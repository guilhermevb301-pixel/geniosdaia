import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Play, RefreshCw, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProducts, type ProductSlug } from "@/hooks/useUserProducts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/** Aponta para o próximo módulo liberado que o aluno ainda não concluiu. */
export function NextStepCard() {
  const { user } = useAuth();
  const { hasProduct, isLoading: isLoadingProducts } = useUserProducts();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["next_step", user?.id],
    queryFn: async () => {
      const [sectionsResult, modulesResult, lessonsResult, progressResult] = await Promise.all([
        supabase.from("module_sections").select("*").order("order_index"),
        supabase.from("modules").select("*").order("order_index"),
        supabase.from("lessons").select("id, module_id"),
        user
          ? supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id)
          : Promise.resolve({
              data: [] as { lesson_id: string; completed: boolean }[],
              error: null,
            }),
      ]);
      const error =
        sectionsResult.error ||
        modulesResult.error ||
        lessonsResult.error ||
        progressResult.error;

      if (error) throw error;

      const { data: sections } = sectionsResult;
      const { data: modules } = modulesResult;
      const { data: lessons } = lessonsResult;
      const { data: progress } = progressResult;
      return { sections: sections ?? [], modules: modules ?? [], lessons: lessons ?? [], progress: progress ?? [] };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <section
        role="alert"
        aria-labelledby="next-step-error-title"
        className="surface flex min-h-[180px] flex-col justify-between border-destructive/30 p-6"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <p className="micro-label text-destructive">Próximo passo indisponível</p>
            <h2 id="next-step-error-title" className="mt-2 text-lg text-foreground">
              Não foi possível carregar seu próximo passo.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente atualizar este card em alguns instantes.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          className="mt-5 w-fit"
        >
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      </section>
    );
  }

  if (isLoading || isLoadingProducts || !data) {
    return <div className="h-[292px] animate-pulse rounded-lg bg-muted" />;
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

  if (!next) {
    return (
      <Link
        to="/aulas"
        aria-label="Ver todas as aulas"
        className="interactive-surface focus-ring group/next flex min-h-[292px] flex-col justify-between overflow-hidden border-primary/25 p-6 sm:p-8"
      >
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="micro-label text-primary">Biblioteca de aulas</span>
            <span className="surface-raised flex h-10 w-10 shrink-0 items-center justify-center text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>

          <h2 className="mt-8 max-w-[18ch] text-2xl text-foreground sm:text-3xl">
            Escolha o que aprender agora
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Explore os módulos disponíveis e defina seu próximo passo.
          </p>
        </div>

        <span className="mt-8 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-5 font-medium text-primary-foreground transition-transform duration-200 group-hover/next:-translate-y-0.5">
          Ver todas as aulas
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    );
  }

  const isStarted = next.completedLessons > 0;
  const progress = next.totalLessons > 0
    ? Math.round((next.completedLessons / next.totalLessons) * 100)
    : 0;

  return (
    <Link
      to={`/aulas/${next.id}`}
      className="interactive-surface focus-ring group/next flex min-h-[292px] flex-col justify-between overflow-hidden border-primary/25 p-6 sm:p-8"
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="micro-label text-primary">
            {isStarted ? "Continue de onde parou" : "Seu próximo passo"}
          </span>
          <span className="surface-raised flex h-10 w-10 shrink-0 items-center justify-center text-primary">
            <Play className="h-4 w-4 fill-current" />
          </span>
        </div>

        <h2 className="mt-8 max-w-[18ch] text-2xl text-foreground sm:text-3xl">
          {next.title}
        </h2>
      </div>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>{next.completedLessons} de {next.totalLessons} aulas</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-medium text-primary-foreground transition-transform duration-200 group-hover/next:-translate-y-0.5">
          {isStarted ? "Continuar" : "Começar"}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
