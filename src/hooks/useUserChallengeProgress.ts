import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DailyChallenge } from "./useDailyChallenges";
import { TimeUnit } from "@/lib/utils";

export type ProgressStatus = "locked" | "active" | "completed";

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  daily_challenge_id: string;
  objective_item_id: string | null;
  status: ProgressStatus;
  started_at: string | null;
  completed_at: string | null;
  deadline: string | null;
  created_at: string;
  daily_challenges?: DailyChallenge;
}

// Calculate deadline based on challenge estimated time
export function calculateDeadline(
  estimatedMinutes: number | null,
  estimatedTimeUnit: TimeUnit = "minutes"
): string {
  const now = new Date();
  const value = estimatedMinutes || 30; // Default 30 minutes

  switch (estimatedTimeUnit) {
    case "minutes":
      return new Date(now.getTime() + value * 60 * 1000).toISOString();
    case "hours":
      return new Date(now.getTime() + value * 60 * 60 * 1000).toISOString();
    case "days":
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000).toISOString();
    case "weeks":
      return new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() + value * 60 * 1000).toISOString();
  }
}

// Calculate time remaining
export function calculateTimeLeft(deadline: string | null) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

// Calculate percent remaining for progress bar
export function calculatePercentRemaining(
  startedAt: string | null,
  deadline: string | null
): number {
  if (!startedAt || !deadline) return 0;

  const start = new Date(startedAt).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();

  if (now >= end) return 0;
  if (now <= start) return 100;

  const total = end - start;
  const remaining = end - now;

  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

export function useUserChallengeProgress(objectiveItemIds?: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's progress for specified objectives
  const { data: progress = [], isLoading, refetch } = useQuery({
    queryKey: ["userChallengeProgress", user?.id, objectiveItemIds],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("user_challenge_progress")
        .select(`
          *,
          daily_challenges (*)
        `)
        .eq("user_id", user.id);

      if (objectiveItemIds && objectiveItemIds.length > 0) {
        query = query.in("objective_item_id", objectiveItemIds);
      }

      const { data, error } = await query.order("created_at", { ascending: true });

      if (error) throw error;

      // Transform data to include parsed challenge fields
      return (data || []).map((p) => ({
        ...p,
        daily_challenges: p.daily_challenges
          ? {
              ...p.daily_challenges,
              steps: Array.isArray(p.daily_challenges.steps)
                ? p.daily_challenges.steps
                : JSON.parse((p.daily_challenges.steps as string) || "[]"),
              checklist: Array.isArray(p.daily_challenges.checklist)
                ? p.daily_challenges.checklist
                : JSON.parse((p.daily_challenges.checklist as string) || "[]"),
            }
          : undefined,
      })) as UserChallengeProgress[];
    },
    enabled: !!user,
  });

  // Initialize progress when user selects an objective
  const initProgressMutation = useMutation({
    mutationFn: async ({
      objectiveItemId,
      challenges,
    }: {
      objectiveItemId: string;
      challenges: Array<{
        id: string;
        estimated_minutes: number | null;
        estimated_time_unit: TimeUnit;
        order_index: number;
      }>;
    }) => {
      if (!user) throw new Error("User not authenticated");
      if (challenges.length === 0) return;

      // Sort by order_index to ensure correct order
      const sortedChallenges = [...challenges].sort((a, b) => a.order_index - b.order_index);

      const now = new Date().toISOString();
      const records = sortedChallenges.map((ch, idx) => ({
        user_id: user.id,
        daily_challenge_id: ch.id,
        objective_item_id: objectiveItemId,
        status: idx === 0 ? "active" : "locked",
        started_at: idx === 0 ? now : null,
        deadline: idx === 0 ? calculateDeadline(ch.estimated_minutes, ch.estimated_time_unit) : null,
      }));

      const { error } = await supabase
        .from("user_challenge_progress")
        .upsert(records, { onConflict: "user_id,daily_challenge_id,objective_item_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao inicializar progresso: " + error.message);
    },
  });

  // Complete a challenge and unlock the next one
  const completeMutation = useMutation({
    mutationFn: async (progressId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Get the current progress record
      const { data: current, error: fetchError } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("id", progressId)
        .single();

      if (fetchError) throw fetchError;

      // Mark as completed
      const { error: updateError } = await supabase
        .from("user_challenge_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", progressId);

      if (updateError) throw updateError;

      // Find the next locked challenge for this objective
      const { data: allProgress, error: allError } = await supabase
        .from("user_challenge_progress")
        .select(`
          *,
          daily_challenges (*)
        `)
        .eq("user_id", user.id)
        .eq("objective_item_id", current.objective_item_id)
        .eq("status", "locked");

      if (allError) throw allError;

      if (allProgress && allProgress.length > 0) {
        // Get order_index from links table for proper ordering
        const challengeIds = allProgress.map((p) => p.daily_challenge_id);
        const { data: links, error: linksError } = await supabase
          .from("objective_challenge_links")
          .select("daily_challenge_id, order_index")
          .eq("objective_item_id", current.objective_item_id)
          .in("daily_challenge_id", challengeIds)
          .order("order_index", { ascending: true });

        if (linksError) throw linksError;

        if (links && links.length > 0) {
          // Find the progress record with the lowest order_index
          const nextChallengeId = links[0].daily_challenge_id;
          const nextProgress = allProgress.find((p) => p.daily_challenge_id === nextChallengeId);

          if (nextProgress) {
            const challenge = nextProgress.daily_challenges;
            const now = new Date().toISOString();

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
              .eq("id", nextProgress.id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
      toast.success("Parabéns! Desafio completado! 🎉");
    },
    onError: (error: Error) => {
      toast.error("Erro ao completar desafio: " + error.message);
    },
  });

  // Clear progress for an objective (when user deselects it)
  const clearProgressMutation = useMutation({
    mutationFn: async (objectiveItemId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_challenge_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("objective_item_id", objectiveItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallengeProgress"] });
    },
  });

  // Derived state
  const activeChallenge = progress.find((p) => p.status === "active");
  const completedChallenges = progress.filter((p) => p.status === "completed");
  const lockedChallenges = progress.filter((p) => p.status === "locked");

  return {
    progress,
    isLoading,
    refetch,
    activeChallenge,
    completedChallenges,
    lockedChallenges,
    initProgress: initProgressMutation.mutate,
    isInitializing: initProgressMutation.isPending,
    completeChallenge: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
    clearProgress: clearProgressMutation.mutate,
    isClearing: clearProgressMutation.isPending,
  };
}
