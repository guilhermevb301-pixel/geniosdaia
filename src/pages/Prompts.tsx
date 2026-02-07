import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video, Image, Search, Wand2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompts/PromptCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useIsMentor } from "@/hooks/useIsMentor";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PromptEditorModal, DeletePromptDialog, PromptCategory, PromptData } from "@/components/prompts/PromptEditorModal";

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
  variations?: {
    id: string;
    content: string;
    image_url: string | null;
    video_url: string | null;
    order_index: number;
  }[];
}

const categories = [
  { value: "image" as PromptCategory, label: "Imagens", icon: Image },
  { value: "video" as PromptCategory, label: "Vídeos", icon: Video },
  { value: "modifier" as PromptCategory, label: "Modificador de Imagens", icon: Wand2 },
];

export default function Prompts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<PromptCategory>("image");

  const { isMentor } = useIsMentor();
  const { isAdmin } = useIsAdmin();
  const canManage = isMentor || isAdmin;

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
      return data as Prompt[];
    },
  });

  const matchesSearch = (prompt: Prompt, query: string) => {
    const lowerQuery = query.toLowerCase();
    return (
      prompt.title.toLowerCase().includes(lowerQuery) ||
      prompt.description?.toLowerCase().includes(lowerQuery) ||
      prompt.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const groupedPrompts = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      prompts:
        prompts?.filter(
          (p) =>
            p.category === cat.value &&
            (searchQuery === "" || matchesSearch(p, searchQuery))
        ) || [],
    }));
  }, [prompts, searchQuery]);

  // Preload first 6 critical images from first category with prompts
  const criticalImages = useMemo(() => {
    const firstCategoryWithPrompts = groupedPrompts.find((g) => g.prompts.length > 0);
    return (
      firstCategoryWithPrompts?.prompts
        .slice(0, 6)
        .map((p) => p.thumbnail_url)
        .filter(Boolean) || []
    );
  }, [groupedPrompts]);
  useImagePreload(criticalImages, { width: 400 });

  const handleNewPrompt = (category: PromptCategory) => {
    setEditingPrompt(null);
    setDefaultCategory(category);
    setIsEditorOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt as PromptData);
    setDefaultCategory(prompt.category);
    setIsEditorOpen(true);
  };

  // Get default open accordion items - categories with prompts
  const defaultOpenCategories = useMemo(() => {
    return groupedPrompts.filter((g) => g.prompts.length > 0).map((g) => g.value);
  }, [groupedPrompts]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Banco de Prompts</h1>
            <p className="text-muted-foreground mt-1">
              Prompts prontos para usar com IAs de geração de conteúdo
            </p>
          </div>
          {canManage && (
            <Button onClick={() => handleNewPrompt("image")}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Accordion Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={defaultOpenCategories}
            className="space-y-2"
          >
            {groupedPrompts.map((group) => (
              <AccordionItem
                key={group.value}
                value={group.value}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <group.icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{group.label}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.prompts.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {group.prompts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.prompts.map((prompt, index) => (
                        <div key={prompt.id} className="relative group">
                          <PromptCard prompt={prompt} priority={index < 6} />
                          {canManage && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPrompt(prompt);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 bg-background/90 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletePromptId(prompt.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <group.icon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Nenhum prompt de {group.label.toLowerCase()}</p>
                      {searchQuery && (
                        <p className="text-sm mt-1">Tente buscar por outros termos</p>
                      )}
                      {canManage && !searchQuery && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleNewPrompt(group.value)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Prompt
                        </Button>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Editor Modal */}
      <PromptEditorModal
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        editingPrompt={editingPrompt}
        defaultCategory={defaultCategory}
      />

      {/* Delete Dialog */}
      <DeletePromptDialog
        promptId={deletePromptId}
        onClose={() => setDeletePromptId(null)}
      />
    </AppLayout>
  );
}
