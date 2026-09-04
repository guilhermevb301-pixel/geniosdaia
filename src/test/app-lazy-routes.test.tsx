import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import * as appRoutes from "@/lib/appRoutes";

const mocks = vi.hoisted(() => ({
  isAdmin: false,
  isAuthorized: true,
  isMentee: false,
  isMentor: false,
  user: { id: "member-1" } as { id: string } | null,
}));

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => ({ loading: false, user: mocks.user }),
}));
vi.mock("@/hooks/useIsAuthorizedBuyer", () => ({
  useIsAuthorizedBuyer: () => ({ isAuthorized: mocks.isAuthorized, loading: false }),
}));
vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => ({ isAdmin: mocks.isAdmin, loading: false }),
}));
vi.mock("@/hooks/useIsMentor", () => ({
  useIsMentor: () => ({ isMentor: mocks.isMentor, isLoading: false }),
}));
vi.mock("@/hooks/useIsMentee", () => ({
  useIsMentee: () => ({ isMentee: mocks.isMentee, isLoading: false }),
}));
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/toaster", () => ({ Toaster: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/pages/Aulas", () => ({ default: () => <h1>Aulas carregadas</h1> }));
vi.mock("@/pages/Login", () => ({ default: () => <h1>Login carregado</h1> }));
vi.mock("@/pages/Dashboard", () => ({ default: () => <h1>Dashboard carregado</h1> }));
vi.mock("@/pages/Mentoria", () => ({ default: () => <h1>Mentoria carregada</h1> }));

type RouteManifest = readonly {
  id: string;
  path: string;
  guard: "public" | "protected" | "admin" | "mentor" | "mentee";
}[];

const expectedRoutes = {
  accessDenied: "/acesso-negado",
  adminAppearance: "/admin/appearance",
  adminBanners: "/admin/banners",
  adminChallenges: "/admin/challenges",
  adminGpts: "/admin/gpts",
  adminLessons: "/admin/lessons",
  adminMentees: "/admin/mentees",
  adminModules: "/admin/modules",
  adminPrompts: "/admin/prompts",
  adminTemplates: "/admin/templates",
  adminUsers: "/admin/users",
  certificate: "/certificado/:code",
  certificates: "/certificados",
  challenges: "/desafios",
  dashboard: "/",
  events: "/eventos",
  forgotPassword: "/forgot-password",
  lessons: "/aulas",
  login: "/login",
  menteeEditor: "/admin/mentees/:menteeId",
  mentorship: "/mentoria",
  moduleLessons: "/aulas/:moduleId",
  myMentorship: "/minha-mentoria",
  myProducts: "/meus-produtos",
  notebook: "/meu-caderno",
  notFound: "*",
  prompts: "/prompts",
  register: "/register",
  resetPassword: "/reset-password",
  templates: "/templates",
  userGpts: "/meus-gpts",
} as const;

const expectedManifest: RouteManifest = [
  { id: "login", path: "/login", guard: "public" },
  { id: "register", path: "/register", guard: "public" },
  { id: "forgotPassword", path: "/forgot-password", guard: "public" },
  { id: "resetPassword", path: "/reset-password", guard: "public" },
  { id: "certificate", path: "/certificado/:code", guard: "public" },
  { id: "accessDenied", path: "/acesso-negado", guard: "public" },
  { id: "myProducts", path: "/meus-produtos", guard: "protected" },
  { id: "dashboard", path: "/", guard: "protected" },
  { id: "lessons", path: "/aulas", guard: "protected" },
  { id: "moduleLessons", path: "/aulas/:moduleId", guard: "protected" },
  { id: "templates", path: "/templates", guard: "protected" },
  { id: "mentorship", path: "/mentoria", guard: "protected" },
  { id: "events", path: "/eventos", guard: "protected" },
  { id: "prompts", path: "/prompts", guard: "protected" },
  { id: "userGpts", path: "/meus-gpts", guard: "protected" },
  { id: "challenges", path: "/desafios", guard: "admin" },
  { id: "certificates", path: "/certificados", guard: "protected" },
  { id: "notebook", path: "/meu-caderno", guard: "protected" },
  { id: "myMentorship", path: "/minha-mentoria", guard: "mentee" },
  { id: "adminModules", path: "/admin/modules", guard: "admin" },
  { id: "adminLessons", path: "/admin/lessons", guard: "admin" },
  { id: "adminTemplates", path: "/admin/templates", guard: "mentor" },
  { id: "adminPrompts", path: "/admin/prompts", guard: "admin" },
  { id: "adminGpts", path: "/admin/gpts", guard: "admin" },
  { id: "adminMentees", path: "/admin/mentees", guard: "mentor" },
  { id: "menteeEditor", path: "/admin/mentees/:menteeId", guard: "mentor" },
  { id: "adminUsers", path: "/admin/users", guard: "mentor" },
  { id: "adminChallenges", path: "/admin/challenges", guard: "mentor" },
  { id: "adminBanners", path: "/admin/banners", guard: "mentor" },
  { id: "adminAppearance", path: "/admin/appearance", guard: "mentor" },
  { id: "notFound", path: "*", guard: "public" },
];

function renderAppAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

describe("route-level loading", () => {
  beforeEach(() => {
    mocks.isAdmin = false;
    mocks.isAuthorized = true;
    mocks.isMentee = false;
    mocks.isMentor = false;
    mocks.user = { id: "member-1" };
  });

  afterEach(() => {
    cleanup();
  });

  it("centralizes every route path and guard category", () => {
    const routeModule = appRoutes as typeof appRoutes & {
      APP_ROUTE_MANIFEST?: RouteManifest;
    };

    expect(appRoutes.APP_ROUTES).toEqual(expectedRoutes);
    expect(routeModule.APP_ROUTE_MANIFEST).toEqual(expectedManifest);
    expect(routeModule.APP_ROUTE_MANIFEST).toHaveLength(31);
  });

  it("shows an accessible fallback before rendering the lazy Aulas page", async () => {
    renderAppAt(appRoutes.APP_ROUTES.lessons);

    expect(screen.getByRole("status", { name: "Carregando página" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Aulas carregadas" })).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Aulas carregadas" })).toBeInTheDocument();
  });

  it("keeps public routes available without a session", async () => {
    mocks.user = null;
    renderAppAt(appRoutes.APP_ROUTES.login);

    expect(await screen.findByRole("heading", { name: "Login carregado" })).toBeInTheDocument();
  });

  it("keeps the reset-password route public and lazy", async () => {
    mocks.user = null;
    renderAppAt(appRoutes.APP_ROUTES.resetPassword);

    expect(screen.getByRole("status", { name: "Carregando página" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Definir nova senha" })).toBeInTheDocument();
  });

  it("keeps ProtectedRoute active for member routes", async () => {
    mocks.user = null;
    renderAppAt(appRoutes.APP_ROUTES.lessons);

    expect(await screen.findByRole("heading", { name: "Login carregado" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Aulas carregadas" })).not.toBeInTheDocument();
  });

  it("lets an unauthorized signed-in user leave the denied page through a public route", async () => {
    mocks.isAuthorized = false;
    renderAppAt(appRoutes.APP_ROUTES.lessons);

    expect(await screen.findByRole("heading", { name: "Acesso não liberado" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /usar outra conta/i }));

    expect(await screen.findByRole("heading", { name: "Login carregado" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Acesso não liberado" })).not.toBeInTheDocument();
  });

  it("keeps AdminRoute active for admin routes", async () => {
    renderAppAt(appRoutes.APP_ROUTES.adminModules);

    expect(await screen.findByRole("heading", { name: "Dashboard carregado" })).toBeInTheDocument();
  });

  it("keeps MentorRoute active for mentor routes", async () => {
    renderAppAt(appRoutes.APP_ROUTES.adminTemplates);

    expect(await screen.findByRole("heading", { name: "Dashboard carregado" })).toBeInTheDocument();
  });

  it("keeps the protected mentee guard chain active", async () => {
    renderAppAt(appRoutes.APP_ROUTES.myMentorship);

    expect(await screen.findByRole("heading", { name: "Mentoria carregada" })).toBeInTheDocument();
  });
});
