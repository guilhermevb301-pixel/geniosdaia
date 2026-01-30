import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { GptCard } from "@/components/gpts/GptCard";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomGpt {
  id: string;
  title: string;
  description: string | null;
  gpt_url: string;
  icon_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function MeusGpts() {
  const { data: gpts, isLoading } = useQuery({
    queryKey: ["custom_gpts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_gpts")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data as CustomGpt[];
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Meus GPTs</h1>
          <p className="text-muted-foreground">
            GPTs personalizados para acelerar seu aprendizado
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-lg space-y-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : gpts && gpts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gpts.map((gpt) => (
              <GptCard key={gpt.id} gpt={gpt} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Bot className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum GPT disponível</h2>
            <p className="text-muted-foreground max-w-md">
              Os GPTs personalizados ainda não foram adicionados. Aguarde o administrador adicionar o conteúdo.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
