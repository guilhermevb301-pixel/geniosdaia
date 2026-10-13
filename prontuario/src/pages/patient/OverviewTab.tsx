import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, CalendarPlus, History, Pencil, Pin, Plus, StickyNote as NoteIcon, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { Card } from "@/components/ui/misc";
import { APPOINTMENT_STATUS, NOTE_COLORS } from "@/lib/constants";
import { confirmLink, openLink } from "@/lib/messages";
import type { NoteColor, Patient } from "@/lib/types";
import { cn, fmtDate, fmtDateLong, formatPhone, nowISO, toDate, uid } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import type { TabId } from "../PatientRecord";

function StickyNotes({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const [text, setText] = useState("");
  const [color, setColor] = useState<NoteColor>("amber");
  const [adding, setAdding] = useState(false);
  const add = () => {
    if (!text.trim()) return;
    updatePatient(patient.id, (p) => ({ notes: [{ id: uid("nt_"), text: text.trim(), color, createdAt: nowISO() }, ...p.notes] }));
    setText("");
    setAdding(false);
  };
  return (
    <Card
      title="Avisos fixados"
      icon={<Pin className="h-5 w-5" />}
      action={
        <Button size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={() => setAdding((v) => !v)}>
          Novo aviso
        </Button>
      }
    >
      <div className="space-y-2.5 p-4 pt-2">
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className={cn("rounded-2xl border-2 border-dashed p-3", NOTE_COLORS[color].border, NOTE_COLORS[color].bg)}>
                <textarea
                  autoFocus
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      add();
                    }
                  }}
                  className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
                  placeholder="Ex.: Prefere atendimento pela manhã · Tem medo de agulha…"
                />
                <div className="mt-2 flex items-center gap-2">
                  {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn("h-5 w-5 rounded-full border-2", NOTE_COLORS[c].border, NOTE_COLORS[c].bg, color === c && "ring-2 ring-jade-500 ring-offset-1 ring-offset-surface")}
                      title={NOTE_COLORS[c].label}
                    />
                  ))}
                  <Button size="sm" className="ml-auto" onClick={add}>
                    Fixar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {patient.notes.length === 0 && !adding && (
          <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-ink-3">
            Fixe aqui informações importantes que devem aparecer sempre que abrir este paciente.
          </p>
        )}
        <AnimatePresence initial={false}>
          {patient.notes.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn("group relative flex gap-2.5 rounded-2xl border p-3 pr-8", NOTE_COLORS[n.color].bg, NOTE_COLORS[n.color].border)}
            >
              <NoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
              <div>
                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-ink">{n.text}</p>
                <p className="mt-1 text-[11px] text-ink-3">{fmtDate(n.createdAt)}</p>
              </div>
              <button
                onClick={() => updatePatient(patient.id, (p) => ({ notes: p.notes.filter((x) => x.id !== n.id) }))}
                className="absolute right-2 top-2 rounded-lg p-1 text-ink-3 opacity-0 transition hover:bg-black/5 hover:text-ink group-hover:opacity-100"
                title="Remover aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}

function InfoRow({ label, value, sensitive }: { label: string; value?: string; sensitive?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 py-2.5 last:border-0">
      <span className="text-sm text-ink-3">{label}</span>
      <span className="text-right text-sm font-semibold text-ink" data-sensitive={sensitive ? "" : undefined}>
        {value || <span className="font-normal text-ink-3">—</span>}
      </span>
    </div>
  );
}

