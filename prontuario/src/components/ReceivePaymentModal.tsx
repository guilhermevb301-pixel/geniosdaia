import { Banknote, FileCheck2, Loader2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS } from "@/lib/constants";
import { buildPaymentRecord, installmentBalance } from "@/lib/finance";
import { putFile, resizeImage } from "@/lib/storage";
import type { Attachment, Installment, Patient, PaymentMethod } from "@/lib/types";
import { money, nowISO, parseMoney, todayKey, uid } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Button } from "./ui/Button";
import { toast } from "./ui/feedback";
import { Field, Select } from "./ui/misc";
import { Modal } from "./ui/Modal";

export function ReceivePaymentModal({ patient, installment, open, onClose }: { patient: Patient; installment?: Installment; open: boolean; onClose: () => void }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const balance = installment ? installmentBalance(installment, patient.payments) : undefined;
  const [amount, setAmount] = useState(balance !== undefined ? balance.toFixed(2).replace(".", ",") : "");
  const [date, setDate] = useState(todayKey());
  const [method, setMethod] = useState<PaymentMethod>(patient.paymentAgreement?.method ?? "pix");
  const [description, setDescription] = useState(installment?.label ?? "");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const receiptId = receipt ? uid("arq_") : undefined;
      const payment = buildPaymentRecord({
        id: uid("pg_"),
        amount: parseMoney(amount),
        maxAmount: balance,
        method,
        date,
        description,
        installmentId: installment?.id,
        receiptAttachmentId: receiptId,
      });
      let attachment: Attachment | undefined;
      if (receipt) {
        if (receipt.size > 10 * 1024 * 1024) throw new Error("O comprovante deve ter no máximo 10 MB.");
        if (!receipt.type.startsWith("image/") && receipt.type !== "application/pdf") throw new Error("Envie uma imagem ou PDF como comprovante.");
        let blob: Blob = receipt;
        let width: number | undefined;
        let height: number | undefined;
        if (receipt.type.startsWith("image/") && receipt.type !== "image/gif" && receipt.type !== "image/svg+xml") {
          const resized = await resizeImage(receipt, 2200, "image/jpeg", 0.9);
          if (resized.blob.size < receipt.size) blob = resized.blob;
          width = resized.width;
          height = resized.height;
        }
        await putFile(receiptId!, blob);
        attachment = {
          id: receiptId!,
          name: `Comprovante - ${description.trim() || "pagamento"}`,
          category: "documento",
          mime: blob.type || receipt.type,
          size: blob.size,
          createdAt: nowISO(),
          takenAt: date,
          note: `Comprovante de recebimento de ${money(payment.amount)}`,
          width,
          height,
        };
      }
      updatePatient(patient.id, (current) => ({ payments: [...current.payments, payment], attachments: attachment ? [attachment, ...current.attachments] : current.attachments }));
      toast.success("Dinheiro recebido e registrado", attachment ? "O comprovante também foi anexado." : money(payment.amount));
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return <Modal open={open} onClose={onClose} title="Registrar dinheiro recebido" subtitle={installment ? `${installment.label} · saldo ${money(balance ?? 0)}` : "Use somente depois que o dinheiro realmente entrar."} icon={<Banknote className="h-5 w-5" />} size="md" footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancelar</Button><Button onClick={() => void save()} disabled={busy} icon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}>Confirmar recebimento</Button></>}>
    <div className="space-y-4">
      <div className="rounded-xl border border-jade-200 bg-brand-soft px-4 py-3 text-sm text-brand-ink"><b>Esta confirmação significa que o dinheiro entrou.</b> Ela não conclui o procedimento clínico.</div>
      <div className="grid grid-cols-2 gap-3"><Field label="Valor recebido (R$)"><input className="input text-lg font-bold" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field><Field label="Data do recebimento"><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
      <Field label="Forma de pagamento"><Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>{(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((item) => <option key={item} value={item}>{PAYMENT_METHODS[item]}</option>)}</Select></Field>
      <Field label="Referente a"><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Entrada do implante" /></Field>
      <div>
        <p className="label">Comprovante (opcional)</p>
        {receipt ? <div className="flex items-center gap-3 rounded-xl border border-jade-200 bg-jade-50 p-3 dark:border-jade-800 dark:bg-jade-950/30"><FileCheck2 className="h-5 w-5 text-brand" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{receipt.name}</p><p className="text-xs text-ink-3">Será guardado junto deste pagamento.</p></div><button aria-label="Remover comprovante" onClick={() => setReceipt(null)} className="rounded-lg p-2 text-ink-3 hover:bg-surface"><X className="h-4 w-4" /></button></div> : <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-5 text-sm font-semibold text-brand hover:border-jade-400 hover:bg-brand-soft"><UploadCloud className="h-5 w-5" />Anexar foto ou PDF<input className="sr-only" type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} /></label>}
        <p className="mt-1.5 text-xs text-ink-3">Imagem ou PDF, até 10 MB. Também aparecerá em Imagens → Documento.</p>
      </div>
    </div>
  </Modal>;
}
