import { Banknote, Paperclip, Printer, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { ReceivePaymentModal } from "@/components/ReceivePaymentModal";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Card, EmptyState } from "@/components/ui/misc";
import { PAYMENT_METHODS } from "@/lib/constants";
import { treatmentTotals } from "@/lib/derive";
import { deletablePaymentAttachment } from "@/lib/finance";
import { openLink } from "@/lib/messages";
import { printReceipt } from "@/lib/print";
import { deleteFile, getFileUrl } from "@/lib/storage";
import type { Installment, Patient } from "@/lib/types";
import { firstName, fmtDate, money, whatsappLink } from "@/lib/utils";
import { useStore } from "@/store/store";
import { PaymentPlan } from "@/components/PaymentPlan";
import { HistoricalNotes } from "@/components/HistoricalNotes";

export function FinanceTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const settings = useStore((s) => s.settings);
  const totals = treatmentTotals(patient);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveInstallment, setReceiveInstallment] = useState<Installment | undefined>();
  const openReceive = (installment?: Installment) => { setReceiveInstallment(installment); setReceiveOpen(true); };

  const payments = [...patient.payments].sort((a, b) => b.date.localeCompare(a.date));
  const chargeMsg = `Olá, ${firstName(patient.name)}! Tudo bem? Aqui é do consultório do ${settings.title} ${settings.doctorName}. Passando para lembrar do saldo de ${money(
    totals.balance,
  )} referente ao seu tratamento. Qualquer dúvida estamos à disposição! 😊`;

  return (
    <div className="space-y-6">
      <HistoricalNotes patient={patient} kind="finance"/>
      {!!patient.importedSources?.length && <div className="card p-4 text-sm"><b>Histórico antigo separado do plano atual</b><p className="mt-1 text-ink-3">Os totais abaixo consideram somente o plano atual e os recebimentos registrados após a importação. R$ 0,00 aqui não confirma quitação do tratamento antigo. Confira os documentos acima com o doutor antes de criar uma cobrança.</p></div>}
      {patient.payments.some(p=>p.historical) && <div className="card p-4 text-sm"><b>Recebimentos anteriores à importação: {money(patient.payments.filter(p=>p.historical).reduce((sum,p)=>sum+p.amount,0))}</b><p className="mt-1 text-ink-3">Estão preservados no histórico abaixo. Não quitam automaticamente novos tratamentos e não demonstram, sozinhos, o saldo atual do paciente.</p></div>}
      <div className="rounded-2xl border border-jade-200 bg-brand-soft px-4 py-3 text-sm text-brand-ink"><b>Aqui é somente dinheiro.</b> Vencimento é uma cobrança planejada; “pagamento recebido” significa que o dinheiro realmente entrou. A realização do procedimento fica em Tratamentos.</div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: patient.importedSources?.length ? "Contratado no plano atual" : "Total contratado", value: money(totals.total), cls: "text-ink" },
          { label: patient.importedSources?.length ? "Recebido após a importação" : "Recebido", value: money(totals.paid), cls: "text-jade-600" },
          { label: patient.importedSources?.length ? "Saldo do plano atual" : "Saldo a receber", value: money(totals.balance), cls: totals.balance ? "text-amber-600" : "text-ink" },
          { label: patient.importedSources?.length ? "Novas propostas não aceitas" : "Ainda não aceito", value: money(totals.planned), cls: "text-ink-2" },
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

      <PaymentPlan patient={patient} onReceive={openReceive} />
      <div id="recebimento" className="grid gap-6 xl:grid-cols-[380px_1fr] scroll-mt-24">
        <Card title="Registrar dinheiro que entrou" icon={<Banknote className="h-5 w-5" />} className="xl:self-start">
          <div className="space-y-4 p-5 pt-3">
            <p className="text-sm leading-relaxed text-ink-2">Use somente depois que o paciente pagar. A janela permite conferir valor, data, forma de pagamento e anexar o comprovante.</p>
            <Button className="w-full" onClick={() => openReceive()} icon={<Banknote className="h-4 w-4" />}>Abrir registro de recebimento</Button>
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
                        {p.historical ? " · Registro histórico importado" : ""}
                        {p.description ? ` · ${p.description}` : ""}
                      </p>
                    </div>
                    {!p.historical && <Button size="sm" variant="secondary" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => printReceipt(patient, settings, p)}>
                      Recibo
                    </Button>}
                    {p.receiptAttachmentId && <Button size="sm" variant="secondary" icon={<Paperclip className="h-3.5 w-3.5" />} onClick={async () => { const url = await getFileUrl(p.receiptAttachmentId!); if (url) window.open(url, "_blank", "noopener"); else toast.error("Não foi possível abrir o documento."); }}>{p.historical ? "Documento de origem" : "Comprovante"}</Button>}
                    <button aria-label="Excluir pagamento"
                      onClick={async () => {
                        const removable = deletablePaymentAttachment(patient, p);
                        if (await confirmDialog({ title: "Excluir este pagamento?", description: removable ? `${money(p.amount)}. O comprovante anexado também será removido.` : `${money(p.amount)}. Documentos originais importados serão preservados.`, danger: true, confirmLabel: "Excluir" })) {
                          if (removable) await deleteFile(removable);
                          updatePatient(patient.id, (x) => ({ payments: x.payments.filter((y) => y.id !== p.id), attachments: removable ? x.attachments.filter((item) => item.id !== removable) : x.attachments }));
                        }
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
      {receiveOpen && <ReceivePaymentModal key={receiveInstallment?.id ?? "avulso"} patient={patient} installment={receiveInstallment} open onClose={() => setReceiveOpen(false)} />}
    </div>
  );
}
