import { createClient, type PostgrestError } from "@supabase/supabase-js";
import type { Appointment, Patient, Settings } from "./types";

/*
 * A chave "anon" é pública por natureza (vai no navegador de qualquer forma).
 * A segurança dos dados é garantida pelas regras RLS do banco: cada usuário
 * só acessa os próprios registros. NUNCA coloque a chave service_role aqui.
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL || "https://wubzprfmwsfvwvptywlf.supabase.co";
export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1YnpwcmZtd3Nmdnd2cHR5d2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDUxMzIsImV4cCI6MjEwNjI4MTEzMn0.fJljYMdbCIssrj5IrlFHZev0xUb7DRSee0AgRwZVD3o";

export const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
export const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;
export const BUCKET = "prontuario";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // os tokens de links de e-mail são tratados em authRedirect.ts (o app usa rotas com #)
    detectSessionInUrl: false,
    storageKey: "prontuario-mizael-auth",
  },
});

/** Consulta pública: o Supabase está aceitando novos cadastros? */
export async function signupsEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    if (!res.ok) return true;
    const json = await res.json();
    return !json.disable_signup;
  } catch {
    return true;
  }
}

export class SchemaMissingError extends Error {
  constructor() {
    super("As tabelas do prontuário ainda não foram criadas no Supabase.");
  }
}

export function isSchemaMissing(err: Pick<PostgrestError, "code" | "message"> | null | undefined) {
  if (!err) return false;
  return err.code === "42P01" || err.code === "PGRST205" || err.code === "PGRST204" || /schema cache|does not exist/i.test(err.message ?? "");
}

const PAGE = 1000;

async function selectAll<T>(table: "patients" | "appointments"): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select("data").order("id").range(from, from + PAGE - 1);
    if (error) {
      if (isSchemaMissing(error)) throw new SchemaMissingError();
      throw error;
    }
    out.push(...(data ?? []).map((r) => r.data as T));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export async function fetchCloud(): Promise<{ patients: Patient[]; appointments: Appointment[]; settings: Settings | null }> {
  const [patients, appointments, settingsRes] = await Promise.all([
    selectAll<Patient>("patients"),
    selectAll<Appointment>("appointments"),
    supabase.from("clinic_settings").select("data").maybeSingle(),
  ]);
  if (settingsRes.error) {
    if (isSchemaMissing(settingsRes.error)) throw new SchemaMissingError();
    throw settingsRes.error;
  }
  return { patients, appointments, settings: (settingsRes.data?.data as Settings | undefined) ?? null };
}

function chunks<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export async function upsertRows(table: "patients" | "appointments", rows: { id: string }[], ownerId?: string) {
  for (const part of chunks(rows, 40)) {
    const { error } = await supabase.from(table).upsert(
      part.map((r) => ({ id: r.id, ...(ownerId ? { owner_id: ownerId } : {}), data: r })),
      { onConflict: "id" },
    );
    if (error) throw error;
  }
}

export async function deleteRows(table: "patients" | "appointments", ids: string[], ownerId?: string) {
  for (const part of chunks(ids, 100)) {
    let query = supabase.from(table).delete().in("id", part);
    if (ownerId) query = query.eq("owner_id", ownerId);
    const { error } = await query;
    if (error) throw error;
  }
}

export async function saveCloudSettings(userId: string, settings: Settings) {
  const { error } = await supabase.from("clinic_settings").upsert({ owner_id: userId, data: settings }, { onConflict: "owner_id" });
  if (error) throw error;
}

/* ---------- Storage ---------- */

export async function uploadCloudFile(userId: string, id: string, blob: Blob) {
  const { error } = await supabase.storage.from(BUCKET).upload(`${userId}/${id}`, blob, {
    upsert: true,
    contentType: blob.type || "application/octet-stream",
  });
  if (error) throw error;
}

export async function downloadCloudFile(userId: string, id: string) {
  const { data, error } = await supabase.storage.from(BUCKET).download(`${userId}/${id}`);
  if (error) return null;
  return data;
}

export async function removeCloudFiles(userId: string, ids: string[]) {
  if (!ids.length) return;
  await supabase.storage.from(BUCKET).remove(ids.map((id) => `${userId}/${id}`));
}

export async function removeAllCloudFiles(userId: string) {
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(userId, { limit: 100 });
    if (error || !data?.length) return;
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${userId}/${f.name}`));
    if (data.length < 100) return;
  }
}
