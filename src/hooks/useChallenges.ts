import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string | null;
  xp_reward: number;
  badge_reward_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  file_url: string | null;
  link_url: string | null;
  votes_count: number;
  is_winner: boolean;
  created_at: string;
}

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active challenge
  const { data: activeChallenge, isLoading: isLoadingActive } = useQuery({
    queryKey: ["activeChallenge"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .lte("start_date", now)
        .gte("end_date", now)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Challenge | null;
    },
  });

  // Fetch all challenges
  const { data: allChallenges, isLoading: isLoadingAll } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data as Challenge[];
    },
  });

  // Fetch submissions for a challenge
  const fetchSubmissions = async (challengeId: string) => {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("votes_count", { ascending: false });
    
    if (error) throw error;
    return data as ChallengeSubmission[];
  };

  // Submit to challenge
  const submitMutation = useMutation({
    mutationFn: async ({
      challengeId,
      title,
      description,
      imageUrl,
      linkUrl,
    }: {
      challengeId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      linkUrl?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("challenge_submissions")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          title,
          description,
          image_url: imageUrl,
          link_url: linkUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challengeSubmissions"] });
    },
  });

  // Vote for submission
  const voteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Check if already voted
      const { data: existingVote } = await supabase
        .from("challenge_votes")
        .select("id")
        .eq("submission_id", submissionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from("challenge_votes")
          .delete()
          .eq("id", existingVote.id);
        
        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add vote
        const { error } = await supabase
          .from("challenge_votes")
          .insert({
            submission_id: submissionId,
            user_id: user.id,
          });
        
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challengeSubmissions"] });
    },
  });

  // Check if user voted for a submission
  const checkUserVote = async (submissionId: string) => {
    if (!user) return false;
    
    const { data } = await supabase
      .from("challenge_votes")
      .select("id")
      .eq("submission_id", submissionId)
      .eq("user_id", user.id)
      .maybeSingle();
    
    return !!data;
  };

  return {
    activeChallenge,
    allChallenges: allChallenges || [],
    pastChallenges: allChallenges?.filter((c) => c.status === "ended") || [],
    isLoading: isLoadingActive || isLoadingAll,
    fetchSubmissions,
    submit: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
    checkUserVote,
  };
}
