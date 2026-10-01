import { Banknote, CalendarClock, CreditCard, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildPaymentAgreement, type PaymentAgreementMode } from "@/lib/finance";
import { PAYMENT_METHODS } from "@/lib/constants";
import type { Patient, PaymentMethod } from "@/lib/types";
import { money, nowISO, parseMoney, todayKey, uid } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Button } from "./ui/Button";
import { toast } from "./ui/feedback";
import { Field, Select } from "./ui/misc";
import { Modal } from "./ui/Modal";

export function PaymentAgreementModal({ patient, treatmentIds, onClose }: { patient: Patient; treatmentIds: string[]; onClose: () => void }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const navigate = useNavigate();
  const [mode, setMode] = useState<PaymentAgreementMode>("avista");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [entry, setEntry] = useState("0");
  const [installments, setInstallments] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState(todayKey());
  const [receivedNow, setReceivedNow] = useState(false);
  const amount = useMemo(() => {
    const gross = patient.treatments.filter((item) => treatmentIds.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
    return Math.round((gross * (1 - (patient.planDiscount ?? 0) / 100)) * 100) / 100;
  }, [patient.planDiscount, patient.treatments, treatmentIds]);

  useEffect(() => setReceivedNow(false), [mode]);

  const save = () => {
    try {
      const entryValue = entry.trim() ? parseMoney(entry) : 0;
      const drafts = buildPaymentAgreement({ amount, mode, entry: entryValue, installments, firstDueDate, today: todayKey() });
      updatePatient(patient.id, (current) => {
        const created = drafts.map((item) => ({ ...item, id: uid("par_") }));
        const first = created[0];
        return {
          treatments: current.treatments.map((item) => (treatmentIds.includes(item.id) ? { ...item, status: "aprovado" as const } : item)),
          paymentSchedule: [...(current.paymentSchedule ?? []), ...created],
          paymentAgreement: { mode, method, createdAt: nowISO() },
          payments:
            receivedNow && first
              ? [...current.payments, { id: uid("pg_"), amount: first.amount, method, date: todayKey(), description: first.label, installmentId: first.id }]
              : current.payments,
        };
      });
      toast.success("Aceite e pagamento organizados", receivedNow ? "O recebimento também foi registrado." : mode === "depois" ? "O pagamento ficou para definir no Financeiro." : "Os vencimentos já estão no Financeiro.");
      onClose();
      navigate(`/pacientes/${patient.id}?aba=financeiro`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      open={treatmentIds.length > 0}
      onClose={onClose}
      title="Paciente aceitou — como vai pagar?"
      subtitle={`Valor aceito: ${money(amount)}. Organizar o pagamento não significa que ele já foi recebido.`}
      icon={<WalletCards className="h-5 w-5" />}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Salvar e abrir Financeiro</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ["avista", "À vista", Banknote],
            ["parcelado", "Parcelado", CreditCard],
            ["depois", "Definir depois", CalendarClock],
          ] as const).map(([value, label, Icon]) => (
            <button key={value} onClick={() => setMode(value)} className={`rounded-2xl border p-4 text-left transition ${mode === value ? "border-jade-500 bg-brand-soft text-brand-ink ring-1 ring-jade-500" : "border-line hover:border-jade-300"}`}>
              <Icon className="mb-2 h-5 w-5" />
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}
        </div>

        {mode !== "depois" && (
          <>
            <Field label="Forma combinada de pagamento">
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((item) => <option key={item} value={item}>{PAYMENT_METHODS[item]}</option>)}
              </Select>
            </Field>
            {mode === "avista" ? (
              <Field label="Data combinada para pagar">
                <input type="date" className="input" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
              </Field>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Entrada (R$)"><input className="input" inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} /></Field>
                <Field label="Parcelas do restante"><input className="input" type="number" min={1} max={60} value={installments} onChange={(e) => setInstallments(Number(e.target.value))} /></Field>
                <Field label="Primeiro vencimento"><input className="input" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} /></Field>
              </div>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface-2 p-4">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-jade-600" checked={receivedNow} onChange={(e) => setReceivedNow(e.target.checked)} />
              <span><b className="block text-sm text-ink">Já recebi {mode === "parcelado" && Number(entry.replace(",", ".")) > 0 ? "a entrada" : "este pagamento"}</b><span className="text-xs text-ink-3">Marque somente se o dinheiro realmente entrou agora.</span></span>
            </label>
          </>
        )}
        {mode === "depois" && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">O tratamento será marcado como aceito, mas o Financeiro continuará avisando que a forma de pagamento ainda precisa ser definida.</p>}
      </div>
    </Modal>
  );
}
