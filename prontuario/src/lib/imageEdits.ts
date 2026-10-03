import type { ImageAnnotation, ImageCrop, ImageEditPoint, ImageEdits } from "./types";

export type ImageEditorCommand =
  | { type: "rotate"; degrees: number }
  | { type: "crop"; crop?: ImageCrop }
  | { type: "visual"; brightness?: number; contrast?: number; invert?: boolean }
  | { type: "add-annotation"; annotation: ImageAnnotation }
  | { type: "remove-annotation"; id: string }
  | { type: "reset" };

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

export function emptyImageEdits(): ImageEdits {
  return { rotation: 0, brightness: 100, contrast: 100, invert: false, annotations: [] };
}

export function normalizeImagePoint(point: ImageEditPoint): ImageEditPoint {
  return { x: clamp01(point.x), y: clamp01(point.y) };
}

function normalizeCrop(crop?: ImageCrop): ImageCrop | undefined {
  if (!crop) return undefined;
  const x = clamp01(crop.x);
  const y = clamp01(crop.y);
  const width = Math.min(clamp01(crop.width), 1 - x);
  const height = Math.min(clamp01(crop.height), 1 - y);
  if (width < 0.01 || height < 0.01) return undefined;
  return { x, y, width, height };
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
  if (command.type === "rotate") return normalizeImageEdits({ ...current, rotation: (current.rotation + command.degrees) as ImageEdits["rotation"] });
  if (command.type === "crop") return normalizeImageEdits({ ...current, crop: command.crop });
  if (command.type === "visual") return normalizeImageEdits({ ...current, ...command });
  if (command.type === "remove-annotation") return { ...current, annotations: current.annotations.filter((item) => item.id !== command.id) };
  const annotation = normalizeAnnotation(command.annotation);
  if (!annotation) return current;
  return { ...current, annotations: [...current.annotations.filter((item) => item.id !== annotation.id), annotation] };
}

export function hasImageEdits(edits?: Partial<ImageEdits>): boolean {
  const value = normalizeImageEdits(edits);
  return value.rotation !== 0 || Boolean(value.crop) || value.brightness !== 100 || value.contrast !== 100 || value.invert || value.annotations.length > 0;
}
