import { addMonths, format, parseISO, isValid } from "date-fns";
import type { Installment, Patient, Payment, PaymentMethod } from "./types";

export function deletablePaymentAttachment(patient: Patient, payment: Payment): string | undefined {
  const id = payment.receiptAttachmentId;
  if (!id || payment.historical || patient.importedSources?.some(s => s.attachmentId === id) || patient.payments.some(p => p.id !== payment.id && p.receiptAttachmentId === id)) return undefined;
  return id;
}

export type PaymentAgreementMode = "avista" | "parcelado" | "depois";

export function buildPaymentAgreement(input: {
  amount: number;
  mode: PaymentAgreementMode;
  entry?: number;
  installments?: number;
  firstDueDate: string;
  today: string;
}): Omit<Installment, "id">[] {
  const amount = Math.round(input.amount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("O valor do acordo precisa ser maior que zero.");
  if (input.mode === "depois") return [];
  if (input.mode === "avista") {
    const due = parseISO(input.firstDueDate);
    if (!isValid(due)) throw new Error("Informe a data combinada para o pagamento.");
    return [{ label: "Pagamento à vista", amount, dueDate: input.firstDueDate }];
  }
  const entry = Math.round((input.entry ?? 0) * 100) / 100;
  if (!Number.isFinite(entry) || entry < 0 || entry >= amount) throw new Error("A entrada deve ser menor que o valor total.");
  const count = input.installments ?? 1;
  const rest = Math.round((amount - entry) * 100) / 100;
  const installments = splitInstallments(rest, count, input.firstDueDate);
  return [...(entry > 0 ? [{ label: "Entrada", amount: entry, dueDate: input.today }] : []), ...installments];
}

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

export function buildPaymentRecord(input: {
  id: string;
  amount: number;
  maxAmount?: number;
  method: PaymentMethod;
  date: string;
  description?: string;
  installmentId?: string;
  receiptAttachmentId?: string;
}): Payment {
  const amount = Math.round(input.amount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Informe um valor positivo.");
  if (input.maxAmount !== undefined && amount > input.maxAmount + 0.001) throw new Error("O valor ultrapassa o saldo desta parcela.");
  const date = parseISO(input.date);
  if (!isValid(date)) throw new Error("Informe a data do recebimento.");
  return {
    id: input.id,
    amount,
    method: input.method,
    date: input.date,
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    ...(input.installmentId ? { installmentId: input.installmentId } : {}),
    ...(input.receiptAttachmentId ? { receiptAttachmentId: input.receiptAttachmentId } : {}),
  };
}
