import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { XP_REWARDS } from "@/lib/gamification";

export function useUserStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ["userStreak", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_xp")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Log daily activity and update streak
  const logActivityMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const today = new Date().toISOString().split("T")[0];

      // Check if already logged today
      const { data: existingLog } = await supabase
        .from("user_streaks")
        .select("id")
        .eq("user_id", user.id)
        .eq("activity_date", today)
        .maybeSingle();

      if (existingLog) {
        return { alreadyLogged: true };
      }

      // Log today's activity
      const { error: logError } = await supabase
        .from("user_streaks")
        .insert({
          user_id: user.id,
          activity_date: today,
        });

      if (logError) throw logError;

      // Get current user XP data
      const { data: currentData } = await supabase
        .from("user_xp")
        .select("current_streak, longest_streak, last_activity_date, total_xp, current_level")
        .eq("user_id", user.id)
        .single();

      if (!currentData) {
        // Create initial record
        const { error: insertError } = await supabase
          .from("user_xp")
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
          });
        
        if (insertError) throw insertError;
        return { newStreak: 1 };
      }

      // Calculate new streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (currentData.last_activity_date === yesterdayStr) {
        newStreak = currentData.current_streak + 1;
      }

      const newLongestStreak = Math.max(newStreak, currentData.longest_streak);

      // Update user XP with streak info
      const { error: updateError } = await supabase
        .from("user_xp")
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Add streak bonus XP if streak continues
      if (newStreak > 1) {
        await supabase.from("xp_transactions").insert({
          user_id: user.id,
          amount: XP_REWARDS.STREAK_BONUS,
          action_type: "streak_bonus",
        });

        await supabase
          .from("user_xp")
          .update({
            total_xp: currentData.total_xp + XP_REWARDS.STREAK_BONUS,
          })
          .eq("user_id", user.id);
      }

      return { newStreak };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
      queryClient.invalidateQueries({ queryKey: ["userXP"] });
    },
  });

  return {
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    lastActivityDate: streakData?.last_activity_date,
    isLoading,
    logActivity: logActivityMutation.mutate,
    isLogging: logActivityMutation.isPending,
  };
}
