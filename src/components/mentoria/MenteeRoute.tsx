import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMentee } from "@/hooks/useIsMentee";

interface MenteeRouteProps {
  children: React.ReactNode;
}

export function MenteeRoute({ children }: MenteeRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isMentee, isLoading: menteeLoading } = useIsMentee();

  if (authLoading || menteeLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isMentee) {
    return <Navigate to="/mentoria" replace />;
  }

  return <>{children}</>;
}
