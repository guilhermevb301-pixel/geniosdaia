import { addDays, addMonths, differenceInCalendarDays, isSameDay, startOfDay } from "date-fns";
import { ANAMNESIS_CONDITIONS } from "./constants";
import type { Appointment, Patient, Settings } from "./types";
import { toDate } from "./utils";
import { reminderAttention } from "./reminders";
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
  if (totals.planned > 0) return { id: "proposal" as const, label: "Proposta não aprovada", amount: totals.planned };
  return { id: "none" as const, label: "Sem cobrança", amount: 0 };
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
      const attention = reminderAttention({ done: balance <= 0, dueAt: item.dueDate }, now);
      if (attention) out.push({ id: `installment-${item.id}`, kind: "alerta", title: `${item.label} · ${attention}`, subtitle: `${p.name} · R$ ${balance.toFixed(2).replace(".", ",")} a receber`, severity: "danger", patientId: p.id, date: toDate(item.dueDate)!, href: `/pacientes/${p.id}?aba=financeiro` });
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