export function OverviewTab({ patient, goTo }: { patient: Patient; goTo: (t: TabId) => void }) {
  const appointments = useStore((s) => s.appointments);
  const settings = useStore((s) => s.settings);
  const { openPatientModal, openApptModal } = useUI();
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.patientId === patient.id && toDate(a.start)! >= new Date(new Date().setHours(0, 0, 0, 0)) && a.status !== "cancelado")
        .sort((a, b) => a.start.localeCompare(b.start))
        .slice(0, 4),
    [appointments, patient.id],
  );
  const history = useMemo(() => appointments.filter((a) => a.patientId === patient.id && a.status === "atendido").length, [appointments, patient.id]);
  const lastEvolutions = [...patient.evolutions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-6">
        <StickyNotes patient={patient} />
        <Card
          title="Dados pessoais"
          icon={<User className="h-5 w-5" />}
          action={
            <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openPatientModal(patient.id)}>
              Editar
            </Button>
          }
        >
          <div className="px-5 pb-3">
            <InfoRow label="Nascimento" value={patient.birthDate ? fmtDateLong(patient.birthDate) : undefined} />
            <InfoRow label="Celular" value={formatPhone(patient.phone)} sensitive />
            <InfoRow label="E-mail" value={patient.email} sensitive />
            <InfoRow label="CPF" value={patient.cpf} sensitive />
            <InfoRow label="RG" value={patient.rg} sensitive />
            <InfoRow label="Endereço" value={[patient.address, patient.city].filter(Boolean).join(" — ")} sensitive />
            <InfoRow label="Profissão" value={patient.profession} />
            <InfoRow label="Convênio" value={patient.insurance || "Particular"} />
            <InfoRow label="Como conheceu" value={patient.referredBy} />
            <InfoRow label="Emergência" value={patient.emergencyContact} sensitive />
            <InfoRow label="Paciente desde" value={fmtDate(patient.createdAt, "MMMM 'de' yyyy")} />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card
          title="Próximas consultas"
          icon={<CalendarDays className="h-5 w-5" />}
          action={
            <Button size="sm" variant="ghost" icon={<CalendarPlus className="h-4 w-4" />} onClick={() => openApptModal({ patientId: patient.id })}>
              Agendar
            </Button>
          }
        >
          <div className="space-y-2 p-4 pt-2">
            {upcoming.length === 0 && <p className="py-4 text-center text-sm text-ink-3">Nenhuma consulta futura. {history ? `${history} atendimento${history > 1 ? "s" : ""} no histórico.` : ""}</p>}
            {upcoming.map((a) => {
              const d = toDate(a.start)!;
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                    <span className="text-[10px] font-bold uppercase leading-none">{fmtDate(d, "MMM")}</span>
                    <span className="font-display text-lg font-semibold leading-tight">{fmtDate(d, "dd")}</span>
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => openApptModal({ ...a })}>
                    <p className="truncate text-sm font-bold text-ink">{a.procedure}</p>
                    <p className="text-xs text-ink-3 first-letter:uppercase">
                      {fmtDate(d, "EEEE, HH:mm")} · {a.duration} min
                    </p>
                  </button>
                  <span className={cn("chip", APPOINTMENT_STATUS[a.status].chip)}>{APPOINTMENT_STATUS[a.status].label}</span>
                  {a.status === "agendado" && (
                    <button onClick={() => openLink(confirmLink(patient, a, settings))} title="Confirmar pelo WhatsApp" className="rounded-lg p-1.5 text-[#25D366] hover:bg-[#25D366]/10">
                      <WhatsAppIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          title="Últimas evoluções"
          icon={<History className="h-5 w-5" />}
          action={
            <button onClick={() => goTo("evolucao")} className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          <div className="p-4 pt-2">
            {lastEvolutions.length === 0 && <p className="py-4 text-center text-sm text-ink-3">Nenhum atendimento registrado ainda.</p>}
            <ol className="relative space-y-4 border-l-2 border-jade-200 pl-5 dark:border-jade-800">
              {lastEvolutions.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-jade-500" />
                  <p className="text-xs font-semibold text-ink-3">{fmtDateLong(e.date)}</p>
                  <p className="text-sm font-bold text-ink">{e.title}</p>
                  <p className="line-clamp-2 text-sm text-ink-2">{e.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { t: "odontograma" as TabId, label: "Dentes marcados", value: Object.keys(patient.odontogram.teeth).length },
            { t: "tratamentos" as TabId, label: "Procedimentos", value: patient.treatments.length },
            { t: "imagens" as TabId, label: "Imagens", value: patient.attachments.length },
            { t: "lembretes" as TabId, label: "Lembretes", value: patient.reminders.filter((r) => !r.done).length },
          ].map((s) => (
            <button key={s.t} onClick={() => goTo(s.t)} className="card p-4 text-left transition hover:-translate-y-0.5 hover:border-jade-300">
              <p className="font-display text-2xl font-semibold text-ink">{s.value}</p>
              <p className="text-xs text-ink-3">{s.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
