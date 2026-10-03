import { ArrowUpRight, Circle, Crop, MousePointer2, Pencil, Redo2, RotateCcw, RotateCw, Save, Square, Trash2, Type, Undo2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { confirmDialog } from "@/components/ui/feedback";
import { applyCropSelection, applyImageCommand, createImageEditHistory, normalizeImageEdits, pushImageEditHistory, redoImageEditHistory, undoImageEditHistory } from "@/lib/imageEdits";
import type { Attachment, ImageAnnotation, ImageCrop, ImageEdits } from "@/lib/types";
import { cn, nowISO, uid } from "@/lib/utils";
import { ImageCanvas, type ImageGesture, type ImageTool } from "./ImageCanvas";

const tools: { id: ImageTool; label: string; icon: typeof Pencil }[] = [
  { id: "select", label: "Selecionar", icon: MousePointer2 },
  { id: "crop", label: "Cortar", icon: Crop },
  { id: "freehand", label: "Desenhar", icon: Pencil },
  { id: "arrow", label: "Seta", icon: ArrowUpRight },
  { id: "ellipse", label: "Círculo", icon: Circle },
  { id: "rectangle", label: "Retângulo", icon: Square },
  { id: "text", label: "Texto", icon: Type },
];

export function ImageEditor({ attachment, src, onSave, onCancel }: { attachment: Attachment; src: string; onSave: (edits: ImageEdits) => void; onCancel: () => void }) {
  const initial = useMemo(() => normalizeImageEdits(attachment.imageEdits), [attachment.id]);
  const [history, setHistory] = useState(() => createImageEditHistory(initial));
  const [tool, setTool] = useState<ImageTool>("select");
  const [color, setColor] = useState("#EF4444");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [selectedId, setSelectedId] = useState<string>();
  const dirty = JSON.stringify(history.present) !== JSON.stringify(initial);
  const push = (next: ImageEdits) => setHistory((current) => pushImageEditHistory(current, next));
  const close = async () => {
    if (dirty && !(await confirmDialog({ title: "Descartar edições?", description: "As alterações ainda não foram salvas.", danger: true, confirmLabel: "Descartar" }))) return;
    onCancel();
  };
  const gesture = (value: ImageGesture) => {
    const width = Math.abs(value.end.x - value.start.x);
    const height = Math.abs(value.end.y - value.start.y);
    if (tool === "crop") {
      if (width < 0.01 || height < 0.01) return;
      const crop: ImageCrop = { x: Math.min(value.start.x, value.end.x), y: Math.min(value.start.y, value.end.y), width, height };
      push(applyCropSelection(history.present, crop));
      setTool("select");
      return;
    }
    if (tool === "text") {
      const text = window.prompt("Texto da marcação:")?.trim();
      if (!text) return;
      push(applyImageCommand(history.present, { type: "add-annotation", annotation: { id: uid("ann_"), kind: "text", color, strokeWidth, point: value.start, text } }));
      return;
    }
    if (tool === "select") return;
    let annotation: ImageAnnotation;
    if (tool === "freehand") {
      if (value.points.length < 2) return;
      annotation = { id: uid("ann_"), kind: "freehand", color, strokeWidth, points: value.points };
    } else {
      if (width < 0.005 && height < 0.005) return;
      annotation = { id: uid("ann_"), kind: tool, color, strokeWidth, start: value.start, end: value.end };
    }
    push(applyImageCommand(history.present, { type: "add-annotation", annotation }));
  };
  const removeSelected = () => {
    if (!selectedId) return;
    push(applyImageCommand(history.present, { type: "remove-annotation", id: selectedId }));
    setSelectedId(undefined);
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-neutral-950 text-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <div className="mr-2 min-w-0 flex-1"><p className="truncate font-semibold">Editando: {attachment.name}</p><p className="text-xs text-white/55">O arquivo original será preservado.</p></div>
        <Button variant="secondary" size="sm" onClick={close} icon={<X className="h-4 w-4" />}>Cancelar</Button>
        <Button size="sm" onClick={() => onSave({ ...history.present, updatedAt: nowISO() })} icon={<Save className="h-4 w-4" />}>Salvar edições</Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 lg:p-6">
          <ImageCanvas src={src} edits={history.present} naturalWidth={attachment.width} naturalHeight={attachment.height} editable tool={tool} color={color} strokeWidth={strokeWidth} selectedId={selectedId} onSelectAnnotation={setSelectedId} onGesture={gesture} />
        </div>
        <aside className="w-full shrink-0 space-y-4 overflow-y-auto border-t border-white/10 bg-white/[0.03] p-4 lg:w-80 lg:border-l lg:border-t-0">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/55">Ferramenta</p><div className="grid grid-cols-2 gap-2">{tools.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setTool(id); setSelectedId(undefined); }} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold", tool === id ? "border-jade-400 bg-jade-500 text-white" : "border-white/10 bg-white/5 hover:bg-white/10")}><Icon className="h-4 w-4" />{label}</button>)}</div></div>
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-white/60">Cor<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-white/15 bg-white/5 p-1" /></label><label className="text-xs font-semibold text-white/60">Espessura<select value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-neutral-900 px-2 text-white"><option value="2">Fina</option><option value="4">Média</option><option value="7">Grossa</option></select></label></div>
          <div className="grid grid-cols-2 gap-2"><button onClick={() => push(applyImageCommand(history.present, { type: "rotate", degrees: -90 }))} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 p-2 text-sm font-semibold hover:bg-white/10"><RotateCcw className="h-4 w-4" />Girar à esquerda</button><button onClick={() => push(applyImageCommand(history.present, { type: "rotate", degrees: 90 }))} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 p-2 text-sm font-semibold hover:bg-white/10"><RotateCw className="h-4 w-4" />Girar à direita</button></div>
          <div className="space-y-3 border-t border-white/10 pt-4"><label className="block text-xs font-semibold text-white/60">Brilho · {history.present.brightness}%<input type="range" min="40" max="200" value={history.present.brightness} onChange={(e) => push(applyImageCommand(history.present, { type: "visual", brightness: Number(e.target.value) }))} className="mt-1 w-full accent-jade-400" /></label><label className="block text-xs font-semibold text-white/60">Contraste · {history.present.contrast}%<input type="range" min="40" max="250" value={history.present.contrast} onChange={(e) => push(applyImageCommand(history.present, { type: "visual", contrast: Number(e.target.value) }))} className="mt-1 w-full accent-jade-400" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={history.present.invert} onChange={(e) => push(applyImageCommand(history.present, { type: "visual", invert: e.target.checked }))} className="h-4 w-4 accent-jade-500" />Negativo</label></div>
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4"><button disabled={!history.past.length} onClick={() => setHistory(undoImageEditHistory(history))} className="flex items-center justify-center gap-1 rounded-lg border border-white/10 p-2 text-xs font-semibold disabled:opacity-35"><Undo2 className="h-4 w-4" />Desfazer</button><button disabled={!history.future.length} onClick={() => setHistory(redoImageEditHistory(history))} className="flex items-center justify-center gap-1 rounded-lg border border-white/10 p-2 text-xs font-semibold disabled:opacity-35"><Redo2 className="h-4 w-4" />Refazer</button><button disabled={!selectedId} onClick={removeSelected} className="flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 p-2 text-xs font-semibold text-rose-300 disabled:opacity-35"><Trash2 className="h-4 w-4" />Apagar</button></div>
          <button onClick={async () => { if (await confirmDialog({ title: "Restaurar imagem original?", description: "Corte, rotação, filtros e marcações serão removidos. O arquivo original permanece intacto.", danger: true, confirmLabel: "Restaurar" })) { push(applyImageCommand(history.present, { type: "reset" })); setSelectedId(undefined); } }} className="w-full rounded-xl border border-rose-500/25 p-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">Restaurar original</button>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
