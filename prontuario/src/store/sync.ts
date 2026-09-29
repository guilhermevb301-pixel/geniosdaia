import type { User } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import {
  clearLocal,
  deleteFile,
  flushCache,
  getLocalFile,
  initLocal,
  loadCache,
  saveCache,
  setMemoryOnly,
  setRemoteFiles,
} from "@/lib/storage";
import {
  SchemaMissingError,
  deleteRows,
  downloadCloudFile,
  fetchCloud,
  removeAllCloudFiles,
  removeCloudFiles,
  saveCloudSettings,
  supabase,
  upsertRows,
  uploadCloudFile,
} from "@/lib/supabase";
import type { Appointment, Patient, Settings } from "@/lib/types";
import { nowISO } from "@/lib/utils";
import { DATA_VERSION, migrate, useStore, withDefaults, type State } from "./store";

/*
 * Sincronização com o Supabase.
 * - Cada alteração no app marca apenas os registros alterados como "pendentes".
 * - As pendências são enviadas em lote (upsert) poucos instantes depois.
 * - Sem internet, tudo continua funcionando: as pendências ficam guardadas no
 *   navegador e são enviadas assim que a conexão voltar.
 */

interface Cache {
  version: number;
  patients: Patient[];
  appointments: Appointment[];
  settings: Settings;
  recent: string[];
  onboarded: boolean;
  pending: { p: string[]; a: string[]; dp: string[]; da: string[]; s: boolean; f: string[] };
}

let userId: string | null = null;
let applyingRemote = false;
let starting: Promise<void> | null = null;
let prev: { patients: Patient[]; appointments: Appointment[]; settings: Settings } = {
  patients: [],
  appointments: [],
  settings: DEFAULT_SETTINGS,
};

const dirtyP = new Set<string>();
const dirtyA = new Set<string>();
const delP = new Set<string>();
const delA = new Set<string>();
const pendingUploads = new Set<string>();
let settingsDirty = false;

let flushing = false;
let rerun = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 4000;
let lastFetch = 0;

const cacheKey = () => `cache:${userId}`;

export function pendingCount() {
  return dirtyP.size + dirtyA.size + delP.size + delA.size + pendingUploads.size + (settingsDirty ? 1 : 0);
}

function setSync(patch: Partial<State["sync"]>) {
  useStore.setState((s) => ({ sync: { ...s.sync, ...patch, pending: pendingCount() } }));
}

function writeCache() {
  if (!userId) return;
  const s = useStore.getState();
  const cache: Cache = {
    version: DATA_VERSION,
    patients: s.patients,
    appointments: s.appointments,
    settings: s.settings,
    recent: s.recent,
    onboarded: s.onboarded,
    pending: { p: [...dirtyP], a: [...dirtyA], dp: [...delP], da: [...delA], s: settingsDirty, f: [...pendingUploads] },
  };
  saveCache(cacheKey(), cache);
}

function applyRemote(patch: Partial<State>) {
  applyingRemote = true;
  try {
    useStore.setState(patch);
  } finally {
    applyingRemote = false;
  }
  const s = useStore.getState();
  prev = { patients: s.patients, appointments: s.appointments, settings: s.settings };
}

function diff<T extends { id: string }>(before: T[], after: T[], dirty: Set<string>, deleted: Set<string>) {
  const beforeMap = new Map(before.map((x) => [x.id, x]));
  const afterIds = new Set<string>();
  for (const x of after) {
    afterIds.add(x.id);
    if (beforeMap.get(x.id) !== x) {
      dirty.add(x.id);
      deleted.delete(x.id);
    }
  }
  for (const x of before) {
    if (!afterIds.has(x.id)) {
      deleted.add(x.id);
      dirty.delete(x.id);
    }
  }
}

useStore.subscribe((s, old) => {
  if (applyingRemote || s.mode !== "cloud" || !userId || !s.ready) return;
  let changed = false;
  if (s.patients !== prev.patients) {
    diff(prev.patients, s.patients, dirtyP, delP);
    changed = true;
  }
  if (s.appointments !== prev.appointments) {
    diff(prev.appointments, s.appointments, dirtyA, delA);
    changed = true;
  }
  if (s.settings !== prev.settings) {
    settingsDirty = true;
    changed = true;
  }
  prev = { patients: s.patients, appointments: s.appointments, settings: s.settings };
  if (changed || s.recent !== old.recent || s.onboarded !== old.onboarded) writeCache();
  if (changed) {
    setSync({ status: "saving" });
    scheduleFlush();
  }
});

function scheduleFlush(ms = 700) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => void flush(), ms);
}

function scheduleRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => void flush(), retryDelay);
  retryDelay = Math.min(60_000, retryDelay * 2);
}

function isNetworkError(err: unknown) {
  const msg = String((err as { message?: string })?.message ?? err);
  return /fetch|network|timeout|Failed to fetch|Load failed/i.test(msg);
}

