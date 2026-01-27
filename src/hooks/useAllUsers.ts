import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_MENTORSHIP_TEMPLATE = [
  {
    title: "Fase 1: Preparação Técnica",
    objective: "Ter o ambiente pronto para começar a criar e testar.",
    icon_color: "#4D96FF",
    tasks: [
      { content: "Onboarding e alinhamento de expectativas", completed: false },
      { content: "Contratação e configuração de VPS", completed: false },
      { content: "Instalação das ferramentas", completed: false },
      { content: "Configuração de credenciais", completed: false },
      { content: "Visão geral do N8N e instalação de templates", completed: false },
      { content: "Criação do primeiro agente de IA", completed: false },
    ],
  },
  {
    title: "Fase 2: Construção de Projeto",
    objective: "Criar um projeto funcional, mesmo que simples, para ganhar experiência prática.",
    icon_color: "#4D96FF",
    tasks: [
      { content: "Escolha de nicho do primeiro projeto", completed: false },
      { content: "Definição do objetivo e escopo", completed: false },
      { content: "Montagem do projeto real (passo a passo guiado)", completed: false },
    ],
  },
  {
    title: "Fase 3: Estratégia de Vendas",
    objective: "Preparar a base para conseguir os primeiros clientes.",
    icon_color: "#FFD93D",
    tasks: [
      { content: "Definir estratégia de venda e nicho", completed: false },
      { content: "Estruturar presença no Instagram para vendas", completed: false },
      { content: "Roteiro para primeiras reuniões", completed: false },
      { content: "Mapeamento, precificação e criação de proposta comercial", completed: false },
    ],
  },
  {
    title: "Fase 4: Entrega e Escala",
    objective: "Aprender a entregar bem e preparar o negócio para crescer.",
    icon_color: "#6BCB77",
    tasks: [
      { content: "Passo a passo: \"Cliente fechou, e agora?\"", completed: false },
      { content: "Modelo validado de organização e entrega de projetos", completed: false },
      { content: "Ajustes para aumentar a capacidade e eficiência", completed: false },
    ],
  },
];

const createDefaultStagesAndTasks = async (menteeId: string) => {
  for (let i = 0; i < DEFAULT_MENTORSHIP_TEMPLATE.length; i++) {
    const stage = DEFAULT_MENTORSHIP_TEMPLATE[i];
    
    const { data: stageData, error: stageError } = await supabase
      .from("mentorship_stages")
      .insert({
        mentee_id: menteeId,
        title: stage.title,
        objective: stage.objective,
        icon_color: stage.icon_color,
        order_index: i,
      })
      .select("id")
      .single();
    
    if (stageError || !stageData) {
      console.error("Error creating stage:", stageError);
      continue;
    }
    
    const tasksToInsert = stage.tasks.map((task, index) => ({
      stage_id: stageData.id,
      content: task.content,
      completed: task.completed,
      order_index: index,
      is_subtask: false,
    }));
    
    await supabase.from("mentorship_tasks").insert(tasksToInsert);
  }
};

export interface UserWithRoles {
  user_id: string;
  email: string;
  created_at: string;
  roles: ("admin" | "user" | "mentor")[];
  mentee_id: string | null;
  mentee_status: string | null;
  display_name: string | null;
}

export interface RoleChangePayload {
  userId: string;
  newRole: "user" | "mentee" | "mentor";
  previousRole?: "user" | "mentee" | "mentor";
  menteeData?: {
    display_name: string;
    plan_tag?: string;
    scheduling_url?: string;
    community_url?: string;
    welcome_message?: string;
  };
}

export function useAllUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users_with_roles");
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      return (data || []) as UserWithRoles[];
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, newRole, previousRole, menteeData }: RoleChangePayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Handle mentee promotion/demotion
      if (newRole === "mentee") {
        if (!menteeData) throw new Error("Mentee data required");
        
        // Check if mentee record exists
        const { data: existingMentee } = await supabase
          .from("mentees")
          .select("id, status")
          .eq("user_id", userId)
          .single();

        if (existingMentee) {
          // Reactivate existing mentee
          const { error } = await supabase
            .from("mentees")
            .update({ 
              status: "active",
              display_name: menteeData.display_name,
              plan_tag: menteeData.plan_tag || "Individual 2.0",
              scheduling_url: menteeData.scheduling_url,
              community_url: menteeData.community_url,
              welcome_message: menteeData.welcome_message,
              mentor_id: user.id,
            })
            .eq("id", existingMentee.id);
          
          if (error) throw error;
        } else {
          // Create new mentee record
          const { data: newMentee, error } = await supabase
            .from("mentees")
            .insert({
              user_id: userId,
              display_name: menteeData.display_name,
              plan_tag: menteeData.plan_tag || "Individual 2.0",
              scheduling_url: menteeData.scheduling_url,
              community_url: menteeData.community_url,
              welcome_message: menteeData.welcome_message,
              mentor_id: user.id,
              status: "active",
            })
            .select("id")
            .single();
          
          if (error) throw error;
          
          // Create default stages and tasks for new mentee
          if (newMentee) {
            await createDefaultStagesAndTasks(newMentee.id);
          }
        }
      } else {
        // Deactivate mentee if demoting from mentee
        const { data: existingMentee } = await supabase
          .from("mentees")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .single();

        if (existingMentee) {
          await supabase
            .from("mentees")
            .update({ status: "inactive" })
            .eq("id", existingMentee.id);
        }
      }

      // Update user_roles table for mentor role
      if (newRole === "mentor") {
        // First remove user role if exists
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "user");

        // Add mentor role
        const { error } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "mentor" }, { onConflict: "user_id,role" });
        
        if (error) throw error;
      } else if (newRole === "user") {
        // Remove mentor role if exists
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "mentor");

        // Ensure user role exists
        await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });
      }

      // Log the change - map mentee to user for the role history
      const historyRole = newRole === "mentee" ? "user" : newRole;
      const prevHistoryRole = previousRole === "mentee" ? "user" : (previousRole || "user");
      
      await supabase.from("user_role_history").insert({
        user_id: userId,
        previous_role: prevHistoryRole,
        new_role: historyRole,
        changed_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      toast({
        title: "Cargo atualizado",
        description: "O cargo do usuário foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error changing role:", error);
      toast({
        title: "Erro ao alterar cargo",
        description: "Não foi possível alterar o cargo do usuário.",
        variant: "destructive",
      });
    },
  });

  return { users, isLoading, changeRole };
}
