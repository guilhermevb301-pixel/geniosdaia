import { useMemo, useEffect, useRef } from "react";
import { useUserChallengeProgress, calculateDeadline } from "@/hooks/useUserChallengeProgress";
import { useObjectives } from "@/hooks/useObjectives";
import { useObjectiveChallengeLinks } from "@/hooks/useObjectiveChallengeLinks";
import { useDailyChallengesAdmin } from "@/hooks/useDailyChallengesAdmin";
import { useSyncChallengeProgress } from "@/hooks/useSyncChallengeProgress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { TimeUnit } from "@/lib/utils";
import { sortProgressByChallengOrder } from "@/lib/buildChallengeOrder";
import { useQueryClient } from "@tanstack/react-query";

export function useChallengeProgressData(selectedObjectives: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
    clearProgress: clearProgressMutation,
  } = useUserChallengeProgress(selectedItemIds.length > 0 ? selectedItemIds : undefined);

  // Sync hook
  const { syncProgressAsync, isSyncing } = useSyncChallengeProgress();

  // Track which objectives have been synced to avoid repeated syncs
  const syncedObjectivesRef = useRef<Set<string>>(new Set());

  // Get linked challenges with their order, initial active state, and predecessor for each objective
  const linkedChallengesMap = useMemo(() => {
    const map: Record<string, Array<{ 
      challengeId: string; 
      orderIndex: number; 
      isInitialActive: boolean;
      predecessorChallengeId: string | null;
    }>> = {};
    
    allLinks.forEach((link) => {
      if (!map[link.objective_item_id]) {
        map[link.objective_item_id] = [];
      }
      map[link.objective_item_id].push({
        challengeId: link.daily_challenge_id,
        orderIndex: link.order_index,
        isInitialActive: link.is_initial_active || false,
        predecessorChallengeId: link.predecessor_challenge_id || null,
      });
    });

    // Sort by order_index
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return map;
  }, [allLinks]);

  // Sync existing progress with current links (remove orphans, add missing)
  useEffect(() => {
    if (isLoadingAllLinks || isLoadingChallenges || isLoadingProgress || isSyncing) return;

    selectedObjectivesData.forEach(async (objective) => {
      const itemId = objective.id;
      const linkedChallenges = linkedChallengesMap[itemId] || [];
      
      // Skip if no linked challenges
      if (linkedChallenges.length === 0) return;

      // Get existing progress for this objective
      const existingProgress = progress.filter((p) => p.objective_item_id === itemId);
      
      // Check if sync is needed: orphans or missing challenges
      const linkedChallengeIds = linkedChallenges.map((l) => l.challengeId);
      const hasOrphans = existingProgress.some(
        (p) => !linkedChallengeIds.includes(p.daily_challenge_id)
      );
      const existingChallengeIds = existingProgress.map((p) => p.daily_challenge_id);
      const hasMissing = linkedChallenges.some(
        (l) => !existingChallengeIds.includes(l.challengeId)
      );

      // If user has no progress at all, use initProgress (first time)
      if (existingProgress.length === 0) {
        const challengesWithOrder = linkedChallenges
          .map((link) => {
            const challenge = allChallenges.find((c) => c.id === link.challengeId);
            if (!challenge) return null;
            return {
              id: challenge.id,
              estimated_minutes: challenge.estimated_minutes,
              estimated_time_unit: (challenge.estimated_time_unit || "minutes") as TimeUnit,
              order_index: link.orderIndex,
              is_initial_active: link.isInitialActive,
              predecessor_challenge_id: link.predecessorChallengeId,
            };
          })
          .filter(Boolean) as Array<{
            id: string;
            estimated_minutes: number | null;
            estimated_time_unit: TimeUnit;
            order_index: number;
            is_initial_active: boolean;
            predecessor_challenge_id: string | null;
          }>;

        if (challengesWithOrder.length > 0) {
          initProgress({
            objectiveItemId: itemId,
            challenges: challengesWithOrder,
            activeSlots: objective.active_slots || 1,
          });
        }
        return;
      }

      // If there are orphans or missing challenges, sync
      if ((hasOrphans || hasMissing) && !syncedObjectivesRef.current.has(itemId)) {
        syncedObjectivesRef.current.add(itemId);

        const allChallengesInfo = allChallenges.map((c) => ({
          id: c.id,
          estimated_minutes: c.estimated_minutes,
          estimated_time_unit: (c.estimated_time_unit || "minutes") as TimeUnit,
        }));

        await syncProgressAsync({
          objectiveItemId: itemId,
          linkedChallenges,
          allChallenges: allChallengesInfo,
          existingProgress,
          activeSlots: objective.active_slots || 1,
        });
        return; // After sync, data will refresh and recovery will run on next render
      }

      // RECOVERY: If progress exists but NONE are active or completed, activate first challenge(s)
      const hasActiveOrCompleted = existingProgress.some(
        (p) => p.status === "active" || p.status === "completed"
      );

      if (!hasActiveOrCompleted && existingProgress.length > 0) {
        const recoveryKey = `recovery-${itemId}`;
        if (syncedObjectivesRef.current.has(recoveryKey)) return;
        syncedObjectivesRef.current.add(recoveryKey);

        const activeSlots = objective.active_slots || 1;
        const now = new Date().toISOString();

        // Determine which challenges to activate
        const initialLinks = linkedChallenges.filter((l) => l.isInitialActive);
        const toActivate =
          initialLinks.length > 0
            ? initialLinks.slice(0, activeSlots)
            : linkedChallenges.slice(0, activeSlots); // fallback: first N by order

        for (const link of toActivate) {
          const progressRecord = existingProgress.find(
            (p) => p.daily_challenge_id === link.challengeId
          );
          if (!progressRecord) continue;

          const challenge = allChallenges.find((c) => c.id === link.challengeId);

          await supabase
            .from("user_challenge_progress")
            .update({
              status: "active",
              started_at: now,
              deadline: calculateDeadline(
                challenge?.estimated_minutes || 30,
                (challenge?.estimated_time_unit as TimeUnit) || "minutes"
              ),
            })
            .eq("id", progressRecord.id);
        }

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
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
    isSyncing,
    initProgress,
    syncProgressAsync,
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

  // Build links for sorting - combine all objectives' links
  const allLinksForSorting = useMemo(() => {
    const links: Array<{
      challengeId: string;
      orderIndex: number;
      isInitialActive: boolean;
      predecessorChallengeId: string | null;
    }> = [];

    selectedItemIds.forEach((itemId) => {
      const objLinks = linkedChallengesMap[itemId] || [];
      links.push(...objLinks);
    });

    return links;
  }, [selectedItemIds, linkedChallengesMap]);

  // Sort all progress arrays by predecessor chain order
  const sortedActiveChallenges = useMemo(
    () => sortProgressByChallengOrder(activeChallenges, allLinksForSorting),
    [activeChallenges, allLinksForSorting]
  );

  const sortedCompletedChallenges = useMemo(
    () => sortProgressByChallengOrder(completedChallenges, allLinksForSorting),
    [completedChallenges, allLinksForSorting]
  );

  const sortedLockedChallenges = useMemo(
    () => sortProgressByChallengOrder(lockedChallenges, allLinksForSorting),
    [lockedChallenges, allLinksForSorting]
  );
  
  // Get active challenges data (for multiple active challenges support)
  const activeChallengesData = sortedActiveChallenges
    .map((p) => p.daily_challenges as DailyChallenge | undefined)
    .filter(Boolean) as DailyChallenge[];
  
  const activeChallengeData = activeChallengesData[0]; // Keep for backward compatibility

  return {
    isLoading,
    progress,
    activeChallenge,
    activeChallenges: sortedActiveChallenges, // All active progress records (sorted)
    activeChallengeData, // First active challenge data (backward compat)
    activeChallengesData, // All active challenges data (sorted)
    completedChallenges: sortedCompletedChallenges,
    lockedChallenges: sortedLockedChallenges,
    completeChallenge,
    isCompleting,
    restartChallenge,
    isRestarting,
    selectedItemIds,
    selectedObjectivesData,
    clearProgress: clearProgressMutation,
  };
}
