-- Run after daily-backup.sql and Edge Function deployment.
-- The anon JWT is public; only the private Vault token authorizes a run.
create or replace function public.prontuario_request_backup()
returns bigint language sql security definer set search_path = '' as $$
 select net.http_post(
  url := 'https://wubzprfmwsfvwvptywlf.supabase.co/functions/v1/prontuario-daily-backup',
  headers := jsonb_build_object(
   'Content-Type','application/json',
   'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1YnpwcmZtd3Nmdnd2cHR5d2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDUxMzIsImV4cCI6MjEwNjI4MTEzMn0.fJljYMdbCIssrj5IrlFHZev0xUb7DRSee0AgRwZVD3o',
   'x-backup-secret',(select decrypted_secret from vault.decrypted_secrets where name='prontuario_backup_token')
  ), body := '{}'::jsonb, timeout_milliseconds := 120000
 );
$$;
revoke all on function public.prontuario_request_backup() from public,anon,authenticated;
grant execute on function public.prontuario_request_backup() to service_role;
select cron.schedule('prontuario-daily-backup','0 5,8,11 * * *','select public.prontuario_request_backup();');
