import { addDays, addMonths, format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { BellPlus, BellRing, Check, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/feedback";
import { Card, EmptyState, Field, Select } from "@/components/ui/misc";
import { REMINDER_TYPES } from "@/lib/constants";
import type { Patient, Reminder, ReminderType } from "@/lib/types";
import { cn, fmtDate, nowISO, toDate, uid } from "@/lib/utils";
import { useStore } from "@/store/store";

export function ReminderItem({ r, onToggle, onDelete, subtitle }: { r: Reminder; onToggle: () => void; onDelete: () => void; subtitle?: React.ReactNode }) {
  const due = toDate(r.dueAt)!;
  const now = new Date();
  const overdue = !r.done && due < now;
  const today = !r.done && due.toDateString() === now.toDateString();
  const type = REMINDER_TYPES[r.type];
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className={cn("group flex items-center gap-3 rounded-2xl border bg-surface p-3", overdue ? "border-rose-200 dark:border-rose-900" : "border-line", r.done && "opacity-60")}>
      <button
        onClick={onToggle}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition",
          r.done ? "border-jade-500 bg-jade-500 text-white" : "border-line hover:border-jade-500 hover:bg-jade-50 dark:hover:bg-jade-900/40",
        )}
        title={r.done ? "Reabrir" : "Marcar como feito"}
      >
        {r.done ? <Check className="h-4 w-4" /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold text-ink", r.done && "line-through")}>{r.title}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
          <span className="font-semibold" style={{ color: type.color }}>
            {type.label}
          </span>
          <span className={cn(overdue && "font-bold text-rose-600", today && "font-bold text-amber-600")}>
            {overdue ? "Atrasado · " : today ? "Hoje · " : ""}
            {fmtDate(due, "dd/MM/yyyy 'às' HH:mm")}
          </span>
          {subtitle}
        </p>
      </div>
      <button onClick={onDelete} className="rounded-lg p-1.5 text-ink-3 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40">
        <Trash2 className="h-4 w-4" />
      </button>
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
    const dueAt = r?.dueAt ?? new Date(`${date}T${time}:00`).toISOString();
    updatePatient(patient.id, (p) => ({
      reminders: [...p.reminders, { id: uid("rm_"), title: t, type: r?.type ?? type, dueAt, done: false, createdAt: nowISO() }],
    }));
    setTitle("");
    toast.success("Lembrete criado", `${t} · ${fmtDate(dueAt, "dd/MM HH:mm")}`);
  };

  const presets = [
    { label: `Retorno em ${recallMonths} meses`, title: "Retorno para revisão e limpeza", type: "retorno" as const, dueAt: addMonths(new Date(), recallMonths) },
    { label: "Ligar amanhã", title: "Ligar para saber como está", type: "outro" as const, dueAt: addDays(new Date(), 1) },
    { label: "Cobrar em 7 dias", title: "Verificar pagamento pendente", type: "pagamento" as const, dueAt: addDays(new Date(), 7) },
    { label: "Pós-operatório (3 dias)", title: "Checar pós-operatório", type: "retorno" as const, dueAt: addDays(new Date(), 3) },
  ];

  const pending = useMemo(() => patient.reminders.filter((r) => !r.done).sort((a, b) => a.dueAt.localeCompare(b.dueAt)), [patient.reminders]);
  const done = useMemo(() => patient.reminders.filter((r) => r.done).sort((a, b) => b.dueAt.localeCompare(a.dueAt)), [patient.reminders]);
  const toggle = (id: string) => updatePatient(patient.id, (p) => ({ reminders: p.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) }));
  const remove = (id: string) => updatePatient(patient.id, (p) => ({ reminders: p.reminders.filter((r) => r.id !== id) }));

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <Card title="Novo lembrete" icon={<BellPlus className="h-5 w-5" />} className="xl:self-start">
        <div className="space-y-4 p-5 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const d = p.dueAt;
                  d.setHours(9, 0, 0, 0);
                  add({ title: p.title, type: p.type, dueAt: d.toISOString() });
                }}
                className="chip border border-line bg-surface px-2.5 py-1 text-ink-2 transition hover:border-jade-400 hover:bg-brand-soft hover:text-brand-ink"
              >
                <RotateCcw className="h-3 w-3" /> {p.label}
              </button>
            ))}
          </div>
          <Field label="O que lembrar?">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex.: Tomar antibiótico 1h antes do procedimento" />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Tipo" className="col-span-3 sm:col-span-1">
              <Select value={type} onChange={(e) => setType(e.target.value as ReminderType)}>
                {(Object.keys(REMINDER_TYPES) as ReminderType[]).map((t) => (
                  <option key={t} value={t}>
                    {REMINDER_TYPES[t].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data" className="col-span-2 sm:col-span-1">
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Hora">
              <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <Button className="w-full" onClick={() => add()}>
            Criar lembrete
          </Button>
          <p className="text-xs text-ink-3">Os lembretes aparecem no sino de notificações no dia marcado e na tela Início.</p>
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
                  <ReminderItem key={r.id} r={r} onToggle={() => toggle(r.id)} onDelete={() => remove(r.id)} />
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
