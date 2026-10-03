import { addDays, format, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Cake,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  RotateCcw,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToothPattern } from "@/components/Logo";
import { NotificationList } from "@/components/NotificationPanel";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { Avatar, Card, EmptyState } from "@/components/ui/misc";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { birthdayIn, buildNotifications, lastVisit, patientAlerts, recallDue, treatmentTotals } from "@/lib/derive";
import { useClock } from "@/lib/useClock";
import { birthdayLink, confirmLink, openLink, recallLink } from "@/lib/messages";
import type { Appointment, Patient } from "@/lib/types";
import { ageLabel, cn, firstName, fmtDate, greeting, money, moneyShort, toDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";

function Kpi({ icon, label, value, hint, tone, to }: { icon: ReactNode; label: string; value: ReactNode; hint?: ReactNode; tone: string; to: string }) {
  return (
    <Link to={to} className="card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.12] blur-xl transition group-hover:opacity-25", tone)} />
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm", tone)}>{icon}</div>
      <p className="mt-4 text-[13px] font-semibold text-ink-3">{label}</p>
      <p className="mt-0.5 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </Link>
  );
}

function TodayItem({ a, p }: { a: Appointment; p: Patient }) {
  const settings = useStore((s) => s.settings);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const navigate = useNavigate();
  const start = toDate(a.start)!;
  const end = new Date(start.getTime() + a.duration * 60000);
  const now = new Date();
  const current = start <= now && end > now && a.status !== "cancelado";
  const past = end <= now;
  const alerts = patientAlerts(p);
  return (
    <div className={cn("group relative flex gap-4 rounded-2xl p-3 transition hover:bg-surface-2", current && "bg-jade-50/80 ring-1 ring-jade-300 dark:bg-jade-900/30 dark:ring-jade-700")}>
      <div className="w-14 shrink-0 pt-0.5 text-right">
        <p className={cn("text-sm font-bold", past && a.status !== "atendido" ? "text-ink-3" : "text-ink")}>{format(start, "HH:mm")}</p>
        <p className="text-[11px] text-ink-3">{a.duration} min</p>
      </div>
      <div className="relative flex flex-col items-center">
        <span className="mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface" style={{ background: APPOINTMENT_STATUS[a.status].dot }} />
        <span className="w-px flex-1 bg-line group-last:hidden" />
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/pacientes/${p.id}`)} className="flex min-w-0 items-center gap-2 text-left">
            <Avatar patient={p} size={26} />
            <span className="truncate text-sm font-bold text-ink hover:text-brand" data-sensitive>
              {p.name}
            </span>
          </button>
          {alerts.length > 0 && (
            <span title={alerts.join(" · ")} className="chip bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <AlertTriangle className="h-3 w-3" /> {alerts.length}
            </span>
          )}
          {current && <span className="chip bg-jade-600 text-white">agora</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-3">
          {a.procedure}
          {a.notes ? ` · ${a.notes}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={cn("chip", APPOINTMENT_STATUS[a.status].chip)}>{APPOINTMENT_STATUS[a.status].label}</span>
          {a.status === "agendado" && (
            <>
              <button onClick={() => openLink(confirmLink(p, a, settings))} className="chip bg-[#25D366]/10 text-[#128C4B] hover:bg-[#25D366]/20 dark:text-[#4ade80]">
                <WhatsAppIcon className="h-3 w-3" /> Confirmar
              </button>
              <button onClick={() => updateAppointment(a.id, { status: "confirmado" })} className="chip bg-surface-2 text-ink-2 hover:bg-brand-soft">
                <CheckCircle2 className="h-3 w-3" /> Marcar confirmado
              </button>
            </>
          )}
          {(a.status === "confirmado" || a.status === "agendado") && (start <= now || current) && (
            <button onClick={() => updateAppointment(a.id, { status: "atendido" })} className="chip bg-jade-600 text-white hover:bg-jade-700">
              <CheckCircle2 className="h-3 w-3" /> Atendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthBars({ data }: { data: { label: string; value: number; current: boolean }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-44 items-end gap-3 px-5 pb-5 pt-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-ink-2">{d.value}</span>
          <div className="relative flex h-28 w-full items-end overflow-hidden rounded-xl bg-surface-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.06, type: "spring", damping: 20 }}
              className={cn("w-full rounded-xl", d.current ? "bg-gradient-to-t from-jade-600 to-jade-400" : "bg-gradient-to-t from-jade-200 to-jade-100 dark:from-jade-800 dark:to-jade-700")}
            />
          </div>
          <span className={cn("text-[11px] font-semibold capitalize", d.current ? "text-brand" : "text-ink-3")}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const nowTick = useClock();
  const patients = useStore((s) => s.patients);
  const appointments = useStore((s) => s.appointments);
  const settings = useStore((s) => s.settings);
  const recent = useStore((s) => s.recent);
  const { openApptModal, openPatientModal } = useUI();
  const now = new Date();

  const data = useMemo(() => {
    const byId = new Map(patients.map((p) => [p.id, p]));
    const active = patients.filter((p) => !p.archived);
    const today = appointments
      .filter((a) => isSameDay(toDate(a.start)!, now) && a.status !== "cancelado" && byId.has(a.patientId))
      .sort((a, b) => a.start.localeCompare(b.start));
    const inTreatment = active.filter((p) => p.stage === "tratamento").length;
    const receivable = active.reduce((s, p) => s + treatmentTotals(p).balance, 0);
    const monthRevenue = active.reduce((s, p) => s + p.payments.filter((x) => isSameMonth(toDate(x.date)!, now)).reduce((a, x) => a + x.amount, 0), 0);
    const birthdays = active
      .map((p) => ({ p, days: birthdayIn(p, 7) }))
      .filter((x): x is { p: Patient; days: number } => x.days !== null)
      .sort((a, b) => a.days - b.days);
    const recalls = active
      .map((p) => ({ p, due: recallDue(p, appointments, settings.recallMonths), last: lastVisit(p, appointments) }))
      .filter((x) => x.due)
      .slice(0, 5);
    const months = Array.from({ length: 6 }, (_, i) => {
      const m = startOfMonth(subMonths(now, 5 - i));
      return {
        label: format(m, "MMM", { locale: ptBR }).replace(".", ""),
        value: appointments.filter((a) => a.status === "atendido" && isSameMonth(toDate(a.start)!, m)).length,
        current: i === 5,
      };
    });
    const newThisMonth = active.filter((p) => isSameMonth(toDate(p.createdAt)!, now)).length;
    const notifications = buildNotifications(patients, appointments, settings);
    const recentPatients = recent.map((id) => byId.get(id)).filter((p): p is Patient => Boolean(p)).slice(0, 5);
    const nextDays = appointments.filter((a) => {
      const d = toDate(a.start)!;
      return d > now && d < addDays(now, 7) && a.status !== "cancelado";
    }).length;
    return { byId, active, today, inTreatment, receivable, monthRevenue, birthdays, recalls, months, newThisMonth, notifications, recentPatients, nextDays };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, appointments, settings, recent, nowTick]);

  const remaining = data.today.filter((a) => toDate(a.start)! > now && a.status !== "atendido").length;
  const summary = [
    data.today.length ? `${data.today.length} consulta${data.today.length > 1 ? "s" : ""} hoje` : "nenhuma consulta hoje",
    data.notifications.length ? `${data.notifications.length} pendência${data.notifications.length > 1 ? "s" : ""}` : null,
    data.birthdays.some((b) => b.days === 0) ? `aniversariante do dia 🎂` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 lg:px-8">
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-lift sm:px-9 sm:py-9">
        <ToothPattern className="absolute inset-0 h-full w-full text-white/[0.045]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-jade-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-jade-200/90 first-letter:uppercase">{format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
            <h1 className="mt-1 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {greeting(now)}, {settings.title} {firstName(settings.doctorName)}
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-jade-50/80">
              {summary.charAt(0).toUpperCase() + summary.slice(1)}.{remaining > 0 && ` Ainda faltam ${remaining} atendimento${remaining > 1 ? "s" : ""}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => openApptModal()} className="border-transparent !bg-white !text-jade-800 hover:!bg-jade-50" icon={<CalendarPlus className="h-4 w-4" />}>
              Nova consulta
            </Button>
            <Button onClick={() => openPatientModal()} variant="ghost" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 hover:text-white" icon={<UserPlus className="h-4 w-4" />}>
              Novo paciente
            </Button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi to="/pacientes" icon={<Users className="h-5 w-5" />} tone="bg-jade-600" label="Pacientes ativos" value={data.active.length} hint={`+${data.newThisMonth} novos este mês`} />
        <Kpi to="/agenda" icon={<CalendarDays className="h-5 w-5" />} tone="bg-sky-500" label="Consultas hoje" value={data.today.length} hint={`${data.nextDays} nos próximos 7 dias`} />
        <Kpi to="/pacientes?etapa=tratamento" icon={<Stethoscope className="h-5 w-5" />} tone="bg-violet-500" label="Em tratamento" value={data.inTreatment} hint="pacientes com procedimentos ativos" />
        <Kpi to="/financeiro" icon={<Wallet className="h-5 w-5" />} tone="bg-amber-500" label="Recebido no mês" value={moneyShort(data.monthRevenue)} hint={`${money(data.receivable)} a receber`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card
          title="Agenda de hoje"
          icon={<CalendarCheck className="h-5 w-5" />}
          action={
            <Link to="/agenda" className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
              Ver agenda <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="p-3">
            {data.today.length ? (
              data.today.map((a) => <TodayItem key={a.id} a={a} p={data.byId.get(a.patientId)!} />)
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-7 w-7" />}
                title="Dia livre por aqui"
                description="Nenhuma consulta marcada para hoje."
                action={
                  <Button size="sm" onClick={() => openApptModal()} icon={<CalendarPlus className="h-4 w-4" />}>
                    Agendar consulta
                  </Button>
                }
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            title="Pendências"
            icon={<Clock className="h-5 w-5" />}
            action={
              <Link to="/lembretes" className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                Todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="p-4 pt-3">
              <NotificationList items={data.notifications.slice(0, 5)} />
            </div>
          </Card>

          <Card title="Aniversariantes da semana" icon={<Cake className="h-5 w-5" />}>
            <div className="space-y-1 p-3">
              {data.birthdays.length === 0 && <p className="px-2 py-4 text-center text-sm text-ink-3">Nenhum aniversário nos próximos 7 dias.</p>}
              {data.birthdays.map(({ p, days }) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                  <Avatar patient={p} size={36} />
                  <Link to={`/pacientes/${p.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                      {p.name}
                    </p>
                    <p className="text-xs text-ink-3">
                      {days === 0 ? "🎉 Hoje!" : days === 1 ? "Amanhã" : `Em ${days} dias`} · completa {ageLabel(p.birthDate).replace(/\d+/, (n) => String(Number(n) + (days === 0 ? 0 : 1)))}
                    </p>
                  </Link>
                  <Button size="sm" variant={days === 0 ? "whatsapp" : "secondary"} onClick={() => openLink(birthdayLink(p, settings))} icon={<WhatsAppIcon className="h-3.5 w-3.5" />}>
                    Parabéns
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Atendimentos por mês" icon={<TrendingUp className="h-5 w-5" />} className="lg:col-span-1">
          <MonthBars data={data.months} />
        </Card>

        <Card title="Retornos pendentes" icon={<RotateCcw className="h-5 w-5" />} action={<span className="text-xs text-ink-3">há mais de {settings.recallMonths} meses</span>}>
          <div className="space-y-1 p-3">
            {data.recalls.length === 0 && <p className="px-2 py-6 text-center text-sm text-ink-3">Todos os pacientes em manutenção estão em dia. 👏</p>}
            {data.recalls.map(({ p, last }) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                <Avatar patient={p} size={36} />
                <Link to={`/pacientes/${p.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                    {p.name}
                  </p>
                  <p className="text-xs text-ink-3">Última visita: {fmtDate(last)}</p>
                </Link>
                <Button size="icon-sm" variant="secondary" title="Chamar no WhatsApp" onClick={() => openLink(recallLink(p, settings))}>
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vistos recentemente" icon={<Users className="h-5 w-5" />}>
          <div className="space-y-1 p-3">
            {data.recentPatients.length === 0 && <p className="px-2 py-6 text-center text-sm text-ink-3">Os prontuários que você abrir aparecem aqui.</p>}
            {data.recentPatients.map((p) => (
              <Link key={p.id} to={`/pacientes/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                <Avatar patient={p} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink" data-sensitive>
                    {p.name}
                  </p>
                  <p className="text-xs text-ink-3">{ageLabel(p.birthDate) || "—"}</p>
                </div>
                {patientAlerts(p).length > 0 && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                <ArrowRight className="h-4 w-4 text-ink-3" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
