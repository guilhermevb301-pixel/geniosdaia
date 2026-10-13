import { Download, FileText } from "lucide-react";
import type { Patient } from "@/lib/types";
import { getFile } from "@/lib/storage";
import { downloadBlob } from "@/lib/utils";
import { toast } from "./ui/feedback";
import { Button } from "./ui/Button";

export function ImportedDocuments({patient}:{patient:Patient}) {
  if (!patient.importedSources?.length) return null;
  return <section className="card p-5">
    <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><FileText className="h-5 w-5"/> Documentos e histórico importados</h2>
    <p className="mt-2 text-sm text-ink-3">Cópias dos registros anteriores, sem reemitir receitas nem alterar o conteúdo original. Datas, valores e grafias do documento são preservados.</p>
    {!!patient.importWarnings?.length && <div className="mt-3 text-sm text-amber-800"><p className="font-bold">Pontos para conferir com o doutor</p><ul className="list-disc pl-5">{patient.importWarnings.map((w,i)=><li key={i}>{w}</li>)}</ul></div>}
    <div className="mt-4 space-y-3">{patient.importedSources.map(source=><details key={source.id} className="rounded-xl border border-line p-4">
      <summary className="cursor-pointer font-semibold text-ink">{source.name} — ler documento</summary>
      <Button className="mt-3" variant="secondary" icon={<Download className="h-4 w-4"/>} onClick={async()=>{const blob=await getFile(source.attachmentId); if(blob)downloadBlob(blob,source.name); else toast.error("Documento indisponível", "Confira a conexão e tente novamente.");}}>Baixar original</Button>
      <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink-2">{source.text}</pre>
    </details>)}</div>
  </section>;
}
