import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { XP_REWARDS, getLevelInfo, LEVELS } from "@/lib/gamification";

export function useUserXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user XP data
  const { data: userXP, isLoading } = useQuery({
    queryKey: ["userXP", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_xp")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Add XP mutation
  const addXPMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      actionType, 
      referenceId 
    }: { 
      amount: number; 
      actionType: string; 
      referenceId?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Insert XP transaction
      const { error: txError } = await supabase
        .from("xp_transactions")
        .insert({
          user_id: user.id,
          amount,
          action_type: actionType,
          reference_id: referenceId,
        });
      
      if (txError) throw txError;

      // Get current XP
      const { data: currentXP } = await supabase
        .from("user_xp")
        .select("total_xp, current_level")
        .eq("user_id", user.id)
        .single();

      const newTotalXP = (currentXP?.total_xp || 0) + amount;
      const newLevelInfo = getLevelInfo(newTotalXP);

      // Update user XP
      const { data, error } = await supabase
        .from("user_xp")
        .update({
          total_xp: newTotalXP,
          current_level: newLevelInfo.level,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userXP"] });
      queryClient.invalidateQueries({ queryKey: ["userBadges"] });
    },
  });

  const levelInfo = userXP ? getLevelInfo(userXP.total_xp) : getLevelInfo(0);

  return {
    userXP,
    isLoading,
    levelInfo,
    addXP: addXPMutation.mutate,
    isAddingXP: addXPMutation.isPending,
  };
}
