import { motion } from "framer-motion";
import { Eraser, MousePointer2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Segmented } from "@/components/ui/misc";
import { FACE_CONDITIONS, TOOTH_CONDITIONS } from "@/lib/constants";
import { toggleToothSelection } from "@/lib/derive";
import {
  LOWER_DECIDUOUS,
  LOWER_PERMANENT,
  SILHOUETTES,
  UPPER_DECIDUOUS,
  UPPER_PERMANENT,
  faceShort,
  isUpper,
  mesialOnRight,
  toothKind,
  toothName,
} from "@/lib/teeth";
import { odontogramMark } from "@/lib/odontogram";
import type { CustomOdontogramMarkId, Dentition, FaceCondition, Odontogram as Odo, OdontogramMarkDef, ToothCondition, ToothFace, ToothState } from "@/lib/types";
import { cn } from "@/lib/utils";

export type Tool = { kind: "select" } | { kind: "face"; value: FaceCondition } | { kind: "tooth"; value: ToothCondition } | { kind: "custom"; value: CustomOdontogramMarkId; scope: "face" | "tooth" } | { kind: "eraser" };

/* ---------- Geometria do diagrama de 5 faces ---------- */
const C = 20;
const R = 18;
const r = 7.2;
const pt = (rad: number, a: number) => `${(C + rad * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(C + rad * Math.sin((a * Math.PI) / 180)).toFixed(2)}`;
const ring = (a1: number, a2: number) => `M ${pt(R, a1)} A ${R} ${R} 0 0 1 ${pt(R, a2)} L ${pt(r, a2)} A ${r} ${r} 0 0 0 ${pt(r, a1)} Z`;
const SEG = { top: ring(-135, -45), right: ring(-45, 45), bottom: ring(45, 135), left: ring(135, 225) };

function facePositions(n: number): Record<"top" | "right" | "bottom" | "left", ToothFace> {
  const upper = isUpper(n);
  const mRight = mesialOnRight(n);
  return {
    top: upper ? "V" : "L",
    bottom: upper ? "L" : "V",
    right: mRight ? "M" : "D",
    left: mRight ? "D" : "M",
  };
}

export function toothHasData(t?: ToothState) {
  return !!t && ((t.whole?.length ?? 0) > 0 || Object.keys(t.faces ?? {}).length > 0 || !!t.note);
}

function Silhouette({ n, state, onClick, highlight, customMarks }: { n: number; state?: ToothState; onClick: () => void; highlight: boolean; customMarks: OdontogramMarkDef[] }) {
  const s = SILHOUETTES[toothKind(n)];
  const upper = isUpper(n);
  const whole = state?.whole ?? [];
  const absent = whole.includes("ausente");
  const implant = whole.includes("implante");
  const crown = whole.includes("coroa");
  const customWhole = customMarks.find((item) => item.scope === "tooth" && whole.includes(item.id));
  const flip = upper ? undefined : "translate(0 76) scale(1 -1)";
  return (
    <svg viewBox="-2 -2 44 80" className={cn("h-[64px] w-full cursor-pointer transition", highlight && "drop-shadow-[0_0_6px_rgba(37,165,111,0.55)]")} onClick={onClick}>
      <g transform={flip}>
        {implant ? (
          <g>
            <path d="M14.5 10 L25.5 10 L24.5 44 L15.5 44 Z" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.4" />
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1="13.5" x2="26.5" y1={13 + i * 4.3} y2={14.6 + i * 4.3} stroke="#7C3AED" strokeWidth="1.3" />
            ))}
          </g>
        ) : (
          <path d={s.root} fill="rgb(var(--surface-2))" stroke="rgb(var(--ink-3))" strokeWidth="1.2" opacity={absent ? 0.25 : 1} strokeDasharray={absent ? "3 2" : undefined} />
        )}
        {whole.includes("canal") && !implant && <path d={s.canal} stroke="#DB2777" strokeWidth="3" fill="none" strokeLinecap="round" />}
        <path
          d={s.crown}
          fill={customWhole?.color ?? (crown ? "#FEF3C7" : "rgb(var(--surface))")}
          fillOpacity={customWhole ? 0.72 : 1}
          stroke={customWhole?.color ?? (crown ? "#CA8A04" : "rgb(var(--ink-3))")}
          strokeWidth={crown || customWhole ? 2.2 : 1.2}
          opacity={absent && !implant ? 0.25 : 1}
          strokeDasharray={absent && !implant ? "3 2" : undefined}
        />
        {whole.includes("protese") && <rect x="-2" y="52" width="44" height="7" rx="2" fill="#0891B2" opacity="0.85" />}
      </g>
      {absent && !implant && <path d="M6 10 L34 66 M34 10 L6 66" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />}
      {whole.includes("extracao") && <path d="M6 10 L34 66 M34 10 L6 66" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" />}
    </svg>
  );
}

