import { CalendarClock, CreditCard, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { buildPaymentAgreement, installmentBalance, type PaymentAgreementMode } from "@/lib/finance";
import { treatmentTotals } from "@/lib/derive";
import { installmentAttention } from "@/lib/reminders";
import { PAYMENT_METHODS } from "@/lib/constants";
import { money, parseMoney, todayKey, uid, nowISO, fmtDate, toDate } from "@/lib/utils";
import type { Patient, Installment, PaymentMethod } from "@/lib/types";
import { useStore } from "@/store/store";
import { useClock } from "@/lib/useClock";
import { Button } from "./ui/Button";
import { Field, Select } from "./ui/misc";
import { toast, confirmDialog } from "./ui/feedback";

export function PaymentPlan({ patient, onReceive }: { patient: Patient; onReceive: (item: Installment) => void }) {
  useClock();
  const update = useStore((s) => s.updatePatient);
  const [mode, setMode] = useState<Exclude<PaymentAgreementMode, "depois">>("avista");
  const [method, setMethod] = useState<PaymentMethod>(patient.paymentAgreement?.method ?? "pix");
  const [entry, setEntry] = useState("0");
  const [count, setCount] = useState(2);
  const [first, setFirst] = useState(todayKey());
  const total = treatmentTotals(patient);
  const schedule = patient.paymentSchedule ?? [];
  const pending = schedule.filter((item) => installmentBalance(item, patient.payments) > 0);
  const pendingTotal = pending.reduce((sum, item) => sum + installmentBalance(item, patient.payments), 0);
  const amountToOrganize = useMemo(() => Math.max(0, Math.round((total.balance - pendingTotal) * 100) / 100), [pendingTotal, total.balance]);

  const saveAgreement = () => {
    try {
      const drafts = buildPaymentAgreement({ amount: amountToOrganize, mode, entry: entry.trim() ? parseMoney(entry) : 0, installments: count, firstDueDate: first, today: todayKey() });
      update(patient.id, (current) => ({ paymentSchedule: [...(current.paymentSchedule ?? []), ...drafts.map((item) => ({ ...item, id: uid("par_") }))], paymentAgreement: { mode, method, createdAt: nowISO() } }));
      toast.success("Forma de pagamento definida", "Os avisos de cobrança serão automáticos.");
    } catch (error) { toast.error((error as Error).message); }
  };

  return (
    <section className="card space-y-5 p-5">
      <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><WalletCards className="h-5 w-5" /></div><div><h3 className="font-display text-xl font-semibold">Como ficou combinado</h3><p className="text-sm text-ink-2">Aqui ficam somente vencimentos. Um valor só vira “pago” depois de registrar o recebimento.</p></div></div>

      {amountToOrganize > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
        <p className="mb-4 text-sm text-amber-950 dark:text-amber-100"><b>{money(amountToOrganize)} ainda não têm vencimentos.</b> Defina como o paciente combinou pagar.</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <button onClick={() => setMode("avista")} className={`rounded-xl border p-3 text-left text-sm font-bold ${mode === "avista" ? "border-jade-500 bg-white text-brand-ink ring-1 ring-jade-500 dark:bg-jade-950" : "border-line bg-surface"}`}><CalendarClock className="mb-1 h-4 w-4" />À vista</button>
          <button onClick={() => setMode("parcelado")} className={`rounded-xl border p-3 text-left text-sm font-bold ${mode === "parcelado" ? "border-jade-500 bg-white text-brand-ink ring-1 ring-jade-500 dark:bg-jade-950" : "border-line bg-surface"}`}><CreditCard className="mb-1 h-4 w-4" />Parcelado</button>
        </div>
        <div className={`grid gap-3 ${mode === "parcelado" ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
          <Field label="Forma combinada"><Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>{(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((item) => <option key={item} value={item}>{PAYMENT_METHODS[item]}</option>)}</Select></Field>
          {mode === "parcelado" && <Field label="Entrada (R$)"><input className="input" inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} /></Field>}
          {mode === "parcelado" && <Field label="Parcelas do restante"><input className="input" type="number" min={1} max={60} value={count} onChange={(e) => setCount(Number(e.target.value))} /></Field>}
          <Field label={mode === "avista" ? "Data combinada" : "Primeiro vencimento"}><input className="input" type="date" value={first} onChange={(e) => setFirst(e.target.value)} /></Field>
        </div>
        <Button className="mt-4" onClick={saveAgreement}>Salvar forma de pagamento</Button>
      </div>}

      {schedule.length > 0 && <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold text-ink">Próximos vencimentos</p>{patient.paymentAgreement && <span className="chip bg-surface-2 text-ink-2">Combinado: {PAYMENT_METHODS[patient.paymentAgreement.method]}</span>}</div>
        {schedule.map((item) => {
          const balance = installmentBalance(item, patient.payments);
          const attention = installmentAttention(item, patient.payments);
          return <div key={item.id} className={`flex flex-wrap items-center gap-3 rounded-xl border bg-surface p-3 ${attention?.severity === "danger" ? "border-rose-300" : attention?.severity === "warn" ? "border-amber-300" : "border-line"}`}>
            <div className="min-w-[220px] flex-1"><p className="font-semibold">{item.label} · {money(item.amount)}</p><p className="text-sm text-ink-2">Vencimento: {fmtDate(item.dueDate)} · {balance === 0 ? "Pagamento recebido" : `${money(balance)} a receber`}</p>{attention && <p className={`mt-1 text-sm font-bold ${attention.severity === "danger" ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>{attention.label} · entrar em contato com o paciente</p>}</div>
            {balance > 0 && <Button variant="secondary" onClick={() => onReceive(item)}>Registrar dinheiro recebido</Button>}
            {balance > 0 && <Field label="Alterar vencimento"><input type="date" className="input w-44" value={item.dueDate} onChange={(e) => { const dueDate = e.target.value; if (toDate(dueDate)) update(patient.id, (current) => ({ paymentSchedule: current.paymentSchedule?.map((currentItem) => currentItem.id === item.id ? { ...currentItem, dueDate } : currentItem) })); }} /></Field>}
            {balance === item.amount && <button className="p-2 text-sm text-ink-2 underline" onClick={async () => { if (await confirmDialog({ title: "Remover este vencimento?", description: "O tratamento permanece aceito. Apenas esta data de cobrança será removida.", confirmLabel: "Remover vencimento" })) update(patient.id, (current) => ({ paymentSchedule: current.paymentSchedule?.filter((currentItem) => currentItem.id !== item.id) })); }}>Remover vencimento</button>}
          </div>;
        })}
      </div>}
      {!schedule.length && amountToOrganize <= 0 && <p className="text-sm text-ink-2">Não há valores aceitos aguardando pagamento.</p>}
    </section>
  );
}
