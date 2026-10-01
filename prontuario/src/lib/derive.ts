import { addDays, addMonths, differenceInCalendarDays, format, isSameDay, startOfDay } from "date-fns";
import { ANAMNESIS_CONDITIONS } from "./constants";
import type { Appointment, Patient, Settings, Stage, TreatmentStatus } from "./types";
import { toDate, uid } from "./utils";
import { installmentAttention, reminderAttention } from "./reminders";
import { installmentBalance } from "./finance";

export function patientAlerts(p: Patient): string[] {
  const out: string[] = [];
  for (const c of ANAMNESIS_CONDITIONS) {
    if (c.alert && p.anamnesis.conditions[c.key]) out.push(c.short);
  }
  if (p.anamnesis.allergies?.trim()) {
    const a = p.anamnesis.allergies.trim();
    const idx = out.indexOf("Alergia a medicamento");
    const label = `Alergia: ${a}`;
    if (idx >= 0) out[idx] = label;
    else out.unshift(label);
  }
  for (const custom of p.anamnesis.customConditions ?? []) {
    if (custom.alert && p.anamnesis.conditions[custom.id]) out.push(custom.label);
  }
  return out;
}

export function hasPenicillinAllergy(p: Patient) {
  return /penicil|amoxic|ampicil/i.test(p.anamnesis.allergies ?? "");
}

export function lastVisit(p: Patient, appts: Appointment[]): Date | null {
  let best: Date | null = null;
  for (const e of p.evolutions) {
    const d = toDate(e.date);
    if (d && (!best || d > best)) best = d;
  }
  const now = new Date();
  for (const a of appts) {
    if (a.patientId !== p.id || a.status !== "atendido") continue;
    const d = toDate(a.start);
    if (d && d <= now && (!best || d > best)) best = d;
  }
  return best;
}

export function nextAppointment(patientId: string, appts: Appointment[]): Appointment | null {
  const now = new Date();
  let best: Appointment | null = null;
  for (const a of appts) {
    if (a.patientId !== patientId || a.status === "cancelado" || a.status === "faltou" || a.status === "atendido") continue;
    const d = toDate(a.start)!;
    if (d < startOfDay(now)) continue;
    if (!best || d < toDate(best.start)!) best = a;
  }
  return best;
}

export function treatmentTotals(p: Patient) {
  const contracted = p.treatments.filter((t) => t.status !== "planejado");
  const gross = contracted.reduce((s, t) => s + t.price, 0);
  const discount = (gross * (p.planDiscount ?? 0)) / 100;
  const total = gross - discount;
  const planned = p.treatments.filter((t) => t.status === "planejado").reduce((s, t) => s + t.price, 0);
  const paid = p.payments.reduce((s, x) => s + x.amount, 0);
  const done = p.treatments.filter((t) => t.status === "concluido").length;
  const count = p.treatments.length;
  return {
    gross,
    discount,
    total,
    planned,
    paid,
    balance: Math.max(0, total - paid),
    credit: Math.max(0, paid - total),
    done,
    count,
    progress: count ? done / count : 0,
  };
}

export function financialSituation(p: Pick<Patient, "treatments" | "payments" | "planDiscount">) {
  const totals = treatmentTotals(p as Patient);
  if (totals.total > 0 && totals.balance <= 0) return { id: "paid" as const, label: "Pago", amount: totals.paid };
  if (totals.balance > 0 && totals.planned > 0) return { id: "mixed" as const, label: "A receber + proposta", amount: totals.balance, proposal: totals.planned };
  if (totals.balance > 0) return { id: "receivable" as const, label: "A receber", amount: totals.balance };
  if (totals.planned > 0) return { id: "proposal" as const, label: "Ainda não aceito", amount: totals.planned };
  return { id: "none" as const, label: "Sem cobrança", amount: 0 };
}

export type PatientsView = "lista" | "quadro";

export function normalizePatientsView(view: string | null | undefined): PatientsView {
  return view === "lista" ? "lista" : "quadro";
}

function treatmentLabel(item: Pick<Patient["treatments"][number], "procedure" | "teeth">) {
  if (!item.teeth?.trim()) return item.procedure;
  const toothCount = item.teeth.match(/\d+/g)?.length ?? 0;
  return `${item.procedure} · ${toothCount > 1 ? "dentes" : "dente"} ${item.teeth}`;
}

export function patientCareSummary(p: Pick<Patient, "treatments" | "reminders">): { active: string | null; followUp: string | null } {
  const activeItems = p.treatments
    .filter((item) => item.status === "aprovado" || item.status === "andamento")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = activeItems.length
    ? `${activeItems.slice(0, 2).map(treatmentLabel).join("; ")}${activeItems.length > 2 ? ` +${activeItems.length - 2}` : ""}`
    : null;

  const explicitReturn = p.reminders
    .filter((item) => !item.done && item.type === "retorno")
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
  if (explicitReturn) return { active, followUp: explicitReturn.title };

  const lastCompleted = p.treatments
    .filter((item) => item.status === "concluido")
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt))[0];
  return { active, followUp: !active && lastCompleted ? `Após ${treatmentLabel(lastCompleted)}` : null };
}

