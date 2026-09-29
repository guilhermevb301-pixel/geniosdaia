-- =====================================================================
--  Prontuário Dr. Mizael Cardoso — estrutura do banco (Supabase)
--  Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
--  Pode ser executado mais de uma vez sem problemas.
-- =====================================================================

-- Atualiza updated_at automaticamente
create or replace function public.pront_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Pacientes (ficha completa: anamnese, odontograma, tratamentos,
-- evolução, lembretes, pagamentos e anexos ficam no campo data)
-- ---------------------------------------------------------------------
create table if not exists public.patients (
  id          text primary key,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text generated always as (data ->> 'name') stored,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists patients_owner_idx on public.patients (owner_id);
create index if not exists patients_name_idx on public.patients (owner_id, name);

drop trigger if exists patients_updated_at on public.patients;
create trigger patients_updated_at
  before update on public.patients
  for each row execute function public.pront_set_updated_at();

-- ---------------------------------------------------------------------
-- Consultas da agenda
-- ---------------------------------------------------------------------
create table if not exists public.appointments (
  id          text primary key,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id  text generated always as (data ->> 'patientId') stored,
  starts_at   text generated always as (data ->> 'start') stored,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists appointments_owner_idx on public.appointments (owner_id, starts_at);

drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at
  before update on public.appointments
  for each row execute function public.pront_set_updated_at();

-- ---------------------------------------------------------------------
-- Configurações do consultório (1 linha por usuário)
-- ---------------------------------------------------------------------
create table if not exists public.clinic_settings (
  owner_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

drop trigger if exists clinic_settings_updated_at on public.clinic_settings;
create trigger clinic_settings_updated_at
  before update on public.clinic_settings
  for each row execute function public.pront_set_updated_at();

-- ---------------------------------------------------------------------
-- Segurança (RLS): cada usuário só enxerga e altera os próprios dados
-- ---------------------------------------------------------------------
alter table public.patients        enable row level security;
alter table public.appointments    enable row level security;
alter table public.clinic_settings enable row level security;

revoke all on public.patients, public.appointments, public.clinic_settings from anon;
grant select, insert, update, delete on public.patients, public.appointments, public.clinic_settings to authenticated;

drop policy if exists "patients: dono" on public.patients;
create policy "patients: dono" on public.patients
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "appointments: dono" on public.appointments;
create policy "appointments: dono" on public.appointments
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "clinic_settings: dono" on public.clinic_settings;
create policy "clinic_settings: dono" on public.clinic_settings
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Arquivos (radiografias, fotos, PDFs) — bucket privado
-- Cada arquivo fica em  <id do usuário>/<id do arquivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('prontuario', 'prontuario', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "prontuario: ler próprios arquivos" on storage.objects;
create policy "prontuario: ler próprios arquivos" on storage.objects
  for select to authenticated
  using (bucket_id = 'prontuario' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "prontuario: enviar próprios arquivos" on storage.objects;
create policy "prontuario: enviar próprios arquivos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'prontuario' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "prontuario: atualizar próprios arquivos" on storage.objects;
create policy "prontuario: atualizar próprios arquivos" on storage.objects
  for update to authenticated
  using (bucket_id = 'prontuario' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "prontuario: apagar próprios arquivos" on storage.objects;
create policy "prontuario: apagar próprios arquivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'prontuario' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------
-- Cadastro fechado: no máximo 3 contas neste projeto
-- (Dr. Mizael + reserva). Para liberar mais, aumente o número abaixo.
-- ---------------------------------------------------------------------
create or replace function public.pront_limit_accounts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from auth.users) >= 3 then
    raise exception 'Cadastro fechado: limite de contas do prontuário atingido';
  end if;
  return new;
end;
$$;

drop trigger if exists pront_limit_accounts on auth.users;
create trigger pront_limit_accounts
  before insert on auth.users
  for each row execute function public.pront_limit_accounts();

-- Pronto! Volte ao prontuário e recarregue a página.