export async function flush(): Promise<void> {
  if (!userId) return;
  if (flushing) {
    rerun = true;
    return;
  }
  if (!pendingCount()) {
    setSync({ status: "saved" });
    return;
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setSync({ status: "offline" });
    return;
  }
  flushing = true;
  setSync({ status: "saving" });
  const uid = userId;
  const s = useStore.getState();
  const takeP = [...dirtyP];
  const takeA = [...dirtyA];
  const takeDP = [...delP];
  const takeDA = [...delA];
  const takeS = settingsDirty;
  const takeF = [...pendingUploads];
  dirtyP.clear();
  dirtyA.clear();
  delP.clear();
  delA.clear();
  pendingUploads.clear();
  settingsDirty = false;
  try {
    const pMap = new Map(s.patients.map((p) => [p.id, p]));
    const aMap = new Map(s.appointments.map((a) => [a.id, a]));
    const pRows = takeP.map((id) => pMap.get(id)).filter((p): p is Patient => Boolean(p));
    const aRows = takeA.map((id) => aMap.get(id)).filter((a): a is Appointment => Boolean(a));
    if (pRows.length) await upsertRows("patients", pRows);
    if (aRows.length) await upsertRows("appointments", aRows);
    if (takeDA.length) await deleteRows("appointments", takeDA);
    if (takeDP.length) await deleteRows("patients", takeDP);
    if (takeS) await saveCloudSettings(uid, s.settings);
    for (const id of takeF) {
      const blob = await getLocalFile(id);
      if (blob) await uploadCloudFile(uid, id, blob);
    }
    retryDelay = 4000;
    setSync({ status: pendingCount() ? "saving" : "saved", lastSavedAt: nowISO(), error: undefined });
  } catch (err) {
    takeP.forEach((id) => !delP.has(id) && dirtyP.add(id));
    takeA.forEach((id) => !delA.has(id) && dirtyA.add(id));
    takeDP.forEach((id) => !dirtyP.has(id) && delP.add(id));
    takeDA.forEach((id) => !dirtyA.has(id) && delA.add(id));
    takeF.forEach((id) => pendingUploads.add(id));
    if (takeS) settingsDirty = true;
    const offline = (typeof navigator !== "undefined" && navigator.onLine === false) || isNetworkError(err);
    setSync({ status: offline ? "offline" : "error", error: String((err as { message?: string })?.message ?? err) });
    scheduleRetry();
  } finally {
    flushing = false;
    writeCache();
    if (rerun) {
      rerun = false;
      scheduleFlush(300);
    }
  }
}

function mergeCloud(cloud: Awaited<ReturnType<typeof fetchCloud>>, cachedOnboarded: boolean) {
  const s = useStore.getState();
  const localP = new Map(s.patients.map((p) => [p.id, p]));
  const localA = new Map(s.appointments.map((a) => [a.id, a]));
  const cloudP = new Set(cloud.patients.map((p) => p.id));
  const cloudA = new Set(cloud.appointments.map((a) => a.id));

  const patients = cloud.patients.filter((p) => !delP.has(p.id)).map((p) => (dirtyP.has(p.id) && localP.get(p.id)) || p);
  dirtyP.forEach((id) => !cloudP.has(id) && localP.has(id) && patients.push(localP.get(id)!));

  const appointments = cloud.appointments.filter((a) => !delA.has(a.id)).map((a) => (dirtyA.has(a.id) && localA.get(a.id)) || a);
  dirtyA.forEach((id) => !cloudA.has(id) && localA.has(id) && appointments.push(localA.get(id)!));

  const settings = settingsDirty ? s.settings : cloud.settings ? withDefaults(cloud.settings) : s.settings;
  const onboarded = Boolean(cloud.settings) || cloud.patients.length > 0 || cachedOnboarded;

  const m = migrate({ patients, appointments, settings, recent: s.recent, onboarded });
  applyRemote({ ...m, ready: true, mode: "cloud" });
  lastFetch = Date.now();
}

async function startCloud(user: User) {
  if (userId === user.id && useStore.getState().mode === "cloud" && useStore.getState().ready) return;
  userId = user.id;
  setMemoryOnly(false);
  setRemoteFiles({
    upload: (id, blob) => uploadCloudFile(user.id, id, blob),
    download: (id) => downloadCloudFile(user.id, id),
    remove: (ids) => removeCloudFiles(user.id, ids),
    onUploadFailed: (id) => {
      pendingUploads.add(id);
      writeCache();
      setSync({ status: "offline" });
      scheduleRetry();
    },
  });
  useStore.setState({ userId: user.id, userEmail: user.email ?? undefined, bootError: undefined });

  const cached = await loadCache<Cache>(cacheKey());
  if (cached) {
    cached.pending.p.forEach((id) => dirtyP.add(id));
    cached.pending.a.forEach((id) => dirtyA.add(id));
    cached.pending.dp.forEach((id) => delP.add(id));
    cached.pending.da.forEach((id) => delA.add(id));
    cached.pending.f.forEach((id) => pendingUploads.add(id));
    settingsDirty = settingsDirty || cached.pending.s;
    applyRemote({ ...migrate(cached), ready: true, mode: "cloud", locked: Boolean(cached.settings?.pinHash) });
    setSync({ status: pendingCount() ? "saving" : "saved" });
  } else {
    applyRemote({ mode: "cloud", ready: false });
  }

  try {
    const cloud = await fetchCloud();
    mergeCloud(cloud, cached?.onboarded ?? false);
    if (!cached) useStore.setState({ locked: Boolean(useStore.getState().settings.pinHash) });
    writeCache();
    setSync({ status: pendingCount() ? "saving" : "saved" });
    if (pendingCount()) void flush();
  } catch (err) {
    if (err instanceof SchemaMissingError) {
      useStore.setState({ mode: "setup", ready: false });
      return;
    }
    if (cached) {
      setSync({ status: "offline" });
      scheduleRetry();
    } else {
      useStore.setState({
        mode: "error",
        ready: false,
        bootError: String((err as { message?: string })?.message ?? err),
      });
    }
  }
}