export function patientContactAction(
  p: Pick<Patient, "treatments" | "reminders" | "paymentSchedule" | "payments">,
  next: Pick<Appointment, "start" | "procedure"> | null,
  now = new Date(),
): { label: string; reason: string } {
  const urgentReminder = p.reminders
    .filter((item) => reminderAttention(item, now))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
  if (urgentReminder) return { label: "Resolver lembrete", reason: `o lembrete: ${urgentReminder.title}` };

  const dueInstallment = (p.paymentSchedule ?? [])
    .map((item) => ({ item, attention: installmentAttention(item, p.payments, now) }))
    .filter((entry) => entry.attention)
    .sort((a, b) => a.item.dueDate.localeCompare(b.item.dueDate))[0];
  if (dueInstallment) {
    const timing = dueInstallment.attention?.label.startsWith("Vence hoje")
      ? "que vence hoje"
      : dueInstallment.attention?.label.startsWith("Cobrar amanhã")
        ? "que vence amanhã"
        : "que está atrasado";
    return { label: "Cobrar pagamento", reason: `o pagamento da ${dueInstallment.item.label}, ${timing}` };
  }

  if (next) {
    const date = new Date(next.start);
    return { label: "Confirmar consulta", reason: `a consulta de ${next.procedure} em ${format(date, "dd/MM 'às' HH:mm")}` };
  }

  const care = patientCareSummary(p);
  if (care.active) return { label: "Conversar sobre tratamento", reason: `o tratamento: ${care.active}` };
  if (care.followUp) return { label: "Combinar acompanhamento", reason: `o acompanhamento: ${care.followUp}` };
  return { label: "Entrar em contato", reason: "seu atendimento odontológico" };
}

export function automaticPatientStage(p: Pick<Patient, "stage" | "treatments">): Stage {
  const hasActiveTreatment = p.treatments.some((item) => item.status === "aprovado" || item.status === "andamento");
  if (hasActiveTreatment) return "tratamento";
  if (p.treatments.some((item) => item.status === "planejado")) return "orcamento";
  if (p.treatments.length > 0 && p.treatments.every((item) => item.status === "concluido")) {
    return p.stage === "concluido" ? "concluido" : "manutencao";
  }
  return "avaliacao";
}

export function applyClinicalTreatmentStatus(
  patient: Pick<Patient, "treatments" | "evolutions">,
  treatmentId: string,
  status: TreatmentStatus,
  meta: { author: string; date: string; createdAt: string },
) {
  const treatment = patient.treatments.find((item) => item.id === treatmentId);
  if (!treatment) return { treatments: patient.treatments, evolutions: patient.evolutions };

  const treatments = patient.treatments.map((item) =>
    item.id === treatmentId
      ? { ...item, status, completedAt: status === "concluido" ? item.completedAt ?? meta.createdAt : undefined }
      : item,
  );
  const automaticEvolution = patient.evolutions.some((item) => item.treatmentId === treatmentId && item.automatic);

  if (status === "concluido") {
    if (automaticEvolution) return { treatments, evolutions: patient.evolutions };
    return {
      treatments,
      evolutions: [
        {
          id: uid("ev_"),
          date: meta.date,
          title: `${treatment.procedure} realizado`,
          description: `Procedimento “${treatment.procedure}”${treatment.teeth ? ` no dente ${treatment.teeth}` : ""} finalizado.`,
          teeth: treatment.teeth,
          author: meta.author,
          createdAt: meta.createdAt,
          treatmentId,
          automatic: true,
        },
        ...patient.evolutions,
      ],
    };
  }

  return {
    treatments,
    evolutions: patient.evolutions.filter((item) => !(item.treatmentId === treatmentId && item.automatic)),
  };
}

export function toggleToothSelection(selected: number[], tooth: number) {
  return selected.includes(tooth) ? selected.filter((item) => item !== tooth) : [...selected, tooth];
}

export type TreatmentPriceMode = "per_tooth" | "total";

export function treatmentPriceTotal(mode: TreatmentPriceMode, value: number, toothCount: number) {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(toothCount) || toothCount < 1) return Number.NaN;
  return Math.round((mode === "per_tooth" ? value * toothCount : value) * 100) / 100;
}

export function sameTreatmentScope(item: Pick<Patient["treatments"][number], "procedure" | "teeth">, procedure: string, teeth: number[]) {
  if (item.procedure.trim().toLocaleLowerCase("pt-BR") !== procedure.trim().toLocaleLowerCase("pt-BR")) return false;
  const current = [...new Set((item.teeth?.match(/\d+/g) ?? []).map(Number))].sort((a, b) => a - b);
  const requested = [...new Set(teeth)].sort((a, b) => a - b);
  return current.length === requested.length && current.every((value, index) => value === requested[index]);
}

export type PatientAgeGroup = "Criança" | "Adulto" | "Idoso";

