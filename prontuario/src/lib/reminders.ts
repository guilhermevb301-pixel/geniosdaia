import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import type { Reminder } from "./types";

export function reminderAttention(r: Pick<Reminder, "done" | "dueAt">, now = new Date()) {
  const due = parseISO(r.dueAt);
  if (r.done || !isValid(due)) return null;
  const days = differenceInCalendarDays(due, now);
  if (days > 3) return null;
  return days < 0 ? "Atrasado" : days === 0 ? "Hoje" : days === 1 ? "Amanhã" : `Em ${days} dias`;
}
