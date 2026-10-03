import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import type { Patient } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function Field({ label, children, className, hint }: { label: string; children: ReactNode; className?: string; hint?: ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select {...rest} className="input appearance-none pr-9">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
    </div>
  );
}

export function Switch({ checked, onChange, label, danger }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-left"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? (danger ? "bg-rose-500" : "bg-jade-500") : "bg-line",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 35 }}
          className={cn("h-5 w-5 rounded-full bg-white shadow", checked ? "ml-[22px]" : "ml-0.5")}
        />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  size?: "sm" | "md";
}) {
  const [layoutId] = useState(() => `seg-${Math.random().toString(36).slice(2)}`);
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-lg font-semibold transition-colors",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
            value === o.value ? "text-brand-ink" : "text-ink-3 hover:text-ink",
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-surface shadow-sm ring-1 ring-line"
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {o.icon}
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Avatar({ patient, size = 40, ring }: { patient: Pick<Patient, "name" | "color" | "photo">; size?: number; ring?: boolean }) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (patient.photo) {
    return (
      <img
        src={patient.photo}
        alt=""
        style={style}
        data-sensitive
        className={cn("shrink-0 rounded-full object-cover", ring && "ring-2 ring-surface")}
      />
    );
  }
  return (
    <div
      style={{ ...style, background: `linear-gradient(135deg, ${patient.color}, ${patient.color}cc)` }}
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight text-white", ring && "ring-2 ring-surface")}
    >
      {initials(patient.name || "?")}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-jade-400/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">{icon}</div>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Menu({
  trigger,
  items,
  align = "right",
}: {
  trigger: (open: boolean) => ReactNode;
  items: ({ label: ReactNode; icon?: ReactNode; onClick: () => void; danger?: boolean; checked?: boolean } | "divider")[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger(open)}</div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            "absolute z-40 mt-1.5 min-w-[210px] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((it, i) =>
            it === "divider" ? (
              <div key={i} className="my-1 h-px bg-line" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                  it.danger ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40" : "text-ink hover:bg-surface-2",
                )}
              >
                <span className="text-ink-3">{it.icon}</span>
                <span className="flex-1">{it.label}</span>
                {it.checked && <Check className="h-4 w-4 text-brand" />}
              </button>
            ),
          )}
        </motion.div>
      )}
    </div>
  );
}

export function ProgressRing({ value, size = 44, stroke = 5, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(var(--line))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#48C089" />
            <stop offset="1" stopColor="#178559" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink">{children}</div>
    </div>
  );
}

export function Card({ className, children, title, action, icon }: { className?: string; children: ReactNode; title?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <section className={cn("card", className)}>
      {title && (
        <header className="flex items-center gap-2.5 px-5 pb-1 pt-4">
          {icon && <span className="text-brand">{icon}</span>}
          <h3 className="flex-1 text-[15px] font-bold text-ink">{title}</h3>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h3 className="flex-1 text-sm font-bold uppercase tracking-wider text-ink-3">{children}</h3>
      {action}
    </div>
  );
}
