import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsMentee() {
  const { user } = useAuth();

  const { data: isMentee = false, isLoading } = useQuery({
    queryKey: ["isMentee", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc("is_mentee", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking mentee status:", error);
        return false;
      }

      return data ?? false;
    },
    enabled: !!user?.id,
  });

  return { isMentee, isLoading };
}
