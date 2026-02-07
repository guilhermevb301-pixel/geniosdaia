import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PREFETCH_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export async function prefetchPrompts(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: PREFETCH_STALE_TIME,
  });
}

export async function prefetchModules(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["modules-with-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select(`*, section:module_sections(id, title, order_index)`)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: PREFETCH_STALE_TIME,
  });
}

export async function prefetchTemplates(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: PREFETCH_STALE_TIME,
  });
}

export async function prefetchBanners(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["dashboard-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: PREFETCH_STALE_TIME,
  });
}

export async function prefetchCustomGpts(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["custom-gpts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_gpts")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: PREFETCH_STALE_TIME,
  });
}

export function getPrefetchHandler(route: string, queryClient: QueryClient) {
  const prefetchMap: Record<string, () => Promise<void>> = {
    "/prompts": () => prefetchPrompts(queryClient),
    "/aulas": () => prefetchModules(queryClient),
    "/templates": () => prefetchTemplates(queryClient),
    "/": () => prefetchBanners(queryClient),
    "/meus-gpts": () => prefetchCustomGpts(queryClient),
  };

  return prefetchMap[route] || null;
}
