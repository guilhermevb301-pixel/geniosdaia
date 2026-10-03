import type {
  AppointmentStatus,
  AttachmentCategory,
  FaceCondition,
  NoteColor,
  PaymentMethod,
  ProcedureDef,
  ReminderType,
  Settings,
  Stage,
  TagDef,
  ToothCondition,
  TreatmentStatus,
} from "./types";

export const STAGES: { id: Stage; label: string; hint: string; color: string; dot: string }[] = [
  { id: "avaliacao", label: "Avaliação", hint: "Avaliação inicial ou proposta ainda não aceita. Não indica dívida nem pagamento.", color: "#0EA5E9", dot: "bg-sky-500" },
  { id: "tratamento", label: "Em tratamento", hint: "Tratamento aceito ou em andamento, incluindo revisões e pós-operatório até a alta.", color: "#25A56F", dot: "bg-jade-500" },
  { id: "concluido", label: "Alta / Inativo", hint: "Alta ou inatividade registrada pelo profissional. O histórico e o financeiro são preservados.", color: "#64748B", dot: "bg-slate-500" },
];

export const stageById = (id: Stage) => STAGES.find((s) => s.id === id) ?? STAGES[0];

export const FACE_CONDITIONS: Record<FaceCondition, { label: string; color: string; short: string }> = {
  carie: { label: "Cárie", color: "#E5484D", short: "Cárie" },
  restauracao: { label: "Restauração", color: "#3B82F6", short: "Rest." },
  provisoria: { label: "Restauração provisória", color: "#F59E0B", short: "Prov." },
  selante: { label: "Selante", color: "#14B8A6", short: "Sel." },
  fratura: { label: "Fratura", color: "#F97316", short: "Frat." },
};

export const TOOTH_CONDITIONS: Record<ToothCondition, { label: string; color: string }> = {
  canal: { label: "Canal (endodontia)", color: "#DB2777" },
  coroa: { label: "Coroa / prótese unitária", color: "#CA8A04" },
  implante: { label: "Implante", color: "#7C3AED" },
  protese: { label: "Prótese fixa / ponte", color: "#0891B2" },
  ausente: { label: "Ausente", color: "#94A3B8" },
  extracao: { label: "Extração indicada", color: "#DC2626" },
};

