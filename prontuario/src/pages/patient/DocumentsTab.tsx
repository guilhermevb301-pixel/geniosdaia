import { AlertTriangle, ClipboardCheck, FileSignature, FileText, HeartPulse, NotebookText, Pill, Plus, Printer, Receipt } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Field, Select } from "@/components/ui/misc";
import { hasPenicillinAllergy, patientAlerts } from "@/lib/derive";
import { printAnamnesis, printBudget, printFreeText, printPatientRecord, printPrescription, type RxItem } from "@/lib/print";
import type { Patient } from "@/lib/types";
import { cn, fmtDate, fmtDateLong, todayKey } from "@/lib/utils";
import { useStore } from "@/store/store";

interface Med extends RxItem {
  id: string;
  group: string;
  penicillin?: boolean;
}

const MEDS: Med[] = [
  { id: "amox", group: "Antibióticos", name: "Amoxicilina 500 mg", posology: "Tomar 1 cápsula de 8 em 8 horas por 7 dias.", qty: "21 cápsulas", penicillin: true },
  { id: "amoxp", group: "Antibióticos", name: "Amoxicilina 500 mg (profilaxia)", posology: "Tomar 4 cápsulas (2 g) 1 hora antes do procedimento.", qty: "4 cápsulas", penicillin: true },
  { id: "clinda", group: "Antibióticos", name: "Clindamicina 300 mg", posology: "Tomar 1 cápsula de 8 em 8 horas por 7 dias.", qty: "21 cápsulas" },
  { id: "azitro", group: "Antibióticos", name: "Azitromicina 500 mg", posology: "Tomar 1 comprimido ao dia por 3 dias.", qty: "3 comprimidos" },
  { id: "metro", group: "Antibióticos", name: "Metronidazol 400 mg", posology: "Tomar 1 comprimido de 8 em 8 horas por 7 dias.", qty: "21 comprimidos" },
  { id: "ibu", group: "Anti-inflamatórios", name: "Ibuprofeno 600 mg", posology: "Tomar 1 comprimido de 8 em 8 horas por 3 dias, após as refeições.", qty: "9 comprimidos" },
  { id: "nime", group: "Anti-inflamatórios", name: "Nimesulida 100 mg", posology: "Tomar 1 comprimido de 12 em 12 horas por 3 dias, após as refeições.", qty: "6 comprimidos" },
  { id: "dexa", group: "Anti-inflamatórios", name: "Dexametasona 4 mg", posology: "Tomar 1 comprimido 1 hora antes do procedimento.", qty: "1 comprimido" },
  { id: "dipi", group: "Analgésicos", name: "Dipirona 500 mg", posology: "Tomar 1 comprimido de 6 em 6 horas em caso de dor.", qty: "1 caixa" },
  { id: "para", group: "Analgésicos", name: "Paracetamol 750 mg", posology: "Tomar 1 comprimido de 6 em 6 horas em caso de dor.", qty: "1 caixa" },
  { id: "clx", group: "Uso bucal", name: "Digluconato de clorexidina 0,12%", posology: "Bochechar 15 mL por 1 minuto, 2 vezes ao dia, por 7 dias. Não engolir.", qty: "1 frasco" },
];

type Doc = "receita" | "atestado" | "comparecimento" | "orcamento" | "anamnese" | "prontuario" | "livre";

const DOCS: { id: Doc; label: string; hint: string; icon: ReactNode }[] = [
  { id: "receita", label: "Receituário", hint: "Medicamentos com posologia", icon: <Pill className="h-5 w-5" /> },
  { id: "atestado", label: "Atestado", hint: "Afastamento com dias de repouso", icon: <FileSignature className="h-5 w-5" /> },
  { id: "comparecimento", label: "Declaração", hint: "Comparecimento à consulta", icon: <ClipboardCheck className="h-5 w-5" /> },
  { id: "orcamento", label: "Orçamento", hint: "Do plano de tratamento", icon: <Receipt className="h-5 w-5" /> },
  { id: "anamnese", label: "Ficha de anamnese", hint: "Para o paciente assinar", icon: <HeartPulse className="h-5 w-5" /> },
  { id: "prontuario", label: "Prontuário completo", hint: "Todos os dados do paciente", icon: <NotebookText className="h-5 w-5" /> },
  { id: "livre", label: "Texto livre", hint: "Encaminhamento, declaração…", icon: <FileText className="h-5 w-5" /> },
];

