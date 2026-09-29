export type ID = string;

export type Stage = "avaliacao" | "orcamento" | "tratamento" | "manutencao" | "concluido";

export type Gender = "F" | "M" | "O";

export type ToothFace = "M" | "D" | "O" | "V" | "L";

export type FaceCondition = "carie" | "restauracao" | "provisoria" | "selante" | "fratura";

export type ToothCondition = "ausente" | "extracao" | "implante" | "coroa" | "canal" | "protese";

export interface ToothState {
  faces?: Partial<Record<ToothFace, FaceCondition>>;
  whole?: ToothCondition[];
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
  id: ID;
  date: string;
  title: string;
  description: string;
  teeth?: string;
  author: string;
  createdAt: string;
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

export type PaymentMethod = "pix" | "credito" | "debito" | "dinheiro" | "convenio" | "boleto";

export interface Payment {
  id: ID;
  date: string;
  amount: number;
  method: PaymentMethod;
  description?: string;
  installments?: number;
}

export type AttachmentCategory =
  | "radiografia"
  | "panoramica"
  | "intraoral"
  | "extraoral"
  | "tomografia"
  | "documento"
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
  attachments: Attachment[];
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
  signature?: string;
  recallMonths: number;
  startHour: number;
  endHour: number;
  workSaturday: boolean;
  procedures: ProcedureDef[];
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
