import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

// This server-only function is invoked by pg_cron; no browser credentials suffice.
Deno.serve(async (request) => {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  if (!key || !url) return Response.json({ error: 'server_configuration_missing' }, { status: 503 });
  if (request.method !== 'POST') {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authorized, error: authError } = await client.rpc('prontuario_backup_authorized', { token: request.headers.get('x-backup-secret') ?? '' });
  if (authError || authorized !== true) return Response.json({ error: 'unauthorized' }, { status: 401 });
  let runId: string | undefined;
  try {
    const { data: run, error } = await client.rpc('prontuario_begin_backup');
    if (error) throw new Error('snapshot_failed');
    if (run.skipped) return Response.json({ status: 'skipped', reason: run.reason });
    runId = run.id;
    const copyFile = async (file: { source: string; target: string }) => {
      // Server-side copy preserves bytes and avoids downloading medical files.
      const { data: exists, error: existsError } = await client.storage.from('prontuario-backups').exists(file.target);
      const status = existsError && 'status' in existsError ? Number(existsError.status) : 0;
      if (existsError && ![400, 404].includes(status)) throw new Error('storage_check_failed');
      if (!exists) {
        const { error: copyError } = await client.storage.from('prontuario').copy(file.source, file.target, { destinationBucket: 'prontuario-backups' });
        if (copyError) throw new Error('storage_copy_failed');
      }
    };
    // Five copies at a time keep the free-plan function within its runtime limit.
    for (let offset = 0; offset < run.files.length; offset += 5) {
      await Promise.all(run.files.slice(offset, offset + 5).map(copyFile));
    }
    const manifest = new Blob([JSON.stringify({ runId, snapshot: run.snapshot, files: run.files })], { type: 'application/json' });
    const { error: manifestError } = await client.storage.from('prontuario-backups').upload(`manifests/${runId}.json`, manifest, { upsert: false, contentType: 'application/json' });
    if (manifestError) throw new Error('manifest_upload_failed');
    const { data: verified, error: finishError } = await client.rpc('prontuario_finish_backup', { run_id: runId });
    if (finishError) throw new Error('verification_failed');
    // Logs contain only status/counts, never clinical data or secrets.
    console.log(JSON.stringify(verified));
    return Response.json(verified);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'backup_failed';
    if (runId) await client.from('prontuario_backup_runs').update({ status: 'failed', error_code: code }).eq('id', runId);
    console.error(JSON.stringify({ status: 'failed', code, runId }));
    return Response.json({ status: 'failed', code }, { status: 500 });
  }
});
