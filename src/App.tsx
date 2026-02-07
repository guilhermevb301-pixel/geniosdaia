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
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Aulas from "./pages/Aulas";
import ModuleLessons from "./pages/ModuleLessons";
import Templates from "./pages/Templates";
import Mentoria from "./pages/Mentoria";
import MinhaMentoria from "./pages/MinhaMentoria";
import Eventos from "./pages/Eventos";
import Prompts from "./pages/Prompts";
import Desafios from "./pages/Desafios";
import Certificados from "./pages/Certificados";
import VerifyCertificate from "./pages/VerifyCertificate";
import MeuCaderno from "./pages/MeuCaderno";
import MeusGpts from "./pages/MeusGpts";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminPrompts from "./pages/admin/AdminPrompts";
import AdminMentees from "./pages/admin/AdminMentees";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminChallenges from "./pages/admin/AdminChallenges";
import AdminGpts from "./pages/admin/AdminGpts";
import AdminBanners from "./pages/admin/AdminBanners";
import MenteeEditor from "./pages/admin/MenteeEditor";
import NotFound from "./pages/NotFound";

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
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/certificado/:code" element={<VerifyCertificate />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aulas"
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
                <ProtectedRoute>
                  <Desafios />
                </ProtectedRoute>
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
                <AdminRoute>
                  <AdminTemplates />
                </AdminRoute>
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
