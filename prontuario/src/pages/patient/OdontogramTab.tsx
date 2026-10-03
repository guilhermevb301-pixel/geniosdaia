import { AnimatePresence, motion } from "framer-motion";
import { Calculator, ClipboardPlus, History, Info, Layers3, Plus, StickyNote, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Odontogram, OdontogramLegend } from "@/components/odontogram/Odontogram";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/feedback";
import { Card, Field, Select } from "@/components/ui/misc";
import { Modal } from "@/components/ui/Modal";
import { TREATMENT_STATUS } from "@/lib/constants";
import { appendOdontogramMark, removeOdontogramMark, sameTreatmentScope, treatmentPriceTotal, type TreatmentPriceMode } from "@/lib/derive";
import { odontogramMark } from "@/lib/odontogram";
import { faceLabel, suggestProcedure, toothName } from "@/lib/teeth";
import type { CustomOdontogramMarkId, Odontogram as Odo, Patient, ToothFace } from "@/lib/types";
import { cn, fmtDate, money, nowISO, parseMoney, uid } from "@/lib/utils";
import { useStore } from "@/store/store";

function ToothPanel({ patient, n, onClose }: { patient: Patient; n: number; onClose: () => void }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const procedures = useStore((s) => s.settings.procedures);
  const customMarks = useStore((s) => s.settings.odontogramMarks);
  const state = patient.odontogram.teeth[String(n)];
  const faces = Object.entries(state?.faces ?? {}) as [ToothFace, string][];
  const whole = state?.whole ?? [];
  const suggestion = suggestProcedure([...faces.map(([, c]) => c), ...whole]);
  const [proc, setProc] = useState(suggestion ?? procedures[0]?.name ?? "");
  const initialDef = procedures.find((item) => item.name === (suggestion ?? procedures[0]?.name));
  const [price, setPrice] = useState(initialDef && !initialDef.pricePending ? String(initialDef.price) : "");
  const [note, setNote] = useState(state?.note ?? "");

  useEffect(() => {
    const nextProc = suggestProcedure([...faces.map(([, c]) => c), ...whole]) ?? procedures[0]?.name ?? "";
    const nextDef = procedures.find((item) => item.name === nextProc);
    setProc(nextProc);
    setPrice(nextDef && !nextDef.pricePending ? String(nextDef.price) : "");
    setNote(patient.odontogram.teeth[String(n)]?.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const related = useMemo(() => {
    const re = new RegExp(`(^|\\D)${n}(\\D|$)`);
    return {
      treatments: patient.treatments.filter((t) => t.teeth && re.test(t.teeth)),
      evolutions: patient.evolutions.filter((e) => e.teeth && re.test(e.teeth)).sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [patient.treatments, patient.evolutions, n]);

  const saveNote = () => {
    if ((state?.note ?? "") === note) return;
    updatePatient(patient.id, (p) => {
      const teeth = { ...p.odontogram.teeth };
      const cur = { ...(teeth[String(n)] ?? {}) };
      if (note.trim()) cur.note = note.trim();
      else delete cur.note;
      if (!cur.note && !cur.whole?.length && !Object.keys(cur.faces ?? {}).length) delete teeth[String(n)];
      else teeth[String(n)] = cur;
      return { odontogram: { ...p.odontogram, teeth } };
    });
  };

  const removeMark = (target: { scope: "tooth"; value: string } | { scope: "face"; face: ToothFace }) => {
    updatePatient(patient.id, (p) => {
      const key = String(n);
      const teeth = { ...p.odontogram.teeth };
      const next = removeOdontogramMark(teeth[key] ?? {}, target);
      if (!next.note && !next.whole?.length && !Object.keys(next.faces ?? {}).length) delete teeth[key];
      else teeth[key] = next;
      return { odontogram: { ...p.odontogram, teeth, updatedAt: nowISO() } };
    });
  };

  const addToPlan = () => {
    if (!price.trim()) return toast.error("Informe o valor combinado com este paciente. Para cortesia, digite 0.");
    const value = parseMoney(price);
    if (!Number.isFinite(value) || value < 0) return toast.error("Informe um valor válido.");
    if (patient.treatments.some((item) => sameTreatmentScope(item, proc, [n]))) return toast.warning("Este procedimento já está no plano", `Confira o item do dente ${n} na aba Tratamentos.`);
    const faceTxt = faces.length ? ` (${faces.map(([f]) => faceLabel(f, n)[0]).join("")})` : "";
    updatePatient(patient.id, (p) => ({
      treatments: [...p.treatments, { id: uid("tr_"), procedure: proc, teeth: `${n}${faceTxt}`, price: value, status: "planejado", createdAt: nowISO() }],
    }));
    toast.success("Adicionado ao plano de tratamento", `${proc} · dente ${n} · ${money(value)}`);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="card overflow-hidden">
      <div className="hero-bg relative flex items-center gap-4 px-5 py-4 text-white">
        <span className="font-display text-4xl font-semibold">{n}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">{toothName(n)}</p>
          <p className="text-xs text-jade-100/70">Notação FDI</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-5 p-5">
        <div>
          <p className="label">Condições</p>
          {faces.length === 0 && whole.length === 0 ? (
            <p className="text-sm text-ink-3">Dente hígido (sem marcações).</p>
          ) : (
            <div>
              <p className="mb-2 text-xs text-ink-3">Clique em uma marcação para removê-la.</p>
              <div className="flex flex-wrap gap-1.5">
              {whole.map((w) => (
                <button
                  key={w}
                  type="button"
                  className="chip text-white transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  style={{ background: odontogramMark(w, customMarks).color }}
                  onClick={() => removeMark({ scope: "tooth", value: w })}
                  aria-label={`Remover ${odontogramMark(w, customMarks).label} do dente ${n}`}
                  title="Clique para remover"
                >
                  {odontogramMark(w, customMarks).label}<X className="h-3 w-3" />
                </button>
              ))}
              {faces.map(([f, c]) => (
                <button
                  key={f}
                  type="button"
                  className="chip border transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  style={{ color: odontogramMark(c, customMarks).color, borderColor: `${odontogramMark(c, customMarks).color}55`, background: `${odontogramMark(c, customMarks).color}12` }}
                  onClick={() => removeMark({ scope: "face", face: f })}
                  aria-label={`Remover ${odontogramMark(c, customMarks).label} da face ${faceLabel(f, n)} do dente ${n}`}
                  title="Clique para remover"
                >
                  {odontogramMark(c, customMarks).label} · {faceLabel(f, n)}<X className="h-3 w-3" />
                </button>
              ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="label flex items-center gap-1.5">
            <StickyNote className="h-3.5 w-3.5" /> Anotação do dente
          </p>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Ex.: sensibilidade ao frio, mobilidade grau I…" />
        </div>

        <div className="rounded-2xl border border-jade-200 bg-jade-50/60 p-3 dark:border-jade-800 dark:bg-jade-900/20">
          <p className="label flex items-center gap-1.5 text-brand">
            <ClipboardPlus className="h-3.5 w-3.5" /> Adicionar ao plano de tratamento
          </p>
          <div className="space-y-3">
            <Select value={proc} onChange={(e) => { const name = e.target.value; const def = procedures.find((item) => item.name === name); setProc(name); setPrice(def && !def.pricePending ? String(def.price) : ""); }} className="w-full">
              {procedures.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} — {p.pricePending ? "valor a definir" : money(p.price)}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="Valor para este paciente (R$)"><input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></Field>
              <div className="flex items-end"><Button onClick={addToPlan}>Adicionar</Button></div>
            </div>
          </div>
          {suggestion && <p className="mt-1.5 text-xs text-ink-3">Sugestão com base nas marcações: {suggestion}</p>}
        </div>

        {(related.treatments.length > 0 || related.evolutions.length > 0) && (
          <div>
            <p className="label flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Histórico deste dente
            </p>
            <ul className="space-y-2">
              {related.treatments.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ background: TREATMENT_STATUS[t.status].dot }} />
                  <span className="flex-1 text-ink">{t.procedure}</span>
                  <span className={cn("chip", TREATMENT_STATUS[t.status].cls)}>{TREATMENT_STATUS[t.status].label}</span>
                </li>
              ))}
              {related.evolutions.map((e) => (
                <li key={e.id} className="rounded-xl bg-surface-2 p-2.5 text-sm">
                  <p className="text-xs font-semibold text-ink-3">{fmtDate(e.date)}</p>
                  <p className="font-semibold text-ink">{e.title}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(faces.length > 0 || whole.length > 0) && (
          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
            onClick={() =>
              updatePatient(patient.id, (p) => {
                const teeth = { ...p.odontogram.teeth };
                const cur = teeth[String(n)];
                if (cur?.note) teeth[String(n)] = { note: cur.note };
                else delete teeth[String(n)];
                return { odontogram: { ...p.odontogram, teeth } };
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpar marcações deste dente
          </button>
        )}
      </div>
    </motion.div>
  );
}

function MultiToothPanel({ patient, selected, onClear }: { patient: Patient; selected: number[]; onClear: () => void }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const procedures = useStore((s) => s.settings.procedures);
  const [proc, setProc] = useState(procedures[0]?.name ?? "");
  const [mode, setMode] = useState<TreatmentPriceMode>("per_tooth");
  const [price, setPrice] = useState(() => procedures[0] && !procedures[0].pricePending ? String(procedures[0].price) : "");
  const teeth = useMemo(() => [...new Set(selected)].sort((a, b) => a - b), [selected]);
  const parsed = price.trim() ? parseMoney(price) : Number.NaN;
  const total = treatmentPriceTotal(mode, parsed, teeth.length);

  const addToPlan = () => {
    if (!price.trim()) return toast.error("Informe o valor combinado com este paciente. Para cortesia, digite 0.");
    if (!Number.isFinite(total) || total < 0) return toast.error("Confira o valor e os dentes selecionados.");
    if (patient.treatments.some((item) => sameTreatmentScope(item, proc, teeth))) return toast.warning("Este procedimento já está no plano", "Confira os mesmos dentes na aba Tratamentos.");
    updatePatient(patient.id, (current) => ({
      treatments: [...current.treatments, { id: uid("tr_"), procedure: proc, teeth: teeth.join(", "), price: total, status: "planejado", createdAt: nowISO() }],
    }));
    toast.success("Adicionado ao plano de tratamento", `${proc} · ${teeth.length} dentes · ${money(total)}`);
    onClear();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="card overflow-hidden">
      <div className="hero-bg relative px-5 py-4 text-white">
        <div className="flex items-start gap-3">
          <Layers3 className="mt-1 h-6 w-6 shrink-0" />
          <div className="min-w-0 flex-1"><p className="font-display text-2xl font-semibold">{teeth.length} dentes selecionados</p><p className="mt-1 text-sm text-jade-100/80">{teeth.join(" · ")}</p></div>
          <button onClick={onClear} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Limpar seleção"><X className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="rounded-2xl border border-jade-200 bg-jade-50/60 p-4 dark:border-jade-800 dark:bg-jade-900/20">
          <p className="label flex items-center gap-1.5 text-brand"><ClipboardPlus className="h-3.5 w-3.5" /> Adicionar todos ao plano</p>
          <div className="space-y-4">
            <Field label="Procedimento">
              <Select value={proc} onChange={(e) => { const name = e.target.value; const def = procedures.find((item) => item.name === name); setProc(name); setPrice(def && !def.pricePending ? String(def.price) : ""); }}>
                {procedures.map((item) => <option key={item.id} value={item.name}>{item.name} — {item.pricePending ? "valor a definir" : money(item.price)}</option>)}
              </Select>
            </Field>
            <div>
              <p className="label">Como este valor foi combinado?</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMode("per_tooth")} className={cn("rounded-xl border p-3 text-left text-sm font-bold", mode === "per_tooth" ? "border-jade-500 bg-white text-brand-ink ring-1 ring-jade-500 dark:bg-jade-950" : "border-line bg-surface")}><span className="block">Por dente</span><span className="text-xs font-normal text-ink-3">Multiplica pela quantidade</span></button>
                <button onClick={() => setMode("total")} className={cn("rounded-xl border p-3 text-left text-sm font-bold", mode === "total" ? "border-jade-500 bg-white text-brand-ink ring-1 ring-jade-500 dark:bg-jade-950" : "border-line bg-surface")}><span className="block">Total do conjunto</span><span className="text-xs font-normal text-ink-3">Um valor para todos</span></button>
              </div>
            </div>
            <Field label={mode === "per_tooth" ? "Valor de cada dente (R$)" : "Valor total dos dentes (R$)"}><input className="input text-lg font-bold" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></Field>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="flex items-center gap-2 text-sm text-ink-2"><Calculator className="h-4 w-4 text-brand" />{mode === "per_tooth" ? `${teeth.length} dentes × ${Number.isFinite(parsed) ? money(parsed) : "—"}` : `${teeth.length} dentes pelo valor combinado`}</p>
              <p className="mt-1 flex items-center justify-between font-semibold"><span>Total do tratamento</span><strong className="text-lg text-brand">{Number.isFinite(total) ? money(total) : "—"}</strong></p>
            </div>
            <Button className="w-full" onClick={addToPlan}>Adicionar {teeth.length} dentes ao plano</Button>
          </div>
        </div>
        <button className="w-full text-center text-sm font-semibold text-ink-3 hover:text-brand" onClick={onClear}>Limpar seleção</button>
      </div>
    </motion.div>
  );
}

export function OdontogramTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const updateSettings = useStore((s) => s.updateSettings);
  const customMarks = useStore((s) => s.settings.odontogramMarks);
  const [selected, setSelected] = useState<number[]>([]);
  const [newMarkOpen, setNewMarkOpen] = useState(false);
  const [markName, setMarkName] = useState("");
  const [markColor, setMarkColor] = useState("#8B5CF6");
  const [markScope, setMarkScope] = useState<"face" | "tooth">("tooth");
  const onChange = (odontogram: Odo) => updatePatient(patient.id, { odontogram });

  const addMark = () => {
    try {
      const id = `custom:${uid("mark_")}` as CustomOdontogramMarkId;
      const next = appendOdontogramMark(customMarks, { label: markName, color: markColor, scope: markScope }, id);
      updateSettings({ odontogramMarks: next });
      toast.success("Marcação criada", `${markName.trim()} já pode ser usada em qualquer paciente.`);
      setMarkName("");
      setMarkColor("#8B5CF6");
      setMarkScope("tooth");
      setNewMarkOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a marcação.");
    }
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-4">
        <Card>
          <Odontogram
            value={patient.odontogram}
            onChange={onChange}
            selected={selected}
            onSelect={setSelected}
            customMarks={customMarks}
            extraToolbar={<Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setNewMarkOpen(true)}>Nova marcação</Button>}
          />
        </Card>
        <div className="card p-4">
          <OdontogramLegend value={patient.odontogram} customMarks={customMarks} />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
            <Info className="h-3.5 w-3.5" />
            Vermelho = a tratar · Azul = já tratado. Última atualização: {patient.odontogram.updatedAt ? fmtDate(patient.odontogram.updatedAt, "dd/MM/yyyy HH:mm") : "—"}
          </p>
        </div>
      </div>
      <div className="2xl:sticky 2xl:top-32 2xl:self-start">
        <AnimatePresence mode="wait">
          {selected.length > 1 ? (
            <MultiToothPanel key={selected.join("-")} patient={patient} selected={selected} onClear={() => setSelected([])} />
          ) : selected.length === 1 ? (
            <ToothPanel key={selected[0]} patient={patient} n={selected[0]} onClose={() => setSelected([])} />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Info className="h-6 w-6" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">Selecione um ou vários dentes</p>
              <p className="mt-1 text-sm text-ink-3">Um dente abre os detalhes. Vários permitem calcular e adicionar o conjunto ao plano de tratamento.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Modal
        open={newMarkOpen}
        onClose={() => setNewMarkOpen(false)}
        size="sm"
        title="Nova marcação do odontograma"
        icon={<Plus className="h-5 w-5" />}
        footer={<><Button variant="secondary" onClick={() => setNewMarkOpen(false)}>Cancelar</Button><Button onClick={addMark}>Criar marcação</Button></>}
      >
        <div className="space-y-4">
          <Field label="Nome da marcação"><input className="input" value={markName} onChange={(e) => setMarkName(e.target.value)} placeholder="Ex.: Faceta" autoFocus /></Field>
          <Field label="Onde será aplicada?">
            <Select value={markScope} onChange={(e) => setMarkScope(e.target.value as "face" | "tooth")}>
              <option value="tooth">No dente inteiro</option>
              <option value="face">Em uma face do dente</option>
            </Select>
          </Field>
          <Field label="Cor">
            <div className="flex items-center gap-3"><input type="color" value={markColor} onChange={(e) => setMarkColor(e.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-surface p-1" /><span className="text-sm text-ink-3">Essa cor aparecerá no desenho e na legenda.</span></div>
          </Field>
          <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink-2">A marcação ficará salva na conta do doutor e poderá ser usada em todos os pacientes.</p>
        </div>
      </Modal>
    </div>
  );
}