function FaceDiagram({
  n,
  state,
  onFace,
  hoverable,
  selected,
  customMarks,
}: {
  n: number;
  state?: ToothState;
  onFace: (face: ToothFace) => void;
  hoverable: boolean;
  selected: boolean;
  customMarks: OdontogramMarkDef[];
}) {
  const pos = facePositions(n);
  const faces = state?.faces ?? {};
  const fill = (f: ToothFace) => (faces[f] ? odontogramMark(faces[f]!, customMarks).color : "rgb(var(--surface))");
  const absent = state?.whole?.includes("ausente") && !state?.whole?.includes("implante");
  return (
    <svg viewBox="0 0 40 40" className={cn("h-[34px] w-[34px]", absent && "opacity-30")}>
      {(Object.keys(SEG) as (keyof typeof SEG)[]).map((k) => {
        const f = pos[k];
        return (
          <path
            key={k}
            d={SEG[k]}
            fill={fill(f)}
            stroke={selected ? "rgb(var(--brand))" : "rgb(var(--ink-3))"}
            strokeWidth={selected ? 1.6 : 1}
            className={cn("cursor-pointer transition-[filter]", hoverable && "hover:brightness-90")}
            onClick={(e) => {
              e.stopPropagation();
              onFace(f);
            }}
          >
            <title>{faceShort(f, n)}</title>
          </path>
        );
      })}
      <circle
        cx={C}
        cy={C}
        r={r}
        fill={fill("O")}
        stroke={selected ? "rgb(var(--brand))" : "rgb(var(--ink-3))"}
        strokeWidth={selected ? 1.6 : 1}
        className={cn("cursor-pointer", hoverable && "hover:brightness-90")}
        onClick={(e) => {
          e.stopPropagation();
          onFace("O");
        }}
      >
        <title>{faceShort("O", n)}</title>
      </circle>
    </svg>
  );
}

function Tooth({
  n,
  state,
  selected,
  tool,
  onApplyFace,
  onApplyTooth,
  customMarks,
}: {
  n: number;
  state?: ToothState;
  selected: boolean;
  tool: Tool;
  onApplyFace: (n: number, face: ToothFace) => void;
  onApplyTooth: (n: number) => void;
  customMarks: OdontogramMarkDef[];
}) {
  const upper = isUpper(n);
  const has = toothHasData(state);
  const label = (
    <span
      className={cn(
        "mx-auto flex h-5 min-w-[26px] items-center justify-center rounded-md px-1 text-[11px] font-bold tabular-nums transition",
        selected ? "bg-jade-600 text-white" : has ? "bg-brand-soft text-brand-ink" : "text-ink-3",
      )}
    >
      {n}
    </span>
  );
  const sil = <Silhouette n={n} state={state} onClick={() => onApplyTooth(n)} highlight={selected} customMarks={customMarks} />;
  const faces = <FaceDiagram n={n} state={state} onFace={(f) => onApplyFace(n, f)} hoverable={tool.kind === "face" || (tool.kind === "custom" && tool.scope === "face") || tool.kind === "eraser"} selected={selected} customMarks={customMarks} />;
  return (
    <div title={`${n} · ${toothName(n)}${state?.note ? `\n📝 ${state.note}` : ""}`} className={cn("relative flex w-[46px] shrink-0 flex-col items-center gap-1 rounded-xl py-1.5 transition", selected ? "bg-brand-soft/70" : "hover:bg-surface-2")}>
      {upper ? (
        <>
          {label}
          {sil}
          {faces}
        </>
      ) : (
        <>
          {faces}
          {sil}
          {label}
        </>
      )}
      {state?.note && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />}
    </div>
  );
}

function Row({ teeth, ...rest }: { teeth: number[] } & Omit<Parameters<typeof Tooth>[0], "n" | "state" | "selected"> & { odo: Odo; selected: number[] }) {
  const half = teeth.length / 2;
  const { odo, selected, ...toothProps } = rest;
  return (
    <div className="flex items-stretch justify-center">
      {teeth.map((n, i) => (
        <div key={n} className={cn("flex", i === half && "border-l-2 border-dashed border-jade-300/70 pl-1 dark:border-jade-700", i === half - 1 && "pr-1")}>
          <Tooth n={n} state={odo.teeth[String(n)]} selected={selected.includes(n)} {...toothProps} />
        </div>
      ))}
    </div>
  );
}

const TOOL_BTN = "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap";

