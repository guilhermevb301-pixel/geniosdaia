import { Banknote, Plus, Printer, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Card, EmptyState, Field, Select } from "@/components/ui/misc";
import { PAYMENT_METHODS } from "@/lib/constants";
import { treatmentTotals } from "@/lib/derive";
import { openLink } from "@/lib/messages";
import { printReceipt } from "@/lib/print";
import type { Patient, PaymentMethod } from "@/lib/types";
import { firstName, fmtDate, money, parseMoney, todayKey, uid, whatsappLink, toDate } from "@/lib/utils";
import { useStore } from "@/store/store";
import { PaymentPlan } from "@/components/PaymentPlan";
import { installmentBalance } from "@/lib/finance";

export function FinanceTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const settings = useStore((s) => s.settings);
  const totals = treatmentTotals(patient);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>(patient.paymentAgreement?.method ?? "pix");
  const [date, setDate] = useState(todayKey());
  const [desc, setDesc] = useState("");
  const [installmentId, setInstallmentId] = useState("");

  const add = () => {
    const value = Math.round(parseMoney(amount) * 100) / 100;
    if (!Number.isFinite(value) || value <= 0 || !toDate(date)) return toast.error("Informe um valor positivo e a data do recebimento.");
    const installment = patient.paymentSchedule?.find(i => i.id === installmentId);
    if (installment && value > installmentBalance(installment, patient.payments) + 0.001) return toast.error("O valor ultrapassa o saldo desta parcela.");
    updatePatient(patient.id, (p) => ({
      payments: [...p.payments, { id: uid("pg_"), amount: value, method, date, description: desc.trim() || undefined, installmentId: installmentId || undefined }],
    }));
    toast.success("Pagamento registrado", money(value));
    setAmount("");
    setDesc("");
    setInstallmentId("");
  };

  const payments = [...patient.payments].sort((a, b) => b.date.localeCompare(a.date));
  const chargeMsg = `Olá, ${firstName(patient.name)}! Tudo bem? Aqui é do consultório do ${settings.title} ${settings.doctorName}. Passando para lembrar do saldo de ${money(
    totals.balance,
  )} referente ao seu tratamento. Qualquer dúvida estamos à disposição! 😊`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-jade-200 bg-brand-soft px-4 py-3 text-sm text-brand-ink"><b>Aqui é somente dinheiro.</b> Vencimento é uma cobrança planejada; “pagamento recebido” significa que o dinheiro realmente entrou. A realização do procedimento fica em Tratamentos.</div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total contratado", value: money(totals.total), cls: "text-ink" },
          { label: "Recebido", value: money(totals.paid), cls: "text-jade-600" },
          { label: "Saldo a receber", value: money(totals.balance), cls: totals.balance ? "text-amber-600" : "text-ink" },
          { label: "Ainda não aceito", value: money(totals.planned), cls: "text-ink-2" },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-xs font-semibold text-ink-3">{k.label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${k.cls}`}>{k.value}</p>
          </div>
        ))}
      </div>
      {totals.total > 0 && (
        <div className="card p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-ink">Pagamento do tratamento</span>
            <span className="text-ink-3">{Math.round(Math.min(1, totals.paid / totals.total) * 100)}% quitado</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-jade-400 to-jade-600 transition-all" style={{ width: `${Math.min(100, (totals.paid / totals.total) * 100)}%` }} />
          </div>
          {totals.balance > 0 && patient.phone && (
            <button onClick={() => openLink(whatsappLink(patient.phone, chargeMsg))} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#128C4B] hover:underline dark:text-[#4ade80]">
              <WhatsAppIcon className="h-3.5 w-3.5" /> Enviar lembrete gentil de pagamento
            </button>
          )}
        </div>
      )}

      <PaymentPlan patient={patient} onReceive={item => {
        setInstallmentId(item.id); setAmount(installmentBalance(item, patient.payments).toFixed(2).replace(".", ",")); setDesc(item.label); setDate(todayKey());
        document.getElementById("recebimento")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }} />
      <div id="recebimento" className="grid gap-6 xl:grid-cols-[380px_1fr] scroll-mt-24">
        <Card title="Registrar dinheiro que entrou" icon={<Banknote className="h-5 w-5" />} className="xl:self-start">
          <div className="space-y-4 p-5 pt-3">
            <p className="text-sm text-ink-2">Use somente depois que o paciente pagar. Criar um vencimento acima não registra dinheiro recebido.</p>
            {!!patient.paymentSchedule?.length && <Field label="Vincular a uma parcela"><Select value={installmentId} onChange={e => { const item = patient.paymentSchedule?.find(i => i.id === e.target.value); setInstallmentId(e.target.value); if (item) { setAmount(installmentBalance(item, patient.payments).toFixed(2).replace(".", ",")); setDesc(item.label); } }}><option value="">Recebimento avulso (sem parcela)</option>{patient.paymentSchedule.filter(i => installmentBalance(i, patient.payments) > 0).map(i => <option key={i.id} value={i.id}>{i.label} · {fmtDate(i.dueDate)}</option>)}</Select></Field>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor (R$)">
                <input className="input text-lg font-bold" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Data">
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Forma de pagamento">
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHODS[m]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Referente a">
              <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Entrada do implante" />
            </Field>
            {totals.balance > 0 && !installmentId && (
              <button className="text-xs font-semibold text-brand hover:underline" onClick={() => setAmount(totals.balance.toFixed(2).replace(".", ","))}>
                Preencher com o saldo total ({money(totals.balance)})
              </button>
            )}
            <Button className="w-full" onClick={add} icon={<Plus className="h-4 w-4" />}>
                Confirmar dinheiro recebido
            </Button>
          </div>
        </Card>
        <Card title="Histórico de pagamentos" icon={<Wallet className="h-5 w-5" />}>
          <div className="p-4 pt-2">
            {payments.length === 0 ? (
              <EmptyState icon={<Wallet className="h-7 w-7" />} title="Nenhum pagamento" description="Os pagamentos registrados aparecem aqui e podem gerar recibo." />
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="group flex items-center gap-3 rounded-2xl border border-line p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-100 text-jade-700 dark:bg-jade-900/50 dark:text-jade-200">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">{money(p.amount)}</p>
                      <p className="truncate text-xs text-ink-3">
                        {fmtDate(p.date)} · {PAYMENT_METHODS[p.method]}
                        {p.description ? ` · ${p.description}` : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => printReceipt(patient, settings, p)}>
                      Recibo
                    </Button>
                    <button aria-label="Excluir pagamento"
                      onClick={async () => {
                        if (await confirmDialog({ title: "Excluir este pagamento?", description: money(p.amount), danger: true, confirmLabel: "Excluir" }))
                          updatePatient(patient.id, (x) => ({ payments: x.payments.filter((y) => y.id !== p.id) }));
                      }}
                      className="rounded-lg p-2 text-ink-2 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