async function refreshFromCloud() {
  const s = useStore.getState();
  if (s.mode !== "cloud" || !s.ready || !userId || flushing || pendingCount()) return;
  try {
    const cloud = await fetchCloud();
    if (pendingCount() || flushing) return;
    mergeCloud(cloud, true);
    writeCache();
  } catch {
    /* segue com os dados locais */
  }
}

function resetState(mode: State["mode"]) {
  userId = null;
  starting = null;
  dirtyP.clear();
  dirtyA.clear();
  delP.clear();
  delA.clear();
  pendingUploads.clear();
  settingsDirty = false;
  setRemoteFiles(null);
  applyRemote({
    mode,
    ready: false,
    userId: undefined,
    userEmail: undefined,
    patients: [],
    appointments: [],
    settings: DEFAULT_SETTINGS,
    recent: [],
    onboarded: false,
    locked: false,
    sync: { status: "idle", pending: 0 },
  });
}

function begin(user: User) {
  if (!starting || userId !== user.id) starting = startCloud(user).finally(() => (starting = null));
  return starting;
}

/* ---------- API pública ---------- */

let booted = false;
export async function boot() {
  if (booted) return;
  booted = true;
  await initLocal();

  supabase.auth.onAuthStateChange((event, session) => {
    // Não aguardar chamadas do Supabase dentro deste callback (recomendação da biblioteca)
    setTimeout(() => {
      if (event === "SIGNED_OUT") {
        if (useStore.getState().mode === "cloud" || useStore.getState().mode === "setup") resetState("auth");
      } else if (event === "PASSWORD_RECOVERY") {
        useStore.setState({ recovery: true });
      } else if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user && session.user.id !== userId) {
        void begin(session.user);
      }
    }, 0);
  });

  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) await begin(data.session.user);
    else if (useStore.getState().mode === "boot") useStore.setState({ mode: "auth" });
  } catch {
    if (useStore.getState().mode === "boot") useStore.setState({ mode: "auth" });
  }

  window.addEventListener("online", () => void flush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastFetch > 60_000) void refreshFromCloud();
    if (document.visibilityState === "hidden") void flush();
  });
}

export async function retryStart() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    userId = null;
    await begin(data.session.user);
  } else useStore.setState({ mode: "auth" });
}

export async function startDemo() {
  const { buildDemoData } = await import("@/lib/seed");
  resetState("demo");
  setMemoryOnly(true);
  const demo = await buildDemoData();
  applyRemote({ mode: "demo", ...demo, settings: DEFAULT_SETTINGS, onboarded: true, ready: true });
}

export function exitDemo() {
  setMemoryOnly(false);
  resetState("auth");
}

/** Sai da conta. Retorna false se houver alterações ainda não enviadas (e force=false). */
export async function signOut(force = false): Promise<boolean> {
  await flush();
  if (pendingCount() && !force) return false;
  await flushCache();
  await clearLocal();
  resetState("auth");
  await supabase.auth.signOut().catch(() => undefined);
  return true;
}

/** Apaga todos os pacientes, consultas e arquivos da conta. */
export async function eraseEverything() {
  const s = useStore.getState();
  const fileIds = s.patients.flatMap((p) => p.attachments.map((a) => a.id));
  useStore.setState({ patients: [], appointments: [], recent: [] });
  await Promise.all(fileIds.map((id) => deleteFile(id)));
  if (userId) await removeAllCloudFiles(userId).catch(() => undefined);
  await flush();
}

/** Remove apenas os pacientes fictícios da demonstração. */
export async function removeDemoPatients() {
  const s = useStore.getState();
  const demo = s.patients.filter((p) => p.demo);
  const ids = new Set(demo.map((p) => p.id));
  useStore.setState({
    patients: s.patients.filter((p) => !ids.has(p.id)),
    appointments: s.appointments.filter((a) => !ids.has(a.patientId)),
    recent: s.recent.filter((r) => !ids.has(r)),
  });
  await Promise.all(demo.flatMap((p) => p.attachments.map((a) => deleteFile(a.id))));
  return demo.length;
}
