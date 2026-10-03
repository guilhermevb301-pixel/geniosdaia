import type { Patient } from "@/lib/types";

export function HistoricalNotes({patient,kind}:{patient:Patient;kind:"plan"|"finance"}) {
  const rows = kind === "plan" ? patient.historicalPlans : patient.historicalFinance;
  if (!rows?.length) return null;
  return <section className="card p-5"><h2 className="font-display text-xl font-semibold">{kind === "plan" ? "Planos e orçamentos anteriores" : "Anotações financeiras dos documentos"}</h2>
    <p className="mt-2 text-sm text-ink-3">{kind === "plan" ? "Transcritos dos documentos originais. Uma proposta antiga não é automaticamente um novo tratamento aceito. Consulte a evolução para ver o que já foi realizado." : "Valores, parcelamentos e saldos mencionados no histórico. Não foram criadas cobranças atuais ou datas de vencimento sem confirmação."}</p>
    {rows.map((row,i)=><details key={i} className="mt-3 rounded-xl border border-line p-3"><summary className="cursor-pointer font-semibold text-sm">{patient.importedSources?.find(s=>s.id===row.sourceId)?.name || "Registro original"}</summary><pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{row.text}</pre></details>)}
  </section>;
}
