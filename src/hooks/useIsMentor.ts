import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsMentor() {
  const { user } = useAuth();

  const { data: isMentor = false, isLoading } = useQuery({
    queryKey: ["isMentor", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "mentor",
      });

      if (error) {
        console.error("Error checking mentor role:", error);
        return false;
      }

      return data ?? false;
    },
    enabled: !!user?.id,
  });

  return { isMentor, isLoading };
}
