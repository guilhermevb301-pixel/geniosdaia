import { create } from "zustand";
import type { Appointment, ID } from "@/lib/types";

export interface ApptDraft {
  id?: ID;
  patientId?: ID;
  start?: string;
  duration?: number;
  procedure?: string;
  status?: Appointment["status"];
  notes?: string;
}

interface UIState {
  patientModal: { open: boolean; id?: ID };
  apptModal: { open: boolean; draft?: ApptDraft };
  palette: boolean;
  notifications: boolean;
  mobileNav: boolean;
  openPatientModal: (id?: ID) => void;
  closePatientModal: () => void;
  openApptModal: (draft?: ApptDraft) => void;
  closeApptModal: () => void;
  setPalette: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  setMobileNav: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  patientModal: { open: false },
  apptModal: { open: false },
  palette: false,
  notifications: false,
  mobileNav: false,
  openPatientModal: (id) => set({ patientModal: { open: true, id } }),
  closePatientModal: () => set({ patientModal: { open: false } }),
  openApptModal: (draft) => set({ apptModal: { open: true, draft } }),
  closeApptModal: () => set({ apptModal: { open: false } }),
  setPalette: (palette) => set({ palette }),
  setNotifications: (notifications) => set({ notifications }),
  setMobileNav: (mobileNav) => set({ mobileNav }),
}));
