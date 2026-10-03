export type ID = string;

export type Stage = "avaliacao" | "tratamento" | "concluido";

export type Gender = "F" | "M" | "O";

export type ToothFace = "M" | "D" | "O" | "V" | "L";

export type FaceCondition = "carie" | "restauracao" | "provisoria" | "selante" | "fratura";

export type ToothCondition = "ausente" | "extracao" | "implante" | "coroa" | "canal" | "protese";

export type CustomOdontogramMarkId = `custom:${string}`;

export interface OdontogramMarkDef {
  id: CustomOdontogramMarkId;
  label: string;
  color: string;
  scope: "face" | "tooth";
}

export interface ToothState {
  faces?: Partial<Record<ToothFace, FaceCondition | CustomOdontogramMarkId>>;
  whole?: (ToothCondition | CustomOdontogramMarkId)[];
  note?: string;
}

export type Dentition = "permanente" | "decidua" | "mista";

export interface Odontogram {
  dentition: Dentition;
  teeth: Record<string, ToothState>;
  updatedAt?: string;
}

export interface Anamnesis {
  updatedAt?: string;
  complaint?: string;
  conditions: Record<string, boolean>;
  habits: Record<string, boolean>;
  allergies?: string;
  medications?: string;
  surgeries?: string;
  bloodPressure?: string;
  lastDentalVisit?: string;
  notes?: string;
  customConditions?: { id: ID; label: string; alert: boolean }[];
  customHabits?: { id: ID; label: string }[];
}

export type TreatmentStatus = "planejado" | "aprovado" | "andamento" | "concluido";

export interface TreatmentItem {
  id: ID;
  procedure: string;
  teeth?: string;
  price: number;
  status: TreatmentStatus;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Evolution {
  /** Registros administrativos importados não contam como uma visita clínica. */
  clinicalVisit?: boolean;
  id: ID;
  date: string;
  title: string;
  description: string;
  teeth?: string;
  author: string;
  createdAt: string;
  /** Vínculo usado para manter o histórico automático alinhado ao procedimento. */
  treatmentId?: ID;
  automatic?: boolean;
}

export type ReminderType = "retorno" | "confirmacao" | "medicacao" | "pagamento" | "outro";

export interface Reminder {
  id: ID;
  title: string;
  dueAt: string;
  type: ReminderType;
  done: boolean;
  notes?: string;
  createdAt: string;
}

export type NoteColor = "jade" | "amber" | "rose" | "sky";

export interface StickyNote {
  id: ID;
  text: string;
  color: NoteColor;
  createdAt: string;
}

export type PaymentMethod = "pix" | "credito" | "debito" | "dinheiro" | "convenio" | "boleto" | "transferencia" | "cheque" | "nao_informado";

export interface Payment {
  id: ID;
  date: string;
  amount: number;
  method: PaymentMethod;
  description?: string;
  installments?: number;
  installmentId?: string;
  receiptAttachmentId?: string;
  /** Recebimento anterior à migração; não abate novos tratamentos. */
  historical?: boolean;
}

export interface Installment {
  id: ID;
  label: string;
  dueDate: string;
  amount: number;
}

export interface PaymentAgreement {
  mode: "avista" | "parcelado" | "depois";
  method: PaymentMethod;
  createdAt: string;
}

export type AttachmentCategory =
  | "radiografia"
  | "panoramica"
  | "intraoral"
  | "extraoral"
  | "tomografia"
  | "documento"
  | "encaminhamento"
  | "relatorio"
  | "consentimento"
  | "outro";

export interface Attachment {
  id: ID;
  name: string;
  category: AttachmentCategory;
  mime: string;
  size: number;
  createdAt: string;
  takenAt?: string;
  note?: string;
  tooth?: string;
  width?: number;
  height?: number;
}

export interface Patient {
  id: ID;
  name: string;
  birthDate?: string;
  gender?: Gender;
  cpf?: string;
  rg?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  profession?: string;
  insurance?: string;
  referredBy?: string;
  emergencyContact?: string;
  photo?: string;
  color: string;
  tags: string[];
  stage: Stage;
  favorite: boolean;
  archived?: boolean;
  /** paciente fictício criado pela demonstração */
  demo?: boolean;
  createdAt: string;
  updatedAt: string;
  planDiscount?: number;
  anamnesis: Anamnesis;
  odontogram: Odontogram;
  treatments: TreatmentItem[];
  evolutions: Evolution[];
  reminders: Reminder[];
  notes: StickyNote[];
  payments: Payment[];
  paymentSchedule?: Installment[];
  paymentAgreement?: PaymentAgreement;
  attachments: Attachment[];
  importedSources?: { id: string; name: string; attachmentId: string; sha256: string; text: string; importedAt: string }[];
  importWarnings?: string[];
  historicalPlans?: { sourceId: string; text: string }[];
  historicalFinance?: { sourceId: string; text: string }[];
}

export type AppointmentStatus = "agendado" | "confirmado" | "atendido" | "faltou" | "cancelado";

export interface Appointment {
  id: ID;
  patientId: ID;
  start: string;
  duration: number;
  procedure: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface ProcedureDef {
  id: ID;
  name: string;
  price: number;
  pricePending?: boolean;
  category: string;
}

export interface TagDef {
  name: string;
  color: string;
}

export interface Settings {
  doctorName: string;
  title: string;
  cro: string;
  specialty: string;
  clinicName: string;
  phone: string;
  email: string;
  address: string;
  documentFooter: string;
  signature?: string;
  recallMonths: number;
  startHour: number;
  endHour: number;
  workSaturday: boolean;
  procedures: ProcedureDef[];
  odontogramMarks: OdontogramMarkDef[];
  tags: TagDef[];
  messages: {
    confirm: string;
    birthday: string;
    recall: string;
  };
  theme: "light" | "dark" | "system";
  pinHash?: string;
  autoLockMinutes: number;
  notificationsEnabled: boolean;
  lastBackupAt?: string;
}

export interface AppData {
  version: number;
  patients: Patient[];
  appointments: Appointment[];
  settings: Settings;
  recent: ID[];
  onboarded: boolean;
}
