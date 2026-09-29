import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { create } from "zustand";
import { uid } from "@/lib/utils";
import { Button } from "./Button";
import { Modal } from "./Modal";

/* ---------- Toasts ---------- */

type ToastKind = "success" | "error" | "info" | "warning";
interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: string) => void }>((set) => ({
  items: [],
  push: (t) => {
    const id = uid("t");
    set((s) => ({ items: [...s.items.slice(-3), { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), t.kind === "warning" ? 7000 : 4200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string, action?: Toast["action"]) => useToasts.getState().push({ kind: "success", title, description, action }),
  error: (title: string, description?: string) => useToasts.getState().push({ kind: "error", title, description }),
  info: (title: string, description?: string) => useToasts.getState().push({ kind: "info", title, description }),
  warning: (title: string, description?: string) => useToasts.getState().push({ kind: "warning", title, description }),
};

const toastIcons: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-jade-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

export function Toaster() {
  const { items, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2 max-md:bottom-20">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface p-3.5 shadow-lift ${
              t.kind === "warning" ? "border-amber-300 dark:border-amber-700" : "border-line"
            }`}
            onClick={() => dismiss(t.id)}
          >
            <div className="mt-0.5">{toastIcons[t.kind]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{t.description}</p>}
            </div>
            {t.action && (
              <button
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-brand hover:bg-brand-soft"
                onClick={(e) => {
                  e.stopPropagation();
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Confirmação ---------- */

interface ConfirmOpts {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

const useConfirmStore = create<{ opts: ConfirmOpts | null; resolve: ((v: boolean) => void) | null }>(() => ({
  opts: null,
  resolve: null,
}));

export function confirmDialog(opts: ConfirmOpts): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.setState({ opts, resolve }));
}

export function ConfirmHost() {
  const { opts, resolve } = useConfirmStore();
  const [busy, setBusy] = useState(false);
  const close = (v: boolean) => {
    resolve?.(v);
    useConfirmStore.setState({ opts: null, resolve: null });
    setBusy(false);
  };
  return (
    <Modal
      open={!!opts}
      onClose={() => close(false)}
      size="sm"
      title={opts?.title}
      icon={opts?.danger ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <Info className="h-5 w-5" />}
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>
            Cancelar
          </Button>
          <Button
            variant={opts?.danger ? "danger" : "primary"}
            disabled={busy}
            onClick={() => {
              setBusy(true);
              close(true);
            }}
          >
            {opts?.confirmLabel ?? "Confirmar"}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-2">{opts?.description}</div>
    </Modal>
  );
}
