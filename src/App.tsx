import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { MentorRoute } from "@/components/admin/MentorRoute";
import { MenteeRoute } from "@/components/mentoria/MenteeRoute";
import { APP_ROUTES } from "@/lib/appRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Aulas = lazy(() => import("./pages/Aulas"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
const AcessoNegado = lazy(() => import("./pages/AcessoNegado"));

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
            {/* Public routes */}
            <Route path={APP_ROUTES.login} element={<Login />} />
            <Route path={APP_ROUTES.register} element={<Register />} />
            <Route path={APP_ROUTES.forgotPassword} element={<ForgotPassword />} />
            <Route path="/certificado/:code" element={<VerifyCertificate />} />
            <Route path={APP_ROUTES.accessDenied} element={<AcessoNegado />} />
            
            {/* Protected routes */}
            <Route
              path={APP_ROUTES.myProducts}
              element={
                <ProtectedRoute>
                  <MeusProdutos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={APP_ROUTES.lessons}
              element={
                <ProtectedRoute>
                  <Aulas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aulas/:moduleId"
              element={
                <ProtectedRoute>
                  <ModuleLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentoria"
              element={
                <ProtectedRoute>
                  <Mentoria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos"
              element={
                <ProtectedRoute>
                  <Eventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prompts"
              element={
                <ProtectedRoute>
                  <Prompts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meus-gpts"
              element={
                <ProtectedRoute>
                  <MeusGpts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/desafios"
              element={
                <AdminRoute>
                  <Desafios />
                </AdminRoute>
              }
            />
            <Route
              path="/certificados"
              element={
                <ProtectedRoute>
                  <Certificados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meu-caderno"
              element={
                <ProtectedRoute>
                  <MeuCaderno />
                </ProtectedRoute>
              }
            />

            {/* Mentee route */}
            <Route
              path="/minha-mentoria"
              element={
                <ProtectedRoute>
                  <MenteeRoute>
                    <MinhaMentoria />
                  </MenteeRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/modules"
              element={
                <AdminRoute>
                  <AdminModules />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/lessons"
              element={
                <AdminRoute>
                  <AdminLessons />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <MentorRoute>
                  <AdminTemplates />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/prompts"
              element={
                <AdminRoute>
                  <AdminPrompts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/gpts"
              element={
                <AdminRoute>
                  <AdminGpts />
                </AdminRoute>
              }
            />

            {/* Mentor routes */}
            <Route
              path="/admin/mentees"
              element={
                <MentorRoute>
                  <AdminMentees />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/mentees/:menteeId"
              element={
                <MentorRoute>
                  <MenteeEditor />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <MentorRoute>
                  <AdminUsers />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/challenges"
              element={
                <MentorRoute>
                  <AdminChallenges />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/banners"
              element={
                <MentorRoute>
                  <AdminBanners />
                </MentorRoute>
              }
            />
            <Route
              path="/admin/appearance"
              element={
                <MentorRoute>
                  <AdminAppearance />
                </MentorRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
