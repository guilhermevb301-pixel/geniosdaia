import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import type { Installment, Payment, Reminder } from "./types";
import { installmentBalance } from "./finance";

export function reminderAttention(r: Pick<Reminder, "done" | "dueAt">, now = new Date()) {
  const due = parseISO(r.dueAt);
  if (r.done || !isValid(due)) return null;
  const days = differenceInCalendarDays(due, now);
  if (days > 3) return null;
  return days < 0 ? "Atrasado" : days === 0 ? "Hoje" : days === 1 ? "Amanhã" : `Em ${days} dias`;
}

export function installmentAttention(item: Installment, payments: Payment[], now = new Date()): { label: string; severity: "warn" | "danger" } | null {
  if (installmentBalance(item, payments) <= 0) return null;
  const due = parseISO(item.dueDate);
  if (!isValid(due)) return null;
  const days = differenceInCalendarDays(due, now);
  if (days > 1) return null;
  if (days === 1) return { label: "Cobrar amanhã", severity: "warn" };
  if (days === 0) return { label: "Vence hoje — cobrar", severity: "danger" };
  return { label: "Pagamento atrasado — cobrar", severity: "danger" };
}
