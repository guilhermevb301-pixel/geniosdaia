import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { MentorRoute } from "@/components/admin/MentorRoute";
import { MenteeRoute } from "@/components/mentoria/MenteeRoute";
import {
  APP_ROUTE_MANIFEST,
  type AppRouteGuard,
  type AppRouteId,
} from "@/lib/appRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Aulas = lazy(() => import("./pages/Aulas"));
const SectionModules = lazy(() => import("./pages/SectionModules"));
const ModuleLessons = lazy(() => import("./pages/ModuleLessons"));
const Templates = lazy(() => import("./pages/Templates"));
const Mentoria = lazy(() => import("./pages/Mentoria"));
const MinhaMentoria = lazy(() => import("./pages/MinhaMentoria"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Prompts = lazy(() => import("./pages/Prompts"));
const Desafios = lazy(() => import("./pages/Desafios"));
const Certificados = lazy(() => import("./pages/Certificados"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const MeuCaderno = lazy(() => import("./pages/MeuCaderno"));
const MeusGpts = lazy(() => import("./pages/MeusGpts"));
const MeusProdutos = lazy(() => import("./pages/MeusProdutos"));
const AdminModules = lazy(() => import("./pages/admin/AdminModules"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));
const AdminPrompts = lazy(() => import("./pages/admin/AdminPrompts"));
const AdminMentees = lazy(() => import("./pages/admin/AdminMentees"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminChallenges = lazy(() => import("./pages/admin/AdminChallenges"));
const AdminGpts = lazy(() => import("./pages/admin/AdminGpts"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminAppearance = lazy(() => import("./pages/admin/AdminAppearance"));
const MenteeEditor = lazy(() => import("./pages/admin/MenteeEditor"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AcessoNegado = lazy(() => import("./pages/AcessoNegado"));

const ROUTE_COMPONENTS = {
  dashboard: Dashboard,
  login: Login,
  register: Register,
  lessons: Aulas,
  sectionModules: SectionModules,
  moduleLessons: ModuleLessons,
  templates: Templates,
  mentorship: Mentoria,
  myMentorship: MinhaMentoria,
  events: Eventos,
  prompts: Prompts,
  challenges: Desafios,
  certificates: Certificados,
  certificate: VerifyCertificate,
  notebook: MeuCaderno,
  userGpts: MeusGpts,
  myProducts: MeusProdutos,
  adminModules: AdminModules,
  adminLessons: AdminLessons,
  adminTemplates: AdminTemplates,
  adminPrompts: AdminPrompts,
  adminMentees: AdminMentees,
  adminUsers: AdminUsers,
  adminChallenges: AdminChallenges,
  adminGpts: AdminGpts,
  adminBanners: AdminBanners,
  adminAppearance: AdminAppearance,
  menteeEditor: MenteeEditor,
  forgotPassword: ForgotPassword,
  resetPassword: ResetPassword,
  notFound: NotFound,
  accessDenied: AcessoNegado,
} satisfies Record<AppRouteId, ComponentType>;

function withRouteGuard(element: ReactNode, guard: AppRouteGuard) {
  switch (guard) {
    case "protected":
      return <ProtectedRoute>{element}</ProtectedRoute>;
    case "admin":
      return <AdminRoute>{element}</AdminRoute>;
    case "mentor":
      return <MentorRoute>{element}</MentorRoute>;
    case "mentee":
      return (
        <ProtectedRoute>
          <MenteeRoute>{element}</MenteeRoute>
        </ProtectedRoute>
      );
    default:
      return element;
  }
}

function RouteLoadingFallback() {
  return (
    <main
      role="status"
      aria-label="Carregando página"
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground"
      />
    </main>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry once on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                {APP_ROUTE_MANIFEST.map(({ id, path, guard }) => {
                  const Page = ROUTE_COMPONENTS[id];

                  return (
                    <Route
                      key={id}
                      path={path}
                      element={withRouteGuard(<Page />, guard)}
                    />
                  );
                })}
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
