import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ObjectiveItem {
  id: string;
  group_id: string;
  label: string;
  objective_key: string;
  requires_infra: boolean;
  is_infra: boolean;
  order_index: number;
  tags: string[];
  created_at: string;
}

export interface ObjectiveGroup {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
  items: ObjectiveItem[];
}

export function useObjectives() {
  const queryClient = useQueryClient();

  // Fetch groups with items
  const { data: objectiveGroups = [], isLoading } = useQuery({
    queryKey: ["objectiveGroups"],
    queryFn: async () => {
      // Fetch groups
      const { data: groups, error: groupsError } = await supabase
        .from("objective_groups")
        .select("*")
        .order("order_index", { ascending: true });

      if (groupsError) throw groupsError;

      // Fetch items
      const { data: items, error: itemsError } = await supabase
        .from("objective_items")
        .select("*")
        .order("order_index", { ascending: true });

      if (itemsError) throw itemsError;

      // Map items to groups
      const groupsWithItems: ObjectiveGroup[] = (groups || []).map(group => ({
        ...group,
        items: (items || [])
          .filter(item => item.group_id === group.id)
          .map(item => ({
            ...item,
            tags: item.tags || [],
          })),
      }));

      return groupsWithItems;
    },
  });

  // Get infra required IDs
  const infraRequiredBy = objectiveGroups
    .flatMap(g => g.items)
    .filter(item => item.requires_infra)
    .map(item => item.objective_key);

  // Get sales IDs for proposal suggestion
  const salesObjectiveKeys = objectiveGroups
    .flatMap(g => g.items)
    .filter(item => item.tags.includes("vendas"))
    .map(item => item.objective_key)
    .filter(key => key !== "criar_proposta");

  // Mutations for mentor/admin
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, title, order_index }: { id: string; title: string; order_index?: number }) => {
      const updates: Record<string, unknown> = { title };
      if (order_index !== undefined) updates.order_index = order_index;
      
      const { error } = await supabase
        .from("objective_groups")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Grupo atualizado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar grupo: " + error.message);
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async ({ title, order_index }: { title: string; order_index: number }) => {
      const { error } = await supabase
        .from("objective_groups")
        .insert({ title, order_index });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Grupo criado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar grupo: " + error.message);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objective_groups")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Grupo excluído!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir grupo: " + error.message);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: Partial<ObjectiveItem> & { id: string }) => {
      const { error } = await supabase
        .from("objective_items")
        .update(item)
        .eq("id", item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Item atualizado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar item: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Item criado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar item: " + error.message);
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
      queryClient.invalidateQueries({ queryKey: ["objectiveGroups"] });
      toast.success("Item excluído!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir item: " + error.message);
    },
  });

  return {
    objectiveGroups,
    isLoading,
    infraRequiredBy,
    salesObjectiveKeys,
    updateGroup: updateGroupMutation.mutate,
    addGroup: addGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    updateItem: updateItemMutation.mutate,
    addItem: addItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isUpdating: 
      updateGroupMutation.isPending || 
      addGroupMutation.isPending || 
      deleteGroupMutation.isPending ||
      updateItemMutation.isPending ||
      addItemMutation.isPending ||
      deleteItemMutation.isPending,
  };
}
