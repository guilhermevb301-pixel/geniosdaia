import { addMinutes, format, setHours, setMinutes, startOfHour } from "date-fns";
import { AlertTriangle, CalendarPlus, Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { APPOINTMENT_STATUS, DURATIONS } from "@/lib/constants";
import { patientAlerts } from "@/lib/derive";
import type { AppointmentStatus } from "@/lib/types";
import { cn, formatPhone, normalize, toDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { Button } from "./ui/Button";
import { confirmDialog, toast } from "./ui/feedback";
import { Avatar, Field, Select } from "./ui/misc";
import { Modal } from "./ui/Modal";

/** Próximo horário cheio dentro do expediente (pula domingo). */
function defaultStart(startHour: number, endHour: number) {
  let d = addMinutes(startOfHour(new Date()), 60);
  if (d.getHours() >= endHour || d.getHours() < startHour || d.getDay() === 0) {
    if (d.getHours() >= endHour) d = addMinutes(d, 24 * 60);
    d = setMinutes(setHours(d, startHour), 0);
    if (d.getDay() === 0) d = addMinutes(d, 24 * 60);
  }
  return d;
}

export function AppointmentModal() {
  const { open, draft } = useUI((s) => s.apptModal);
  const close = useUI((s) => s.closeApptModal);
  const patients = useStore((s) => s.patients);
  const procedures = useStore((s) => s.settings.procedures);
  const startHour = useStore((s) => s.settings.startHour);
  const endHour = useStore((s) => s.settings.endHour);
  const appointments = useStore((s) => s.appointments);
  const addAppointment = useStore((s) => s.addAppointment);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const deleteAppointment = useStore((s) => s.deleteAppointment);
  const addPatient = useStore((s) => s.addPatient);

  const [patientId, setPatientId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(45);
  const [procedure, setProcedure] = useState("Consulta / avaliação");
  const [status, setStatus] = useState<AppointmentStatus>("agendado");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const start = toDate(draft?.start) ?? defaultStart(startHour, endHour);
    setPatientId(draft?.patientId);
    setQuery("");
    setDate(format(start, "yyyy-MM-dd"));
    setTime(format(start, "HH:mm"));
    setDuration(draft?.duration ?? 45);
    setProcedure(draft?.procedure ?? "Consulta / avaliação");
    setStatus(draft?.status ?? "agendado");
    setNotes(draft?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  const patient = patients.find((p) => p.id === patientId);
  const matches = useMemo(() => {
    const q = normalize(query);
    return patients
      .filter((p) => !p.archived && (!q || normalize(p.name).includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 6);
  }, [patients, query]);

  const startDate = useMemo(() => {
    if (!date || !time) return null;
    const day = toDate(date);
    if (!day) return null;
    const [h, m] = time.split(":").map(Number);
    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return setMinutes(setHours(day, h), m);
  }, [date, time]);

  const conflict = useMemo(() => {
    if (!startDate) return null;
    const end = addMinutes(startDate, duration);
    return appointments.find((a) => {
      if (a.id === draft?.id || a.status === "cancelado") return false;
      const s = toDate(a.start)!;
      const e = addMinutes(s, a.duration);
      return s < end && e > startDate;
    });
  }, [appointments, startDate, duration, draft?.id]);
  const conflictPatient = conflict ? patients.find((p) => p.id === conflict.patientId) : null;

  const save = () => {
    if (!patientId) return toast.error("Escolha o paciente");
    if (!startDate) return toast.error("Informe data e horário");
    const data = { patientId, start: startDate.toISOString(), duration, procedure, status, notes: notes.trim() || undefined };
    if (draft?.id) {
      updateAppointment(draft.id, data);
      toast.success("Consulta atualizada");
    } else {
      addAppointment(data);
      toast.success("Consulta agendada!", `${patient?.name.split(" ")[0]} · ${format(startDate, "dd/MM 'às' HH:mm")}`);
    }
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      title={draft?.id ? "Editar consulta" : "Nova consulta"}
      icon={<CalendarPlus className="h-5 w-5" />}
      footer={
        <>
          {draft?.id && (
            <Button
              variant="ghost"
              className="mr-auto text-rose-600"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={async () => {
                if (await confirmDialog({ title: "Excluir esta consulta?", danger: true, confirmLabel: "Excluir" })) {
                  deleteAppointment(draft.id!);
                  close();
                  toast.success("Consulta excluída");
                }
              }}
            >
              Excluir
            </Button>
          )}
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button onClick={save}>{draft?.id ? "Salvar" : "Agendar"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <span className="label">Paciente</span>
          {patient ? (
            <div className="flex items-center gap-3 rounded-xl border border-jade-300 bg-jade-50/60 p-3 dark:border-jade-700 dark:bg-jade-900/30">
              <Avatar patient={patient} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink" data-sensitive>
                  {patient.name}
                </p>
                <p className="text-xs text-ink-3" data-sensitive>
                  {formatPhone(patient.phone) || "Sem telefone"}
                </p>
              </div>
              {!draft?.patientId && (
                <button className="text-xs font-semibold text-brand hover:underline" onClick={() => setPatientId(undefined)}>
                  trocar
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-line">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input autoFocus className="input rounded-b-none border-0 border-b pl-9" placeholder="Buscar paciente pelo nome…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="max-h-52 overflow-y-auto p-1">
                {matches.map((p) => (
                  <button key={p.id} onClick={() => setPatientId(p.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2">
                    <Avatar patient={p} size={28} />
                    <span className="flex-1 truncate text-sm font-medium text-ink" data-sensitive>
                      {p.name}
                    </span>
                    {patientAlerts(p).length > 0 && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                  </button>
                ))}
                {query.trim().length > 2 && (
                  <button
                    onClick={() => {
                      const p = addPatient({ name: query.trim() });
                      setPatientId(p.id);
                      toast.success("Paciente cadastrado", "Complete os dados depois no prontuário.");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-brand hover:bg-brand-soft/60"
                  >
                    <UserPlus className="h-4 w-4" /> Cadastrar “{query.trim()}” como novo paciente
                  </button>
                )}
              </div>
            </div>
          )}
          {patient && patientAlerts(patient).length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" /> {patientAlerts(patient).join(" · ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Data">
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Horário">
            <input type="time" step={900} className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Duração" className="col-span-2 sm:col-span-1">
            <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d < 60 ? `${d} min` : `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}min` : ""}`}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {conflict && (
          <p className="-mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" /> Conflito de horário com {conflictPatient?.name ?? "outra consulta"} ({format(toDate(conflict.start)!, "HH:mm")})
          </p>
        )}

        <Field label="Procedimento">
          <input className="input" list="proc-list" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
          <datalist id="proc-list">
            {procedures.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </Field>

        <div>
          <span className="label">Situação</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(APPOINTMENT_STATUS) as AppointmentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "chip border px-3 py-1.5 text-xs transition",
                  status === s ? "border-jade-500 bg-jade-600 text-white" : "border-line bg-surface text-ink-2 hover:border-jade-300",
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: status === s ? "#fff" : APPOINTMENT_STATUS[s].dot }} />
                {APPOINTMENT_STATUS[s].label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Observações">
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: trazer exames, sessão 2 do canal…" />
        </Field>
      </div>
    </Modal>
  );
}
