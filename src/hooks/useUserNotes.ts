import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserNote {
  id: string;
  user_id: string;
  lesson_id: string | null;
  prompt_id: string | null;
  content: string;
  title: string | null;
  media_urls: string[];
  created_at: string;
  updated_at: string;
}

export function useUserNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all user notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ["userNotes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data as UserNote[];
    },
    enabled: !!user,
  });

  // Get note for specific lesson
  const getNoteForLesson = (lessonId: string) => {
    return notes?.find((n) => n.lesson_id === lessonId);
  };

  // Get note for specific prompt
  const getNoteForPrompt = (promptId: string) => {
    return notes?.find((n) => n.prompt_id === promptId);
  };

  // Save/update note
  const saveNoteMutation = useMutation({
    mutationFn: async ({
      lessonId,
      promptId,
      content,
    }: {
      lessonId?: string;
      promptId?: string;
      content: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Find existing note
      const existing = lessonId 
        ? notes?.find((n) => n.lesson_id === lessonId)
        : notes?.find((n) => n.prompt_id === promptId);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("user_notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("user_notes")
          .insert({
            user_id: user.id,
            lesson_id: lessonId || null,
            prompt_id: promptId || null,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
    },
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("user_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    getNoteForLesson,
    getNoteForPrompt,
    saveNote: saveNoteMutation.mutate,
    isSaving: saveNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutate,
    isDeleting: deleteNoteMutation.isPending,
  };
}
