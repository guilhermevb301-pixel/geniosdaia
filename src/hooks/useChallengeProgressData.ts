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

  // Get selected objectives with their active_slots config
  const selectedObjectivesData = objectives.filter((item) =>
    selectedObjectives.includes(item.objective_key)
  );

  // Get user progress for selected objectives
  const {
    progress,
    activeChallenge,
    activeChallenges,
    completedChallenges,
    lockedChallenges,
    isLoading: isLoadingProgress,
    initProgress,
    completeChallenge: rawCompleteChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
  } = useUserChallengeProgress(selectedItemIds.length > 0 ? selectedItemIds : undefined);

  // Get linked challenges with their order and initial active state for each objective
  const linkedChallengesMap = useMemo(() => {
    const map: Record<string, Array<{ challengeId: string; orderIndex: number; isInitialActive: boolean }>> = {};
    
    allLinks.forEach((link) => {
      if (!map[link.objective_item_id]) {
        map[link.objective_item_id] = [];
      }
      map[link.objective_item_id].push({
        challengeId: link.daily_challenge_id,
        orderIndex: link.order_index,
        isInitialActive: link.is_initial_active || false,
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

    selectedObjectivesData.forEach((objective) => {
      const itemId = objective.id;
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
        // Use the objective's active_slots configuration
        initProgress({
          objectiveItemId: itemId,
          challenges: challengesWithOrder,
          activeSlots: objective.active_slots || 1,
        });
      }
    });
  }, [
    selectedObjectivesData,
    linkedChallengesMap,
    allChallenges,
    progress,
    isLoadingAllLinks,
    isLoadingChallenges,
    isLoadingProgress,
    initProgress,
  ]);

  // Wrapper for completeChallenge that includes activeSlots
  const completeChallenge = (progressId: string) => {
    // Find the progress record to get its objective_item_id
    const progressRecord = progress.find((p) => p.id === progressId);
    if (!progressRecord) return;

    // Find the objective to get its active_slots
    const objective = selectedObjectivesData.find(
      (o) => o.id === progressRecord.objective_item_id
    );
    const activeSlots = objective?.active_slots || 1;

    rawCompleteChallenge({ progressId, activeSlots });
  };

  const isLoading = isLoadingAllLinks || isLoadingChallenges || isLoadingProgress;
  
  // Get active challenges data (for multiple active challenges support)
  const activeChallengesData = activeChallenges
    .map((p) => p.daily_challenges as DailyChallenge | undefined)
    .filter(Boolean) as DailyChallenge[];
  
  const activeChallengeData = activeChallengesData[0]; // Keep for backward compatibility

  return {
    isLoading,
    progress,
    activeChallenge,
    activeChallenges, // All active progress records
    activeChallengeData, // First active challenge data (backward compat)
    activeChallengesData, // All active challenges data
    completedChallenges,
    lockedChallenges,
    completeChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
    selectedItemIds,
    selectedObjectivesData,
  };
}
