import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAuthorizedBuyer } from "@/hooks/useIsAuthorizedBuyer";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsMentor } from "@/hooks/useIsMentor";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { isAuthorized, loading: buyerLoading } = useIsAuthorizedBuyer();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isMentor, isLoading: mentorLoading } = useIsMentor();

  if (loading || buyerLoading || adminLoading || mentorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins and mentors bypass buyer check
  if (!isAdmin && !isMentor && !isAuthorized) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
