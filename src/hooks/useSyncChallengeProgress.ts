import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateDeadline, UserChallengeProgress } from "./useUserChallengeProgress";
import { TimeUnit } from "@/lib/utils";

interface ChallengeLink {
  challengeId: string;
  orderIndex: number;
  isInitialActive: boolean;
  predecessorChallengeId: string | null;
}

interface ChallengeInfo {
  id: string;
  estimated_minutes: number | null;
  estimated_time_unit: TimeUnit;
}

export function useSyncChallengeProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async ({
      objectiveItemId,
      linkedChallenges,
      allChallenges,
      existingProgress,
      activeSlots = 1,
    }: {
      objectiveItemId: string;
      linkedChallenges: ChallengeLink[];
      allChallenges: ChallengeInfo[];
      existingProgress: UserChallengeProgress[];
      activeSlots?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (linkedChallenges.length === 0) return { deleted: 0, created: 0 };

      const linkedChallengeIds = linkedChallenges.map((l) => l.challengeId);

      // 1. Find orphan progress (challenges that no longer exist in links)
      const orphanProgress = existingProgress.filter(
        (p) =>
          p.objective_item_id === objectiveItemId &&
          !linkedChallengeIds.includes(p.daily_challenge_id)
      );

      // Delete orphans
      if (orphanProgress.length > 0) {
        const orphanIds = orphanProgress.map((p) => p.id);
        const { error: deleteError } = await supabase
          .from("user_challenge_progress")
          .delete()
          .in("id", orphanIds);

        if (deleteError) throw deleteError;
      }

      // 2. Find missing challenges (links without progress records)
      const existingChallengeIds = existingProgress
        .filter((p) => p.objective_item_id === objectiveItemId)
        .map((p) => p.daily_challenge_id);

      const missingChallenges = linkedChallenges.filter(
        (l) => !existingChallengeIds.includes(l.challengeId)
      );

      // Create missing progress records
      if (missingChallenges.length > 0) {
        const now = new Date().toISOString();
        const hasExplicitInitialActive = linkedChallenges.some((ch) => ch.isInitialActive);

        // Get currently active count
        const currentActiveCount = existingProgress.filter(
          (p) => p.objective_item_id === objectiveItemId && p.status === "active"
        ).length;

        const records = missingChallenges.map((link) => {
          const challenge = allChallenges.find((c) => c.id === link.challengeId);

          // Determine if should be active:
          // Only auto-activate if no active challenges exist and it's marked as initial
          let shouldBeActive = false;
          if (hasExplicitInitialActive && currentActiveCount === 0) {
            shouldBeActive = link.isInitialActive;
          }

          return {
            user_id: user.id,
            daily_challenge_id: link.challengeId,
            objective_item_id: objectiveItemId,
            status: shouldBeActive ? "active" : "locked",
            started_at: shouldBeActive ? now : null,
            deadline: shouldBeActive
              ? calculateDeadline(
                  challenge?.estimated_minutes || 30,
                  challenge?.estimated_time_unit || "minutes"
                )
              : null,
          };
        });

        const { error: insertError } = await supabase
          .from("user_challenge_progress")
          .insert(records);

        if (insertError) throw insertError;
      }

      return { deleted: orphanProgress.length, created: missingChallenges.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
    },
  });

  return {
    syncProgress: syncMutation.mutate,
    syncProgressAsync: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
  };
}
