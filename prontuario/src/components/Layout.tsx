import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Command,
  Eye,
  EyeOff,
  HardDriveDownload,
  LayoutDashboard,
  Lock,
  Menu as MenuIcon,
  Moon,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sun,
  Users,
  Wallet,
  BellRing,
  X,
  Cloud,
  CloudOff,
  Loader2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { buildNotifications } from "@/lib/derive";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { exitDemo, flush, signOut } from "@/store/sync";
import { useUI } from "@/store/ui";
import { confirmDialog, toast } from "./ui/feedback";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";
import { Menu } from "./ui/misc";
import { HelpCenter } from "./HelpCenter";
import { ContactAlerts } from "./ContactAlerts";
import { useClock } from "@/lib/useClock";

const NAV = [
  { to: "/", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/lembretes", label: "Lembretes", icon: BellRing },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

function useNotificationCount() {
  const now = useClock();
  const patients = useStore((s) => s.patients);
  const appointments = useStore((s) => s.appointments);
  const settings = useStore((s) => s.settings);
  return useMemo(() => buildNotifications(patients, appointments, settings).length, [patients, appointments, settings, now]);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const settings = useStore((s) => s.settings);
  const email = useStore((s) => s.userEmail);
  const mode = useStore((s) => s.mode);
  const count = useNotificationCount();
  const patientsCount = useStore((s) => s.patients.filter((p) => !p.archived).length);
  return (
    <div className="sidebar-bg relative flex h-full flex-col overflow-hidden text-jade-50">
      <div className="pointer-events-none absolute -right-16 top-24 h-48 w-48 rounded-full bg-jade-400/10 blur-3xl" />
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <Logo size={42} />
        <div className="min-w-0">
          <p className="font-display text-[17px] font-semibold leading-tight text-white">
            {settings.title} {settings.doctorName}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-jade-300/80">Prontuário digital</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-all",
                isActive ? "text-white" : "text-jade-100/70 hover:bg-white/5 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-jade-500/40 to-jade-500/10 ring-1 ring-inset ring-jade-300/25"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <item.icon className={cn("relative h-[18px] w-[18px]", isActive ? "text-jade-200" : "text-jade-300/70")} />
                <span className="relative flex-1">{item.label}</span>
                {item.to === "/pacientes" && (
                  <span className="relative rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-jade-100/80">{patientsCount}</span>
                )}
                {item.to === "/lembretes" && count > 0 && (
                  <span className="relative rounded-md bg-amber-400 px-1.5 py-0.5 text-[11px] font-extrabold text-jade-950">{count}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-jade-300 to-jade-600 font-display text-base font-bold text-jade-950">
            MC
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {settings.title} {settings.doctorName}
            </p>
            <p className="truncate text-xs text-jade-200/70">{mode === "demo" ? "Modo demonstração" : email ?? settings.specialty}</p>
          </div>
          <button
            onClick={() => (mode === "demo" ? exitDemo() : void handleSignOut())}
            title={mode === "demo" ? "Sair da demonstração" : "Sair da conta"}
            className="ml-auto rounded-lg p-2 text-jade-200/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SyncPill() {
  const mode = useStore((s) => s.mode);
  const sync = useStore((s) => s.sync);
  if (mode === "demo")
    return (
      <span className="hidden items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 md:flex">
        Demonstração
      </span>
    );
  const map = {
    idle: { icon: <Cloud className="h-4 w-4" />, label: "Conectado", cls: "text-ink-3" },
    saved: { icon: <Cloud className="h-4 w-4" />, label: "Salvo na nuvem", cls: "text-jade-600 dark:text-jade-300" },
    saving: { icon: <Loader2 className="h-4 w-4 animate-spin" />, label: "Salvando…", cls: "text-ink-3" },
    offline: { icon: <CloudOff className="h-4 w-4" />, label: `Sem internet · ${sync.pending} pendente${sync.pending === 1 ? "" : "s"}`, cls: "text-amber-600" },
    error: { icon: <AlertCircle className="h-4 w-4" />, label: "Erro ao salvar — tentar de novo", cls: "text-rose-600" },
  }[sync.status];
  return (
    <button
      onClick={() => void flush()}
      title={sync.error ?? (sync.lastSavedAt ? `Último envio: ${new Date(sync.lastSavedAt).toLocaleTimeString("pt-BR")}` : "")}
      className={cn("hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:bg-surface md:flex", map.cls)}
    >
      {map.icon}
      <span className="max-lg:hidden">{map.label}</span>
    </button>
  );
}

export async function handleSignOut() {
  const ok = await signOut(false);
  if (!ok) {
    const force = await confirmDialog({
      title: "Há alterações ainda não enviadas",
      description: "Parece que você está sem internet. Se sair agora, as últimas alterações feitas neste computador serão perdidas.",
      confirmLabel: "Sair mesmo assim",
      danger: true,
    });
    if (force) await signOut(true);
  } else toast.success("Você saiu da conta");
}

function TopBar() {
  const navigate = useNavigate();
  const { setPalette, setNotifications, openPatientModal, setMobileNav } = useUI();
  const privacy = useStore((s) => s.privacy);
  const setPrivacy = useStore((s) => s.setPrivacy);
  const theme = useStore((s) => s.settings.theme);
  const updateSettings = useStore((s) => s.updateSettings);
  const hasPin = useStore((s) => Boolean(s.settings.pinHash));
  const setLocked = useStore((s) => s.setLocked);
  const count = useNotificationCount();
  const mode = useStore((s) => s.mode);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 lg:px-8">
        <button className="rounded-xl p-2 text-ink-2 hover:bg-surface lg:hidden" onClick={() => setMobileNav(true)} aria-label="Menu">
          <MenuIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setPalette(true)}
          className="group flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3 text-left text-sm text-ink-3 shadow-sm transition hover:border-jade-300 sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Buscar paciente, telefone, CPF…</span>
          <kbd className="hidden items-center gap-0.5 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3 sm:flex">
            {isMac ? <Command className="h-3 w-3" /> : "Ctrl"} K
          </kbd>
        </button>
        <div className="flex-1 max-sm:hidden" />
        <SyncPill />
        <HelpCenter />
        <button
          onClick={() => setPrivacy(!privacy)}
          title={privacy ? "Mostrar dados dos pacientes" : "Modo discreto: desfoca nomes e telefones"}
          className={cn(
            "rounded-xl p-2.5 transition",
            privacy ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "text-ink-2 hover:bg-surface",
          )}
        >
          {privacy ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        <button
          onClick={() => updateSettings({ theme: theme === "dark" ? "light" : "dark" })}
          className="rounded-xl p-2.5 text-ink-2 transition hover:bg-surface max-sm:hidden"
          title="Alternar tema claro/escuro"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button onClick={() => setNotifications(true)} className="relative rounded-xl p-2.5 text-ink-2 transition hover:bg-surface" title="Notificações">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-rose-500" />
              <span className="relative rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{count}</span>
            </span>
          )}
        </button>
        <Menu
          trigger={() => (
            <Button aria-label="Novo cadastro ou agendamento" size="md" icon={<Plus className="h-4 w-4" />} className="max-sm:h-10 max-sm:w-10 max-sm:px-0">
              <span className="max-sm:hidden">Novo</span>
            </Button>
          )}
          items={[
            { label: "Novo paciente", icon: <Users className="h-4 w-4" />, onClick: () => openPatientModal() },
            { label: "Nova consulta", icon: <CalendarDays className="h-4 w-4" />, onClick: () => useUI.getState().openApptModal() },
            "divider",
            ...(hasPin ? [{ label: "Bloquear tela", icon: <Lock className="h-4 w-4" />, onClick: () => setLocked(true) }] : []),
            { label: "Fazer backup", icon: <HardDriveDownload className="h-4 w-4" />, onClick: () => navigate("/configuracoes?secao=backup") },
            ...(mode === "cloud"
              ? [{ label: "Sair da conta", icon: <LogOut className="h-4 w-4" />, onClick: () => void handleSignOut(), danger: true }]
              : [{ label: "Sair da demonstração", icon: <LogOut className="h-4 w-4" />, onClick: () => exitDemo(), danger: true }]),
          ]}
        />
      </div>
    </header>
  );
}

const MOBILE_NAV = NAV.filter((n) => ["/", "/pacientes", "/agenda", "/lembretes"].includes(n.to));

export function Layout({ children }: { children: ReactNode }) {
  const { mobileNav, setMobileNav } = useUI();
  const location = useLocation();
  const mode = useStore((s) => s.mode);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  return (
    <div className="flex h-full">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] lg:block">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-jade-950/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px]"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
            >
              <SidebarContent onNavigate={() => setMobileNav(false)} />
              <button className="absolute right-3 top-6 rounded-lg p-1.5 text-jade-100 hover:bg-white/10" onClick={() => setMobileNav(false)}>
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[268px]">
        {mode === "demo" && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900 dark:from-amber-900/40 dark:to-amber-900/20 dark:text-amber-200">
            <span>Modo demonstração — pacientes fictícios, nada é salvo.</span>
            <button onClick={() => exitDemo()} className="rounded-full bg-amber-900/10 px-2.5 py-0.5 font-bold hover:bg-amber-900/20">
              Entrar com minha conta →
            </button>
          </div>
        )}
        <TopBar />
        <ContactAlerts />
        <main className="flex-1 pb-24 lg:pb-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", isActive ? "text-brand" : "text-ink-3")
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
