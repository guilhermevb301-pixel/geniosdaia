import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Track = "agentes" | "videos" | "fotos" | "crescimento" | "propostas";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  main_track: Track;
  goals: {
    objetivo_30d?: string;
    objetivo_90d?: string;
    bloqueio?: string;
    tempo_dia?: number;
    nicho?: string;
    plataforma?: string;
    monetizar?: string;
  };
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!user,
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!user) throw new Error("User not authenticated");

      // Check if profile exists
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { data: result, error } = await supabase
          .from("user_profiles")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Insert
        const { data: result, error } = await supabase
          .from("user_profiles")
          .insert({ user_id: user.id, ...data })
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    mainTrack: (profile?.main_track || "agentes") as Track,
    updateProfile: createOrUpdateMutation.mutateAsync,
    isUpdating: createOrUpdateMutation.isPending,
  };
}
