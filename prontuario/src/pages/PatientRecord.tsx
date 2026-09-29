import { motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BellRing,
  CalendarPlus,
  ClipboardList,
  FileText,
  HeartPulse,
  History,
  Images,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Printer,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ToothGlyph } from "@/components/Logo";
import { Button, WhatsAppIcon } from "@/components/ui/Button";
import { confirmDialog, toast } from "@/components/ui/feedback";
import { Avatar, EmptyState, Menu, Select, TagChip } from "@/components/ui/misc";
import { STAGES, stageById } from "@/lib/constants";
import { isBirthdayToday, patientAlerts, treatmentTotals } from "@/lib/derive";
import { printPatientRecord } from "@/lib/print";
import type { Stage } from "@/lib/types";
import { ageLabel, cn, fmtDate, formatPhone, money, whatsappLink } from "@/lib/utils";
import { usePatient, useStore } from "@/store/store";
import { useUI } from "@/store/ui";
import { deleteFile } from "@/lib/storage";
import { AnamnesisTab } from "./patient/AnamnesisTab";
import { DocumentsTab } from "./patient/DocumentsTab";
import { EvolutionTab } from "./patient/EvolutionTab";
import { FinanceTab } from "./patient/FinanceTab";
import { ImagesTab } from "./patient/ImagesTab";
import { OdontogramTab } from "./patient/OdontogramTab";
import { OverviewTab } from "./patient/OverviewTab";
import { RemindersTab } from "./patient/RemindersTab";
import { TreatmentsTab } from "./patient/TreatmentsTab";

type TabId = "visao" | "anamnese" | "odontograma" | "tratamentos" | "evolucao" | "imagens" | "lembretes" | "financeiro" | "documentos";

