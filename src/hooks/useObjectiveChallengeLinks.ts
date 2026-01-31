import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ObjectiveChallengeLink {
  id: string;
  objective_item_id: string;
  daily_challenge_id: string;
  created_at: string;
}

export function useObjectiveChallengeLinks(objectiveItemId?: string) {
  const queryClient = useQueryClient();

  // Fetch links for a specific objective item
  const { data: links = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["objectiveChallengeLinks", objectiveItemId],
    queryFn: async () => {
      if (!objectiveItemId) return [];
      
      const { data, error } = await supabase
        .from("objective_challenge_links")
        .select("*")
        .eq("objective_item_id", objectiveItemId);

      if (error) throw error;
      return data as ObjectiveChallengeLink[];
    },
    enabled: !!objectiveItemId,
  });

  // Fetch all links (for recommendation system)
  const { data: allLinks = [], isLoading: isLoadingAllLinks } = useQuery({
    queryKey: ["allObjectiveChallengeLinks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objective_challenge_links")
        .select("*");

      if (error) throw error;
      return data as ObjectiveChallengeLink[];
    },
  });

  // Fetch link counts per objective item (for UI indicators)
  const { data: linkCounts = {} } = useQuery({
    queryKey: ["objectiveLinkCounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objective_challenge_links")
        .select("objective_item_id");

      if (error) throw error;

      // Count links per item
      const counts: Record<string, number> = {};
      data.forEach((link) => {
        counts[link.objective_item_id] = (counts[link.objective_item_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Get linked challenge IDs for an objective
  const linkedChallengeIds = links.map(link => link.daily_challenge_id);

  // Save links (replace all links for an objective)
  const saveLinksMutation = useMutation({
    mutationFn: async ({ 
      objectiveItemId, 
      challengeIds 
    }: { 
      objectiveItemId: string; 
      challengeIds: string[] 
    }) => {
      // Delete existing links
      const { error: deleteError } = await supabase
        .from("objective_challenge_links")
        .delete()
        .eq("objective_item_id", objectiveItemId);

      if (deleteError) throw deleteError;

      // Insert new links
      if (challengeIds.length > 0) {
        const newLinks = challengeIds.map(challengeId => ({
          objective_item_id: objectiveItemId,
          daily_challenge_id: challengeId,
        }));

        const { error: insertError } = await supabase
          .from("objective_challenge_links")
          .insert(newLinks);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectiveChallengeLinks"] });
      queryClient.invalidateQueries({ queryKey: ["allObjectiveChallengeLinks"] });
      queryClient.invalidateQueries({ queryKey: ["objectiveLinkCounts"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao salvar vínculos: " + error.message);
    },
  });

  // Get linked challenges for multiple objective keys (for recommendations)
  const getLinkedChallengesForObjectives = (
    objectiveKeys: string[],
    objectiveItems: { id: string; objective_key: string }[],
    allChallenges: { id: string }[]
  ) => {
    // Get objective item IDs from keys
    const itemIds = objectiveItems
      .filter(item => objectiveKeys.includes(item.objective_key))
      .map(item => item.id);

    // Get linked challenge IDs
    const linkedIds = allLinks
      .filter(link => itemIds.includes(link.objective_item_id))
      .map(link => link.daily_challenge_id);

    return [...new Set(linkedIds)];
  };

  return {
    links,
    allLinks,
    linkedChallengeIds,
    linkCounts,
    isLoadingLinks,
    isLoadingAllLinks,
    saveLinks: saveLinksMutation.mutate,
    isSaving: saveLinksMutation.isPending,
    getLinkedChallengesForObjectives,
  };
}
