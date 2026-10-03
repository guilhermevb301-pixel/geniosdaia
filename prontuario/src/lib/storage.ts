import { createStore, del, get, set, clear, type UseStore } from "idb-keyval";

/*
 * Cache local (IndexedDB) do navegador.
 * A cópia oficial dos dados fica no Supabase; o cache deixa o app rápido
 * e permite continuar trabalhando se a internet cair (as alterações ficam
 * pendentes e são enviadas assim que a conexão voltar).
 */

let dataStore: UseStore | null = null;
let fileStore: UseStore | null = null;
let localAvailable = false;
let memoryOnly = false;
const memoryFiles = new Map<string, Blob>();

/** No modo demonstração nada é gravado no disco. */
export function setMemoryOnly(v: boolean) {
  memoryOnly = v;
}

export async function initLocal(): Promise<boolean> {
  if (dataStore) return localAvailable;
  try {
    if (typeof indexedDB === "undefined") throw new Error("sem IndexedDB");
    dataStore = createStore("prontuario-mizael", "data");
    fileStore = createStore("prontuario-mizael-arquivos", "files");
    await set("__probe", 1, dataStore);
    await del("__probe", dataStore);
    localAvailable = true;
  } catch {
    dataStore = null;
    fileStore = null;
    localAvailable = false;
  }
  return localAvailable;
}

export async function loadCache<T>(key: string): Promise<T | null> {
  if (!dataStore) return null;
  try {
    return ((await get(key, dataStore)) as T | undefined) ?? null;
  } catch {
    return null;
  }
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingWrites = new Map<string, unknown>();

export function saveCache(key: string, value: unknown) {
  if (!dataStore || memoryOnly) return;
  pendingWrites.set(key, value);
  const t = timers.get(key);
  if (t) clearTimeout(t);
  timers.set(
    key,
    setTimeout(() => void flushCache(key), 400),
  );
}

export async function flushCache(key?: string) {
  if (!dataStore) return;
  const keys = key ? [key] : [...pendingWrites.keys()];
  for (const k of keys) {
    if (!pendingWrites.has(k)) continue;
    const v = pendingWrites.get(k);
    pendingWrites.delete(k);
    try {
      await set(k, v, dataStore);
    } catch (err) {
      console.error("Falha ao salvar cache local", err);
    }
  }
}

export async function removeCache(key: string) {
  pendingWrites.delete(key);
  if (dataStore) await del(key, dataStore).catch(() => undefined);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => void flushCache());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushCache();
  });
}

/* ---------- Arquivos (imagens, radiografias, PDFs) ---------- */

export interface RemoteFiles {
  upload: (id: string, blob: Blob) => Promise<void>;
  download: (id: string) => Promise<Blob | null>;
  remove: (ids: string[]) => Promise<void>;
  onUploadFailed: (id: string) => void;
}

let remote: RemoteFiles | null = null;
export function setRemoteFiles(r: RemoteFiles | null) {
  remote = r;
}

const urlCache = new Map<string, string>();

async function putLocalFile(id: string, blob: Blob) {
  if (fileStore && !memoryOnly) await set(id, blob, fileStore).catch(() => memoryFiles.set(id, blob));
  else memoryFiles.set(id, blob);
}

export async function getLocalFile(id: string): Promise<Blob | null> {
  if (memoryFiles.has(id)) return memoryFiles.get(id)!;
  if (fileStore) {
    try {
      return ((await get(id, fileStore)) as Blob | undefined) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Guarda um arquivo localmente e envia para a nuvem (quando conectado). */
export async function putFile(id: string, blob: Blob, requireCloud = false) {
  if (requireCloud && !remote) throw new Error("Entre na conta antes de importar arquivos.");
  await putLocalFile(id, blob);
  const old = urlCache.get(id);
  if (old) URL.revokeObjectURL(old);
  urlCache.delete(id);
  if (remote) {
    try {
      await remote.upload(id, blob);
    } catch (error) {
      remote.onUploadFailed(id);
      if (requireCloud) throw error;
    }
  }
}

export async function getFile(id: string): Promise<Blob | null> {
  const local = await getLocalFile(id);
  if (local) return local;
  if (!remote) return null;
  try {
    const blob = await remote.download(id);
    if (blob) await putLocalFile(id, blob);
    return blob;
  } catch {
    return null;
  }
}

export async function getFileUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getFile(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export async function deleteFile(id: string) {
  const url = urlCache.get(id);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(id);
  memoryFiles.delete(id);
  if (fileStore) await del(id, fileStore).catch(() => undefined);
  if (remote) await remote.remove([id]).catch(() => undefined);
}

export async function clearLocal() {
  urlCache.forEach((u) => URL.revokeObjectURL(u));
  urlCache.clear();
  memoryFiles.clear();
  pendingWrites.clear();
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  if (dataStore) await clear(dataStore).catch(() => undefined);
  if (fileStore) await clear(fileStore).catch(() => undefined);
}

/* ---------- Helpers de imagem ---------- */

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export async function dataURLToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Redimensiona uma imagem mantendo proporção. */
export async function resizeImage(
  blob: Blob,
  maxSide: number,
  type: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.86,
): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (type === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const out = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falhou"))), type, quality),
    );
    return { blob: out, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}
