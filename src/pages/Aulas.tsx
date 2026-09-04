import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ModuleCarousel } from "@/components/aulas/ModuleCarousel";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useUserProducts, type ProductSlug } from "@/hooks/useUserProducts";
import { getSectionIcon } from "@/lib/sectionIcons";
import { getModuleCover } from "@/lib/moduleCoverCatalog";

const BUY_URLS: Record<string, string> = {
  "genios-ia": "https://pay.kiwify.com.br/dZG6AiO",
  "agente-atendimento": "https://pay.kiwify.com.br/gg698sf",
  "videos-cinematograficos": "https://pay.kiwify.com.br/a8LzNm8",
  "fotos-profissionais": "https://pay.kiwify.com.br/HdtzNv8",
  "influencer-ia": "https://pay.kiwify.com.br/Itaz5PH",
  "clone-criativo": "https://pay.kiwify.com.br/vcFgUbO",
};

interface ModuleSection {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
  product_slug: string | null;
}

interface ModuleWithProgress {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  section_id: string | null;
  completedLessons: number;
  totalLessons: number;
}

interface SectionGroup {
  section: ModuleSection;
  modules: ModuleWithProgress[];
}

export default function Aulas() {
  const { user } = useAuth();
  const { hasProduct, isLoading: isLoadingProducts } = useUserProducts();

  // Fetch sections
  const {
    data: sectionsData,
    isError: isSectionsError,
    isLoading: isLoadingSections,
    refetch: refetchSections,
  } = useQuery({
    queryKey: ["module_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_sections")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as ModuleSection[];
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Fetch modules
  const {
    data: modulesData,
    isError: isModulesError,
    isLoading: isLoadingModules,
    refetch: refetchModules,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Fetch lessons
  const {
    data: lessonsData,
    isError: isLessonsError,
    isLoading: isLoadingLessons,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Fetch user progress
  const {
    data: progressData,
    isError: isProgressError,
    isLoading: isLoadingProgress,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ["lesson_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const isLoading =
    isLoadingModules ||
    isLoadingLessons ||
    isLoadingSections ||
    isLoadingProgress ||
    isLoadingProducts;
  const isError = isSectionsError || isModulesError || isLessonsError || isProgressError;

  const handleRetry = () => {
    void Promise.all([
      refetchSections(),
      refetchModules(),
      refetchLessons(),
      refetchProgress(),
    ]);
  };

  const isSectionLocked = (section: ModuleSection): boolean => {
    if (!section.product_slug) return false;
    return !hasProduct(section.product_slug as ProductSlug);
  };

  // Build modules with progress
  const modules: ModuleWithProgress[] = (modulesData || []).map((module) => {
    const moduleLessons = (lessonsData || []).filter(
      (lesson) => lesson.module_id === module.id
    );
    const completedLessons = moduleLessons.filter((lesson) =>
      progressData?.some((p) => p.lesson_id === lesson.id && p.completed)
    ).length;

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      cover_image_url: module.cover_image_url,
      order_index: module.order_index,
      section_id: module.section_id,
      completedLessons,
      totalLessons: moduleLessons.length,
    };
  });

  // Group modules by section
  const modulesWithoutSection = modules.filter((m) => !m.section_id);
  const sectionGroups: SectionGroup[] = (sectionsData || [])
    .map((section) => ({
      section,
      modules: modules
        .filter((m) => m.section_id === section.id)
        .sort((a, b) => a.order_index - b.order_index),
    }))
    .filter((group) => group.modules.length > 0);

  const firstVisibleGroup = modulesWithoutSection.length === 0 ? sectionGroups[0] : undefined;
  const firstVisibleModules = modulesWithoutSection.length > 0
    ? modulesWithoutSection
    : firstVisibleGroup?.modules ?? [];
  const coverUrls = firstVisibleModules
    .filter(
      (module) =>
        !getModuleCover({
          moduleId: module.id,
          productSlug: firstVisibleGroup?.section.product_slug ?? null,
          orderIndex: module.order_index,
        }),
    )
    .map((module) => module.cover_image_url);
  useImagePreload(coverUrls, { width: 200, quality: 50, maxPreload: 5 });

  return (
    <AppLayout>
      <div>
        {/* Header */}
        <div className="space-y-3">
          <p className="eyebrow text-primary">Biblioteca</p>
          <h1>Aulas</h1>
          <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            Tudo que você precisa para colocar IA pra trabalhar no seu negócio.
          </p>
        </div>

        <div className="rule my-6 md:my-8" />

        {isError ? (
          <section
            role="alert"
            aria-labelledby="aulas-error-title"
            className="surface relative overflow-hidden border-destructive/30 px-6 py-10 sm:px-10"
          >
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-destructive/70" />
            <div className="max-w-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert aria-hidden="true" className="h-5 w-5" />
              </span>
              <p className="micro-label mt-6 text-destructive">Biblioteca indisponível</p>
              <h2 id="aulas-error-title" className="mt-3 text-2xl text-foreground">
                Não foi possível carregar suas aulas.
              </h2>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Houve uma falha temporária ao buscar o conteúdo. Tente novamente para atualizar a biblioteca.
              </p>
              <Button type="button" variant="outline" onClick={handleRetry} className="mt-6 h-11">
                <RefreshCw aria-hidden="true" />
                Tentar novamente
              </Button>
            </div>
          </section>
        ) : (
          <>
            {/* Modules organized by sections */}
            <div className="space-y-12">
              {isLoading ? (
                <ModuleCarousel modules={[]} isLoading />
              ) : (
                <>
                  {/* Modules without section first */}
                  {modulesWithoutSection.length > 0 && (
                    <ModuleCarousel
                      modules={modulesWithoutSection}
                      title="Mais aulas"
                      prioritizeImages
                    />
                  )}

                  {/* Section groups with their modules */}
                  {sectionGroups.map(({ section, modules: sectionModules }, groupIndex) => {
                    const locked = isSectionLocked(section);
                    const buyUrl = section.product_slug ? BUY_URLS[section.product_slug] : undefined;
                    return (
                      <div key={section.id}>
                        <ModuleCarousel
                          modules={sectionModules}
                          title={section.title}
                          productSlug={section.product_slug}
                          locked={locked}
                          buyUrl={buyUrl}
                          sectionIconUrl={getSectionIcon(section.product_slug)}
                          prioritizeImages={modulesWithoutSection.length === 0 && groupIndex === 0}
                        />
                      </div>
                    );
                  })}

                  {/* Empty state when no modules at all */}
                  {modules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <span className="text-4xl">📚</span>
                      </div>
                      <h2 className="mb-2 text-2xl font-semibold">Sem módulos disponíveis</h2>
                      <p className="max-w-md text-muted-foreground">
                        Os módulos ainda não foram adicionados. Aguarde o administrador adicionar o conteúdo.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