export function DocumentsTab({ patient }: { patient: Patient }) {
  const settings = useStore((s) => s.settings);
  const appointments = useStore((s) => s.appointments);
  const [doc, setDoc] = useState<Doc>("receita");

  // Receita
  const [picked, setPicked] = useState<Record<string, RxItem>>({});
  const [custom, setCustom] = useState({ name: "", posology: "", qty: "" });
  const [use, setUse] = useState("Uso interno");
  const [rxNotes, setRxNotes] = useState("");
  const penicillinWarn = hasPenicillinAllergy(patient) && MEDS.some((m) => m.penicillin && picked[m.id]);

  // Atestado / declaração
  const [date, setDate] = useState(todayKey());
  const [from, setFrom] = useState("08:00");
  const [to, setTo] = useState("09:00");
  const [days, setDays] = useState(1);
  const [cid, setCid] = useState("");

  const certText = useMemo(() => {
    const who = `${patient.gender === "M" ? "o Sr." : patient.gender === "F" ? "a Sra." : "o(a) Sr(a)."} ${patient.name}${patient.cpf ? `, portador(a) do CPF ${patient.cpf},` : ""}`;
    if (doc === "comparecimento")
      return `Declaro, para os devidos fins, que ${who} esteve presente neste consultório odontológico no dia ${fmtDateLong(date)}, no período das ${from} às ${to}, para tratamento odontológico.`;
    return `Atesto, para os devidos fins, que ${who} esteve sob meus cuidados profissionais no dia ${fmtDateLong(date)}, das ${from} às ${to}, necessitando de ${days} (${
      ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"][days] ?? days
    }) dia${days > 1 ? "s" : ""} de repouso a partir desta data.${cid ? `\n\nCID: ${cid}` : ""}`;
  }, [doc, patient, date, from, to, days, cid]);
  const [freeTitle, setFreeTitle] = useState("Encaminhamento");
  const [freeText, setFreeText] = useState("");
  const [certEdit, setCertEdit] = useState<string | null>(null);

  const alerts = patientAlerts(patient);
  const groups = [...new Set(MEDS.map((m) => m.group))];

  const printNow = () => {
    if (doc === "receita") {
      const items = [...Object.values(picked)];
      if (custom.name.trim()) items.push({ ...custom });
      printPrescription(patient, settings, items, use, rxNotes);
    } else if (doc === "atestado") printFreeText(patient, settings, "Atestado odontológico", certEdit ?? certText);
    else if (doc === "comparecimento") printFreeText(patient, settings, "Declaração de comparecimento", certEdit ?? certText);
    else if (doc === "orcamento") printBudget(patient, settings);
    else if (doc === "anamnese") printAnamnesis(patient, settings);
    else if (doc === "prontuario") printPatientRecord(patient, settings, appointments);
    else printFreeText(patient, settings, freeTitle, freeText);
  };

  const canPrint = doc !== "receita" || Object.keys(picked).length > 0 || custom.name.trim();

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <div className="grid grid-cols-2 gap-2 self-start xl:grid-cols-1">
        {DOCS.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setDoc(d.id);
              setCertEdit(null);
            }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
              doc === d.id ? "border-jade-500 bg-jade-50 shadow-glow dark:bg-jade-900/30" : "border-line bg-surface hover:border-jade-300",
            )}
          >
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", doc === d.id ? "bg-jade-600 text-white" : "bg-brand-soft text-brand")}>{d.icon}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink">{d.label}</span>
              <span className="block truncate text-xs text-ink-3">{d.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <Card
        title={DOCS.find((d) => d.id === doc)?.label}
        icon={DOCS.find((d) => d.id === doc)?.icon}
        action={
          <Button onClick={printNow} disabled={!canPrint} icon={<Printer className="h-4 w-4" />}>
            Imprimir / PDF
          </Button>
        }
      >
        <div className="p-5 pt-3">
          {alerts.length > 0 && (doc === "receita" || doc === "atestado") && (
            <p className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {alerts.join(" · ")}
            </p>
          )}

          {doc === "receita" && (
            <div className="space-y-5">
              {penicillinWarn && (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-3 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
                  <AlertTriangle className="h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-bold">Atenção: paciente com alergia registrada a “{patient.anamnesis.allergies}”.</p>
                    <p className="text-sm">A amoxicilina pertence ao grupo das penicilinas. Considere uma alternativa como a clindamicina.</p>
                  </div>
                </div>
              )}
              {groups.map((g) => (
                <div key={g}>
                  <p className="label">{g}</p>
                  <div className="space-y-2">
                    {MEDS.filter((m) => m.group === g).map((m) => {
                      const on = !!picked[m.id];
                      const danger = m.penicillin && hasPenicillinAllergy(patient);
                      return (
                        <div key={m.id} className={cn("rounded-xl border p-3 transition", on ? (danger ? "border-rose-400 bg-rose-50/60 dark:bg-rose-950/30" : "border-jade-400 bg-jade-50/60 dark:bg-jade-900/20") : "border-line")}>
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                setPicked((cur) => {
                                  const next = { ...cur };
                                  if (on) delete next[m.id];
                                  else next[m.id] = { name: m.name, posology: m.posology, qty: m.qty };
                                  return next;
                                })
                              }
                              className="h-4 w-4 accent-jade-600"
                            />
                            <span className="flex-1 text-sm font-semibold text-ink">{m.name}</span>
                            {danger && <span className="chip bg-rose-600 text-white">alergia</span>}
                            <span className="text-xs text-ink-3">{m.qty}</span>
                          </label>
                          {on && (
                            <input
                              className="input mt-2 h-9"
                              value={picked[m.id].posology}
                              onChange={(e) => setPicked((cur) => ({ ...cur, [m.id]: { ...cur[m.id], posology: e.target.value } }))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-dashed border-line p-3">
                <p className="label flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Outro medicamento
                </p>
                <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                  <input className="input" placeholder="Nome e concentração" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
                  <input className="input" placeholder="Quantidade" value={custom.qty} onChange={(e) => setCustom({ ...custom, qty: e.target.value })} />
                  <input className="input sm:col-span-2" placeholder="Posologia" value={custom.posology} onChange={(e) => setCustom({ ...custom, posology: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tipo de uso">
                  <Select value={use} onChange={(e) => setUse(e.target.value)}>
                    <option>Uso interno</option>
                    <option>Uso externo</option>
                    <option>Uso interno e externo</option>
                  </Select>
                </Field>
                <Field label="Recomendações">
                  <input className="input" value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} placeholder="Ex.: evitar alimentos quentes nas primeiras 24h" />
                </Field>
              </div>
              <p className="text-xs text-ink-3">As posologias são sugestões editáveis — revise sempre conforme o caso clínico.</p>
            </div>
          )}

          {(doc === "atestado" || doc === "comparecimento") && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Data">
                  <input type="date" className="input" value={date} onChange={(e) => (setDate(e.target.value), setCertEdit(null))} />
                </Field>
                <Field label="Das">
                  <input type="time" className="input" value={from} onChange={(e) => (setFrom(e.target.value), setCertEdit(null))} />
                </Field>
                <Field label="Às">
                  <input type="time" className="input" value={to} onChange={(e) => (setTo(e.target.value), setCertEdit(null))} />
                </Field>
                {doc === "atestado" && (
                  <Field label="Dias de repouso">
                    <input type="number" min={0} max={30} className="input" value={days} onChange={(e) => (setDays(Math.max(0, Number(e.target.value) || 0)), setCertEdit(null))} />
                  </Field>
                )}
              </div>
              {doc === "atestado" && (
                <Field label="CID (opcional — somente com autorização do paciente)">
                  <input className="input" value={cid} onChange={(e) => (setCid(e.target.value), setCertEdit(null))} placeholder="Ex.: K08.8" />
                </Field>
              )}
              <Field label="Texto do documento (pode editar)">
                <textarea className="input font-display text-[15px] leading-relaxed" rows={7} value={certEdit ?? certText} onChange={(e) => setCertEdit(e.target.value)} />
              </Field>
            </div>
          )}

          {doc === "livre" && (
            <div className="space-y-4">
              <Field label="Título">
                <input className="input" value={freeTitle} onChange={(e) => setFreeTitle(e.target.value)} />
              </Field>
              <Field label="Texto">
                <textarea
                  className="input font-display text-[15px] leading-relaxed"
                  rows={10}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder={`Ao colega,\n\nEncaminho o(a) paciente ${patient.name} para avaliação…`}
                />
              </Field>
            </div>
          )}

          {(doc === "orcamento" || doc === "anamnese" || doc === "prontuario") && (
            <div className="rounded-2xl border border-line bg-surface-2/60 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">{DOCS.find((d) => d.id === doc)?.icon}</div>
              <p className="mt-3 font-display text-lg font-semibold text-ink">Documento gerado automaticamente</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">
                {doc === "orcamento" && `Inclui ${patient.treatments.filter((t) => t.status !== "concluido").length || patient.treatments.length} procedimento(s) do plano de tratamento, com desconto e validade.`}
                {doc === "anamnese" && "Ficha com todo o histórico de saúde marcado e espaço para a assinatura do paciente."}
                {doc === "prontuario" && "Dados pessoais, alertas, anamnese, odontograma, plano de tratamento e evolução clínica."}
              </p>
              <Button className="mt-4" onClick={printNow} icon={<Printer className="h-4 w-4" />}>
                Imprimir / salvar PDF
              </Button>
            </div>
          )}

          <p className="mt-6 border-t border-line pt-4 text-xs text-ink-3">
            Os documentos saem com o cabeçalho do {settings.title} {settings.doctorName}
            {settings.cro ? ` (CRO ${settings.cro})` : " — cadastre o CRO em Configurações"} e data de {fmtDate(new Date())}. Na janela de impressão, escolha “Salvar como PDF” para enviar
            por WhatsApp ou e-mail.
          </p>
        </div>
      </Card>
    </div>
  );
}
