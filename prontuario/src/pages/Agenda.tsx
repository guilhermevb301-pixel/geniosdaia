import { addDays, addMinutes, format, isSameDay, isToday, setHours, setMinutes, startOfDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CalendarPlus, ChevronLeft, ChevronRight, Clock, ExternalLink, NotebookPen, Pencil } from "lucide-react";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { toast } from "@/components/ui/feedback";
import { Avatar, Segmented } from "@/components/ui/misc";
import { Modal } from "@/components/ui/Modal";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { patientAlerts } from "@/lib/derive";
import { confirmLink, openLink } from "@/lib/messages";
import type { Appointment, AppointmentStatus, Patient } from "@/lib/types";
import { cn, formatPhone, toDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";

const SLOT = 30;
const SLOT_H = 34;

function layoutDay(items: Appointment[]) {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const out = new Map<string, { lane: number; lanes: number }>();
  let cluster: { a: Appointment; lane: number; end: number }[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.set(c.a.id, { lane: c.lane, lanes }));
    cluster = [];
  };
  for (const a of sorted) {
    const s = toDate(a.start)!.getTime();
    const e = s + a.duration * 60000;
    if (cluster.length && s >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => c.end > s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ a, lane, end: e });
    clusterEnd = Math.max(clusterEnd, e);
  }
  if (cluster.length) flush();
  return out;
}

function Details({ appt, onClose }: { appt: Appointment | null; onClose: () => void }) {
  const patient = useStore((s) => s.patients.find((p) => p.id === appt?.patientId));
  const settings = useStore((s) => s.settings);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const openApptModal = useUI((s) => s.openApptModal);
  const navigate = useNavigate();
  if (!appt || !patient) return null;
  const start = toDate(appt.start)!;
  const alerts = patientAlerts(patient);
  const setStatus = (status: AppointmentStatus) => {
    updateAppointment(appt.id, { status });
    if (status === "atendido")
      toast.success("Consulta marcada como atendida", "Registre a evolução no prontuário.", {
        label: "Registrar",
        onClick: () => navigate(`/pacientes/${patient.id}?aba=evolucao`),
      });
  };
  return (
    <Modal open={!!appt} onClose={onClose} size="sm">
      <div className="-mx-1 flex items-center gap-3">
        <Avatar patient={patient} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-semibold text-ink" data-sensitive>
            {patient.name}
          </p>
          <p className="text-sm text-ink-3" data-sensitive>
            {formatPhone(patient.phone) || "Sem telefone"}
          </p>
        </div>
      </div>
      {alerts.length > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {alerts.join(" · ")}
        </p>
      )}
      <div className="mt-4 rounded-2xl bg-surface-2 p-4">
        <p className="font-bold text-ink">{appt.procedure}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
          <Clock className="h-4 w-4" />
          {format(start, "EEEE, d 'de' MMMM · HH:mm", { locale: ptBR })} – {format(addMinutes(start, appt.duration), "HH:mm")}
        </p>
        {appt.notes && <p className="mt-2 text-sm text-ink-2">📝 {appt.notes}</p>}
      </div>
      <p className="label mt-5">Situação</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn("chip border px-3 py-1.5", appt.status === s ? "border-jade-600 bg-jade-600 text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300")}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: appt.status === s ? "#fff" : APPOINTMENT_STATUS[s].dot }} />
            {APPOINTMENT_STATUS[s].label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="whatsapp" icon={<WhatsAppIcon />} onClick={() => openLink(confirmLink(patient, appt, settings))} disabled={!patient.phone}>
          Confirmar
        </Button>
        <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" />} onClick={() => navigate(`/pacientes/${patient.id}`)}>
          Prontuário
        </Button>
        <Button
          variant="secondary"
          icon={<Pencil className="h-4 w-4" />}
          onClick={() => {
            onClose();
            openApptModal({ ...appt });
          }}
        >
          Editar
        </Button>
        <Button variant="soft" icon={<NotebookPen className="h-4 w-4" />} onClick={() => navigate(`/pacientes/${patient.id}?aba=evolucao`)}>
          Evolução
        </Button>
      </div>
    </Modal>
  );
}

