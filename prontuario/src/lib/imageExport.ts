import { normalizeImageEdits } from "./imageEdits";
import type { ImageAnnotation, ImageEditPoint, ImageEdits } from "./types";

export interface ImageOutputDimensions {
  width: number;
  height: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function editedImageDimensions(width: number, height: number, edits?: Partial<ImageEdits>): ImageOutputDimensions {
  const normalized = normalizeImageEdits(edits);
  const crop = normalized.crop ?? { x: 0, y: 0, width: 1, height: 1 };
  const croppedWidth = Math.max(1, Math.round(Math.max(1, width) * crop.width));
  const croppedHeight = Math.max(1, Math.round(Math.max(1, height) * crop.height));
  return normalized.rotation === 90 || normalized.rotation === 270
    ? { width: croppedHeight, height: croppedWidth }
    : { width: croppedWidth, height: croppedHeight };
}

export function editedImagePoint(point: ImageEditPoint, dimensions: ImageOutputDimensions): ImageEditPoint {
  return {
    x: Math.round(clamp01(point.x) * dimensions.width * 1_000) / 1_000,
    y: Math.round(clamp01(point.y) * dimensions.height * 1_000) / 1_000,
  };
}

async function loadImage(blob: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; dispose: () => void }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
  }
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Não foi possível abrir a imagem original."));
      image.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, dispose: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, start: ImageEditPoint, end: ImageEditPoint, size: number) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - size * Math.cos(angle - Math.PI / 6), end.y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(end.x - size * Math.cos(angle + Math.PI / 6), end.y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawAnnotation(ctx: CanvasRenderingContext2D, annotation: ImageAnnotation, dimensions: ImageOutputDimensions) {
  const point = (value: ImageEditPoint) => editedImagePoint(value, dimensions);
  const scale = Math.max(0.5, Math.min(dimensions.width, dimensions.height) / 800);
  const lineWidth = Math.max(1, annotation.strokeWidth * scale);
  ctx.strokeStyle = annotation.color;
  ctx.fillStyle = annotation.color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (annotation.kind === "freehand") {
    const points = annotation.points.map(point);
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((item) => ctx.lineTo(item.x, item.y));
    ctx.stroke();
    return;
  }
  if (annotation.kind === "text") {
    const at = point(annotation.point);
    const fontSize = Math.max(14, annotation.strokeWidth * 5 * scale);
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.lineWidth = Math.max(2, fontSize / 7);
    ctx.strokeStyle = "rgba(0,0,0,.65)";
    ctx.strokeText(annotation.text, at.x, at.y);
    ctx.fillText(annotation.text, at.x, at.y);
    return;
  }
  const start = point(annotation.start);
  const end = point(annotation.end);
  if (annotation.kind === "arrow") return drawArrow(ctx, start, end, Math.max(8, lineWidth * 4));
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  ctx.beginPath();
  if (annotation.kind === "ellipse") ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  else ctx.rect(x, y, width, height);
  ctx.stroke();
}

export async function exportEditedImage(blob: Blob, edits?: Partial<ImageEdits>): Promise<Blob> {
  const normalized = normalizeImageEdits(edits);
  const loaded = await loadImage(blob);
  try {
    const crop = normalized.crop ?? { x: 0, y: 0, width: 1, height: 1 };
    const sourceX = Math.round(crop.x * loaded.width);
    const sourceY = Math.round(crop.y * loaded.height);
    const sourceWidth = Math.max(1, Math.round(crop.width * loaded.width));
    const sourceHeight = Math.max(1, Math.round(crop.height * loaded.height));
    const dimensions = editedImageDimensions(loaded.width, loaded.height, normalized);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Este navegador não conseguiu preparar a imagem editada.");
    const outputPng = /(?:png|gif|svg)/i.test(blob.type);
    if (!outputPng) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.save();
    ctx.filter = `${normalized.invert ? "invert(1) " : ""}brightness(${normalized.brightness}%) contrast(${normalized.contrast}%)`;
    if (normalized.rotation === 90) {
      ctx.translate(dimensions.width, 0);
      ctx.rotate(Math.PI / 2);
    } else if (normalized.rotation === 180) {
      ctx.translate(dimensions.width, dimensions.height);
      ctx.rotate(Math.PI);
    } else if (normalized.rotation === 270) {
      ctx.translate(0, dimensions.height);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(loaded.source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    ctx.restore();
    normalized.annotations.forEach((annotation) => drawAnnotation(ctx, annotation, dimensions));
    const type = outputPng ? "image/png" : "image/jpeg";
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Não foi possível gerar a imagem editada.")), type, outputPng ? undefined : 0.94));
  } finally {
    loaded.dispose();
  }
}
