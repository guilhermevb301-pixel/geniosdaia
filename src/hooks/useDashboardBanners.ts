import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  gradient: string | null;
  button_text: string | null;
  button_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  height: number;
  width_type: string;
}

export function useDashboardBanners() {
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ["dashboardBanners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      return data as DashboardBanner[];
    },
  });

  return { banners, isLoading, error };
}

export function useDashboardBannersAdmin() {
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ["dashboardBannersAdmin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data as DashboardBanner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (banner: Omit<DashboardBanner, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .insert(banner)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardBannersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBanners"] });
      toast.success("Banner criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating banner:", error);
      toast.error("Erro ao criar banner");
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, ...banner }: Partial<DashboardBanner> & { id: string }) => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .update(banner)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardBannersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBanners"] });
      toast.success("Banner atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating banner:", error);
      toast.error("Erro ao atualizar banner");
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dashboard_banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardBannersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBanners"] });
      toast.success("Banner excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting banner:", error);
      toast.error("Erro ao excluir banner");
    },
  });

  return {
    banners,
    isLoading,
    error,
    createBanner,
    updateBanner,
    deleteBanner,
  };
}