export function patientAgeGroup(p: Pick<Patient, "birthDate">, today = new Date()): PatientAgeGroup | null {
  const birth = toDate(p.birthDate);
  if (!birth || birth > today) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayHasPassed = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!birthdayHasPassed) age--;
  if (age < 18) return "Criança";
  if (age < 60) return "Adulto";
  return "Idoso";
}

function nextBirthday(birth: Date, from: Date) {
  const nb = new Date(from.getFullYear(), birth.getMonth(), birth.getDate());
  if (nb < startOfDay(from)) nb.setFullYear(nb.getFullYear() + 1);
  return nb;
}

export function birthdayIn(p: Patient, days: number, from = new Date()): number | null {
  const b = toDate(p.birthDate);
  if (!b) return null;
  const nb = nextBirthday(b, from);
  const diff = differenceInCalendarDays(nb, from);
  return diff <= days ? diff : null;
}

export function isBirthdayToday(p: Patient) {
  return birthdayIn(p, 0) === 0;
}

export function recallDue(p: Patient, appts: Appointment[], months: number): Date | null {
  if (p.archived || p.stage === "avaliacao") return null;
  const lv = lastVisit(p, appts);
  if (!lv) return null;
  const due = addMonths(lv, months);
  if (due > new Date()) return null;
  if (nextAppointment(p.id, appts)) return null;
  return due;
}

export type NotificationKind = "lembrete" | "aniversario" | "confirmar" | "retorno" | "backup" | "alerta";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: string;
  date?: Date;
  patientId?: string;
  reminderId?: string;
  severity: "info" | "warn" | "danger" | "success";
  href: string;
}

export function buildNotifications(patients: Patient[], appts: Appointment[], settings: Settings): AppNotification[] {
  const now = new Date();
  const out: AppNotification[] = [];
  const byId = new Map(patients.map((p) => [p.id, p]));

  for (const p of patients) {
    if (p.archived) continue;
    for (const r of p.reminders) {
      if (r.done) continue;
      const d = toDate(r.dueAt);
      if (!d || !reminderAttention(r, now)) continue;
      out.push({
        id: `rem-${r.id}`,
        kind: "lembrete",
        title: r.title,
        subtitle: `${p.name} · ${reminderAttention(r, now)} · entrar em contato`,
        date: d,
        patientId: p.id,
        reminderId: r.id,
        severity: "danger",
        href: `/pacientes/${p.id}?aba=lembretes`,
      });
    }
    for (const item of p.paymentSchedule ?? []) {
      const balance = installmentBalance(item, p.payments);
      const attention = installmentAttention(item, p.payments, now);
      if (attention) out.push({ id: `installment-${item.id}`, kind: "alerta", title: `${item.label} · ${attention.label}`, subtitle: `${p.name} · R$ ${balance.toFixed(2).replace(".", ",")} a receber · entrar em contato`, severity: attention.severity, patientId: p.id, date: toDate(item.dueDate)!, href: `/pacientes/${p.id}?aba=financeiro` });
    }
    if (isBirthdayToday(p)) {
      out.push({
        id: `bday-${p.id}`,
        kind: "aniversario",
        title: `Aniversário de ${p.name.split(" ")[0]} 🎂`,
        subtitle: "Envie uma mensagem de parabéns",
        patientId: p.id,
        severity: "success",
        href: `/pacientes/${p.id}`,
      });
    }
  }

  const tomorrow = addDays(now, 1);
  for (const a of appts) {
    const d = toDate(a.start);
    if (!d || a.status !== "agendado") continue;
    const p = byId.get(a.patientId);
    if (!p) continue;
    if (isSameDay(d, now) && d > now) {
      out.push({
        id: `conf-${a.id}`,
        kind: "confirmar",
        title: `Confirmar ${p.name.split(" ")[0]} hoje`,
        subtitle: `${a.procedure} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        date: d,
        patientId: p.id,
        severity: "warn",
        href: `/agenda?data=${d.toISOString().slice(0, 10)}`,
      });
    } else if (isSameDay(d, tomorrow)) {
      out.push({
        id: `conf-${a.id}`,
        kind: "confirmar",
        title: `Confirmar consulta de amanhã`,
        subtitle: `${p.name} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        date: d,
        patientId: p.id,
        severity: "info",
        href: `/agenda?data=${d.toISOString().slice(0, 10)}`,
      });
    }
  }

  const lastBackup = toDate(settings.lastBackupAt);
  if (patients.length > 0 && (!lastBackup || differenceInCalendarDays(now, lastBackup) >= 7)) {
    out.push({
      id: "backup",
      kind: "backup",
      title: "Faça um backup dos dados",
      subtitle: lastBackup ? `Último backup há ${differenceInCalendarDays(now, lastBackup)} dias` : "Nenhum backup feito ainda",
      severity: "info",
      href: "/configuracoes?secao=backup",
    });
  }

  const order = { danger: 0, warn: 1, success: 2, info: 3 } as const;
  return out.sort((a, b) => order[a.severity] - order[b.severity] || (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
}
