import type { ImageAnnotation, ImageCrop, ImageEditPoint, ImageEdits } from "./types";

export type ImageEditorCommand =
  | { type: "rotate"; degrees: number }
  | { type: "crop"; crop?: ImageCrop }
  | { type: "visual"; brightness?: number; contrast?: number; invert?: boolean }
  | { type: "add-annotation"; annotation: ImageAnnotation }
  | { type: "remove-annotation"; id: string }
  | { type: "reset" };

export interface ImageEditHistory {
  past: ImageEdits[];
  present: ImageEdits;
  future: ImageEdits[];
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

export function emptyImageEdits(): ImageEdits {
  return { rotation: 0, brightness: 100, contrast: 100, invert: false, annotations: [] };
}

export function normalizeImagePoint(point: ImageEditPoint): ImageEditPoint {
  return { x: clamp01(point.x), y: clamp01(point.y) };
}

const tidy = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function toNormalizedPoint(point: ImageEditPoint, rect: { left: number; top: number; width: number; height: number }): ImageEditPoint {
  return {
    x: tidy(clamp01((point.x - rect.left) / Math.max(1, rect.width))),
    y: tidy(clamp01((point.y - rect.top) / Math.max(1, rect.height))),
  };
}

export function rotateNormalizedPoint(point: ImageEditPoint, degrees: number): ImageEditPoint {
  const rotation = ((degrees % 360) + 360) % 360;
  if (rotation === 90) return { x: tidy(1 - point.y), y: tidy(point.x) };
  if (rotation === 180) return { x: tidy(1 - point.x), y: tidy(1 - point.y) };
  if (rotation === 270) return { x: tidy(point.y), y: tidy(1 - point.x) };
  return { x: tidy(point.x), y: tidy(point.y) };
}

function transformAnnotation(annotation: ImageAnnotation, fn: (point: ImageEditPoint) => ImageEditPoint): ImageAnnotation {
  if (annotation.kind === "freehand") return { ...annotation, points: annotation.points.map(fn) };
  if (annotation.kind === "text") return { ...annotation, point: fn(annotation.point) };
  return { ...annotation, start: fn(annotation.start), end: fn(annotation.end) };
}

function normalizeCrop(crop?: ImageCrop): ImageCrop | undefined {
  if (!crop) return undefined;
  const x = clamp01(crop.x);
  const y = clamp01(crop.y);
  const width = Math.min(clamp01(crop.width), 1 - x);
  const height = Math.min(clamp01(crop.height), 1 - y);
  if (width < 0.01 || height < 0.01) return undefined;
  return { x: tidy(x), y: tidy(y), width: tidy(width), height: tidy(height) };
}

function normalizeAnnotation(annotation: ImageAnnotation): ImageAnnotation | null {
  const common = {
    id: annotation.id,
    kind: annotation.kind,
    color: annotation.color || "#EF4444",
    strokeWidth: clamp(annotation.strokeWidth, 1, 24),
  };
  if (annotation.kind === "text") {
    const text = annotation.text.trim();
    return text ? { ...common, kind: "text", point: normalizeImagePoint(annotation.point), text } : null;
  }
  if (annotation.kind === "freehand") {
    const points = annotation.points.map(normalizeImagePoint);
    return points.length >= 2 ? { ...common, kind: "freehand", points } : null;
  }
  return { ...common, kind: annotation.kind, start: normalizeImagePoint(annotation.start), end: normalizeImagePoint(annotation.end) };
}

export function normalizeImageEdits(edits?: Partial<ImageEdits>): ImageEdits {
  const rotation = ((((edits?.rotation ?? 0) % 360) + 360) % 360) as ImageEdits["rotation"];
  const crop = normalizeCrop(edits?.crop);
  return {
    rotation: [0, 90, 180, 270].includes(rotation) ? rotation : 0,
    ...(crop ? { crop } : {}),
    brightness: clamp(edits?.brightness ?? 100, 40, 200),
    contrast: clamp(edits?.contrast ?? 100, 40, 250),
    invert: Boolean(edits?.invert),
    annotations: (edits?.annotations ?? []).map(normalizeAnnotation).filter((item): item is ImageAnnotation => Boolean(item)),
    ...(edits?.updatedAt ? { updatedAt: edits.updatedAt } : {}),
  };
}

export function applyImageCommand(edits: ImageEdits, command: ImageEditorCommand): ImageEdits {
  const current = normalizeImageEdits(edits);
  if (command.type === "reset") return emptyImageEdits();
  if (command.type === "rotate") {
    const delta = ((command.degrees % 360) + 360) % 360;
    return normalizeImageEdits({
      ...current,
      rotation: (current.rotation + delta) as ImageEdits["rotation"],
      annotations: current.annotations.map((annotation) => transformAnnotation(annotation, (point) => rotateNormalizedPoint(point, delta))),
    });
  }
  if (command.type === "crop") return normalizeImageEdits({ ...current, crop: command.crop });
  if (command.type === "visual") return normalizeImageEdits({ ...current, ...command });
  if (command.type === "remove-annotation") return { ...current, annotations: current.annotations.filter((item) => item.id !== command.id) };
  const annotation = normalizeAnnotation(command.annotation);
  if (!annotation) return current;
  return { ...current, annotations: [...current.annotations.filter((item) => item.id !== annotation.id), annotation] };
}

function inverseRotateNormalizedPoint(point: ImageEditPoint, degrees: number) {
  return rotateNormalizedPoint(point, 360 - (((degrees % 360) + 360) % 360));
}

export function applyCropSelection(edits: ImageEdits, selection: ImageCrop): ImageEdits {
  const current = normalizeImageEdits(edits);
  const selected = normalizeCrop(selection);
  if (!selected) return current;
  const corners = [
    { x: selected.x, y: selected.y },
    { x: selected.x + selected.width, y: selected.y },
    { x: selected.x, y: selected.y + selected.height },
    { x: selected.x + selected.width, y: selected.y + selected.height },
  ].map((point) => inverseRotateNormalizedPoint(point, current.rotation));
  const minX = Math.min(...corners.map((point) => point.x));
  const minY = Math.min(...corners.map((point) => point.y));
  const maxX = Math.max(...corners.map((point) => point.x));
  const maxY = Math.max(...corners.map((point) => point.y));
  const old = current.crop ?? { x: 0, y: 0, width: 1, height: 1 };
  const crop = normalizeCrop({
    x: old.x + minX * old.width,
    y: old.y + minY * old.height,
    width: (maxX - minX) * old.width,
    height: (maxY - minY) * old.height,
  });
  const mapPoint = (point: ImageEditPoint) => ({
    x: tidy((point.x - selected.x) / selected.width),
    y: tidy((point.y - selected.y) / selected.height),
  });
  return normalizeImageEdits({ ...current, crop, annotations: current.annotations.map((annotation) => transformAnnotation(annotation, mapPoint)) });
}

export function createImageEditHistory(initial: ImageEdits): ImageEditHistory {
  return { past: [], present: normalizeImageEdits(initial), future: [] };
}

export function pushImageEditHistory(history: ImageEditHistory, next: ImageEdits): ImageEditHistory {
  return { past: [...history.past, history.present].slice(-50), present: normalizeImageEdits(next), future: [] };
}

export function undoImageEditHistory(history: ImageEditHistory): ImageEditHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redoImageEditHistory(history: ImageEditHistory): ImageEditHistory {
  const next = history.future[0];
  if (!next) return history;
  return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
}

export function hasImageEdits(edits?: Partial<ImageEdits>): boolean {
  const value = normalizeImageEdits(edits);
  return value.rotation !== 0 || Boolean(value.crop) || value.brightness !== 100 || value.contrast !== 100 || value.invert || value.annotations.length > 0;
}