export function Agenda() {
  const appointments = useStore((s) => s.appointments);
  const patients = useStore((s) => s.patients);
  const settings = useStore((s) => s.settings);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const openApptModal = useUI((s) => s.openApptModal);
  const [params] = useSearchParams();
  const [anchor, setAnchor] = useState(() => toDate(params.get("data")) ?? new Date());
  const [view, setView] = useState<"semana" | "dia">(() => (typeof window !== "undefined" && window.innerWidth < 900 ? "dia" : "semana"));
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [now, setNow] = useState(new Date());
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const byId = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const days = useMemo(() => {
    if (view === "dia") return [startOfDay(anchor)];
    const monday = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: settings.workSaturday ? 6 : 5 }, (_, i) => addDays(monday, i));
  }, [anchor, view, settings.workSaturday]);

  // Expediente configurado, ampliado se houver consulta fora dele na semana visível
  const { startHour, endHour } = useMemo(() => {
    let sH = settings.startHour;
    let eH = settings.endHour;
    for (const a of appointments) {
      const d = toDate(a.start)!;
      if (a.status === "cancelado" || !days.some((day) => isSameDay(day, d))) continue;
      sH = Math.min(sH, d.getHours());
      eH = Math.max(eH, Math.ceil((d.getHours() * 60 + d.getMinutes() + a.duration) / 60));
    }
    return { startHour: sH, endHour: Math.min(24, eH) };
  }, [appointments, days, settings.startHour, settings.endHour]);
  const hours = useMemo(() => Array.from({ length: endHour - startHour }, (_, i) => startHour + i), [startHour, endHour]);
  const slots = hours.flatMap((h) => [0, 30].map((m) => ({ h, m })));
  const totalH = slots.length * SLOT_H;

  const perDay = useMemo(
    () =>
      days.map((d) => {
        const items = appointments.filter((a) => isSameDay(toDate(a.start)!, d) && byId.has(a.patientId));
        return { d, items, layout: layoutDay(items.filter((a) => a.status !== "cancelado")) };
      }),
    [days, appointments, byId],
  );

  const weekItems = perDay.flatMap((x) => x.items).filter((a) => a.status !== "cancelado");
  const stats = {
    total: weekItems.length,
    confirmed: weekItems.filter((a) => a.status === "confirmado").length,
    pending: weekItems.filter((a) => a.status === "agendado" && toDate(a.start)! > now).length,
  };

  const shift = (dir: number) => setAnchor((a) => addDays(a, dir * (view === "dia" ? 1 : 7)));
  const slotDate = (d: Date, h: number, m: number) => setMinutes(setHours(d, h), m);

  const onDrop = (e: DragEvent, d: Date, h: number, m: number) => {
    e.preventDefault();
    setDropTarget(null);
    const id = e.dataTransfer.getData("text/appt");
    const a = appointments.find((x) => x.id === id);
    if (!a) return;
    const start = slotDate(d, h, m);
    updateAppointment(id, { start: start.toISOString() });
    toast.success("Consulta remarcada", `${byId.get(a.patientId)?.name.split(" ")[0]} · ${format(start, "EEE dd/MM 'às' HH:mm", { locale: ptBR })}`);
  };

  const title =
    view === "dia"
      ? format(anchor, "EEEE, d 'de' MMMM", { locale: ptBR })
      : `${format(days[0], "d MMM", { locale: ptBR })} – ${format(days[days.length - 1], "d MMM yyyy", { locale: ptBR })}`;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-ink">Agenda</h1>
          <p className="mt-1 text-sm text-ink-3 first-letter:uppercase">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-line bg-surface p-1">
            <button className="rounded-lg p-1.5 text-ink-2 hover:bg-surface-2" onClick={() => shift(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-2" onClick={() => setAnchor(new Date())}>
              Hoje
            </button>
            <button className="rounded-lg p-1.5 text-ink-2 hover:bg-surface-2" onClick={() => shift(1)}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <input type="date" className="input h-10 w-auto" value={format(anchor, "yyyy-MM-dd")} onChange={(e) => e.target.value && setAnchor(toDate(e.target.value)!)} />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "dia", label: "Dia" },
              { value: "semana", label: "Semana" },
            ]}
          />
          <Button onClick={() => openApptModal(isToday(anchor) ? undefined : { start: slotDate(startOfDay(anchor), settings.startHour, 0).toISOString() })} icon={<CalendarPlus className="h-4 w-4" />}>
            Nova consulta
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="chip bg-surface px-3 py-1 text-ink-2 ring-1 ring-line">{stats.total} consultas</span>
        <span className="chip bg-jade-100 px-3 py-1 text-jade-800 dark:bg-jade-900/50 dark:text-jade-200">{stats.confirmed} confirmadas</span>
        {stats.pending > 0 && <span className="chip bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{stats.pending} a confirmar</span>}
        <span className="ml-auto hidden text-ink-3 md:block">Dica: arraste uma consulta para remarcar · clique em um horário vazio para agendar</span>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="scrollbar-thin overflow-x-auto">
          <div style={{ minWidth: view === "dia" ? 0 : days.length * 150 + 64 }}>
            {/* Cabeçalho dos dias */}
            <div className="sticky top-0 z-10 grid border-b border-line bg-surface" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
              <div />
              {perDay.map(({ d, items }) => (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setAnchor(d);
                    setView("dia");
                  }}
                  className={cn("border-l border-line px-3 py-3 text-left transition hover:bg-surface-2", isToday(d) && "bg-brand-soft/50")}
                >
                  <p className={cn("text-[11px] font-bold uppercase tracking-wider", isToday(d) ? "text-brand" : "text-ink-3")}>{format(d, "EEE", { locale: ptBR })}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("font-display text-2xl font-semibold", isToday(d) ? "text-brand" : "text-ink")}>{format(d, "d")}</span>
                    <span className="text-xs text-ink-3">{items.filter((a) => a.status !== "cancelado").length || ""}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Grade */}
            <div className="grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
              <div className="relative" style={{ height: totalH }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute right-2 -translate-y-1/2 text-[11px] font-semibold text-ink-3" style={{ top: i * 2 * SLOT_H }}>
                    {i > 0 && `${String(h).padStart(2, "0")}:00`}
                  </div>
                ))}
              </div>
              {perDay.map(({ d, items, layout }) => {
                const showNow = isToday(d) && now.getHours() >= startHour && now.getHours() < endHour;
                const nowTop = ((now.getHours() - startHour) * 60 + now.getMinutes()) * (SLOT_H / SLOT);
                return (
                  <div key={d.toISOString()} className={cn("relative border-l border-line", isToday(d) && "bg-brand-soft/20")} style={{ height: totalH }}>
                    {slots.map(({ h, m }) => {
                      const key = `${d.toDateString()}-${h}-${m}`;
                      const past = slotDate(d, h, m) < now;
                      return (
                        <div
                          key={key}
                          onClick={() => openApptModal({ start: slotDate(d, h, m).toISOString() })}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTarget(key);
                          }}
                          onDragLeave={() => setDropTarget((t) => (t === key ? null : t))}
                          onDrop={(e) => onDrop(e, d, h, m)}
                          className={cn(
                            "group/slot relative cursor-pointer border-b transition-colors",
                            m === 0 ? "border-line/40" : "border-line",
                            past ? "bg-surface-2/40" : "hover:bg-brand-soft/40",
                            dropTarget === key && "bg-jade-200/60 dark:bg-jade-800/60",
                          )}
                          style={{ height: SLOT_H }}
                        >
                          <span className="pointer-events-none absolute left-2 top-1 hidden text-[11px] font-semibold text-brand group-hover/slot:block">
                            + {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}
                          </span>
                        </div>
                      );
                    })}

                    {showNow && (
                      <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowTop }}>
                        <div className="relative h-0.5 bg-rose-500">
                          <span className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-rose-500 ring-2 ring-surface" />
                        </div>
                      </div>
                    )}

                    {items.map((a) => {
                      const p = byId.get(a.patientId) as Patient;
                      const s = toDate(a.start)!;
                      const minutes = (s.getHours() - startHour) * 60 + s.getMinutes();
                      const top = minutes * (SLOT_H / SLOT);
                      const height = Math.max(SLOT_H - 4, a.duration * (SLOT_H / SLOT) - 4);
                      const pos = layout.get(a.id) ?? { lane: 0, lanes: 1 };
                      const width = 100 / pos.lanes;
                      if (minutes < 0 || minutes >= (endHour - startHour) * 60) return null;
                      const alert = patientAlerts(p).length > 0;
                      const st = APPOINTMENT_STATUS[a.status];
                      return (
                        <button
                          key={a.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/appt", a.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetail(a);
                          }}
                          className={cn(
                            "absolute z-10 overflow-hidden rounded-xl border-l-4 px-2 py-1 text-left shadow-sm ring-1 ring-black/5 transition hover:z-30 hover:shadow-lift",
                            st.block,
                            a.status === "cancelado" && "opacity-60",
                          )}
                          style={{ top: top + 2, height, left: `calc(${pos.lane * width}% + 3px)`, width: `calc(${width}% - 6px)` }}
                        >
                          {height < 44 ? (
                            <p className="flex items-center gap-1.5 truncate text-[12px] font-bold leading-tight">
                              <span className="opacity-80">{format(s, "HH:mm")}</span>
                              {alert && <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />}
                              <span className="truncate" data-sensitive>
                                {p.name}
                              </span>
                            </p>
                          ) : (
                            <>
                              <p className="flex items-center gap-1 text-[11px] font-bold opacity-80">
                                {format(s, "HH:mm")}
                                {alert && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                                {a.status === "confirmado" && <span>✓</span>}
                              </p>
                              <p className="truncate text-[13px] font-bold leading-tight" data-sensitive>
                                {p.name}
                              </p>
                              {height > 48 && <p className="truncate text-[11px] opacity-75">{a.procedure}</p>}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-3">
        {(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: APPOINTMENT_STATUS[s].dot }} />
            {APPOINTMENT_STATUS[s].label}
          </span>
        ))}
      </div>

      <Details appt={detail ? appointments.find((a) => a.id === detail.id) ?? null : null} onClose={() => setDetail(null)} />
    </div>
  );
}
