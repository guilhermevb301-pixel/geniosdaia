import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { toNormalizedPoint } from "@/lib/imageEdits";
import type { ImageAnnotation, ImageEditPoint, ImageEdits } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ImageTool = "select" | "crop" | "freehand" | "arrow" | "ellipse" | "rectangle" | "text";

export interface ImageGesture {
  start: ImageEditPoint;
  end: ImageEditPoint;
  points: ImageEditPoint[];
}

function Bounds({ start, end }: { start: ImageEditPoint; end: ImageEditPoint }) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return { x, y, width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) };
}

function AnnotationShape({ annotation, selected, onSelect }: { annotation: ImageAnnotation; selected: boolean; onSelect?: () => void }) {
  const common = { stroke: annotation.color, strokeWidth: annotation.strokeWidth / 500, vectorEffect: "non-scaling-stroke" as const, fill: "none" };
  const selectProps = { onPointerDown: (event: ReactPointerEvent) => { event.stopPropagation(); onSelect?.(); }, className: onSelect ? "cursor-pointer" : undefined };
  if (annotation.kind === "freehand") return <polyline {...common} {...selectProps} points={annotation.points.map((p) => `${p.x},${p.y}`).join(" ")} strokeLinecap="round" strokeLinejoin="round" />;
  if (annotation.kind === "text") return <text {...selectProps} x={annotation.point.x} y={annotation.point.y} fill={annotation.color} stroke="rgba(0,0,0,.65)" strokeWidth="0.004" paintOrder="stroke" fontSize={Math.max(0.035, annotation.strokeWidth / 120)} fontWeight="700">{annotation.text}</text>;
  const b = Bounds({ start: annotation.start, end: annotation.end });
  if (annotation.kind === "arrow") return <line {...common} {...selectProps} x1={annotation.start.x} y1={annotation.start.y} x2={annotation.end.x} y2={annotation.end.y} markerEnd="url(#clinical-arrow)" strokeLinecap="round" />;
  if (annotation.kind === "ellipse") return <ellipse {...common} {...selectProps} cx={b.x + b.width / 2} cy={b.y + b.height / 2} rx={b.width / 2} ry={b.height / 2} />;
  return <rect {...common} {...selectProps} x={b.x} y={b.y} width={b.width} height={b.height} rx="0.008" />;
}

export function ImageCanvas({
  src,
  edits,
  naturalWidth = 4,
  naturalHeight = 3,
  tool = "select",
  editable = false,
  color = "#EF4444",
  strokeWidth = 4,
  selectedId,
  onSelectAnnotation,
  onGesture,
  className,
}: {
  src: string;
  edits: ImageEdits;
  naturalWidth?: number;
  naturalHeight?: number;
  tool?: ImageTool;
  editable?: boolean;
  color?: string;
  strokeWidth?: number;
  selectedId?: string;
  onSelectAnnotation?: (id?: string) => void;
  onGesture?: (gesture: ImageGesture) => void;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [gesture, setGesture] = useState<ImageGesture | null>(null);
  const crop = edits.crop ?? { x: 0, y: 0, width: 1, height: 1 };
  const rotated = edits.rotation === 90 || edits.rotation === 270;
  const aspectRatio = rotated ? (naturalHeight * crop.height) / Math.max(1, naturalWidth * crop.width) : (naturalWidth * crop.width) / Math.max(1, naturalHeight * crop.height);
  const imageTransform = useMemo(() => {
    if (edits.rotation === 90) return "translate(1 0) rotate(90)";
    if (edits.rotation === 180) return "translate(1 1) rotate(180)";
    if (edits.rotation === 270) return "translate(0 1) rotate(270)";
    return undefined;
  }, [edits.rotation]);
  const point = (event: ReactPointerEvent) => toNormalizedPoint({ x: event.clientX, y: event.clientY }, ref.current!.getBoundingClientRect());
  const down = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!editable || tool === "select") { onSelectAnnotation?.(undefined); return; }
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    setGesture({ start: p, end: p, points: [p] });
  };
  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!gesture) return;
    const p = point(event);
    setGesture({ ...gesture, end: p, points: tool === "freehand" ? [...gesture.points, p] : gesture.points });
  };
  const up = () => {
    if (!gesture) return;
    onGesture?.(gesture);
    setGesture(null);
  };
  const draft: ImageAnnotation | null = gesture && tool !== "select" && tool !== "crop" && tool !== "text"
    ? tool === "freehand"
      ? { id: "draft", kind: "freehand", color, strokeWidth, points: gesture.points }
      : { id: "draft", kind: tool, color, strokeWidth, start: gesture.start, end: gesture.end }
    : null;
  const cropDraft = gesture && tool === "crop" ? Bounds(gesture) : null;

  return (
    <div className={cn("relative mx-auto flex max-h-full max-w-full items-center justify-center", className)} style={{ aspectRatio }}>
      <svg ref={ref} viewBox="0 0 1 1" preserveAspectRatio="none" className={cn("block h-full w-full overflow-hidden rounded-lg bg-black", editable && tool !== "select" && "cursor-crosshair")} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setGesture(null)}>
        <defs>
          <marker id="clinical-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill={color} /></marker>
          <filter id="clinical-filters"><feComponentTransfer><feFuncR type="linear" slope={edits.brightness / 100} intercept="0" /><feFuncG type="linear" slope={edits.brightness / 100} intercept="0" /><feFuncB type="linear" slope={edits.brightness / 100} intercept="0" /></feComponentTransfer></filter>
        </defs>
        <g transform={imageTransform}>
          <image href={src} x={-crop.x / crop.width} y={-crop.y / crop.height} width={1 / crop.width} height={1 / crop.height} preserveAspectRatio="none" style={{ filter: `${edits.invert ? "invert(1) " : ""}brightness(${edits.brightness}%) contrast(${edits.contrast}%)` }} />
        </g>
        {edits.annotations.map((annotation) => <AnnotationShape key={annotation.id} annotation={annotation} selected={selectedId === annotation.id} onSelect={editable && tool === "select" ? () => onSelectAnnotation?.(annotation.id) : undefined} />)}
        {draft && <AnnotationShape annotation={draft} selected={false} />}
        {cropDraft && <rect x={cropDraft.x} y={cropDraft.y} width={cropDraft.width} height={cropDraft.height} fill="rgba(16,185,129,.12)" stroke="#34D399" strokeWidth="0.004" strokeDasharray="0.015 0.01" vectorEffect="non-scaling-stroke" />}
        {selectedId && <rect x="0.004" y="0.004" width="0.992" height="0.992" fill="none" stroke="#34D399" strokeWidth="0.004" strokeDasharray="0.015 0.01" pointerEvents="none" />}
      </svg>
    </div>
  );
}
