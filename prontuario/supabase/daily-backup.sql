-- Administrative application backups. Run once as postgres in Supabase.
-- Uses the existing project; backup records and files are inaccessible to app users.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table if not exists public.prontuario_backup_runs (
  id uuid primary key default gen_random_uuid(),
  backup_day date not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'copying' check (status in ('copying','complete','failed')),
  snapshot jsonb not null,
  files jsonb not null,
  error_code text
);
create index if not exists prontuario_backup_day_idx on public.prontuario_backup_runs(backup_day,status);
alter table public.prontuario_backup_runs enable row level security;
revoke all on public.prontuario_backup_runs from public, anon, authenticated;
grant select, insert, update on public.prontuario_backup_runs to service_role;

insert into storage.buckets(id,name,public,file_size_limit)
values ('prontuario-backups','prontuario-backups',false,52428800)
on conflict(id) do nothing;

create or replace function public.prontuario_begin_backup()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  backup_id uuid;
  backup_date date := (now() at time zone 'America/Bahia')::date;
  snapshot_data jsonb;
  file_data jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('prontuario-daily-backup'));
  if exists(select 1 from public.prontuario_backup_runs where backup_day=backup_date and status='complete') then
    return jsonb_build_object('skipped',true,'reason','already_complete');
  end if;
  if exists(select 1 from public.prontuario_backup_runs where status='copying' and started_at > now()-interval '10 minutes') then
    return jsonb_build_object('skipped',true,'reason','in_progress');
  end if;
  select jsonb_build_object(
    'format','prontuario-server-backup-v1','capturedAt',now(),
    'patients',coalesce((select jsonb_agg(to_jsonb(p)) from public.patients p),'[]'::jsonb),
    'appointments',coalesce((select jsonb_agg(to_jsonb(a)) from public.appointments a),'[]'::jsonb),
    'clinicSettings',coalesce((select jsonb_agg(to_jsonb(s)) from public.clinic_settings s),'[]'::jsonb)
  ) into snapshot_data;
  select coalesce(jsonb_agg(jsonb_build_object(
    'source',o.name,'metadata',o.metadata,
    'target','objects/' || encode(extensions.digest(o.name || '/' || o.id::text || '/' || o.updated_at::text,'sha256'),'hex')
  )),'[]'::jsonb) into file_data from storage.objects o where o.bucket_id='prontuario';
  -- Refuse to label a backup complete if an attachment has never reached Storage.
  if exists(
    select 1 from public.patients p cross join lateral jsonb_array_elements(coalesce(p.data->'attachments','[]'::jsonb)) a
    where not exists(select 1 from storage.objects o where o.bucket_id='prontuario' and o.name=p.owner_id::text || '/' || (a->>'id'))
  ) then raise exception 'backup_source_attachment_missing'; end if;
  insert into public.prontuario_backup_runs(backup_day,snapshot,files)
  values(backup_date,snapshot_data,file_data) returning id into backup_id;
  return jsonb_build_object('id',backup_id,'files',file_data,'snapshot',snapshot_data);
end $$;

create or replace function public.prontuario_finish_backup(run_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare backup public.prontuario_backup_runs%rowtype;
begin
  select * into strict backup from public.prontuario_backup_runs where id=run_id for update;
  if not exists(select 1 from storage.objects where bucket_id='prontuario-backups' and name='manifests/' || run_id::text || '.json') then
    raise exception 'backup_manifest_missing';
  end if;
  if exists(
    select 1 from jsonb_array_elements(backup.files) f
    left join storage.objects o on o.bucket_id='prontuario-backups' and o.name=f->>'target'
    where o.id is null
      or coalesce(o.metadata->>'size','') <> coalesce(f->'metadata'->>'size','')
      or coalesce(o.metadata->>'eTag','') <> coalesce(f->'metadata'->>'eTag','')
  ) then raise exception 'backup_file_verification_failed'; end if;
  update public.prontuario_backup_runs set status='complete',completed_at=now(),error_code=null where id=run_id;
  return jsonb_build_object('id',run_id,'status','complete','files',jsonb_array_length(backup.files));
end $$;

revoke all on function public.prontuario_begin_backup() from public,anon,authenticated;
revoke all on function public.prontuario_finish_backup(uuid) from public,anon,authenticated;
grant execute on function public.prontuario_begin_backup() to service_role;
grant execute on function public.prontuario_finish_backup(uuid) to service_role;

-- A purpose-specific token remains inside Vault; no privileged key is copied
-- into a browser, repository or client application.
do $$ begin
  if not exists(select 1 from vault.secrets where name='prontuario_backup_token') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'prontuario_backup_token','Internal daily backup authorization');
  end if;
end $$;
create or replace function public.prontuario_backup_authorized(token text)
returns boolean language sql security definer set search_path = '' as $$
  select length(token)=64 and exists(select 1 from vault.decrypted_secrets where name='prontuario_backup_token' and decrypted_secret=token);
$$;
revoke all on function public.prontuario_backup_authorized(text) from public,anon,authenticated;
grant execute on function public.prontuario_backup_authorized(text) to service_role;

-- Set schedule after deploying the function. Public anon JWT keeps gateway
-- verification ON; the private Vault token authorizes the actual backup.
-- 05:00 UTC = 02:00 Bahia. 08:00/11:00 UTC retry a failed daily run.
