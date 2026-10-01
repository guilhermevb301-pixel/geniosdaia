import { useState } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/misc";
import { toast, confirmDialog } from "./ui/feedback";
import { useStore } from "@/store/store";
import { installmentBalance, splitInstallments } from "@/lib/finance";
import { treatmentTotals } from "@/lib/derive";
import { reminderAttention } from "@/lib/reminders";
import { money, parseMoney, todayKey, uid, nowISO, fmtDate, toDate } from "@/lib/utils";
import type { Patient, Installment } from "@/lib/types";
import { useClock } from "@/lib/useClock";

export function PatientBilling({ patient, onReceive }: { patient: Patient; onReceive: (item: Installment) => void }) {
  useClock();
  const update = useStore(s => s.updatePatient);
  const [service, setService] = useState("Consulta odontológica");
  const [price, setPrice] = useState("");
  const [entry, setEntry] = useState("0");
  const [count, setCount] = useState(1);
  const [first, setFirst] = useState(todayKey());
  const total = treatmentTotals(patient);
  const schedule = patient.paymentSchedule ?? [];
  const pending = schedule.filter(i => installmentBalance(i, patient.payments) > 0);
  const pendingTotal = pending.reduce((sum, i) => sum + installmentBalance(i, patient.payments), 0);
  const addService = () => {
    const value = Math.round(parseMoney(price) * 100) / 100;
    if (!service.trim() || !Number.isFinite(value) || value <= 0) return toast.error("Informe o serviço e um valor maior que zero.");
    update(patient.id, p => ({ treatments: [...p.treatments, { id: uid("tr_"), procedure: service.trim(), price: value, status: "aprovado", createdAt: nowISO() }] }));
    setPrice("");
    toast.success("Valor lançado no tratamento", "Agora registre o recebimento ou organize as parcelas abaixo.");
  };
  const makePlan = () => {
    try {
      if (pending.length) return toast.error("Já existem parcelas pendentes. Receba ou remova as parcelas antes de reorganizar o saldo.");
      const entryValue = Math.round(parseMoney(entry) * 100) / 100;
      if (!Number.isFinite(entryValue) || entryValue < 0 || entryValue > total.balance || total.balance <= 0) throw new Error("A entrada deve estar entre zero e o saldo a receber.");
      const remaining = Math.round((total.balance - entryValue) * 100) / 100;
      const parts = remaining ? splitInstallments(remaining, count, first) : [];
      const plan = [...(entryValue > 0 ? [{ label: "Entrada", amount: entryValue, dueDate: todayKey() }] : []), ...parts].map(i => ({ ...i, id: uid("par_") }));
      update(patient.id, { paymentSchedule: [...schedule, ...plan] });
      toast.success("Parcelamento organizado", "Entrada e parcelas só contam como recebidas após registrar o pagamento.");
    } catch (e) { toast.error((e as Error).message); }
  };
  return <div className="space-y-5">
    <section className="card p-5">
      <h3 className="font-display text-xl font-semibold">1. Lançar consulta ou serviço</h3>
      <p className="mt-1 mb-4 text-sm text-ink-2">Use para adicionar um valor que o paciente já aprovou. Se o serviço já está em Tratamentos, não lance novamente.</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] items-end">
        <Field label="Consulta ou serviço"><input className="input" value={service} onChange={e => setService(e.target.value)} /></Field>
        <Field label="Valor combinado (R$)"><input className="input" inputMode="decimal" placeholder="Ex.: 200,00" value={price} onChange={e => setPrice(e.target.value)} /></Field>
        <Button onClick={addService}>Lançar valor</Button>
      </div>
      {!!patient.planDiscount && <p className="mt-3 text-sm text-ink-2">O desconto de {patient.planDiscount}% do plano também será aplicado a este serviço.</p>}
    </section>
    <section className="card p-5 space-y-4">
      <h3 className="font-display text-xl font-semibold">2. Organizar entrada e parcelas</h3>
      <p className="text-sm text-ink-2">Distribua o saldo de <b>{money(total.balance)}</b> em vencimentos. A entrada é prevista para hoje; não é marcada como paga automaticamente.</p>
      {!pending.length && total.balance > 0 && <>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Entrada prevista (R$)"><input className="input" inputMode="decimal" value={entry} onChange={e => setEntry(e.target.value)} /></Field>
          <Field label="Parcelas mensais do restante"><input className="input" type="number" min="1" max="60" value={count} onChange={e => setCount(Number(e.target.value))} /></Field>
          <Field label="Primeiro vencimento"><input className="input" type="date" value={first} onChange={e => setFirst(e.target.value)} /></Field>
        </div>
        <Button variant="secondary" onClick={makePlan}>Criar parcelas do saldo</Button>
      </>}
      {pending.length > 0 && Math.abs(pendingTotal - total.balance) > 0.01 && <p className="rounded-xl bg-amber-50 p-3 text-amber-900 text-sm">As parcelas pendentes somam {money(pendingTotal)}, mas o saldo atual é {money(total.balance)}. Houve alteração no tratamento ou recebimento sem vínculo. Revise os vencimentos antes de cobrar.</p>}
      {schedule.map(item => {
        const balance = installmentBalance(item, patient.payments);
        const label = reminderAttention({ done: balance <= 0, dueAt: item.dueDate });
        return <div key={item.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${label ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : "border-line"}`}>
          <div className="flex-1"><p className="font-semibold">{item.label} · {money(item.amount)}</p><p className="text-sm text-ink-2">Vencimento: {fmtDate(item.dueDate)} · {balance === 0 ? "Pago" : `Pendente: ${money(balance)}`}</p>{label && <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{label} · verificar pagamento / entrar em contato</p>}</div>
          {balance > 0 && <Button variant="secondary" onClick={() => onReceive(item)}>Registrar recebimento</Button>}
          {balance > 0 && <Field label="Alterar vencimento"><input type="date" className="input w-44" value={item.dueDate} onChange={e => { const dueDate = e.target.value; if (toDate(dueDate)) update(patient.id, p => ({ paymentSchedule: p.paymentSchedule?.map(i => i.id === item.id ? { ...i, dueDate } : i) })); }} /></Field>}
          {balance === item.amount && <button className="text-sm underline text-ink-2 p-2" onClick={async () => {
            if (await confirmDialog({ title: "Remover este vencimento?", description: "O valor do tratamento e os pagamentos permanecem. Apenas este vencimento será removido.", confirmLabel: "Remover vencimento" })) update(patient.id, p => ({ paymentSchedule: p.paymentSchedule?.filter(i => i.id !== item.id) }));
          }}>Remover vencimento</button>}
        </div>;
      })}
      {!schedule.length && total.balance <= 0 && <p className="text-sm text-ink-2">Lance um serviço aprovado para organizar os vencimentos. Se o saldo já foi quitado, não há novas parcelas a criar.</p>}
    </section>
  </div>;
}
