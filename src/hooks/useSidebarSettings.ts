import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SidebarSettings {
  id: string;
  icon_color: string;
  updated_at: string;
  updated_by: string | null;
}

export function useSidebarSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["sidebarSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sidebar_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching sidebar settings:", error);
        return null;
      }

      return data as SidebarSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateSettings = useMutation({
    mutationFn: async (iconColor: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("sidebar_settings")
        .update({
          icon_color: iconColor,
          updated_at: new Date().toISOString(),
          updated_by: user.user.id,
        })
        .eq("id", settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebarSettings"] });
      toast.success("Cor dos ícones atualizada!");
    },
    onError: (error) => {
      console.error("Error updating sidebar settings:", error);
      toast.error("Erro ao atualizar cor dos ícones");
    },
  });

  return {
    iconColor: settings?.icon_color || "amber-400",
    isLoading,
    updateIconColor: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
