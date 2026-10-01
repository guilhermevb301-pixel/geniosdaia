import { addDays, addMonths, format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { BellPlus, BellRing, Check, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast, confirmDialog } from "@/components/ui/feedback";
import { Card, EmptyState, Field, Select } from "@/components/ui/misc";
import { REMINDER_TYPES } from "@/lib/constants";
import type { Patient, Reminder, ReminderType } from "@/lib/types";
import { cn, fmtDate, nowISO, toDate, uid } from "@/lib/utils";
import { useStore } from "@/store/store";
import { reminderAttention } from "@/lib/reminders";
import { useClock } from "@/lib/useClock";
import { whatsappLink } from "@/lib/utils";

export function ReminderItem({ r, onToggle, onDelete, subtitle, patient }: { r: Reminder; onToggle: () => void; onDelete: () => void; subtitle?: React.ReactNode; patient?: Patient }) {
  useClock();
  const settings = useStore(s => s.settings);
  const attention = reminderAttention(r);
  const due = toDate(r.dueAt)!;
  const type = REMINDER_TYPES[r.type] ?? REMINDER_TYPES.outro;
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className={cn("group rounded-2xl border border-line bg-surface p-4 shadow-sm", r.done && "opacity-70")}>
      <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className={cn("break-words font-semibold leading-relaxed text-ink", r.done && "line-through")}>{r.title}</p>
        {subtitle && <div className="mt-1 text-sm">{subtitle}</div>}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2"><span>{type.label}</span><span>{fmtDate(due, "dd/MM/yyyy 'às' HH:mm")}</span>{attention && <span className="font-semibold text-rose-600">{attention} · entrar em contato</span>}</p>
      </div>
      <button aria-label="Excluir lembrete" onClick={async () => { if (await confirmDialog({ title: "Excluir este lembrete?", description: r.title, confirmLabel: "Excluir", danger: true })) onDelete(); }} className="shrink-0 rounded-lg p-2 text-ink-3 hover:bg-surface-2 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!r.done && patient?.phone && whatsappLink(patient.phone) && <a className="inline-flex min-h-10 items-center rounded-xl border border-line px-3 py-2 text-sm font-semibold text-brand hover:bg-surface-2" target="_blank" rel="noreferrer" href={whatsappLink(patient.phone, `Olá, ${patient.name.split(" ")[0]}! Aqui é do consultório do ${settings.title} ${settings.doctorName}. Podemos conversar sobre seu acompanhamento?`) || undefined}>Entrar em contato pelo WhatsApp</a>}
        {!r.done && patient && !whatsappLink(patient.phone) && <span className="text-sm text-ink-2">Cadastre o telefone em Visão geral → Editar para entrar em contato.</span>}
        <button onClick={onToggle} className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-ink-2 hover:border-jade-500 hover:bg-surface-2" title={r.done ? "Reabrir" : "Marcar como feito"}><Check className="h-4 w-4" />{r.done ? "Reabrir" : "Concluir"}</button>
      </div>
    </motion.div>
  );
}

export function RemindersTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const recallMonths = useStore((s) => s.settings.recallMonths);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>("retorno");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");

  const add = (r?: Partial<Reminder>) => {
    const t = r?.title ?? title.trim();
    if (!t) return toast.error("Escreva o lembrete");
    const candidate = r?.dueAt ? new Date(r.dueAt) : new Date(`${date}T${time}:00`);
    if (!Number.isFinite(candidate.getTime())) return toast.error("Informe uma data e hora válidas.");
    const dueAt = candidate.toISOString();
    updatePatient(patient.id, (p) => ({
      reminders: [...p.reminders, { id: uid("rm_"), title: t, type: r?.type ?? type, dueAt, done: false, createdAt: nowISO() }],
    }));
    setTitle("");
    toast.success("Lembrete criado", `${t} · ${fmtDate(dueAt, "dd/MM HH:mm")}`);
  };

  const presets = [
    { label: `Retorno em ${recallMonths} meses`, title: "Entrar em contato para agendar revisão", type: "retorno" as const, dueAt: addMonths(new Date(), recallMonths) },
    { label: "Ligar amanhã", title: "Ligar para saber como está", type: "outro" as const, dueAt: addDays(new Date(), 1) },
    { label: "Cobrar em 7 dias", title: "Verificar pagamento pendente", type: "pagamento" as const, dueAt: addDays(new Date(), 7) },
    { label: "Pós-operatório", title: "Entrar em contato para acompanhar o pós-operatório", type: "retorno" as const },
    { label: "Solicitar exames", title: "Entrar em contato para solicitar os exames definidos pelo doutor", type: "outro" as const },
    { label: "Confirmar cirurgia", title: "Confirmar data, horário e local da cirurgia", type: "confirmacao" as const },
  ];

  const pending = useMemo(() => patient.reminders.filter((r) => !r.done).sort((a, b) => a.dueAt.localeCompare(b.dueAt)), [patient.reminders]);
  const done = useMemo(() => patient.reminders.filter((r) => r.done).sort((a, b) => b.dueAt.localeCompare(a.dueAt)), [patient.reminders]);
  const toggle = (id: string) => updatePatient(patient.id, (p) => ({ reminders: p.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) }));
  const remove = (id: string) => updatePatient(patient.id, (p) => ({ reminders: p.reminders.filter((r) => r.id !== id) }));

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <Card title="Novo lembrete" icon={<BellPlus className="h-5 w-5" />} className="xl:self-start">
        <div className="space-y-4 p-5 pt-3">
          <p className="text-sm text-ink-2">Escolha um modelo ou escreva abaixo. Confira a data e clique em Criar lembrete.</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setTitle(p.title);
                  setType(p.type);
                  if (p.dueAt) setDate(format(p.dueAt, "yyyy-MM-dd"));
                  setTime("09:00");
                }}
                className="chip border border-line bg-surface px-2.5 py-1 text-ink-2 transition hover:border-jade-400 hover:bg-brand-soft hover:text-brand-ink"
              >
                <RotateCcw className="h-3 w-3" /> {p.label}
              </button>
            ))}
          </div>
          <Field label="O que lembrar?">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex.: Ligar para confirmar o retorno" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo" className="col-span-2">
              <Select value={type} onChange={(e) => setType(e.target.value as ReminderType)}>
                {(Object.keys(REMINDER_TYPES) as ReminderType[]).map((t) => (
                  <option key={t} value={t}>
                    {REMINDER_TYPES[t].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data do contato">
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Hora">
              <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <Button className="w-full" onClick={() => add()}>
            Criar lembrete
          </Button>
          <p className="text-sm text-ink-2">O aviso fica vermelho 3 dias antes, no dia e depois do vencimento, até você marcar como feito. Abra o sistema para acompanhar; o WhatsApp é enviado por você.</p>
        </div>
      </Card>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-display text-xl font-semibold text-ink">Pendentes · {pending.length}</h3>
          {pending.length === 0 ? (
            <div className="card">
              <EmptyState icon={<BellRing className="h-7 w-7" />} title="Nenhum lembrete pendente" description="Crie lembretes de retorno, medicação, pagamentos ou qualquer coisa sobre este paciente." />
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {pending.map((r) => (
                  <ReminderItem key={r.id} r={r} patient={patient} onToggle={() => toggle(r.id)} onDelete={() => remove(r.id)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        {done.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-3">Concluídos · {done.length}</h3>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {done.map((r) => (
                  <ReminderItem key={r.id} r={r} onToggle={() => toggle(r.id)} onDelete={() => remove(r.id)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
