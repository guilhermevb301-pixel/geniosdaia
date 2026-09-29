import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CalendarDays, CalendarPlus, EyeOff, LayoutDashboard, Moon, Search, Settings, UserPlus, Users, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { patientAlerts } from "@/lib/derive";
import { ageLabel, cn, digits, formatPhone, normalize } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { Avatar } from "./ui/misc";

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  group: string;
  run: () => void;
  alert?: boolean;
}

export function CommandPalette() {
  const open = useUI((s) => s.palette);
  const setOpen = useUI((s) => s.setPalette);
  const patients = useStore((s) => s.patients);
  const recent = useStore((s) => s.recent);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().palette);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      setOpen(false);
    };
    const nq = normalize(q);
    const dq = digits(q);
    const list = patients
      .filter((p) => {
        if (!nq) return recent.includes(p.id);
        return normalize(p.name).includes(nq) || (dq.length >= 3 && (digits(p.phone).includes(dq) || digits(p.cpf).includes(dq)));
      })
      .sort((a, b) => (nq ? 0 : recent.indexOf(a.id) - recent.indexOf(b.id)))
      .slice(0, 8)
      .map<Item>((p) => ({
        id: p.id,
        label: p.name,
        hint: [ageLabel(p.birthDate), formatPhone(p.phone)].filter(Boolean).join(" · "),
        icon: <Avatar patient={p} size={30} />,
        group: nq ? "Pacientes" : "Vistos recentemente",
        alert: patientAlerts(p).length > 0,
        run: go(`/pacientes/${p.id}`),
      }));

    const actions: Item[] = [
      { id: "a-new", label: "Novo paciente", icon: <UserPlus className="h-4 w-4" />, group: "Ações", run: () => { setOpen(false); useUI.getState().openPatientModal(); } },
      { id: "a-appt", label: "Nova consulta", icon: <CalendarPlus className="h-4 w-4" />, group: "Ações", run: () => { setOpen(false); useUI.getState().openApptModal(); } },
      { id: "a-home", label: "Ir para Início", icon: <LayoutDashboard className="h-4 w-4" />, group: "Ir para", run: go("/") },
      { id: "a-pac", label: "Ir para Pacientes", icon: <Users className="h-4 w-4" />, group: "Ir para", run: go("/pacientes") },
      { id: "a-ag", label: "Ir para Agenda", icon: <CalendarDays className="h-4 w-4" />, group: "Ir para", run: go("/agenda") },
      { id: "a-fin", label: "Ir para Financeiro", icon: <Wallet className="h-4 w-4" />, group: "Ir para", run: go("/financeiro") },
      { id: "a-cfg", label: "Configurações", icon: <Settings className="h-4 w-4" />, group: "Ir para", run: go("/configuracoes") },
      {
        id: "a-theme",
        label: "Alternar tema claro/escuro",
        icon: <Moon className="h-4 w-4" />,
        group: "Preferências",
        run: () => {
          const s = useStore.getState();
          s.updateSettings({ theme: s.settings.theme === "dark" ? "light" : "dark" });
          setOpen(false);
        },
      },
      {
        id: "a-priv",
        label: "Modo discreto (desfocar dados)",
        icon: <EyeOff className="h-4 w-4" />,
        group: "Preferências",
        run: () => {
          const s = useStore.getState();
          s.setPrivacy(!s.privacy);
          setOpen(false);
        },
      },
    ].filter((a) => !nq || normalize(a.label).includes(nq));

    return [...list, ...actions];
  }, [q, patients, recent, navigate, setOpen]);

  useEffect(() => setIdx(0), [q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[idx]?.run();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let lastGroup = "";
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-jade-950/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-5 w-5 text-brand" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Digite o nome, telefone ou CPF do paciente…"
                className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">Esc</kbd>
            </div>
            <div className="scrollbar-thin max-h-[56vh] overflow-y-auto p-2">
              {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-3">Nada encontrado para “{q}”.</p>}
              {items.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null;
                lastGroup = it.group;
                return (
                  <div key={it.id}>
                    {header && <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-3">{header}</p>}
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={it.run}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                        i === idx ? "bg-brand-soft/70" : "hover:bg-surface-2",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center text-ink-2">{it.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink" data-sensitive={it.group !== "Ações" ? "" : undefined}>
                          {it.label}
                        </span>
                        {it.hint && <span className="block truncate text-xs text-ink-3" data-sensitive>{it.hint}</span>}
                      </span>
                      {it.alert && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-line bg-surface-2/70 px-4 py-2 text-[11px] text-ink-3">
              <span>↑↓ navegar</span>
              <span>↵ abrir</span>
              <span className="ml-auto">Ctrl + K de qualquer lugar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
