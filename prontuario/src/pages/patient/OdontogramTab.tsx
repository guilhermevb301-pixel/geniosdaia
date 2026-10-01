import { AnimatePresence, motion } from "framer-motion";
import { ClipboardPlus, History, Info, StickyNote, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Odontogram, OdontogramLegend } from "@/components/odontogram/Odontogram";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/feedback";
import { Card, Select } from "@/components/ui/misc";
import { FACE_CONDITIONS, TOOTH_CONDITIONS, TREATMENT_STATUS } from "@/lib/constants";
import { faceLabel, suggestProcedure, toothName } from "@/lib/teeth";
import type { Odontogram as Odo, Patient, ToothFace } from "@/lib/types";
import { cn, fmtDate, money, nowISO, uid } from "@/lib/utils";
import { useStore } from "@/store/store";

function ToothPanel({ patient, n, onClose }: { patient: Patient; n: number; onClose: () => void }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const procedures = useStore((s) => s.settings.procedures);
  const state = patient.odontogram.teeth[String(n)];
  const faces = Object.entries(state?.faces ?? {}) as [ToothFace, keyof typeof FACE_CONDITIONS][];
  const whole = state?.whole ?? [];
  const suggestion = suggestProcedure([...faces.map(([, c]) => c), ...whole]);
  const [proc, setProc] = useState(suggestion ?? procedures[0]?.name ?? "");
  const [note, setNote] = useState(state?.note ?? "");

  useEffect(() => {
    setProc(suggestProcedure([...faces.map(([, c]) => c), ...whole]) ?? procedures[0]?.name ?? "");
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

  const addToPlan = () => {
    const def = procedures.find((p) => p.name === proc);
    if (!def || def.pricePending) return toast.error("Defina o valor em Configurações → Procedimentos ou adicione este item na aba Tratamentos com o valor combinado.");
    const faceTxt = faces.length ? ` (${faces.map(([f]) => faceLabel(f, n)[0]).join("")})` : "";
    updatePatient(patient.id, (p) => ({
      treatments: [...p.treatments, { id: uid("tr_"), procedure: proc, teeth: `${n}${faceTxt}`, price: def?.price ?? 0, status: "planejado", createdAt: nowISO() }],
    }));
    toast.success("Adicionado ao plano de tratamento", `${proc} · dente ${n}`);
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
            <div className="flex flex-wrap gap-1.5">
              {whole.map((w) => (
                <span key={w} className="chip text-white" style={{ background: TOOTH_CONDITIONS[w].color }}>
                  {TOOTH_CONDITIONS[w].label}
                </span>
              ))}
              {faces.map(([f, c]) => (
                <span key={f} className="chip border" style={{ color: FACE_CONDITIONS[c].color, borderColor: `${FACE_CONDITIONS[c].color}55`, background: `${FACE_CONDITIONS[c].color}12` }}>
                  {FACE_CONDITIONS[c].label} · {faceLabel(f, n)}
                </span>
              ))}
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
          <div className="flex gap-2">
            <Select value={proc} onChange={(e) => setProc(e.target.value)} className="flex-1">
              {procedures.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} — {p.pricePending ? "valor a definir" : money(p.price)}
                </option>
              ))}
            </Select>
            <Button onClick={addToPlan}>Adicionar</Button>
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

export function OdontogramTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const [selected, setSelected] = useState<number | null>(null);
  const onChange = (odontogram: Odo) => updatePatient(patient.id, { odontogram });

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-4">
        <Card>
          <Odontogram value={patient.odontogram} onChange={onChange} selected={selected} onSelect={setSelected} />
        </Card>
        <div className="card p-4">
          <OdontogramLegend value={patient.odontogram} />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
            <Info className="h-3.5 w-3.5" />
            Vermelho = a tratar · Azul = já tratado. Última atualização: {patient.odontogram.updatedAt ? fmtDate(patient.odontogram.updatedAt, "dd/MM/yyyy HH:mm") : "—"}
          </p>
        </div>
      </div>
      <div className="2xl:sticky 2xl:top-32 2xl:self-start">
        <AnimatePresence mode="wait">
          {selected ? (
            <ToothPanel key={selected} patient={patient} n={selected} onClose={() => setSelected(null)} />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Info className="h-6 w-6" />
              </div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">Selecione um dente</p>
              <p className="mt-1 text-sm text-ink-3">Veja condições, escreva anotações e adicione procedimentos ao plano de tratamento com um clique.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
