import { AnimatePresence, motion } from "framer-motion";
import { History, NotebookPen, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Card, EmptyState, Field } from "@/components/ui/misc";
import type { Evolution, Patient } from "@/lib/types";
import { fmtDate, normalize, nowISO, todayKey, uid, toDate } from "@/lib/utils";
import { useStore } from "@/store/store";

const TEMPLATES: { label: string; title: string; text: string }[] = [
  { label: "Avaliação bucomaxilofacial", title: "Avaliação bucomaxilofacial", text: "Queixa e história clínica:\nExame realizado e achados:\nExames avaliados / solicitados:\nHipótese diagnóstica e plano discutido:\nConduta e próximo retorno:" },
  { label: "Planejamento cirúrgico", title: "Planejamento cirúrgico", text: "Procedimento proposto e região:\nIndicação e exames considerados:\nRiscos e alternativas discutidos com o paciente:\nLocal e equipe previstos:\nPendências antes do procedimento:\nData de reavaliação:" },
  { label: "Registro de cirurgia", title: "Registro do procedimento cirúrgico", text: "Data, local e equipe:\nProcedimento realizado:\nRegião / dentes envolvidos:\nTécnica, materiais e anestesia utilizados:\nIntercorrências e conduta:\nOrientações fornecidas e documentos entregues:\nRetorno combinado:" },
  { label: "Pós-operatório", title: "Reavaliação pós-operatória", text: "Procedimento e data de referência:\nQueixas relatadas:\nAchados da avaliação:\nConduta definida pelo profissional:\nOrientações ao paciente:\nPróximo contato / retorno:" },
  { label: "Limpeza", title: "Profilaxia", text: "Realizada profilaxia com pasta profilática e taça de borracha. Aplicação de flúor. Orientações de higiene oral." },
  { label: "Restauração", title: "Restauração em resina", text: "Anestesia infiltrativa. Isolamento absoluto. Remoção de tecido cariado. Condicionamento ácido, sistema adesivo e restauração em resina composta pela técnica incremental. Ajuste oclusal e polimento." },
  { label: "Canal", title: "Tratamento endodôntico", text: "Anestesia. Isolamento absoluto. Abertura coronária, odontometria, preparo químico-mecânico. Medicação intracanal. Selamento provisório." },
  { label: "Extração", title: "Exodontia", text: "Anestesia. Sindesmotomia, luxação e avulsão do elemento. Curetagem e irrigação do alvéolo. Sutura. Orientações pós-operatórias e prescrição." },
  { label: "Avaliação", title: "Consulta de avaliação", text: "Anamnese, exame clínico intra e extraoral. Plano de tratamento discutido com o paciente." },
  { label: "Retorno", title: "Retorno / controle", text: "Paciente sem queixas. Boa cicatrização. Mantido acompanhamento." },
  { label: "Anestesia", title: "", text: "Anestesia: articaína 4% com epinefrina 1:100.000 — 1 tubete." },
];

export function EvolutionTab({ patient }: { patient: Patient }) {
  const updatePatient = useStore((s) => s.updatePatient);
  const settings = useStore((s) => s.settings);
  const [date, setDate] = useState(todayKey());
  const [title, setTitle] = useState("");
  const [teeth, setTeeth] = useState("");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const nq = normalize(q);
    return [...patient.evolutions]
      .filter((e) => !nq || normalize(`${e.title} ${e.description} ${e.teeth ?? ""}`).includes(nq))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [patient.evolutions, q]);

  const reset = () => {
    setDate(todayKey());
    setTitle("");
    setTeeth("");
    setText("");
    setEditing(null);
  };

  const save = () => {
    if (!toDate(date)) return toast.error("Informe a data do atendimento.");
    if (!text.trim() && !title.trim()) return toast.error("Escreva o que foi feito na consulta");
    const entry: Evolution = {
      id: editing ?? uid("ev_"),
      date,
      title: title.trim() || "Atendimento",
      description: text.trim(),
      teeth: teeth.trim() || undefined,
      author: `${settings.title} ${settings.doctorName}`,
      createdAt: nowISO(),
    };
    updatePatient(patient.id, (p) => ({
      evolutions: editing ? p.evolutions.map((e) => (e.id === editing ? { ...entry, createdAt: e.createdAt } : e)) : [entry, ...p.evolutions],
    }));
    toast.success(editing ? "Evolução atualizada" : "Evolução registrada");
    reset();
  };

  const edit = (e: Evolution) => {
    setEditing(e.id);
    setDate(e.date);
    setTitle(e.title);
    setTeeth(e.teeth ?? "");
    setText(e.description);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card title={editing ? "Editar evolução" : "Registrar atendimento"} icon={<NotebookPen className="h-5 w-5" />} className="xl:sticky xl:top-32 xl:self-start">
        <div className="space-y-4 p-5 pt-3">
          <div>
            <span className="label">Modelos rápidos</span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    if (t.title && !title) setTitle(t.title);
                    setText((cur) => (cur ? `${cur}\n${t.text}` : t.text));
                  }}
                  className="chip border border-line bg-surface px-2.5 py-1 text-ink-2 transition hover:border-jade-400 hover:bg-brand-soft hover:text-brand-ink"
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Dente(s)">
              <input className="input" value={teeth} onChange={(e) => setTeeth(e.target.value)} placeholder="Ex.: 36, 37" />
            </Field>
          </div>
          <Field label="Título">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Restauração do 26" />
          </Field>
          <Field label="Descrição do procedimento">
            <textarea className="input" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Descreva o que foi realizado, materiais, anestesia, intercorrências e orientações…" />
          </Field>
          <div className="flex gap-2">
            {editing && (
              <Button variant="secondary" onClick={reset}>
                Cancelar
              </Button>
            )}
            <Button className="flex-1" onClick={save}>
              {editing ? "Salvar alterações" : "Registrar evolução"}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="flex-1 font-display text-xl font-semibold text-ink">Linha do tempo</h3>
          <div className="relative w-64 max-w-[50%]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input className="input h-9 pl-9" placeholder="Buscar no histórico" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {list.length === 0 ? (
          <div className="card">
            <EmptyState icon={<History className="h-7 w-7" />} title="Sem registros" description="As evoluções clínicas aparecerão aqui em ordem cronológica." />
          </div>
        ) : (
          <ol className="relative ml-3 space-y-4 border-l-2 border-jade-200 pl-6 dark:border-jade-800">
            <AnimatePresence initial={false}>
              {list.map((e) => (
                <motion.li key={e.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative">
                  <span className="absolute -left-[33px] top-4 flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-bg bg-jade-500" />
                  <div className="card group p-4">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-brand">{fmtDate(e.date, "EEEE, d 'de' MMMM 'de' yyyy")}</p>
                        <p className="mt-0.5 font-bold text-ink">{e.title}</p>
                      </div>
                      {e.teeth && <span className="chip bg-brand-soft text-brand-ink">Dente {e.teeth}</span>}
                      <div className="flex opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => edit(e)} className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (await confirmDialog({ title: "Excluir este registro?", danger: true, confirmLabel: "Excluir" }))
                              updatePatient(patient.id, (p) => ({ evolutions: p.evolutions.filter((x) => x.id !== e.id) }));
                          }}
                          className="rounded-lg p-1.5 text-ink-3 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {e.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{e.description}</p>}
                    <p className="mt-3 text-[11px] font-semibold text-ink-3">✍️ {e.author}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </div>
  );
}
