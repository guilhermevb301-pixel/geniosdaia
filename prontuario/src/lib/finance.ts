import { addMonths, format, parseISO, isValid } from "date-fns";
import type { Installment, Payment } from "./types";

/** Split integer cents, including the remainder, without losing money. */
export function splitInstallments(total: number, count: number, firstDate: string): Omit<Installment, "id">[] {
  const date = parseISO(firstDate);
  const cents = Math.round(total * 100);
  if (!Number.isFinite(cents) || cents <= 0 || !Number.isInteger(count) || count < 1 || count > 60 || cents < count || !isValid(date)) throw new Error("Confira o valor, a data e o número de parcelas (1 a 60).");
  const base = Math.floor(cents / count);
  return Array.from({ length: count }, (_, i) => ({ label: `Parcela ${i + 1}/${count}`, dueDate: format(addMonths(date, i), "yyyy-MM-dd"), amount: (base + (i < cents % count ? 1 : 0)) / 100 }));
}

export function installmentBalance(item: Installment, payments: Payment[]) {
  return Math.max(0, Math.round((item.amount - payments.filter(p => p.installmentId === item.id).reduce((sum, p) => sum + p.amount, 0)) * 100) / 100);
}
