import { motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BellRing,
  CalendarPlus,
  CheckCircle2,
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
import { Avatar, EmptyState, Menu } from "@/components/ui/misc";
import { stageById } from "@/lib/constants";
import { finishPendingReturns, isBirthdayToday, patientAgeGroup, patientAlerts, treatmentTotals } from "@/lib/derive";
import { printPatientRecord } from "@/lib/print";
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
  const ageGroup = patientAgeGroup(patient);

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
        <div className="relative flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-start" style={{ background: `linear-gradient(120deg, ${patient.color}18, transparent 70%)` }}>
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <Avatar patient={patient} size={84} ring />
              {bday && <span className="absolute -right-1 -top-1 text-2xl" title="Aniversário hoje!">🎂</span>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="break-words font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl" data-sensitive>
                  {patient.name}
                </h1>
                <button onClick={() => toggleFavorite(patient.id)} className={cn("shrink-0 p-1", patient.favorite ? "text-amber-400" : "text-ink-3 hover:text-amber-400")} title="Favorito">
                  <Star className="h-5 w-5" fill={patient.favorite ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="mt-1 text-sm text-ink-2">
                {[ageLabel(patient.birthDate) && `${ageLabel(patient.birthDate)} (${fmtDate(patient.birthDate)})`, patient.insurance || "Particular", patient.profession]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="chip" style={{ background: `${stage.color}1f`, color: stage.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.color }} />
                  {stage.label}
                </span>
                {ageGroup && <span className="chip bg-surface-2 text-ink-2">{ageGroup}</span>}
                {patient.archived && <span className="chip bg-slate-200 text-slate-700">Arquivado</span>}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-[360px] xl:justify-end">
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
                <Button variant="secondary" size="icon" aria-label="Mais opções do paciente">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              )}
              items={[
                { label: "Editar dados", icon: <Pencil className="h-4 w-4" />, onClick: () => openPatientModal(patient.id) },
                { label: "Imprimir prontuário completo", icon: <Printer className="h-4 w-4" />, onClick: () => printPatientRecord(patient, settings, appointments) },
                ...(patient.email ? [{ label: "Enviar e-mail", icon: <Mail className="h-4 w-4" />, onClick: () => window.open(`mailto:${patient.email}`) }] : []),
                ...(patient.stage === "manutencao" ? [{ label: "Encerrar acompanhamento e dar alta", icon: <CheckCircle2 className="h-4 w-4" />, onClick: async () => { if (await confirmDialog({ title: "Encerrar acompanhamento e dar alta?", description: "Os retornos pendentes serão concluídos. Um novo procedimento ou retorno cadastrado reabrirá o fluxo automaticamente.", confirmLabel: "Encerrar e dar alta" })) { updatePatient(patient.id, (current) => ({ reminders: finishPendingReturns(current.reminders) })); toast.success("Acompanhamento encerrado e alta registrada"); } } }] : []),
                ...(patient.stage === "concluido" ? [{ label: "Programar novo retorno", icon: <BellRing className="h-4 w-4" />, onClick: () => { setTab("lembretes"); toast.info("Cadastre o retorno", "Ao criar um lembrete do tipo Retorno, o paciente irá automaticamente para Em acompanhamento."); } }] : []),
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mx-5 my-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-surface p-3.5 dark:border-rose-900 sm:mx-6">
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

        <div className="relative grid grid-cols-2 border-t border-line xl:grid-cols-4">
          {[
            { label: "Etapa automática", value: <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />{stage.label}</span> },
            { label: "Procedimentos", value: totals.count ? `${totals.done}/${totals.count} realizados` : "Sem plano" },
            { label: "Total contratado", value: money(totals.total) },
            { label: "Saldo a receber", value: <span className={totals.balance ? "text-amber-600" : "text-jade-600"}>{money(totals.balance)}</span> },
          ].map((s, i) => (
            <div key={i} className={cn("min-w-0 px-5 py-3 sm:px-6 border-line", i < 2 && "max-xl:col-span-2", i > 0 && "xl:border-l max-xl:border-t", i === 3 && "max-xl:border-l")}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{s.label}</p>
              <div className="mt-0.5 text-sm font-bold text-ink">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-surface-2 px-5 py-3 text-sm leading-relaxed text-ink-2 sm:px-6"><b className="text-ink">{stage.label}:</b> {stage.hint} <span>A etapa muda automaticamente pelo plano; aceite, realização clínica e pagamento são informações separadas.</span></div>
      </section>

      {/* Abas */}
      <div className="sm:sticky sm:top-16 z-20 mt-6 bg-bg/95 py-2 backdrop-blur-xl">
        <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-sm" role="tablist" aria-label="Áreas do prontuário">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
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
