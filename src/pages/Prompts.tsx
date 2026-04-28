import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompts/PromptCard";
import { ModifierCard } from "@/components/prompts/ModifierCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useIsMentor } from "@/hooks/useIsMentor";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
  is_locked: boolean;
  created_at: string;
  variations?: {
    id: string;
    content: string;
    image_url: string | null;
    video_url: string | null;
    order_index: number;
  }[];
}

type ActiveTab = "all" | PromptCategory;

const TABS: { value: ActiveTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "modifier", label: "Modificador" },
];

export default function Prompts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
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

  const filtered = useMemo(() => {
    if (!prompts) return [];
    let list = [...prompts];
    if (activeTab !== "all") {
      list = list.filter((p) => p.category === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prompts, activeTab, searchQuery]);

  // Preload first 8 critical images for performance
  const criticalImages = useMemo(
    () => filtered.slice(0, 8).map((p) => p.thumbnail_url).filter(Boolean),
    [filtered]
  );
  useImagePreload(criticalImages, { width: 400 });

  const handleNewPrompt = () => {
    setEditingPrompt(null);
    setDefaultCategory(activeTab === "all" ? "image" : (activeTab as PromptCategory));
    setIsEditorOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt as PromptData);
    setDefaultCategory(prompt.category);
    setIsEditorOpen(true);
  };

  const counts = useMemo(() => {
    if (!prompts) return {} as Record<ActiveTab, number>;
    return {
      all: prompts.length,
      image: prompts.filter((p) => p.category === "image").length,
      video: prompts.filter((p) => p.category === "video").length,
      modifier: prompts.filter((p) => p.category === "modifier").length,
    };
  }, [prompts]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Banco de Prompts</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Prompts prontos para usar com IAs de geração de conteúdo
            </p>
          </div>
          {canManage && (
            <Button onClick={handleNewPrompt} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Prompt
            </Button>
          )}
        </div>

        {/* ── Search bar ────────────────────────────────────── */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* ── Category tabs ─────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  activeTab === tab.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }
              `}
            >
              {tab.label}
              {counts[tab.value] !== undefined && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${activeTab === tab.value ? "bg-white/20" : "bg-muted"}
                  `}
                >
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">Nenhum prompt encontrado</p>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Tente buscar por outros termos" : "Nenhum prompt nesta categoria ainda"}
            </p>
            {canManage && !searchQuery && (
              <Button variant="outline" size="sm" onClick={handleNewPrompt} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar Prompt
              </Button>
            )}
          </div>
        ) : activeTab === "modifier" ? (
          // Modifier: single-column list
          <div className="space-y-3 max-w-2xl">
            {filtered.map((prompt) => (
              <ModifierCard
                key={prompt.id}
                prompt={prompt}
                canManage={canManage}
                onEdit={() => handleEditPrompt(prompt)}
                onDelete={() => setDeletePromptId(prompt.id)}
              />
            ))}
          </div>
        ) : (
          // Image / Video / All: portrait grid
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((prompt, index) => (
              <div key={prompt.id} className="relative group">
                <PromptCard
                  prompt={prompt}
                  priority={index < 8}
                  canManage={canManage}
                  onEdit={() => handleEditPrompt(prompt)}
                  onDelete={() => setDeletePromptId(prompt.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <PromptEditorModal
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        editingPrompt={editingPrompt}
        defaultCategory={defaultCategory}
      />

      <DeletePromptDialog
        promptId={deletePromptId}
        onClose={() => setDeletePromptId(null)}
      />
    </AppLayout>
  );
}
