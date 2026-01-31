import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Track } from "./useUserProfile";
import { TimeUnit } from "@/lib/utils";

export interface DailyChallenge {
  id: string;
  track: Track;
  difficulty: string;
  title: string;
  objective: string;
  steps: string[];
  deliverable: string;
  checklist: string[];
  estimated_minutes: number | null;
  estimated_time_unit: TimeUnit;
  is_bonus: boolean;
  created_at: string;
}

export function useDailyChallenges(userTrack: Track, userLevel: number = 1) {
  // Determine difficulty based on user level
  const getDifficulty = (level: number): string => {
    if (level <= 2) return "iniciante";
    if (level <= 5) return "intermediario";
    return "avancado";
  };

  const difficulty = getDifficulty(userLevel);

  // Fetch personalized challenge for user's track
  const { data: personalizedChallenge, isLoading: isLoadingPersonalized } = useQuery({
    queryKey: ["dailyChallenge", userTrack, difficulty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("track", userTrack)
        .eq("is_bonus", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Parse JSON fields
      if (data) {
        return {
          ...data,
          steps: Array.isArray(data.steps) ? data.steps : JSON.parse(data.steps as string || "[]"),
          checklist: Array.isArray(data.checklist) ? data.checklist : JSON.parse(data.checklist as string || "[]"),
        } as DailyChallenge;
      }
      return null;
    },
    enabled: !!userTrack,
  });

  // Fetch weekly bonus challenge (Propostas que Vendem)
  const { data: bonusChallenge, isLoading: isLoadingBonus } = useQuery({
    queryKey: ["bonusChallenge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("is_bonus", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          steps: Array.isArray(data.steps) ? data.steps : JSON.parse(data.steps as string || "[]"),
          checklist: Array.isArray(data.checklist) ? data.checklist : JSON.parse(data.checklist as string || "[]"),
        } as DailyChallenge;
      }
      return null;
    },
  });

  return {
    personalizedChallenge,
    bonusChallenge,
    isLoading: isLoadingPersonalized || isLoadingBonus,
  };
}
