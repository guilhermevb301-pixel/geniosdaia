import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Mentee {
  id: string;
  user_id: string;
  mentor_id: string | null;
  display_name: string;
  plan_tag: string;
  community_url: string | null;
  scheduling_url: string | null;
  welcome_message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  mentee_id: string;
  title: string;
  meeting_date: string;
  video_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Stage {
  id: string;
  mentee_id: string;
  title: string;
  objective: string | null;
  icon: string;
  icon_color: string;
  order_index: number;
  created_at: string;
  tasks?: Task[];
  notes?: Note[];
}

export interface Task {
  id: string;
  stage_id: string;
  content: string;
  completed: boolean;
  is_subtask: boolean;
  order_index: number;
  created_at: string;
}

export interface Note {
  id: string;
  stage_id: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Todo {
  id: string;
  mentee_id: string;
  content: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

export function useMenteeData(menteeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current user's mentee profile
  const { data: myMenteeProfile, isLoading: isLoadingMyProfile } = useQuery({
    queryKey: ["myMenteeProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("mentees")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error("Error fetching mentee profile:", error);
        return null;
      }

      return data as Mentee;
    },
    enabled: !!user?.id && !menteeId,
  });

  // Fetch specific mentee (for mentors viewing a mentee)
  const { data: menteeProfile, isLoading: isLoadingMentee } = useQuery({
    queryKey: ["menteeProfile", menteeId],
    queryFn: async () => {
      if (!menteeId) return null;

      const { data, error } = await supabase
        .from("mentees")
        .select("*")
        .eq("id", menteeId)
        .single();

      if (error) {
        console.error("Error fetching mentee:", error);
        return null;
      }

      return data as Mentee;
    },
    enabled: !!menteeId,
  });

  const activeMenteeId = menteeId || myMenteeProfile?.id;

  // Fetch meetings
  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: ["meetings", activeMenteeId],
    queryFn: async () => {
      if (!activeMenteeId) return [];

      const { data, error } = await supabase
        .from("mentorship_meetings")
        .select("*")
        .eq("mentee_id", activeMenteeId)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Error fetching meetings:", error);
        return [];
      }

      return data as Meeting[];
    },
    enabled: !!activeMenteeId,
  });

  // Fetch stages with tasks and notes
  const { data: stages = [], isLoading: isLoadingStages } = useQuery({
    queryKey: ["stages", activeMenteeId],
    queryFn: async () => {
      if (!activeMenteeId) return [];

      const { data: stagesData, error: stagesError } = await supabase
        .from("mentorship_stages")
        .select("*")
        .eq("mentee_id", activeMenteeId)
        .order("order_index", { ascending: true });

      if (stagesError) {
        console.error("Error fetching stages:", stagesError);
        return [];
      }

      const stageIds = stagesData.map((s) => s.id);

      const [tasksResult, notesResult] = await Promise.all([
        supabase
          .from("mentorship_tasks")
          .select("*")
          .in("stage_id", stageIds)
          .order("order_index", { ascending: true }),
        supabase
          .from("mentorship_notes")
          .select("*")
          .in("stage_id", stageIds)
          .order("order_index", { ascending: true }),
      ]);

      const tasks = (tasksResult.data || []) as Task[];
      const notes = (notesResult.data || []) as Note[];

      return stagesData.map((stage) => ({
        ...stage,
        tasks: tasks.filter((t) => t.stage_id === stage.id),
        notes: notes.filter((n) => n.stage_id === stage.id),
      })) as Stage[];
    },
    enabled: !!activeMenteeId,
  });

  // Fetch todos
  const { data: todos = [], isLoading: isLoadingTodos } = useQuery({
    queryKey: ["todos", activeMenteeId],
    queryFn: async () => {
      if (!activeMenteeId) return [];

      const { data, error } = await supabase
        .from("mentee_todos")
        .select("*")
        .eq("mentee_id", activeMenteeId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching todos:", error);
        return [];
      }

      return data as Todo[];
    },
    enabled: !!activeMenteeId,
  });

  // Toggle task completion
  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("mentorship_tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages", activeMenteeId] });
    },
  });

  // Toggle todo completion
  const toggleTodo = useMutation({
    mutationFn: async ({ todoId, completed }: { todoId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("mentee_todos")
        .update({ completed })
        .eq("id", todoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", activeMenteeId] });
    },
  });

  return {
    mentee: menteeId ? menteeProfile : myMenteeProfile,
    meetings,
    stages,
    todos,
    isLoading: isLoadingMyProfile || isLoadingMentee || isLoadingMeetings || isLoadingStages || isLoadingTodos,
    toggleTask,
    toggleTodo,
  };
}

// Hook for mentors to fetch all mentees
export function useAllMentees() {
  const { data: mentees = [], isLoading } = useQuery({
    queryKey: ["allMentees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all mentees:", error);
        return [];
      }

      return data as Mentee[];
    },
  });

  return { mentees, isLoading };
}
