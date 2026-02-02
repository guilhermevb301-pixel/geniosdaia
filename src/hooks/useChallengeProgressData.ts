import { useMemo } from "react";
import { useUserChallengeProgress } from "@/hooks/useUserChallengeProgress";
import { useObjectives } from "@/hooks/useObjectives";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { TimeUnit } from "@/lib/utils";
import { useEffect } from "react";

export function useChallengeProgressData(selectedObjectives: string[]) {
  const { objectives } = useObjectives();
  const { allLinks, isLoadingAllLinks } = useObjectiveChallengeLinks();
  const { challenges: allChallenges, isLoading: isLoadingChallenges } = useDailyChallengesAdmin();

  // Get objective item IDs from selected keys
  const selectedItemIds = objectives
    .filter((item) => selectedObjectives.includes(item.objective_key))
    .map((item) => item.id);

  // Get user progress for selected objectives
  const {
    progress,
    activeChallenge,
    completedChallenges,
    lockedChallenges,
    isLoading: isLoadingProgress,
    initProgress,
    completeChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
  } = useUserChallengeProgress(selectedItemIds.length > 0 ? selectedItemIds : undefined);

  // Get linked challenges with their order for each objective
  const linkedChallengesMap = useMemo(() => {
    const map: Record<string, Array<{ challengeId: string; orderIndex: number }>> = {};
    
    allLinks.forEach((link) => {
      if (!map[link.objective_item_id]) {
        map[link.objective_item_id] = [];
      }
      map[link.objective_item_id].push({
        challengeId: link.daily_challenge_id,
        orderIndex: (link as unknown as { order_index: number }).order_index || 0,
      });
    });

    // Sort by order_index
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return map;
  }, [allLinks]);

  // Initialize progress when objectives change
  useEffect(() => {
    if (isLoadingAllLinks || isLoadingChallenges || isLoadingProgress) return;

    selectedItemIds.forEach((itemId) => {
      const linkedChallenges = linkedChallengesMap[itemId] || [];
      if (linkedChallenges.length === 0) return;

      // Check if user already has progress for this objective
      const existingProgress = progress.filter((p) => p.objective_item_id === itemId);
      if (existingProgress.length > 0) return;

      // Prepare challenges with order info
      const challengesWithOrder = linkedChallenges
        .map((link) => {
          const challenge = allChallenges.find((c) => c.id === link.challengeId);
          if (!challenge) return null;
          return {
            id: challenge.id,
            estimated_minutes: challenge.estimated_minutes,
            estimated_time_unit: (challenge.estimated_time_unit || "minutes") as TimeUnit,
            order_index: link.orderIndex,
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          estimated_minutes: number | null;
          estimated_time_unit: TimeUnit;
          order_index: number;
        }>;

      if (challengesWithOrder.length > 0) {
        initProgress({ objectiveItemId: itemId, challenges: challengesWithOrder });
      }
    });
  }, [
    selectedItemIds,
    linkedChallengesMap,
    allChallenges,
    progress,
    isLoadingAllLinks,
    isLoadingChallenges,
    isLoadingProgress,
    initProgress,
  ]);

  const isLoading = isLoadingAllLinks || isLoadingChallenges || isLoadingProgress;
  const activeChallengeData = activeChallenge?.daily_challenges as DailyChallenge | undefined;

  return {
    isLoading,
    progress,
    activeChallenge,
    activeChallengeData,
    completedChallenges,
    lockedChallenges,
    completeChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
    selectedItemIds,
  };
}
