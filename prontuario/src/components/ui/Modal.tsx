import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  side?: boolean;
  className?: string;
}

const widths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[96vw]",
};

export function Modal({ open, onClose, title, subtitle, icon, children, footer, size = "md", side, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50 flex", side ? "justify-end" : "items-end justify-center p-0 sm:items-center sm:p-4")}>
          <motion.div
            className="absolute inset-0 bg-jade-950/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative flex w-full flex-col overflow-hidden border border-line bg-surface shadow-lift",
              side
                ? "h-full max-w-lg"
                : cn("max-h-[92vh] rounded-t-3xl sm:rounded-3xl", widths[size]),
              className,
            )}
            initial={side ? { x: 40, opacity: 0 } : { y: 24, opacity: 0, scale: 0.98 }}
            animate={side ? { x: 0, opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={side ? { x: 40, opacity: 0 } : { y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
          >
            {(title || icon) && (
              <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
                {icon && (
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">{icon}</div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold leading-tight text-ink">{title}</h2>
                  {subtitle && <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="-mr-2 rounded-xl p-2 text-ink-3 transition hover:bg-surface-2 hover:text-ink"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
