import { create } from "zustand";
import { DEFAULT_SETTINGS, AVATAR_COLORS } from "@/lib/constants";
import type { AppData, Appointment, ID, Patient, Settings } from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";
import { automaticPatientStage, normalizePatientStage } from "@/lib/derive";

export const DATA_VERSION = 1;

export function emptyPatient(partial: Partial<Patient> = {}): Patient {
  const now = nowISO();
  const patient: Patient = {
    id: uid("pac_"),
    name: "",
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    tags: [],
    stage: "avaliacao",
    favorite: false,
    createdAt: now,
    updatedAt: now,
    anamnesis: { conditions: {}, habits: {} },
    odontogram: { dentition: "permanente", teeth: {} },
    treatments: [],
    evolutions: [],
    reminders: [],
    notes: [],
    payments: [],
    attachments: [],
    ...partial,
  };
  return { ...patient, stage: partial.stage ? normalizePatientStage(partial.stage) : automaticPatientStage(patient) };
}

export function withDefaults(settings?: Partial<Settings> | null): Settings {
  const legacySpecialties = ["Cirurgião-Dentista", "Cirurgia e Traumatologia Bucomaxilofacial"];
  return {
    ...DEFAULT_SETTINGS,
    ...(settings ?? {}),
    doctorName: !settings?.doctorName || settings.doctorName === "Mizael Cardoso" ? DEFAULT_SETTINGS.doctorName : settings.doctorName,
    cro: settings?.cro?.trim() || DEFAULT_SETTINGS.cro,
    specialty: !settings?.specialty || legacySpecialties.includes(settings.specialty) ? DEFAULT_SETTINGS.specialty : settings.specialty,
    phone: settings?.phone?.trim() || DEFAULT_SETTINGS.phone,
    address: settings?.address?.trim() || DEFAULT_SETTINGS.address,
    documentFooter: settings?.documentFooter?.trim() || DEFAULT_SETTINGS.documentFooter,
    messages: { ...DEFAULT_SETTINGS.messages, ...(settings?.messages ?? {}) },
  };
}

/** Estado clínico de uma conta recém-criada. Nunca inclui dados da demonstração. */
export function freshAccountData(): Omit<AppData, "version"> {
  return {
    settings: withDefaults(),
    patients: [],
    appointments: [],
    recent: [],
    onboarded: false,
  };
}

export function migrate(data: Partial<AppData>): Omit<AppData, "version"> {
  return {
    settings: withDefaults(data.settings),
    patients: (data.patients ?? []).map((p) => emptyPatient(p)),
    appointments: data.appointments ?? [],
    recent: data.recent ?? [],
    onboarded: data.onboarded ?? false,
  };
}

export type Mode = "boot" | "auth" | "setup" | "error" | "demo" | "cloud";
export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error";

export interface State {
  mode: Mode;
  bootError?: string;
  userId?: string;
  userEmail?: string;
  recovery: boolean;
  sync: { status: SyncStatus; pending: number; lastSavedAt?: string; error?: string };

  ready: boolean;
  onboarded: boolean;
  patients: Patient[];
  appointments: Appointment[];
  settings: Settings;
  recent: ID[];
  privacy: boolean;
  locked: boolean;

  startWith: (demo: boolean) => Promise<void>;
  addPatient: (p: Partial<Patient>) => Patient;
  updatePatient: (id: ID, patch: Partial<Patient> | ((p: Patient) => Partial<Patient>)) => void;
  deletePatient: (id: ID) => void;
  toggleFavorite: (id: ID) => void;
  markRecent: (id: ID) => void;
  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: ID, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: ID) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceAll: (data: Partial<AppData>) => void;
  setPrivacy: (v: boolean) => void;
  setLocked: (v: boolean) => void;
}

/** Estado transitório ao autenticar uma identidade antes de carregar cache/nuvem. */
export function freshCloudSession(userId: string, userEmail?: string): Partial<State> {
  return {
    ...freshAccountData(),
    mode: "cloud",
    ready: false,
    userId,
    userEmail,
    locked: false,
    sync: { status: "idle", pending: 0 },
  };
}

export const useStore = create<State>((set, get) => ({
  mode: "boot",
  recovery: false,
  sync: { status: "idle", pending: 0 },
  ready: false,
  onboarded: false,
  patients: [],
  appointments: [],
  settings: DEFAULT_SETTINGS,
  recent: [],
  privacy: false,
  locked: false,

  startWith: async (demo) => {
    if (demo) {
      const { buildDemoData } = await import("@/lib/seed");
      const d = await buildDemoData();
      set((s) => ({
        patients: [...d.patients.map((patient) => emptyPatient(patient)), ...s.patients],
        appointments: [...d.appointments, ...s.appointments],
        settings: { ...s.settings },
        onboarded: true,
      }));
    } else {
      set((s) => ({ onboarded: true, settings: { ...s.settings } }));
      const [{ flush }, { flushCache }] = await Promise.all([import("./sync"), import("@/lib/storage")]);
      await flushCache();
      await flush();
    }
  },

  addPatient: (p) => {
    const patient = emptyPatient(p);
    set((s) => ({ patients: [patient, ...s.patients] }));
    return patient;
  },

  updatePatient: (id, patch) =>
    set((s) => ({
      patients: s.patients.map((p) => {
        if (p.id !== id) return p;
        const changes = typeof patch === "function" ? patch(p) : patch;
        const next = { ...p, ...changes, updatedAt: nowISO() };
        return { ...next, stage: changes.stage ? normalizePatientStage(changes.stage) : (changes.treatments || changes.reminders) ? automaticPatientStage(next) : normalizePatientStage(next.stage) };
      }),
    })),

  deletePatient: (id) =>
    set((s) => ({
      patients: s.patients.filter((p) => p.id !== id),
      appointments: s.appointments.filter((a) => a.patientId !== id),
      recent: s.recent.filter((r) => r !== id),
    })),

  toggleFavorite: (id) => get().updatePatient(id, (p) => ({ favorite: !p.favorite })),

  markRecent: (id) => set((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 8) })),

  addAppointment: (a) => {
    const appt = { ...a, id: uid("ag_") };
    set((s) => ({ appointments: [...s.appointments, appt] }));
    return appt;
  },

  updateAppointment: (id, patch) =>
    set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

  deleteAppointment: (id) => set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  replaceAll: (data) => set({ ...migrate(data), onboarded: true }),

  setPrivacy: (privacy) => set({ privacy }),
  setLocked: (locked) => set({ locked }),
}));

export const usePatient = (id?: ID) => useStore((s) => s.patients.find((p) => p.id === id));
