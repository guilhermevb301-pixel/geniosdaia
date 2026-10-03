import type { Patient } from "./types";

export interface PatientImportPackage {
  app: "prontuario-patient-import";
  version: 1;
  expectedEmail: string;
  patients: Patient[];
  files: Record<string, string>;
}

/** Importação aditiva: nunca substitui registros existentes nem configurações. */
export function validatePatientImport(value: unknown, email: string, existing: Patient[]): PatientImportPackage {
  const pack = value as PatientImportPackage;
  if (pack?.app !== "prontuario-patient-import" || pack.version !== 1 || !Array.isArray(pack.patients) || !pack.patients.length || !pack.files) throw new Error("Pacote de importação inválido.");
  if (!email || pack.expectedEmail?.trim().toLowerCase() !== email.trim().toLowerCase()) throw new Error("Este pacote pertence a outra conta. Nenhum paciente foi importado.");
  const ids = new Set<string>();
  const names = new Set(existing.map(p => p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()));
  const existingIds = new Set(existing.map(p => p.id));
  const fileIds = new Set<string>();
  for (const p of pack.patients) {
    if (!p.id || !p.name?.trim() || !["avaliacao", "tratamento", "concluido"].includes(p.stage) || !p.anamnesis || !p.odontogram || ![p.treatments,p.payments,p.evolutions,p.reminders,p.notes,p.attachments].every(Array.isArray)) throw new Error("Há um cadastro incompleto no pacote.");
    if (ids.has(p.id) || existingIds.has(p.id)) throw new Error("Paciente já importado ou identificador duplicado. Nenhum registro foi substituído.");
    const name = p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    if (names.has(name)) throw new Error(`Nome já cadastrado ou duplicado: ${p.name}. Confira a identidade antes de importar.`);
    ids.add(p.id); names.add(name);
    if (p.demo || p.archived || !p.importedSources?.length) throw new Error("O pacote deve conter prontuários reais e suas fontes.");
    for (const a of p.attachments) {
      if (fileIds.has(a.id) || !pack.files[a.id]?.startsWith("data:")) throw new Error("Anexo ausente ou duplicado no pacote.");
      fileIds.add(a.id);
    }
    for (const source of p.importedSources) {
      if (!source.text || !/^[a-f0-9]{64}$/.test(source.sha256) || !p.attachments.some(a => a.id === source.attachmentId)) throw new Error("Documento de origem incompleto.");
    }
    for (const t of p.treatments) if (!Number.isFinite(t.price) || t.price < 0) throw new Error("Valor de tratamento inválido.");
    for (const payment of p.payments) {
      const date = new Date(payment.date + "T12:00:00Z");
      if (!Number.isFinite(payment.amount) || payment.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(payment.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== payment.date) throw new Error("Pagamento sem valor ou data verificável.");
    }
  }
  if (Object.keys(pack.files).length !== fileIds.size) throw new Error("Há arquivos sem paciente associado.");
  return pack;
}
