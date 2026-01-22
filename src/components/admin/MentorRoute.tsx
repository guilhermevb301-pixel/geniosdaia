import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsMentor } from "@/hooks/useIsMentor";

interface MentorRouteProps {
  children: React.ReactNode;
}

export function MentorRoute({ children }: MentorRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isMentor, isLoading: mentorLoading } = useIsMentor();

  if (authLoading || adminLoading || mentorLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && !isMentor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
