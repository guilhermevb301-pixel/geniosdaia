import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CalendarDays, FileText, Images, Loader2, Stethoscope, Users } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/store/store";
import { Logo, ToothPattern } from "./Logo";
import { Button } from "./ui/Button";

const FEATURES = [
  { icon: Stethoscope, title: "Odontograma interativo", text: "Marque cáries, restaurações, canais e implantes com um clique." },
  { icon: Users, title: "Pacientes organizados", text: "Busca instantânea, favoritos e etapas que mudam automaticamente." },
  { icon: CalendarDays, title: "Agenda inteligente", text: "Arraste consultas e confirme pelo WhatsApp." },
  { icon: Images, title: "Radiografias e fotos", text: "Negatoscópio, zoom e comparação antes/depois." },
  { icon: BellRing, title: "Lembretes e alertas", text: "Alergias em destaque, retornos e aniversários." },
  { icon: FileText, title: "Documentos prontos", text: "Receitas, atestados, orçamentos e recibos." },
];

export function Welcome() {
  const onboarded = useStore((s) => s.onboarded);
  const ready = useStore((s) => s.ready);
  const mode = useStore((s) => s.mode);
  const startWith = useStore((s) => s.startWith);
  const [busy, setBusy] = useState<null | "empty">(null);
  const open = ready && mode === "cloud" && !onboarded;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-jade-950/60 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-surface shadow-lift"
          >
            <div className="hero-bg relative overflow-hidden px-8 pb-10 pt-10 text-white">
              <ToothPattern className="absolute inset-0 h-full w-full text-white/[0.05]" />
              <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", delay: 0.15 }} className="relative">
                <Logo size={64} />
              </motion.div>
              <h1 className="relative mt-5 font-display text-4xl font-semibold leading-tight">Bem-vindo, Dr. Mizael! 🦷</h1>
              <p className="relative mt-2 max-w-xl text-jade-100/85">
                Este é o seu novo prontuário digital — feito sob medida para o seu consultório. Sua conta começa com 0 pacientes e 0 consultas.
              </p>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{f.title}</p>
                    <p className="text-xs leading-relaxed text-ink-3">{f.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-line bg-surface-2/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-sm text-ink-2">Nada da demonstração entra na sua conta. Seus cadastros ficam salvos automaticamente neste computador e na nuvem para continuar depois.</p>
              <div className="flex gap-2">
                <Button
                  disabled={!!busy}
                  onClick={async () => {
                    setBusy("empty");
                    await startWith(false);
                  }}
                  icon={busy === "empty" ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  Criar meu prontuário vazio
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
