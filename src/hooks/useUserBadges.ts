import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export function useUserBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all badges
  const { data: allBadges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("criteria_value");
      
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Fetch user's earned badges
  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery({
    queryKey: ["userBadges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          id,
          badge_id,
          earned_at,
          badge:badges(*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as unknown as UserBadge[];
    },
    enabled: !!user,
  });

  // Check and award badge
  const awardBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_badges")
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        })
        .select()
        .single();

      if (error) {
        // Ignore duplicate error
        if (error.code === "23505") return null;
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBadges"] });
    },
  });

  // Get badges with earned status
  const badgesWithStatus = allBadges?.map((badge) => ({
    ...badge,
    earned: userBadges?.some((ub) => ub.badge_id === badge.id) || false,
    earnedAt: userBadges?.find((ub) => ub.badge_id === badge.id)?.earned_at,
  })) || [];

  return {
    allBadges: allBadges || [],
    userBadges: userBadges || [],
    badgesWithStatus,
    isLoading: isLoadingBadges || isLoadingUserBadges,
    awardBadge: awardBadgeMutation.mutate,
  };
}
