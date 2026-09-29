import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppointmentModal } from "./components/AppointmentModal";
import { ErrorScreen, LoadingScreen, LoginScreen, RecoveryModal, SetupScreen } from "./components/AuthScreens";
import { CommandPalette } from "./components/CommandPalette";
import { Layout } from "./components/Layout";
import { LockScreen } from "./components/LockScreen";
import { NotificationPanel } from "./components/NotificationPanel";
import { PatientFormModal } from "./components/PatientFormModal";
import { ConfirmHost, Toaster } from "./components/ui/feedback";
import { Welcome } from "./components/Welcome";
import { useReminderAlerts } from "./lib/useReminderAlerts";
import { Agenda } from "./pages/Agenda";
import { Dashboard } from "./pages/Dashboard";
import { Finance } from "./pages/Finance";
import { PatientRecord } from "./pages/PatientRecord";
import { Patients } from "./pages/Patients";
import { Reminders } from "./pages/Reminders";
import { SettingsPage } from "./pages/SettingsPage";
import { useStore } from "./store/store";
import { boot } from "./store/sync";

function useTheme() {
  const theme = useStore((s) => s.settings.theme);
  const privacy = useStore((s) => s.privacy);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => root.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    document.body.classList.toggle("privacy", privacy);
  }, [privacy]);
}

function MainApp() {
  useReminderAlerts();
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Patients />} />
          <Route path="/pacientes/:id" element={<PatientRecord />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/lembretes" element={<Reminders />} />
          <Route path="/financeiro" element={<Finance />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <CommandPalette />
      <NotificationPanel />
      <PatientFormModal />
      <AppointmentModal />
      <Welcome />
      <LockScreen />
    </>
  );
}

export default function App() {
  const mode = useStore((s) => s.mode);
  const ready = useStore((s) => s.ready);
  useTheme();
  useEffect(() => {
    void boot();
  }, []);

  let content;
  if (mode === "boot") content = <LoadingScreen />;
  else if (mode === "auth") content = <LoginScreen />;
  else if (mode === "setup") content = <SetupScreen />;
  else if (mode === "error") content = <ErrorScreen />;
  else if (!ready) content = <LoadingScreen label="Sincronizando seus pacientes…" />;
  else content = <MainApp />;

  return (
    <HashRouter>
      {content}
      <RecoveryModal />
      <ConfirmHost />
      <Toaster />
    </HashRouter>
  );
}
