import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProducts, type ProductSlug } from "@/hooks/useUserProducts";
import { Button } from "@/components/ui/button";

/** Aponta para o próximo módulo liberado que o aluno ainda não concluiu. */
export function NextStepCard() {
  const { user } = useAuth();
  const { hasProduct, isLoading: isLoadingProducts } = useUserProducts();

  const { data, isLoading } = useQuery({
    queryKey: ["next_step", user?.id],
    queryFn: async () => {
      const [{ data: sections }, { data: modules }, { data: lessons }, { data: progress }] =
        await Promise.all([
          supabase.from("module_sections").select("*").order("order_index"),
          supabase.from("modules").select("*").order("order_index"),
          supabase.from("lessons").select("id, module_id"),
          user
            ? supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id)
            : Promise.resolve({ data: [] as { lesson_id: string; completed: boolean }[] }),
        ]);
      return { sections: sections ?? [], modules: modules ?? [], lessons: lessons ?? [], progress: progress ?? [] };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (isLoading || isLoadingProducts || !data) {
    return <div className="h-14 animate-pulse rounded-lg bg-muted" />;
  }

  const sectionById = new Map(data.sections.map((s) => [s.id, s]));
  const completedLessonIds = new Set(
    data.progress.filter((p) => p.completed).map((p) => p.lesson_id),
  );

  const candidates = data.modules
    .map((m) => {
      const section = m.section_id ? sectionById.get(m.section_id) : undefined;
      const moduleLessons = data.lessons.filter((l) => l.module_id === m.id);
      const completed = moduleLessons.filter((l) => completedLessonIds.has(l.id)).length;
      return {
        ...m,
        totalLessons: moduleLessons.length,
        completedLessons: completed,
        locked: !!section?.product_slug && !hasProduct(section.product_slug as ProductSlug),
        sectionOrder: section?.order_index ?? 0,
      };
    })
    .filter((m) => !m.locked)
    .sort((a, b) => a.sectionOrder - b.sectionOrder || a.order_index - b.order_index);

  const next = candidates.find((m) => m.completedLessons < m.totalLessons) ?? candidates[0];

  if (!next) return null;

  const isStarted = next.completedLessons > 0;

  return (
    <Link
      to={`/aulas/${next.id}`}
      className="group/next flex items-center justify-between gap-4 rounded-lg border border-primary/25 bg-card px-6 py-4 transition-colors hover:border-primary/45"
    >
      <div className="min-w-0">
        <p className="eyebrow mb-1 text-primary">
          {isStarted ? "Continue de onde parou" : "Seu próximo passo"}
        </p>
        <p className="truncate text-[15px] font-medium">{next.title}</p>
      </div>
      <Button size="sm" className="shrink-0" tabIndex={-1}>
        <Play className="h-3.5 w-3.5" />
        {isStarted ? "Continuar" : "Começar"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Link>
  );
}
