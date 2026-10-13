import { useRef, useState } from "react";
import { Button } from "./ui/Button";
import { confirmDialog, toast } from "./ui/feedback";
import { validatePatientImport } from "@/lib/patientImport";
import { dataURLToBlob, putFile } from "@/lib/storage";
import { emptyPatient, useStore } from "@/store/store";
import { flush } from "@/store/sync";

export function PatientImport() {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState("");
  const mode = useStore(s => s.mode);
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const initial = useStore.getState();
      if (initial.mode !== "cloud" || !initial.userId || !initial.ready) throw new Error("Entre na conta para importar.");
      const pack = validatePatientImport(JSON.parse(await file.text()), initial.userEmail || "", initial.patients);
      const verifyAccount = () => {
        const now = useStore.getState();
        if (now.mode !== "cloud" || now.userId !== initial.userId) throw new Error("A conta mudou. Importação interrompida.");
      };
      const ok = await confirmDialog({ title: "Adicionar prontuários revisados?", description: `${pack.patients.length} pacientes e ${Object.keys(pack.files).length} arquivos serão adicionados à conta ${initial.userEmail}. Nenhum cadastro, configuração ou agendamento atual será substituído.`, confirmLabel: "Adicionar pacientes" });
      if (!ok) return;
      const blobs = new Map<string, Blob>();
      const sources = pack.patients.flatMap(p => p.importedSources || []);
      for (const [id, value] of Object.entries(pack.files)) {
        setProgress(`Validando documento ${blobs.size + 1} de ${Object.keys(pack.files).length}`);
        const blob = await dataURLToBlob(value);
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map(b => b.toString(16).padStart(2, "0")).join("");
        const source = sources.find(s => s.attachmentId === id);
        if (source && source.sha256 !== hash) throw new Error("Um documento não confere com a revisão. Importação cancelada.");
        blobs.set(id, blob);
      }
      let count = 0;
      for (const [id, blob] of blobs) {
        verifyAccount();
        setProgress(`Salvando documento ${++count} de ${blobs.size} na nuvem…`);
        await putFile(id, blob, true);
      }
      verifyAccount();
      validatePatientImport(pack, useStore.getState().userEmail || "", useStore.getState().patients);
      useStore.setState(s => ({patients: [...s.patients, ...pack.patients.map(p => emptyPatient(p))]}));
      setProgress("Salvando os cadastros na nuvem…");
      await flush();
      const final = useStore.getState();
      if (final.sync.pending || final.sync.status !== "saved") toast.warning("Pacientes adicionados, sincronização pendente", "Não feche o aplicativo até aparecer Salvo na nuvem.");
      else toast.success(`${pack.patients.length} pacientes importados`, "Documentos originais e transcrições disponíveis em Documentos.");
    } catch (error) {
      toast.error("Importação interrompida", error instanceof Error ? error.message : "Não foi possível salvar os documentos. Tente novamente.");
    } finally { setProgress(""); if (input.current) input.current.value = ""; }
  };
  return <div className="mt-5 border-t border-line pt-5">
    <h3 className="font-bold text-ink">Adicionar prontuários de outro sistema</h3>
    <p className="my-2 text-sm text-ink-3">Use um pacote revisado. Os cadastros atuais são preservados, a conta é conferida e os documentos originais acompanham cada paciente.</p>
    <Button variant="secondary" disabled={mode !== "cloud" || !!progress} onClick={() => input.current?.click()}>{progress || "Importar pacientes revisados"}</Button>
    <input ref={input} aria-label="Pacote de pacientes revisados" type="file" accept=".json,application/json" className="hidden" onChange={e => void importFile(e.target.files?.[0])}/>
    {progress && <p role="status" className="mt-2 text-sm text-ink-2">Mantenha esta aba aberta. {progress}</p>}
  </div>;
}
