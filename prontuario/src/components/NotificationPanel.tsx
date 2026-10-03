import { Bell, Cake, CalendarCheck, Check, Clock, HardDriveDownload, RotateCcw } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { buildNotifications, type AppNotification } from "@/lib/derive";
import { fmtDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { Modal } from "./ui/Modal";
import { useClock } from "@/lib/useClock";
import { EmptyState } from "./ui/misc";

const icons: Record<AppNotification["kind"], ReactNode> = {
  lembrete: <Clock className="h-4 w-4" />,
  aniversario: <Cake className="h-4 w-4" />,
  confirmar: <CalendarCheck className="h-4 w-4" />,
  retorno: <RotateCcw className="h-4 w-4" />,
  backup: <HardDriveDownload className="h-4 w-4" />,
  alerta: <Bell className="h-4 w-4" />,
};

const tone: Record<AppNotification["severity"], string> = {
  danger: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
  warn: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  success: "bg-jade-100 text-jade-700 dark:bg-jade-900/50 dark:text-jade-200",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

export function completeReminder(patientId: string, reminderId: string) {
  useStore.getState().updatePatient(patientId, (p) => ({
    reminders: p.reminders.map((r) => (r.id === reminderId ? { ...r, done: true } : r)),
  }));
}

export function NotificationList({ items, onNavigate }: { items: AppNotification[]; onNavigate?: () => void }) {
  const navigate = useNavigate();
  if (!items.length)
    return <EmptyState icon={<Check className="h-7 w-7" />} title="Tudo em dia!" description="Nenhuma pendência no momento. Aproveite o dia, doutor." />;
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li key={n.id} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:shadow-card">
          <button
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => {
              navigate(n.href);
              onNavigate?.();
            }}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone[n.severity]}`}>{icons[n.kind]}</span>
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-semibold text-ink">{n.title}</span>
              <span className="block break-words text-sm text-ink-3" data-sensitive>
                {n.subtitle}
                {n.date && n.kind === "lembrete" ? ` · ${fmtDate(n.date, "dd/MM HH:mm")}` : ""}
              </span>
            </span>
          </button>
          {n.reminderId && n.patientId && (
            <button
              title="Marcar como feito"
              onClick={() => completeReminder(n.patientId!, n.reminderId!)}
              className="rounded-lg border border-line p-1.5 text-ink-3 transition hover:border-jade-400 hover:bg-jade-50 hover:text-jade-600 dark:hover:bg-jade-900/40"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function NotificationPanel() {
  const now = useClock();
  const open = useUI((s) => s.notifications);
  const setOpen = useUI((s) => s.setNotifications);
  const patients = useStore((s) => s.patients);
  const appointments = useStore((s) => s.appointments);
  const settings = useStore((s) => s.settings);
  const navigate = useNavigate();
  const items = useMemo(() => buildNotifications(patients, appointments, settings), [patients, appointments, settings, now]);
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      side
      title="Notificações"
      subtitle={items.length ? `${items.length} aviso${items.length > 1 ? "s" : ""} para acompanhar` : "Nada pendente"}
      icon={<Bell className="h-5 w-5" />}
      footer={
        <button
          className="text-sm font-semibold text-brand hover:underline"
          onClick={() => {
            navigate("/lembretes");
            setOpen(false);
          }}
        >
          Ver todos os lembretes →
        </button>
      }
    >
      <NotificationList items={items} onNavigate={() => setOpen(false)} />
    </Modal>
  );
}
