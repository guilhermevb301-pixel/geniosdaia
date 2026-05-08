import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ProductSlug =
  | "genios-ia"
  | "agente-atendimento"
  | "banco-prompts"
  | "videos-cinematograficos"
  | "fotos-profissionais"
  | "influencer-ia"
  | "clone-criativo";

export function useUserProducts() {
  const { user } = useAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["user_products", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("user_products")
        .select("product_slug");
      if (error) throw error;
      return data.map((p) => p.product_slug as ProductSlug);
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  // genios-ia dá acesso a tudo
  const hasProduct = (slug: ProductSlug) =>
    products.includes("genios-ia") || products.includes(slug);

  return { products, hasProduct, isLoading };
}
