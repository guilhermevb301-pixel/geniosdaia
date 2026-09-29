import { addDays, endOfDay, startOfDay } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { BellRing, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationList } from "@/components/NotificationPanel";
import { Card, EmptyState, Segmented } from "@/components/ui/misc";
import { buildNotifications } from "@/lib/derive";
import type { Patient, Reminder } from "@/lib/types";
import { toDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { ReminderItem } from "./patient/RemindersTab";

export function Reminders() {
  const patients = useStore((s) => s.patients);
  const appointments = useStore((s) => s.appointments);
  const settings = useStore((s) => s.settings);
  const updatePatient = useStore((s) => s.updatePatient);
  const [tab, setTab] = useState<"pendentes" | "concluidos">("pendentes");

  const auto = useMemo(() => buildNotifications(patients, appointments, settings).filter((n) => n.kind !== "lembrete"), [patients, appointments, settings]);

  const groups = useMemo(() => {
    const all: { r: Reminder; p: Patient }[] = patients.flatMap((p) => p.reminders.map((r) => ({ r, p })));
    const now = new Date();
    const sod = startOfDay(now);
    const eod = endOfDay(now);
    const week = endOfDay(addDays(now, 7));
    const pending = all.filter((x) => !x.r.done).sort((a, b) => a.r.dueAt.localeCompare(b.r.dueAt));
    return {
      atrasados: pending.filter((x) => toDate(x.r.dueAt)! < sod),
      hoje: pending.filter((x) => toDate(x.r.dueAt)! >= sod && toDate(x.r.dueAt)! <= eod),
      semana: pending.filter((x) => toDate(x.r.dueAt)! > eod && toDate(x.r.dueAt)! <= week),
      depois: pending.filter((x) => toDate(x.r.dueAt)! > week),
      concluidos: all.filter((x) => x.r.done).sort((a, b) => b.r.dueAt.localeCompare(a.r.dueAt)),
    };
  }, [patients]);

  const toggle = (p: Patient, id: string) => updatePatient(p.id, (x) => ({ reminders: x.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) }));
  const remove = (p: Patient, id: string) => updatePatient(p.id, (x) => ({ reminders: x.reminders.filter((r) => r.id !== id) }));

  const section = (title: string, items: { r: Reminder; p: Patient }[], tone: string) =>
    items.length > 0 && (
      <div>
        <h3 className={`mb-2 text-sm font-bold uppercase tracking-wider ${tone}`}>
          {title} · {items.length}
        </h3>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map(({ r, p }) => (
              <ReminderItem
                key={r.id}
                r={r}
                onToggle={() => toggle(p, r.id)}
                onDelete={() => remove(p, r.id)}
                subtitle={
                  <Link to={`/pacientes/${p.id}?aba=lembretes`} className="font-semibold text-brand hover:underline" data-sensitive>
                    {p.name}
                  </Link>
                }
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );

  const pendingCount = groups.atrasados.length + groups.hoje.length + groups.semana.length + groups.depois.length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-ink">Lembretes</h1>
          <p className="mt-1 text-sm text-ink-3">Tudo o que precisa de atenção, de todos os pacientes, em um só lugar.</p>
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "pendentes", label: `Pendentes · ${pendingCount}` },
            { value: "concluidos", label: "Concluídos" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {tab === "pendentes" ? (
            pendingCount === 0 ? (
              <div className="card">
                <EmptyState icon={<BellRing className="h-7 w-7" />} title="Nenhum lembrete pendente" description="Crie lembretes na aba “Lembretes” de cada paciente." />
              </div>
            ) : (
              <>
                {section("Atrasados", groups.atrasados, "text-rose-600")}
                {section("Hoje", groups.hoje, "text-amber-600")}
                {section("Próximos 7 dias", groups.semana, "text-brand")}
                {section("Mais adiante", groups.depois, "text-ink-3")}
              </>
            )
          ) : groups.concluidos.length ? (
            section("Concluídos", groups.concluidos, "text-ink-3")
          ) : (
            <div className="card">
              <EmptyState icon={<BellRing className="h-7 w-7" />} title="Nada concluído ainda" />
            </div>
          )}
        </div>
        <Card title="Avisos automáticos" icon={<Sparkles className="h-5 w-5" />} className="lg:self-start">
          <div className="p-4 pt-2">
            <p className="mb-3 text-xs text-ink-3">Aniversários, consultas a confirmar e backup — gerados automaticamente.</p>
            <NotificationList items={auto} />
          </div>
        </Card>
      </div>
    </div>
  );
}
