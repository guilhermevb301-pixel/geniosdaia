import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video, Image, Bot, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PromptCard } from "@/components/prompts/PromptCard";
import { Skeleton } from "@/components/ui/skeleton";

type PromptCategory = "video" | "image" | "agent";

interface Prompt {
  id: string;
  category: PromptCategory;
  title: string;
  content: string;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  thumbnail_focus: string | null;
  example_images: string[] | null;
  example_video_url: string | null;
  created_at: string;
}

export default function Prompts() {
  const [activeTab, setActiveTab] = useState<PromptCategory>("video");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select(`
          *,
          variations:prompt_variations(
            id, content, image_url, video_url, order_index
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Prompt & { variations?: { id: string; content: string; image_url: string | null; video_url: string | null; order_index: number }[] })[];
    },
  });

  const filteredPrompts = prompts?.filter((prompt) => {
    const matchesCategory = prompt.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const tabItems = [
    { value: "video" as PromptCategory, label: "Vídeos", icon: Video },
    { value: "image" as PromptCategory, label: "Imagens", icon: Image },
    { value: "agent" as PromptCategory, label: "Agentes de IA", icon: Bot },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banco de Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Prompts prontos para usar com IAs de geração de conteúdo
          </p>
        </div>

        {/* Tabs and Search */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PromptCategory)}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              {tabItems.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Content */}
          {tabItems.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : filteredPrompts && filteredPrompts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum prompt encontrado</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">
                      Tente buscar por outros termos
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
