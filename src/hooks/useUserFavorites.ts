import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserFavorite {
  id: string;
  user_id: string;
  lesson_id: string | null;
  prompt_id: string | null;
  note: string | null;
  created_at: string;
}

export function useUserFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all user favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["userFavorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserFavorite[];
    },
    enabled: !!user,
  });

  // Check if item is favorited
  const isLessonFavorited = (lessonId: string) => {
    return favorites?.some((f) => f.lesson_id === lessonId) || false;
  };

  const isPromptFavorited = (promptId: string) => {
    return favorites?.some((f) => f.prompt_id === promptId) || false;
  };

  // Toggle favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      lessonId,
      promptId,
      note,
    }: {
      lessonId?: string;
      promptId?: string;
      note?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Find existing favorite
      const existing = lessonId 
        ? favorites?.find((f) => f.lesson_id === lessonId)
        : favorites?.find((f) => f.prompt_id === promptId);

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            lesson_id: lessonId || null,
            prompt_id: promptId || null,
            note: note || null,
          })
          .select()
          .single();

        if (error) throw error;
        return { action: "added", data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    },
  });

  // Update favorite note
  const updateNoteMutation = useMutation({
    mutationFn: async ({
      favoriteId,
      note,
    }: {
      favoriteId: string;
      note: string;
    }) => {
      const { data, error } = await supabase
        .from("user_favorites")
        .update({ note })
        .eq("id", favoriteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    },
  });

  // Get lesson favorites
  const lessonFavorites = favorites?.filter((f) => f.lesson_id !== null) || [];
  
  // Get prompt favorites
  const promptFavorites = favorites?.filter((f) => f.prompt_id !== null) || [];

  return {
    favorites: favorites || [],
    lessonFavorites,
    promptFavorites,
    isLoading,
    isLessonFavorited,
    isPromptFavorited,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending,
    updateNote: updateNoteMutation.mutate,
  };
}
