import { useEffect } from "react";
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
  pillar_id: string | null;
  title: string;
  objective: string | null;
  icon: string;
  icon_color: string;
  order_index: number;
  created_at: string;
  tasks?: Task[];
  notes?: Note[];
}

export interface Pillar {
  id: string;
  mentee_id: string;
  title: string;
  icon: string;
  icon_color: string;
  order_index: number;
  created_at: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  objective: string | null;
  order_index: number;
  tasks: Task[];
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

  // Fetch pillars with phases and tasks
  const { data: pillars = [], isLoading: isLoadingPillars } = useQuery({
    queryKey: ["pillars", activeMenteeId],
    queryFn: async () => {
      if (!activeMenteeId) return [];

      // 1. Fetch pillars
      const { data: pillarsData, error: pillarsError } = await supabase
        .from("mentorship_pillars")
        .select("*")
        .eq("mentee_id", activeMenteeId)
        .order("order_index", { ascending: true });

      if (pillarsError) {
        console.error("Error fetching pillars:", pillarsError);
        return [];
      }

      if (!pillarsData || pillarsData.length === 0) return [];

      const pillarIds = pillarsData.map((p) => p.id);

      // 2. Fetch stages (phases) linked to pillars
      const { data: phasesData, error: phasesError } = await supabase
        .from("mentorship_stages")
        .select("*")
        .in("pillar_id", pillarIds)
        .order("order_index", { ascending: true });

      if (phasesError) {
        console.error("Error fetching phases:", phasesError);
        return pillarsData.map((p) => ({ ...p, phases: [] })) as Pillar[];
      }

      const phaseIds = (phasesData || []).map((s) => s.id);

      // 3. Fetch tasks for phases
      let tasksData: Task[] = [];
      if (phaseIds.length > 0) {
        const { data: tasks, error: tasksError } = await supabase
          .from("mentorship_tasks")
          .select("*")
          .in("stage_id", phaseIds)
          .order("order_index", { ascending: true });

        if (!tasksError && tasks) {
          tasksData = tasks as Task[];
        }
      }

      // 4. Build hierarchy
      return pillarsData.map((pillar) => ({
        ...pillar,
        phases: (phasesData || [])
          .filter((phase) => phase.pillar_id === pillar.id)
          .map((phase) => ({
            id: phase.id,
            title: phase.title,
            objective: phase.objective,
            order_index: phase.order_index,
            tasks: tasksData.filter((t) => t.stage_id === phase.id),
          })),
      })) as Pillar[];
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

  // Create new todo
  const createTodo = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!activeMenteeId) throw new Error("No mentee id");

      const { data: existingTodos } = await supabase
        .from("mentee_todos")
        .select("order_index")
        .eq("mentee_id", activeMenteeId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = (existingTodos?.[0]?.order_index ?? -1) + 1;

      const { error } = await supabase.from("mentee_todos").insert({
        mentee_id: activeMenteeId,
        content,
        order_index: nextOrder,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", activeMenteeId] });
    },
  });

  // Delete todo
  const deleteTodo = useMutation({
    mutationFn: async (todoId: string) => {
      const { error } = await supabase
        .from("mentee_todos")
        .delete()
        .eq("id", todoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", activeMenteeId] });
    },
  });

  // Realtime subscriptions
  useEffect(() => {
    if (!activeMenteeId) return;

    const channel = supabase
      .channel(`mentee-realtime-${activeMenteeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_pillars", filter: `mentee_id=eq.${activeMenteeId}` },
        () => queryClient.invalidateQueries({ queryKey: ["pillars", activeMenteeId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_stages", filter: `mentee_id=eq.${activeMenteeId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["stages", activeMenteeId] });
          queryClient.invalidateQueries({ queryKey: ["pillars", activeMenteeId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["stages", activeMenteeId] });
          queryClient.invalidateQueries({ queryKey: ["pillars", activeMenteeId] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_meetings", filter: `mentee_id=eq.${activeMenteeId}` },
        () => queryClient.invalidateQueries({ queryKey: ["meetings", activeMenteeId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentorship_notes" },
        () => queryClient.invalidateQueries({ queryKey: ["stages", activeMenteeId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentee_todos", filter: `mentee_id=eq.${activeMenteeId}` },
        () => queryClient.invalidateQueries({ queryKey: ["todos", activeMenteeId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMenteeId, queryClient]);

  return {
    mentee: menteeId ? menteeProfile : myMenteeProfile,
    meetings,
    stages,
    pillars,
    todos,
    isLoading: isLoadingMyProfile || isLoadingMentee || isLoadingMeetings || isLoadingStages || isLoadingTodos || isLoadingPillars,
    toggleTask,
    toggleTodo,
    createTodo,
    deleteTodo,
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