export function PatientRecord() {
  const { id } = useParams();
  const patient = usePatient(id);
  const [params, setParams] = useSearchParams();
  const tab = (params.get("aba") as TabId) || "visao";
  const navigate = useNavigate();
  const markRecent = useStore((s) => s.markRecent);
  const updatePatient = useStore((s) => s.updatePatient);
  const deletePatient = useStore((s) => s.deletePatient);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const settings = useStore((s) => s.settings);
  const appointments = useStore((s) => s.appointments);
  const { openPatientModal, openApptModal } = useUI();
  const alerted = useRef<string | null>(null);

  useEffect(() => {
    if (!patient) return;
    markRecent(patient.id);
    if (alerted.current !== patient.id) {
      alerted.current = patient.id;
      const alerts = patientAlerts(patient);
      if (alerts.length) toast.warning(`Atenção: ${patient.name.split(" ")[0]}`, alerts.join(" · "));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id]);

  if (!patient)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title="Paciente não encontrado"
          description="Ele pode ter sido excluído."
          action={
            <Link to="/pacientes">
              <Button variant="secondary">Voltar para pacientes</Button>
            </Link>
          }
        />
      </div>
    );

  const alerts = patientAlerts(patient);
  const totals = treatmentTotals(patient);
  const pendingReminders = patient.reminders.filter((r) => !r.done).length;
  const stage = stageById(patient.stage);
  const wa = whatsappLink(patient.phone);
  const bday = isBirthdayToday(patient);

  const tabs: { id: TabId; label: string; icon: ReactNode; count?: number; alert?: boolean }[] = [
    { id: "visao", label: "Visão geral", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "anamnese", label: "Anamnese", icon: <HeartPulse className="h-4 w-4" />, alert: alerts.length > 0 },
    { id: "odontograma", label: "Odontograma", icon: <ToothGlyph className="h-4 w-4" />, count: Object.keys(patient.odontogram.teeth).length || undefined },
    { id: "tratamentos", label: "Tratamentos", icon: <ClipboardList className="h-4 w-4" />, count: patient.treatments.length || undefined },
    { id: "evolucao", label: "Evolução", icon: <History className="h-4 w-4" />, count: patient.evolutions.length || undefined },
    { id: "imagens", label: "Imagens", icon: <Images className="h-4 w-4" />, count: patient.attachments.length || undefined },
    { id: "lembretes", label: "Lembretes", icon: <BellRing className="h-4 w-4" />, count: pendingReminders || undefined },
    { id: "financeiro", label: "Financeiro", icon: <Wallet className="h-4 w-4" /> },
    { id: "documentos", label: "Documentos", icon: <FileText className="h-4 w-4" /> },
  ];

  const setTab = (t: TabId) => {
    const next = new URLSearchParams(params);
    if (t === "visao") next.delete("aba");
    else next.set("aba", t);
    setParams(next, { replace: true });
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: `Excluir ${patient.name}?`,
      description: "Todo o prontuário, imagens e consultas deste paciente serão apagados permanentemente. Se quiser apenas tirá-lo da lista, use “Arquivar”.",
      confirmLabel: "Excluir definitivamente",
      danger: true,
    });
    if (!ok) return;
    await Promise.all(patient.attachments.map((a) => deleteFile(a.id)));
    deletePatient(patient.id);
    toast.success("Paciente excluído");
    navigate("/pacientes");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      {/* Cabeçalho */}
      <section className="card relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 opacity-90" style={{ background: `linear-gradient(120deg, ${patient.color}33, transparent 70%)` }} />
        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
            <div className="relative">
              <Avatar patient={patient} size={84} ring />
              {bday && <span className="absolute -right-1 -top-1 text-2xl" title="Aniversário hoje!">🎂</span>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-2xl font-semibold text-ink sm:text-3xl" data-sensitive>
                  {patient.name}
                </h1>
                <button onClick={() => toggleFavorite(patient.id)} className={patient.favorite ? "text-amber-400" : "text-ink-3 hover:text-amber-400"} title="Favorito">
                  <Star className="h-5 w-5" fill={patient.favorite ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="mt-1 text-sm text-ink-2">
                {[ageLabel(patient.birthDate) && `${ageLabel(patient.birthDate)} (${fmtDate(patient.birthDate)})`, patient.insurance || "Particular", patient.profession]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="chip" style={{ background: `${stage.color}1f`, color: stage.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.color }} />
                  {stage.label}
                </span>
                {patient.tags.map((t) => (
                  <TagChip key={t} name={t} />
                ))}
                {patient.archived && <span className="chip bg-slate-200 text-slate-700">Arquivado</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {patient.phone && (
              <a href={`tel:${patient.phone}`} className="hidden sm:block">
                <Button variant="secondary" icon={<Phone className="h-4 w-4" />}>
                  <span data-sensitive>{formatPhone(patient.phone)}</span>
                </Button>
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer">
                <Button variant="whatsapp" icon={<WhatsAppIcon />}>
                  WhatsApp
                </Button>
              </a>
            )}
            <Button onClick={() => openApptModal({ patientId: patient.id })} icon={<CalendarPlus className="h-4 w-4" />}>
              Agendar
            </Button>
            <Menu
              trigger={() => (
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              )}
              items={[
                { label: "Editar dados", icon: <Pencil className="h-4 w-4" />, onClick: () => openPatientModal(patient.id) },
                { label: "Imprimir prontuário completo", icon: <Printer className="h-4 w-4" />, onClick: () => printPatientRecord(patient, settings, appointments) },
                ...(patient.email ? [{ label: "Enviar e-mail", icon: <Mail className="h-4 w-4" />, onClick: () => window.open(`mailto:${patient.email}`) }] : []),
                "divider" as const,
                {
                  label: patient.archived ? "Desarquivar" : "Arquivar paciente",
                  icon: <Archive className="h-4 w-4" />,
                  onClick: () => {
                    updatePatient(patient.id, { archived: !patient.archived });
                    toast.success(patient.archived ? "Paciente de volta à lista" : "Paciente arquivado");
                  },
                },
                { label: "Excluir paciente", icon: <Trash2 className="h-4 w-4" />, onClick: remove, danger: true },
              ]}
            />
          </div>
        </div>

        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-900 dark:bg-rose-950/40 sm:mx-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">Alertas de saúde</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {alerts.map((a) => (
                  <span key={a} className="chip bg-white text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/50 dark:text-rose-200 dark:ring-rose-800">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="relative grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {[
            { label: "Etapa", value: <Select value={patient.stage} onChange={(e) => updatePatient(patient.id, { stage: e.target.value as Stage })} className="-ml-3 max-w-[180px] [&_select]:h-8 [&_select]:border-transparent [&_select]:bg-transparent [&_select]:font-bold">{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</Select> },
            { label: "Plano de tratamento", value: totals.count ? `${totals.done}/${totals.count} concluídos` : "Sem plano" },
            { label: "Total contratado", value: money(totals.total) },
            { label: "Saldo a receber", value: <span className={totals.balance ? "text-amber-600" : "text-jade-600"}>{money(totals.balance)}</span> },
          ].map((s, i) => (
            <div key={i} className={cn("px-5 py-3 sm:px-6", i > 0 && "sm:border-l", i % 2 === 1 && "border-l", i >= 2 && "max-sm:border-t", "border-line")}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{s.label}</p>
              <div className="mt-0.5 text-sm font-bold text-ink">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Abas */}
      <div className="no-scrollbar sticky top-16 z-20 -mx-4 mt-6 overflow-x-auto bg-bg/85 px-4 py-2 backdrop-blur-xl lg:-mx-8 lg:px-8">
        <div className="flex w-max gap-1 rounded-2xl border border-line bg-surface p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                tab === t.id ? "text-white" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              {tab === t.id && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-gradient-to-b from-jade-500 to-jade-600 shadow-md" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
              <span className="relative flex items-center gap-2">
                {t.icon}
                {t.label}
                {t.count !== undefined && (
                  <span className={cn("rounded-md px-1.5 text-[11px] font-bold", tab === t.id ? "bg-white/20" : "bg-surface-2 text-ink-3")}>{t.count}</span>
                )}
                {t.alert && <span className="h-2 w-2 rounded-full bg-rose-500" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-4">
        {tab === "visao" && <OverviewTab patient={patient} goTo={setTab} />}
        {tab === "anamnese" && <AnamnesisTab patient={patient} />}
        {tab === "odontograma" && <OdontogramTab patient={patient} />}
        {tab === "tratamentos" && <TreatmentsTab patient={patient} />}
        {tab === "evolucao" && <EvolutionTab patient={patient} />}
        {tab === "imagens" && <ImagesTab patient={patient} />}
        {tab === "lembretes" && <RemindersTab patient={patient} />}
        {tab === "financeiro" && <FinanceTab patient={patient} />}
        {tab === "documentos" && <DocumentsTab patient={patient} />}
      </motion.div>
    </div>
  );
}

export type { TabId };