export function Odontogram({
  value,
  onChange,
  selected,
  onSelect,
  extraToolbar,
  customMarks,
}: {
  value: Odo;
  onChange: (next: Odo) => void;
  selected: number[];
  onSelect: (teeth: number[]) => void;
  extraToolbar?: ReactNode;
  customMarks: OdontogramMarkDef[];
}) {
  const [tool, setTool] = useState<Tool>({ kind: "select" });
  const history = useRef<Odo[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  const commit = useCallback(
    (next: Odo) => {
      history.current.push(value);
      if (history.current.length > 40) history.current.shift();
      setCanUndo(true);
      onChange({ ...next, updatedAt: new Date().toISOString() });
    },
    [value, onChange],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (prev) onChange(prev);
    setCanUndo(history.current.length > 0);
  }, [onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (e.key === "Escape") setTool({ kind: "select" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const setTooth = (n: number, fn: (t: ToothState) => ToothState) => {
    const key = String(n);
    const cur = value.teeth[key] ?? {};
    const next = fn({ ...cur, faces: { ...(cur.faces ?? {}) }, whole: [...(cur.whole ?? [])] });
    const teeth = { ...value.teeth };
    if (!toothHasData(next)) delete teeth[key];
    else {
      if (next.faces && !Object.keys(next.faces).length) delete next.faces;
      if (next.whole && !next.whole.length) delete next.whole;
      teeth[key] = next;
    }
    commit({ ...value, teeth });
  };

  const includeSelection = (n: number) => {
    if (!selected.includes(n)) onSelect([...selected, n]);
  };

  const onApplyFace = (n: number, face: ToothFace) => {
    if (tool.kind === "select") {
      onSelect(toggleToothSelection(selected, n));
      return;
    }
    includeSelection(n);
    if (tool.kind === "face" || (tool.kind === "custom" && tool.scope === "face")) {
      setTooth(n, (t) => {
        if (t.faces![face] === tool.value) delete t.faces![face];
        else t.faces![face] = tool.value;
        return t;
      });
    } else if (tool.kind === "eraser") {
      setTooth(n, (t) => {
        delete t.faces![face];
        return t;
      });
    } else if (tool.kind === "tooth") onApplyTooth(n);
  };

  const onApplyTooth = (n: number) => {
    if (tool.kind === "select") {
      onSelect(toggleToothSelection(selected, n));
      return;
    }
    includeSelection(n);
    if (tool.kind === "tooth" || (tool.kind === "custom" && tool.scope === "tooth")) {
      setTooth(n, (t) => {
        const w = t.whole!;
        const i = w.indexOf(tool.value);
        if (i >= 0) w.splice(i, 1);
        else w.push(tool.value);
        return t;
      });
    } else if (tool.kind === "eraser") {
      setTooth(n, (t) => ({ note: t.note }));
    }
  };

  const isActive = (t: Tool) => JSON.stringify(t) === JSON.stringify(tool);
  const rowProps = { odo: value, selected, tool, onApplyFace, onApplyTooth, customMarks };
  const d: Dentition = value.dentition;

  return (
    <div>
      <div className="flex min-w-0 flex-col gap-3 border-b border-line p-4 2xl:flex-row 2xl:items-center">
        <div className="scrollbar-thin flex min-w-0 flex-wrap items-center gap-1.5">
          <button onClick={() => setTool({ kind: "select" })} className={cn(TOOL_BTN, isActive({ kind: "select" }) ? "border-jade-500 bg-jade-600 text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}>
            <MousePointer2 className="h-3.5 w-3.5" /> Selecionar{selected.length ? ` · ${selected.length}` : ""}
          </button>
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          {(Object.keys(FACE_CONDITIONS) as FaceCondition[]).map((k) => {
            const active = isActive({ kind: "face", value: k });
            return (
              <button
                key={k}
                onClick={() => setTool({ kind: "face", value: k })}
                className={cn(TOOL_BTN, active ? "text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
                style={active ? { background: FACE_CONDITIONS[k].color, borderColor: FACE_CONDITIONS[k].color } : undefined}
              >
                <span className="h-3 w-3 rounded-full ring-2 ring-white/60" style={{ background: FACE_CONDITIONS[k].color }} />
                {FACE_CONDITIONS[k].label.replace("Restauração provisória", "Provisória")}
              </button>
            );
          })}
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          {(Object.keys(TOOTH_CONDITIONS) as ToothCondition[]).map((k) => {
            const active = isActive({ kind: "tooth", value: k });
            return (
              <button
                key={k}
                onClick={() => setTool({ kind: "tooth", value: k })}
                className={cn(TOOL_BTN, active ? "text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
                style={active ? { background: TOOTH_CONDITIONS[k].color, borderColor: TOOTH_CONDITIONS[k].color } : undefined}
              >
                <span className="h-3 w-3 rounded-[4px] ring-2 ring-white/60" style={{ background: TOOTH_CONDITIONS[k].color }} />
                {TOOTH_CONDITIONS[k].label.split(" (")[0].split(" /")[0]}
              </button>
            );
          })}
          {customMarks.map((mark) => {
            const active = isActive({ kind: "custom", value: mark.id, scope: mark.scope });
            return (
              <button key={mark.id} onClick={() => setTool({ kind: "custom", value: mark.id, scope: mark.scope })} className={cn(TOOL_BTN, active ? "text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")} style={active ? { background: mark.color, borderColor: mark.color } : undefined}>
                <span className={cn("h-3 w-3 ring-2 ring-white/60", mark.scope === "face" ? "rounded-full" : "rounded-[4px]")} style={{ background: mark.color }} />
                {mark.label}
              </button>
            );
          })}
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          <button onClick={() => setTool({ kind: "eraser" })} className={cn(TOOL_BTN, isActive({ kind: "eraser" }) ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2 hover:border-jade-300")}>
            <Eraser className="h-3.5 w-3.5" /> Borracha
          </button>
          <button onClick={undo} disabled={!canUndo} className={cn(TOOL_BTN, "border-line bg-surface text-ink-2 hover:border-jade-300 disabled:opacity-40")} title="Desfazer (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" /> Desfazer
          </button>
        </div>
        <div className="flex items-center gap-2 2xl:ml-auto">
          {extraToolbar}
          <Segmented
            size="sm"
            value={d}
            onChange={(v) => commit({ ...value, dentition: v })}
            options={[
              { value: "permanente", label: "Permanente" },
              { value: "mista", label: "Mista" },
              { value: "decidua", label: "Decídua" },
            ]}
          />
        </div>
      </div>

      <motion.p key={JSON.stringify(tool)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-3 text-center text-xs text-ink-3">
        {tool.kind === "select" && (selected.length ? `${selected.length} dente${selected.length > 1 ? "s" : ""} selecionado${selected.length > 1 ? "s" : ""}. Clique para adicionar ou remover dentes da seleção.` : "Clique nos dentes para selecionar um ou vários. Escolha uma ferramenta acima para marcar.")}
        {tool.kind === "face" && `Clique nas faces dos dentes para marcar “${FACE_CONDITIONS[tool.value].label}”. Clique de novo para desmarcar.`}
        {tool.kind === "tooth" && `Clique nos dentes para marcar “${TOOTH_CONDITIONS[tool.value].label}”.`}
        {tool.kind === "custom" && `Clique ${tool.scope === "face" ? "nas faces" : "nos dentes"} para marcar “${odontogramMark(tool.value, customMarks).label}”. Clique de novo para desmarcar.`}
        {tool.kind === "eraser" && "Clique em uma face para limpá-la, ou no desenho do dente para limpar tudo."}
      </motion.p>

      <div className="scrollbar-thin overflow-x-auto px-4 pb-5 pt-3">
        <div className="mx-auto w-max space-y-1">
          <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-ink-3">
            <span>Direito do paciente</span>
            <span>Esquerdo do paciente</span>
          </div>
          {(d === "permanente" || d === "mista") && <Row teeth={UPPER_PERMANENT} {...rowProps} />}
          {(d === "decidua" || d === "mista") && <Row teeth={UPPER_DECIDUOUS} {...rowProps} />}
          <div className="relative my-2 flex items-center">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-jade-300 to-transparent dark:via-jade-700" />
          </div>
          {(d === "decidua" || d === "mista") && <Row teeth={LOWER_DECIDUOUS} {...rowProps} />}
          {(d === "permanente" || d === "mista") && <Row teeth={LOWER_PERMANENT} {...rowProps} />}
        </div>
      </div>
    </div>
  );
}

export function OdontogramLegend({ value, customMarks }: { value: Odo; customMarks: OdontogramMarkDef[] }) {
  const counts: Record<string, number> = {};
  Object.values(value.teeth).forEach((t) => {
    Object.values(t.faces ?? {}).forEach((c) => (counts[c] = (counts[c] ?? 0) + 1));
    (t.whole ?? []).forEach((c) => (counts[c] = (counts[c] ?? 0) + 1));
  });
  const all = [
    ...Object.entries(FACE_CONDITIONS).map(([k, v]) => ({ k, label: v.label, color: v.color, round: true })),
    ...Object.entries(TOOTH_CONDITIONS).map(([k, v]) => ({ k, label: v.label, color: v.color, round: false })),
    ...customMarks.map((v) => ({ k: v.id, label: v.label, color: v.color, round: v.scope === "face" })),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c) => (
        <span key={c.k} className={cn("chip border border-line bg-surface px-2.5 py-1 font-medium", counts[c.k] ? "text-ink" : "text-ink-3 opacity-60")}>
          <span className={cn("h-2.5 w-2.5", c.round ? "rounded-full" : "rounded-[3px]")} style={{ background: c.color }} />
          {c.label}
          {counts[c.k] ? <b className="ml-0.5 text-ink">{counts[c.k]}</b> : null}
        </span>
      ))}
    </div>
  );
}