export const TREATMENT_STATUS: Record<TreatmentStatus, { label: string; cls: string; dot: string }> = {
  planejado: { label: "Ainda não aceito", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", dot: "#94A3B8" },
  aprovado: { label: "Aceito — não iniciado", cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200", dot: "#0EA5E9" },
  andamento: { label: "Procedimento em andamento", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200", dot: "#F59E0B" },
  concluido: { label: "Procedimento realizado", cls: "bg-jade-100 text-jade-800 dark:bg-jade-900/60 dark:text-jade-200", dot: "#25A56F" },
};

export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; block: string; chip: string; dot: string }
> = {
  agendado: {
    label: "Agendado",
    block: "bg-surface border-jade-300 text-ink dark:border-jade-700",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    dot: "#94A3B8",
  },
  confirmado: {
    label: "Confirmado",
    block: "bg-jade-50 border-jade-500 text-jade-900 dark:bg-jade-900/50 dark:text-jade-100",
    chip: "bg-jade-100 text-jade-800 dark:bg-jade-900/60 dark:text-jade-200",
    dot: "#25A56F",
  },
  atendido: {
    label: "Atendido",
    block: "bg-jade-700 border-jade-800 text-white",
    chip: "bg-jade-700 text-white",
    dot: "#136A4A",
  },
  faltou: {
    label: "Faltou",
    block: "bg-rose-50 border-rose-400 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
    dot: "#E5484D",
  },
  cancelado: {
    label: "Cancelado",
    block: "bg-surface-2 border-line text-ink-3 line-through",
    chip: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    dot: "#CBD5E1",
  },
};

export const REMINDER_TYPES: Record<ReminderType, { label: string; color: string }> = {
  retorno: { label: "Retorno", color: "#25A56F" },
  confirmacao: { label: "Confirmação", color: "#0EA5E9" },
  medicacao: { label: "Medicação", color: "#DB2777" },
  pagamento: { label: "Pagamento", color: "#F59E0B" },
  outro: { label: "Outro", color: "#64748B" },
};

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; label: string }> = {
  jade: { bg: "bg-jade-50 dark:bg-jade-900/40", border: "border-jade-300 dark:border-jade-700", label: "Verde" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", label: "Amarelo" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-300 dark:border-rose-800", label: "Vermelho" },
  sky: { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-300 dark:border-sky-800", label: "Azul" },
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  pix: "Pix",
  credito: "Cartão de crédito",
  debito: "Cartão de débito",
  dinheiro: "Dinheiro",
  convenio: "Convênio",
  boleto: "Boleto",
  nao_informado: "Não informado no registro",
  transferencia: "Transferência bancária",
  cheque: "Cheque",
};

export const ATTACHMENT_CATEGORIES: Record<AttachmentCategory, { label: string; color: string }> = {
  radiografia: { label: "Radiografia", color: "#0EA5E9" },
  panoramica: { label: "Panorâmica", color: "#6366F1" },
  intraoral: { label: "Foto intraoral", color: "#25A56F" },
  extraoral: { label: "Foto do sorriso", color: "#F59E0B" },
  tomografia: { label: "Tomografia", color: "#8B5CF6" },
  documento: { label: "Documento", color: "#64748B" },
  encaminhamento: { label: "Encaminhamento", color: "#0891B2" },
  relatorio: { label: "Laudo / relatório", color: "#6366F1" },
  consentimento: { label: "Documento assinado", color: "#178559" },
  outro: { label: "Outro", color: "#94A3B8" },
};

export interface AnamnesisItem {
  key: string;
  label: string;
  alert: boolean;
  short: string;
}

export const ANAMNESIS_CONDITIONS: AnamnesisItem[] = [
  { key: "alergia_medicamento", label: "Alergia a medicamentos", alert: true, short: "Alergia a medicamento" },
  { key: "alergia_anestesico", label: "Alergia a anestésico local", alert: true, short: "Alergia a anestésico" },
  { key: "hipertensao", label: "Hipertensão arterial", alert: true, short: "Hipertenso(a)" },
  { key: "diabetes", label: "Diabetes", alert: true, short: "Diabético(a)" },
  { key: "cardiopatia", label: "Cardiopatia / problema cardíaco", alert: true, short: "Cardiopata" },
  { key: "marcapasso", label: "Marcapasso", alert: true, short: "Marcapasso" },
  { key: "anticoagulante", label: "Uso de anticoagulante (AAS, varfarina…)", alert: true, short: "Anticoagulante" },
  { key: "sangramento", label: "Sangramento excessivo / coagulopatia", alert: true, short: "Risco de sangramento" },
  { key: "gestante", label: "Gestante ou lactante", alert: true, short: "Gestante/lactante" },
  { key: "bisfosfonato", label: "Uso de bisfosfonatos", alert: true, short: "Bisfosfonato" },
  { key: "radioterapia", label: "Radioterapia em cabeça e pescoço", alert: true, short: "Radioterapia" },
  { key: "imunossupressao", label: "HIV / imunossupressão", alert: true, short: "Imunossuprimido(a)" },
  { key: "hepatite", label: "Hepatite / doença hepática", alert: true, short: "Hepatopatia" },
  { key: "epilepsia", label: "Epilepsia / convulsões", alert: true, short: "Epilepsia" },
  { key: "asma", label: "Asma / problema respiratório", alert: false, short: "Asma" },
  { key: "renal", label: "Doença renal", alert: false, short: "Doença renal" },
  { key: "tireoide", label: "Problema de tireoide", alert: false, short: "Tireoide" },
  { key: "ansiedade", label: "Ansiedade / medo de dentista", alert: false, short: "Ansioso(a)" },
];

export const ANAMNESIS_HABITS: { key: string; label: string }[] = [
  { key: "fumante", label: "Fumante" },
  { key: "etilista", label: "Consome álcool com frequência" },
  { key: "bruxismo", label: "Bruxismo / range os dentes" },
  { key: "roer_unhas", label: "Rói unhas / objetos" },
  { key: "respirador_bucal", label: "Respirador bucal" },
  { key: "fio_dental", label: "Usa fio dental diariamente" },
  { key: "sensibilidade", label: "Sensibilidade dentária" },
  { key: "sangramento_gengival", label: "Sangramento gengival" },
];

export const TAG_PALETTE = [
  "#25A56F",
  "#0EA5E9",
  "#8B5CF6",
  "#F59E0B",
  "#E5484D",
  "#DB2777",
  "#14B8A6",
  "#64748B",
];

export const AVATAR_COLORS = [
  "#178559",
  "#0F766E",
  "#0369A1",
  "#7C3AED",
  "#B45309",
  "#BE185D",
  "#4D7C0F",
  "#1D4ED8",
  "#9333EA",
  "#C2410C",
];

export const DEFAULT_TAGS: TagDef[] = [
  { name: "VIP", color: "#CA8A04" },
  { name: "Ortodontia", color: "#8B5CF6" },
  { name: "Implante", color: "#0EA5E9" },
  { name: "Estética", color: "#DB2777" },
  { name: "Convênio", color: "#14B8A6" },
  { name: "Criança", color: "#F59E0B" },
  { name: "Idoso", color: "#64748B" },
  { name: "Urgência", color: "#E5484D" },
];

const proc = (id: string, name: string, category: string): ProcedureDef => ({ id, name, price: 0, pricePending: true, category });

export const SPECIALTY_PROCEDURES: ProcedureDef[] = [
  proc("bx01", "Consulta de cirurgia e traumatologia bucomaxilofacial", "Bucomaxilofacial"),
  proc("bx02", "Cirurgia de osteoma, odontoma e outros tumores", "Bucomaxilofacial"),
  proc("bx03", "Odontologia hospitalar para pacientes especiais", "Hospitalar"),
  proc("bx04", "Reavaliação / pós-operatório", "Acompanhamento"),
];

export const DEFAULT_PROCEDURES: ProcedureDef[] = [
  ...SPECIALTY_PROCEDURES,
  proc("p01", "Consulta / avaliação", "Clínica geral"),
  proc("p02", "Limpeza (profilaxia)", "Prevenção"),
  proc("p03", "Aplicação de flúor", "Prevenção"),
  proc("p04", "Selante", "Prevenção"),
  proc("p05", "Restauração em resina", "Dentística"),
  proc("p06", "Restauração provisória", "Dentística"),
  proc("p07", "Clareamento dental", "Estética"),
  proc("p08", "Faceta em porcelana", "Estética"),
  proc("p09", "Tratamento de canal", "Endodontia"),
  proc("p10", "Retratamento de canal", "Endodontia"),
  proc("p11", "Extração simples", "Cirurgia"),
  proc("p12", "Extração de siso", "Cirurgia"),
  proc("p13", "Raspagem periodontal", "Periodontia"),
  proc("p14", "Implante dentário", "Implantodontia"),
  proc("p15", "Coroa em porcelana", "Prótese"),
  proc("p16", "Coroa provisória", "Prótese"),
  proc("p17", "Prótese total (dentadura)", "Prótese"),
  proc("p18", "Ponte fixa (por elemento)", "Prótese"),
  proc("p19", "Manutenção ortodôntica", "Ortodontia"),
  proc("p20", "Aparelho ortodôntico fixo", "Ortodontia"),
  proc("p21", "Placa de bruxismo", "Prótese"),
  proc("p22", "Radiografia periapical", "Diagnóstico"),
];

export const DEFAULT_SETTINGS: Settings = {
  doctorName: "Mizael Magalhães Cardoso",
  title: "Dr.",
  cro: "BA 3653",
  specialty: "Cirurgia Bucomaxilofacial / PCD",
  clinicName: "Consultório Odontológico Dr. Mizael Cardoso",
  phone: "(71) 99961-3646",
  email: "",
  address: "Ed. Aero Empresarial, Sala 118 - Centro - Lauro de Freitas - BA",
  documentFooter: "Cirurgia · Implantes · Próteses · Odontologia Hospitalar · Pacientes Especiais · Atendimento Odontológico Domiciliar",
  recallMonths: 6,
  startHour: 8,
  endHour: 19,
  workSaturday: true,
  procedures: DEFAULT_PROCEDURES,
  odontogramMarks: [],
  tags: DEFAULT_TAGS,
  messages: {
    confirm:
      "Olá, {nome}! Aqui é do consultório do Dr. Mizael Cardoso 🦷\nPassando para confirmar sua consulta de {data} às {hora}.\nPodemos confirmar? Responda SIM para confirmar. Obrigado!",
    birthday:
      "Olá, {nome}! 🎉 Hoje é um dia especial e o Dr. Mizael Cardoso e toda a equipe desejam um feliz aniversário, com muita saúde e muitos motivos para sorrir! 😁",
    recall:
      "Olá, {nome}! Tudo bem? Aqui é do consultório do Dr. Mizael Cardoso 🦷\nPodemos combinar seu retorno de acompanhamento? Fale conosco para consultar os horários disponíveis.",
  },
  theme: "light",
  autoLockMinutes: 0,
  notificationsEnabled: false,
};

export const DURATIONS = [15, 30, 45, 60, 90, 120, 180];
