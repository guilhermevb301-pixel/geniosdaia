import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { buildCourseLibrary } from "@/lib/courseLibrary";
import { useUserProducts } from "@/hooks/useUserProducts";

export function useCourseLibrary() {
  const { user } = useAuth();
  const { hasProduct, isLoading: isLoadingProducts } = useUserProducts();

  const sectionsQuery = useQuery({
    queryKey: ["module_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_sections")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const modulesQuery = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id,module_id")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const progressQuery = useQuery({
    queryKey: ["lesson_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id,completed")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
  });

  const library = buildCourseLibrary({
    sections: (sectionsQuery.data ?? []).map((section) => ({
      ...section,
      product_slug:
        "product_slug" in section && typeof section.product_slug === "string"
          ? section.product_slug
          : null,
    })),
    modules: modulesQuery.data ?? [],
    lessons: lessonsQuery.data ?? [],
    progress: progressQuery.data ?? [],
    hasProduct,
  });

  return {
    ...library,
    isLoading:
      sectionsQuery.isLoading ||
      modulesQuery.isLoading ||
      lessonsQuery.isLoading ||
      progressQuery.isLoading ||
      isLoadingProducts,
    isError:
      sectionsQuery.isError ||
      modulesQuery.isError ||
      lessonsQuery.isError ||
      progressQuery.isError,
    refetch: () =>
      Promise.all([
        sectionsQuery.refetch(),
        modulesQuery.refetch(),
        lessonsQuery.refetch(),
        progressQuery.refetch(),
      ]),
  };
}
