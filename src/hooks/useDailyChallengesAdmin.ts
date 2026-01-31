import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DailyChallenge } from "./useDailyChallenges";

export interface DailyChallengeFormData {
  title: string;
  objective: string;
  track: string;
  difficulty: string;
  estimated_minutes: number | null;
  steps: string[];
  checklist: string[];
  deliverable: string;
  is_bonus: boolean;
}

export function useDailyChallengesAdmin() {
  const queryClient = useQueryClient();

  // Fetch all daily challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["adminDailyChallenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DailyChallenge[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: DailyChallengeFormData) => {
      const { error } = await supabase.from("daily_challenges").insert({
        title: data.title,
        objective: data.objective,
        track: data.track,
        difficulty: data.difficulty,
        estimated_minutes: data.estimated_minutes,
        steps: data.steps,
        checklist: data.checklist,
        deliverable: data.deliverable,
        is_bonus: data.is_bonus,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["dailyChallenges"] });
      toast.success("Desafio criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar desafio: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DailyChallengeFormData> }) => {
      const { error } = await supabase
        .from("daily_challenges")
        .update({
          title: data.title,
          objective: data.objective,
          track: data.track,
          difficulty: data.difficulty,
          estimated_minutes: data.estimated_minutes,
          steps: data.steps,
          checklist: data.checklist,
          deliverable: data.deliverable,
          is_bonus: data.is_bonus,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["dailyChallenges"] });
      toast.success("Desafio atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar desafio: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("daily_challenges")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDailyChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["dailyChallenges"] });
      toast.success("Desafio excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir desafio: " + error.message);
    },
  });

  return {
    challenges,
    isLoading,
    createChallenge: createMutation.mutate,
    updateChallenge: updateMutation.mutate,
    deleteChallenge: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
