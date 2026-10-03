import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Columns2,
  Contrast,
  Download,
  FileText,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  RotateCw,
  Sun,
  Trash2,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { ImageCanvas } from "@/components/image-editor/ImageCanvas";
import { ImageEditor } from "@/components/image-editor/ImageEditor";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { EmptyState, Field, Select } from "@/components/ui/misc";
import { ATTACHMENT_CATEGORIES } from "@/lib/constants";
import { guessAttachmentCategory } from "@/lib/derive";
import { canEditAttachment, hasImageEdits, normalizeImageEdits, restoreAttachmentOriginal, saveAttachmentImageEdits } from "@/lib/imageEdits";
import { exportEditedImage } from "@/lib/imageExport";
import { deleteFile, getFile, getFileUrl, putFile, resizeImage } from "@/lib/storage";
import type { Attachment, AttachmentCategory, Patient } from "@/lib/types";
import { clamp, cn, downloadBlob, fileSize, fmtDate, nowISO, todayKey, uid } from "@/lib/utils";
import { useStore } from "@/store/store";

export function useFileUrl(id?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    if (!id) return;
    getFileUrl(id).then((u) => {
      if (alive) {
        setUrl(u);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [id]);
  return { url, loading };
}

function Thumb({ a, onOpen, selected, onSelect, compareMode }: { a: Attachment; onOpen: () => void; selected: boolean; onSelect: () => void; compareMode: boolean }) {
  const { url, loading } = useFileUrl(a.id);
  const cat = ATTACHMENT_CATEGORIES[a.category];
  const isImage = a.mime.startsWith("image/");
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={compareMode ? onSelect : onOpen}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-surface text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
        selected ? "border-jade-500 ring-4 ring-jade-500/25" : "border-line",
      )}
    >
      <div className={cn("relative aspect-[4/3] overflow-hidden", isImage ? "bg-neutral-900" : "bg-surface-2")}>
        {loading ? (
          <div className="skeleton h-full w-full" />
        ) : isImage && url ? (
          <img src={url} alt={a.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-3">
            <FileText className="h-10 w-10" />
            <span className="text-xs font-semibold uppercase">{a.mime.split("/")[1] ?? "arquivo"}</span>
          </div>
        )}
        <span className="chip absolute left-2 top-2 bg-black/55 text-white backdrop-blur" style={{ boxShadow: `inset 3px 0 0 ${cat.color}` }}>
          {cat.label}
        </span>
        {isImage && hasImageEdits(a.imageEdits) && <span className="chip absolute bottom-2 right-2 bg-jade-600 text-white shadow">Editada</span>}
        {compareMode && (
          <span className={cn("absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold", selected ? "border-jade-400 bg-jade-500 text-white" : "border-white/80 bg-black/30")}>
            {selected ? "✓" : ""}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-ink">{a.name}</p>
        <p className="text-xs text-ink-3">
          {fmtDate(a.takenAt ?? a.createdAt)}
          {a.tooth ? ` · dente ${a.tooth}` : ""}
        </p>
      </div>
    </motion.button>
  );
}

function Viewer({ patient, list, index, onIndex, onClose }: { patient: Patient; list: Attachment[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const a = list[index];
  const { url } = useFileUrl(a?.id);
  const updatePatient = useStore((s) => s.updatePatient);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rot, setRot] = useState(0);
  const [invert, setInvert] = useState(false);
  const [bright, setBright] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [editing, setEditing] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRot(0);
  };
  useEffect(() => {
    resetView();
    setDownloadOpen(false);
  }, [index]);

  const go = useCallback((d: number) => onIndex((index + d + list.length) % list.length), [index, list.length, onIndex]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "+" || e.key === "=") setZoom((z) => clamp(z * 1.25, 1, 8));
      if (e.key === "-") setZoom((z) => clamp(z / 1.25, 1, 8));
      if (e.key.toLowerCase() === "i") setInvert((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!a) return null;
  const isImage = canEditAttachment(a);
  const setMeta = (patch: Partial<Attachment>) => updatePatient(patient.id, (p) => ({ attachments: p.attachments.map((x) => (x.id === a.id ? { ...x, ...patch } : x)) }));
  const downloadOriginal = async () => {
    try {
      const blob = await getFile(a.id);
      if (!blob) throw new Error();
      downloadBlob(blob, a.name.includes(".") ? a.name : `${a.name}.${(a.mime.split("/")[1] ?? "bin").replace("svg+xml", "svg")}`);
      setDownloadOpen(false);
    } catch {
      toast.error("Não foi possível baixar o arquivo original");
    }
  };
  const downloadEdited = async () => {
    try {
      const blob = await getFile(a.id);
      if (!blob) throw new Error();
      const output = await exportEditedImage(blob, a.imageEdits);
      const base = a.name.replace(/\.[^.]+$/, "") || "imagem";
      downloadBlob(output, `${base}-editada.${output.type === "image/png" ? "png" : "jpg"}`);
      setDownloadOpen(false);
    } catch {
      toast.error("Não foi possível gerar a versão editada", "O arquivo original continua intacto.");
    }
  };

  const onPointerDown = (e: RPointerEvent) => {
    if (zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: RPointerEvent) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };

  const portal = createPortal(
    <motion.div className="fixed inset-0 z-[65] flex flex-col bg-neutral-950/95 text-white backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.name}</p>
          <p className="text-xs text-white/50">
            {index + 1} de {list.length} · {ATTACHMENT_CATEGORIES[a.category].label} · {fmtDate(a.takenAt ?? a.createdAt)} · {fileSize(a.size)}
          </p>
        </div>
        {isImage && (
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
            <button className="flex items-center gap-1.5 rounded-lg bg-jade-500 px-2.5 py-2 text-xs font-semibold text-white hover:bg-jade-400" onClick={() => setEditing(true)} title="Cortar, girar e fazer marcações">
              <Pencil className="h-4 w-4" /> Editar imagem
            </button>
            <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setZoom((z) => clamp(z / 1.25, 1, 8))} title="Diminuir zoom">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
            <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setZoom((z) => clamp(z * 1.25, 1, 8))} title="Aumentar zoom">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setRot((r) => r + 90)} title="Girar">
              <RotateCw className="h-4 w-4" />
            </button>
            <button className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold", invert ? "bg-jade-500 text-white" : "hover:bg-white/10")} onClick={() => setInvert((v) => !v)} title="Negatoscópio (inverter cores) — tecla I">
              <Contrast className="h-4 w-4" /> Negativo
            </button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button className="flex items-center gap-1 rounded-lg p-2 hover:bg-white/10" title="Baixar arquivo" onClick={() => setDownloadOpen((open) => !open)} aria-expanded={downloadOpen}>
              <Download className="h-5 w-5" /><ChevronDown className="h-3 w-3" />
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-neutral-900 p-1.5 shadow-2xl">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-white/10" onClick={() => void downloadOriginal()}>Baixar original</button>
                {isImage && hasImageEdits(a.imageEdits) && <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-jade-300 hover:bg-white/10" onClick={() => void downloadEdited()}>Baixar versão editada</button>}
              </div>
            )}
          </div>
          <button className="rounded-lg p-2 hover:bg-white/10" onClick={onClose} title="Fechar (Esc)">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden"
          onWheel={(e) => isImage && setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1, 8))}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onDoubleClick={() => (zoom > 1 ? resetView() : setZoom(2.5))}
          style={{ cursor: zoom > 1 ? "grab" : "zoom-in" }}
        >
          {list.length > 1 && (
            <>
              <button onClick={() => go(-1)} className="absolute left-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={() => go(1)} className="absolute right-3 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          {url && isImage ? (
            <div className="flex h-full w-full items-center justify-center p-8 transition-transform duration-150" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rot}deg)`, filter: `${invert ? "invert(1) " : ""}brightness(${bright}%) contrast(${contrast}%)` }}>
              <ImageCanvas src={url} edits={normalizeImageEdits(a.imageEdits)} naturalWidth={a.width} naturalHeight={a.height} />
            </div>
          ) : url ? (
            <iframe src={url} title={a.name} className="h-full w-full bg-white" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          )}
        </div>
        <aside className="w-full shrink-0 space-y-4 overflow-y-auto border-t border-white/10 p-4 lg:w-80 lg:border-l lg:border-t-0">
          {isImage && (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 flex items-center justify-between text-xs font-semibold text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5" /> Brilho
                  </span>
                  {bright}%
                </span>
                <input type="range" min={40} max={200} value={bright} onChange={(e) => setBright(Number(e.target.value))} className="w-full accent-jade-400" />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center justify-between text-xs font-semibold text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Contrast className="h-3.5 w-3.5" /> Contraste
                  </span>
                  {contrast}%
                </span>
                <input type="range" min={40} max={250} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-jade-400" />
              </label>
              <button
                className="text-xs font-semibold text-jade-300 hover:underline"
                onClick={() => {
                  setBright(100);
                  setContrast(100);
                  setInvert(false);
                  resetView();
                }}
              >
                Restaurar visualização
              </button>
              {hasImageEdits(a.imageEdits) && <button className="block text-xs font-semibold text-rose-300 hover:underline" onClick={async () => { if (await confirmDialog({ title: "Restaurar imagem original?", description: "O corte, a rotação, os filtros e as marcações salvas serão removidos. O arquivo original continuará intacto.", danger: true, confirmLabel: "Restaurar original" })) { updatePatient(patient.id, (p) => ({ attachments: p.attachments.map((item) => item.id === a.id ? restoreAttachmentOriginal(item) : item) })); toast.success("Imagem original restaurada"); } }}>Restaurar imagem original</button>}
            </div>
          )}
          <div className="space-y-3 border-t border-white/10 pt-4 [&_.input]:border-white/15 [&_.input]:bg-white/5 [&_.input]:text-white [&_.label]:text-white/50">
            <Field label="Nome">
              <input className="input" defaultValue={a.name} key={`n-${a.id}`} onBlur={(e) => e.target.value.trim() && setMeta({ name: e.target.value.trim() })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tipo">
                <Select value={a.category} onChange={(e) => setMeta({ category: e.target.value as AttachmentCategory })}>
                  {(Object.keys(ATTACHMENT_CATEGORIES) as AttachmentCategory[]).map((c) => (
                    <option key={c} value={c} className="text-black">
                      {ATTACHMENT_CATEGORIES[c].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Dente">
                <input className="input" defaultValue={a.tooth ?? ""} key={`t-${a.id}`} onBlur={(e) => setMeta({ tooth: e.target.value.trim() || undefined })} />
              </Field>
            </div>
            <Field label="Data do exame">
              <input type="date" className="input" value={a.takenAt ?? ""} onChange={(e) => setMeta({ takenAt: e.target.value })} />
            </Field>
            <Field label="Observações">
              <textarea className="input" rows={3} defaultValue={a.note ?? ""} key={`o-${a.id}`} onBlur={(e) => setMeta({ note: e.target.value.trim() || undefined })} />
            </Field>
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:underline"
              onClick={async () => {
                if (!(await confirmDialog({ title: "Excluir este arquivo?", description: a.name, danger: true, confirmLabel: "Excluir" }))) return;
                await deleteFile(a.id);
                updatePatient(patient.id, (p) => ({
                  attachments: p.attachments.filter((x) => x.id !== a.id),
                  payments: p.payments.map((payment) => payment.receiptAttachmentId === a.id ? { ...payment, receiptAttachmentId: undefined } : payment),
                }));
                if (list.length <= 1) onClose();
                else onIndex(Math.max(0, index - 1));
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir arquivo
            </button>
          </div>
        </aside>
      </div>
    </motion.div>,
    document.body,
  );
  return <>{portal}{editing && url && isImage && <ImageEditor attachment={a} src={url} onCancel={() => setEditing(false)} onSave={(edits) => { const normalized = normalizeImageEdits(edits); updatePatient(patient.id, (p) => ({ attachments: p.attachments.map((item) => item.id === a.id ? (hasImageEdits(normalized) ? saveAttachmentImageEdits(item, normalized) : restoreAttachmentOriginal(item)) : item) })); setEditing(false); toast.success("Edições salvas", "O arquivo original foi preservado."); }} />}</>;
}

function Compare({ a, b, onClose }: { a: Attachment; b: Attachment; onClose: () => void }) {
  const ua = useFileUrl(a.id).url;
  const ub = useFileUrl(b.id).url;
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const [before, after] = (a.takenAt ?? a.createdAt) <= (b.takenAt ?? b.createdAt) ? [a, b] : [b, a];
  const [ubefore, uafter] = before === a ? [ua, ub] : [ub, ua];
  const move = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos(clamp(((clientX - r.left) / r.width) * 100, 0, 100));
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <motion.div className="fixed inset-0 z-[65] flex flex-col bg-neutral-950/95 p-4 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-3 flex items-center">
        <p className="flex-1 font-semibold">Comparação antes × depois — arraste a linha</p>
        <button className="rounded-lg p-2 hover:bg-white/10" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        ref={ref}
        className="relative mx-auto aspect-[4/3] max-h-full w-full max-w-5xl touch-none select-none overflow-hidden rounded-2xl bg-black"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => e.buttons && move(e.clientX)}
      >
        {uafter && <img src={uafter} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />}
        {ubefore && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={ubefore} alt="" className="h-full w-full object-contain" draggable={false} />
          </div>
        )}
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]" style={{ left: `${pos}%` }}>
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-jade-700 shadow-lg">
            <Columns2 className="h-5 w-5" />
          </div>
        </div>
        <span className="chip absolute left-3 top-3 bg-black/60 text-white">Antes · {fmtDate(before.takenAt ?? before.createdAt)}</span>
        <span className="chip absolute right-3 top-3 bg-jade-600 text-white">Depois · {fmtDate(after.takenAt ?? after.createdAt)}</span>
      </div>
    </motion.div>,
    document.body,
  );
}

export function ImagesTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const [filter, setFilter] = useState<AttachmentCategory | "todas">("todas");
  const [viewer, setViewer] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const list = useMemo(
    () =>
      [...patient.attachments]
        .filter((a) => filter === "todas" || a.category === filter)
        .sort((a, b) => (b.takenAt ?? b.createdAt).localeCompare(a.takenAt ?? a.createdAt)),
    [patient.attachments, filter],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    patient.attachments.forEach((a) => (c[a.category] = (c[a.category] ?? 0) + 1));
    return c;
  }, [patient.attachments]);

  const upload = useCallback(
    async (files: File[]) => {
      const valid = files.filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
      if (!valid.length) return toast.error("Envie imagens (JPG, PNG…) ou PDFs");
      setUploading(valid.length);
      const added: Attachment[] = [];
      for (const f of valid) {
        try {
          let blob: Blob = f;
          let width: number | undefined;
          let height: number | undefined;
          if (f.type.startsWith("image/") && f.type !== "image/svg+xml" && f.type !== "image/gif") {
            const r = await resizeImage(f, 2600, "image/jpeg", 0.9);
            if (r.blob.size < f.size) blob = r.blob;
            width = r.width;
            height = r.height;
          }
          const id = uid("arq_");
          await putFile(id, blob);
          added.push({
            id,
            name: f.name.replace(/\.[^.]+$/, "") || "Arquivo",
            category: filter !== "todas" ? filter : guessAttachmentCategory(f.name, f.type),
            mime: blob.type || f.type,
            size: blob.size,
            createdAt: nowISO(),
            takenAt: todayKey(),
            width,
            height,
          });
        } catch {
          toast.error(`Não foi possível enviar ${f.name}`);
        }
        setUploading((u) => u - 1);
      }
      if (added.length) {
        updatePatient(patient.id, (p) => ({ attachments: [...added, ...p.attachments] }));
        toast.success(`${added.length} arquivo${added.length > 1 ? "s" : ""} adicionado${added.length > 1 ? "s" : ""}`);
      }
      setUploading(0);
    },
    [filter, patient.id, updatePatient],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length) void upload(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [upload]);

  const pickedAtt = picked.map((id) => patient.attachments.find((a) => a.id === id)).filter((a): a is Attachment => Boolean(a));

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void upload([...e.dataTransfer.files]);
      }}
      className="relative"
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <button onClick={() => setFilter("todas")} className={cn("chip shrink-0 border px-3 py-1.5", filter === "todas" ? "border-jade-600 bg-jade-600 text-white" : "border-line bg-surface text-ink-2")}>
            Todas · {patient.attachments.length}
          </button>
          {(Object.keys(ATTACHMENT_CATEGORIES) as AttachmentCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn("chip shrink-0 border px-3 py-1.5", filter === c ? "border-transparent text-white" : "border-line bg-surface text-ink-2")}
              style={filter === c ? { background: ATTACHMENT_CATEGORIES[c].color } : undefined}
            >
              {ATTACHMENT_CATEGORIES[c].label}
              {counts[c] ? ` · ${counts[c]}` : ""}
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto">
          {patient.attachments.filter((a) => a.mime.startsWith("image/")).length >= 2 && (
            <Button
              variant={compareMode ? "soft" : "secondary"}
              icon={<Columns2 className="h-4 w-4" />}
              onClick={() => {
                setCompareMode((v) => !v);
                setPicked([]);
              }}
            >
              {compareMode ? "Cancelar" : "Comparar"}
            </Button>
          )}
          <Button variant="secondary" className="sm:hidden" onClick={() => cameraRef.current?.click()} icon={<ImagePlus className="h-4 w-4" />}>
            Câmera
          </Button>
          <Button onClick={() => inputRef.current?.click()} icon={uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} disabled={uploading > 0}>
            {uploading ? `Enviando ${uploading}…` : "Enviar arquivos"}
          </Button>
          <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => (void upload([...(e.target.files ?? [])]), (e.target.value = ""))} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => (void upload([...(e.target.files ?? [])]), (e.target.value = ""))} />
        </div>
      </div>

      {compareMode && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-jade-300 bg-jade-50 p-3 text-sm dark:border-jade-800 dark:bg-jade-900/30">
          <Columns2 className="h-5 w-5 text-brand" />
          <span className="flex-1 text-ink-2">Selecione 2 imagens para comparar lado a lado (antes × depois). {picked.length}/2</span>
          <Button size="sm" disabled={pickedAtt.length !== 2} onClick={() => setComparing(true)}>
            Comparar agora
          </Button>
        </div>
      )}

      {list.length === 0 ? (
        <button onClick={() => inputRef.current?.click()} className="card flex w-full flex-col items-center border-2 border-dashed p-2 transition hover:border-jade-400">
          <EmptyState
            icon={<Images className="h-7 w-7" />}
            title="Nenhuma imagem ainda"
            description="Arraste radiografias, fotos intraorais ou PDFs para cá, clique para escolher, ou cole (Ctrl+V) uma imagem copiada."
          />
        </button>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {list.map((a, i) => (
              <Thumb
                key={a.id}
                a={a}
                compareMode={compareMode}
                selected={picked.includes(a.id)}
                onSelect={() => setPicked((cur) => (cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id].slice(-2)))}
                onOpen={() => setViewer(i)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-4 z-50 flex flex-col items-center justify-center rounded-[32px] border-4 border-dashed border-jade-400 bg-jade-50/90 text-jade-800 backdrop-blur dark:bg-jade-950/90 dark:text-jade-100"
          >
            <UploadCloud className="h-16 w-16" />
            <p className="mt-3 font-display text-2xl font-semibold">Solte para anexar ao prontuário</p>
            <p className="text-sm opacity-70">{patient.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{viewer !== null && list[viewer] && <Viewer patient={patient} list={list} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />}</AnimatePresence>
      {comparing && pickedAtt.length === 2 && <Compare a={pickedAtt[0]} b={pickedAtt[1]} onClose={() => setComparing(false)} />}
    </div>
  );
}
