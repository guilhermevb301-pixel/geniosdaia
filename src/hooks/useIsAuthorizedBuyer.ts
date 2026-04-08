import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAuthorizedBuyer() {
  const { user } = useAuth();

  const { data: isAuthorized = false, isLoading: loading } = useQuery({
    queryKey: ["isAuthorizedBuyer", user?.email],
    queryFn: async () => {
      if (!user?.email) return false;

      const { data, error } = await supabase
        .from("compradores_autorizados")
        .select("id")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Error checking buyer status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.email,
  });

  return { isAuthorized, loading };
}
