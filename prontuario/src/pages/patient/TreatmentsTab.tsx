import { CheckCheck, ClipboardList, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Card, EmptyState, Field, ProgressRing, Select } from "@/components/ui/misc";
import { TREATMENT_STATUS } from "@/lib/constants";
import { treatmentTotals } from "@/lib/derive";
import { printBudget } from "@/lib/print";
import type { Patient, TreatmentItem, TreatmentStatus } from "@/lib/types";
import { cn, money, nowISO, parseMoney, todayKey, uid } from "@/lib/utils";
import { useStore } from "@/store/store";

export function TreatmentsTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const procedures = useStore((s) => s.settings.procedures);
  const settings = useStore((s) => s.settings);
  const [proc, setProc] = useState("");
  const [teeth, setTeeth] = useState("");
  const [price, setPrice] = useState("");
  const totals = treatmentTotals(patient);

  const add = () => {
    if (!proc.trim()) return toast.error("Informe o procedimento");
    const def = procedures.find((p) => p.name === proc);
    if (!price.trim() && (!def || def.pricePending)) return toast.error("Informe o valor combinado. Para cortesia, digite 0.");
    const value = price ? parseMoney(price) : def?.price ?? 0;
    if (!Number.isFinite(value) || value < 0) return toast.error("O valor do procedimento não pode ser negativo.");
    updatePatient(patient.id, (p) => ({
      treatments: [...p.treatments, { id: uid("tr_"), procedure: proc.trim(), teeth: teeth.trim() || undefined, price: value, status: "planejado", createdAt: nowISO() }],
    }));
    setProc("");
    setTeeth("");
    setPrice("");
  };

  const setItem = (id: string, patch: Partial<TreatmentItem>) => {
    if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price < 0)) return toast.error("Informe um valor válido, maior ou igual a zero.");
    updatePatient(patient.id, (p) => ({ treatments: p.treatments.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  };

  const setStatus = (t: TreatmentItem, status: TreatmentStatus) => {
    if (status === "concluido" && t.status !== "concluido") {
      updatePatient(patient.id, (p) => ({
        treatments: p.treatments.map((x) => (x.id === t.id ? { ...x, status, completedAt: nowISO() } : x)),
        evolutions: [
          {
            id: uid("ev_"),
            date: todayKey(),
            title: `${t.procedure} concluído`,
            description: `Procedimento “${t.procedure}”${t.teeth ? ` no dente ${t.teeth}` : ""} finalizado.`,
            teeth: t.teeth,
            author: `${settings.title} ${settings.doctorName}`,
            createdAt: nowISO(),
          },
          ...p.evolutions,
        ],
      }));
      toast.success("Procedimento concluído", "Registrado automaticamente na evolução clínica.");
    } else setItem(t.id, { status, completedAt: status === "concluido" ? t.completedAt : undefined });
  };

  const approveAll = async () => {
    if (!(await confirmDialog({ title: "O paciente confirmou que aceita?", description: "Os itens não aprovados passarão a formar o total contratado e o saldo a receber.", confirmLabel: "Sim, confirmou" }))) return;
    updatePatient(patient.id, (p) => ({
      treatments: p.treatments.map((t) => (t.status === "planejado" ? { ...t, status: "aprovado" } : t)),
    }));
    toast.success("Tratamento aprovado", "O paciente foi movido para Em tratamento. O valor permanece a receber até o pagamento ser registrado.");
  };

  const planned = patient.treatments.filter((t) => t.status === "planejado");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card title="Plano de tratamento" icon={<ClipboardList className="h-5 w-5" />}>
        <div className="p-4 pt-2">
          <div className="grid gap-2 rounded-2xl border border-dashed border-jade-300 bg-jade-50/40 p-3 dark:border-jade-800 dark:bg-jade-900/10 sm:grid-cols-[1fr_120px_130px_auto]">
            <Field label="Procedimento">
              <input
                className="input"
                list="proc-options"
                value={proc}
                onChange={(e) => {
                  setProc(e.target.value);
                  const def = procedures.find((p) => p.name === e.target.value);
                  if (def) setPrice(def.pricePending ? "" : String(def.price));
                }}
                placeholder="Digite ou escolha…"
              />
              <datalist id="proc-options">
                {procedures.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.pricePending ? "Informe o valor" : money(p.price)}
                  </option>
                ))}
              </datalist>
            </Field>
            <Field label="Dente(s)">
              <input className="input" value={teeth} onChange={(e) => setTeeth(e.target.value)} placeholder="Ex.: 36" />
            </Field>
            <Field label="Valor (R$)">
              <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" onKeyDown={(e) => e.key === "Enter" && add()} />
            </Field>
            <div className="flex items-end">
              <Button onClick={add} icon={<Plus className="h-4 w-4" />} className="w-full">
                Adicionar
              </Button>
            </div>
          </div>

          {patient.treatments.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-7 w-7" />} title="Nenhum procedimento planejado" description="Adicione procedimentos acima ou direto pelo odontograma." />
          ) : (
            <div className="mt-4 space-y-2">
              {patient.treatments.map((t) => (
                <div key={t.id} className={cn("group flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3 transition hover:border-jade-300", t.status === "concluido" && "bg-surface-2/60")}>
                  <span className="h-8 w-1.5 rounded-full" style={{ background: TREATMENT_STATUS[t.status].dot }} />
                  <div className="min-w-[160px] flex-1">
                    <p className={cn("text-sm font-bold text-ink", t.status === "concluido" && "text-ink-2")}>{t.procedure}</p>
                    <p className="text-xs text-ink-3">{t.teeth ? `Dente ${t.teeth}` : "Geral"}{t.completedAt ? ` · concluído em ${new Date(t.completedAt).toLocaleDateString("pt-BR")}` : ""}</p>
                  </div>
                  <input
                    aria-label={`Valor de ${t.procedure}`}
                    className="input h-9 w-28 text-right font-semibold"
                    defaultValue={t.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    onBlur={(e) => { const value = parseMoney(e.target.value); if (!Number.isFinite(value) || value < 0) { e.target.value = t.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); return toast.error("Informe um valor válido. Use 0 somente para cortesia."); } setItem(t.id, { price: value }); }}
                  />
                  <Select aria-label={`Situação de ${t.procedure}`} value={t.status} onChange={(e) => setStatus(t, e.target.value as TreatmentStatus)} className="w-40 [&_select]:h-9">
                    {(Object.keys(TREATMENT_STATUS) as TreatmentStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {TREATMENT_STATUS[s].label}
                      </option>
                    ))}
                  </Select>
                  <button
                    aria-label={`Remover ${t.procedure}`}
                    onClick={async () => {
                      if (await confirmDialog({ title: "Remover procedimento?", description: t.procedure, danger: true, confirmLabel: "Remover" }))
                        updatePatient(patient.id, (p) => ({ treatments: p.treatments.filter((x) => x.id !== t.id) }));
                    }}
                    className="rounded-lg p-2 text-ink-3 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4 xl:sticky xl:top-32 xl:self-start">
        <div className="card p-5">
          <p className="font-display text-lg font-semibold text-ink">O que fazer agora?</p>
          {!patient.treatments.length ? <p className="mt-2 text-sm leading-relaxed text-ink-2">Adicione somente os procedimentos que serão propostos ao paciente.</p> : planned.length ? <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-2"><p><b className="text-ink">1.</b> Confira procedimentos e valores.</p><p><b className="text-ink">2.</b> Se quiser entregar uma proposta, use o PDF abaixo. Ele é opcional.</p><p><b className="text-ink">3.</b> Só confirme a aprovação depois que o paciente aceitar.</p></div> : <p className="mt-2 text-sm leading-relaxed text-ink-2">Os itens desta ficha já foram aprovados. Registre os recebimentos no Financeiro e conclua cada procedimento quando ele for realizado.</p>}
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={totals.progress} size={64} stroke={7}>
              <span className="text-sm">{Math.round(totals.progress * 100)}%</span>
            </ProgressRing>
            <div>
              <p className="font-display text-lg font-semibold text-ink">Progresso</p>
              <p className="text-sm text-ink-3">
                {totals.done} de {totals.count} procedimentos
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>Proposta não aprovada</span>
              <b className="text-ink">{money(totals.planned)}</b>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>Contratado</span>
              <b className="text-ink">{money(totals.gross)}</b>
            </div>
            <div className="flex items-center justify-between text-ink-2">
              <span>Desconto (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                className="input h-8 w-20 text-right"
                value={patient.planDiscount ?? 0}
                onChange={(e) => updatePatient(patient.id, { planDiscount: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              />
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <span className="font-semibold text-ink">Total</span>
              <b className="text-brand">{money(totals.total)}</b>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>Pago</span>
              <b className="text-jade-600">{money(totals.paid)}</b>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>Saldo</span>
              <b className={totals.balance ? "text-amber-600" : "text-ink"}>{money(totals.balance)}</b>
            </div>
          </div>
        </div>
        {planned.length > 0 && (
          <Button className="w-full" icon={<CheckCheck className="h-4 w-4" />} onClick={approveAll}>
            Confirmar que o paciente aceitou
          </Button>
        )}
        <Button variant="secondary" className="w-full" icon={<FileText className="h-4 w-4" />} onClick={() => printBudget(patient, settings)} disabled={!patient.treatments.length}>
          Gerar PDF / imprimir proposta (opcional)
        </Button>
      </div>
    </div>
  );
}
