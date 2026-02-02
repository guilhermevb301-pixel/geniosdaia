import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ObjectiveItem {
  id: string;
  group_id: string | null;
  label: string;
  objective_key: string;
  requires_infra: boolean;
  is_infra: boolean;
  order_index: number;
  tags: string[];
  created_at: string;
}

export function useObjectives() {
  const queryClient = useQueryClient();

  // Fetch all objectives as flat list
  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ["objectives"],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("objective_items")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      return (items || []).map(item => ({
        ...item,
        tags: item.tags || [],
      })) as ObjectiveItem[];
    },
  });

  // Get infra required IDs
  const infraRequiredBy = objectives
    .filter(item => item.requires_infra)
    .map(item => item.objective_key);

  // Get sales IDs for proposal suggestion
  const salesObjectiveKeys = objectives
    .filter(item => item.tags.includes("vendas"))
    .map(item => item.objective_key)
    .filter(key => key !== "criar_proposta");

  // Mutations
  const updateItemMutation = useMutation({
    mutationFn: async (item: Partial<ObjectiveItem> & { id: string }) => {
      const { error } = await supabase
        .from("objective_items")
        .update(item)
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objetivo atualizado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar objetivo: " + error.message);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<ObjectiveItem, "id" | "created_at">) => {
      const { error } = await supabase
        .from("objective_items")
        .insert(item);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objetivo criado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar objetivo: " + error.message);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objective_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectives"] });
      toast.success("Objetivo excluído!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir objetivo: " + error.message);
    },
  });

  return {
    objectives,
    isLoading,
    infraRequiredBy,
    salesObjectiveKeys,
    updateItem: updateItemMutation.mutate,
    addItem: addItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isUpdating: 
      updateItemMutation.isPending ||
      addItemMutation.isPending ||
      deleteItemMutation.isPending,
  };
}
