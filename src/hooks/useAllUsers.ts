import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          const { error } = await supabase
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
            });
          
          if (error) throw error;
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
