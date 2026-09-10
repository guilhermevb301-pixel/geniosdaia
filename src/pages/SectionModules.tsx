import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleGrid } from "@/components/aulas/ModuleGrid";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseLibrary } from "@/hooks/useCourseLibrary";
import { getSectionPresentation } from "@/lib/sectionCoverImages";

export default function SectionModules() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { sections, isLoading, isError, refetch } = useCourseLibrary();
  const section = sections.find((candidate) => candidate.id === sectionId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto w-full max-w-[1440px] space-y-8">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (section?.locked) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (isError) {
    return (
      <AppLayout>
        <section role="alert" className="surface mx-auto max-w-2xl px-6 py-10">
          <TriangleAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
          <h1 className="mt-5 text-2xl text-foreground">Não foi possível abrir esta sessão.</h1>
          <Button variant="outline" onClick={() => void refetch()} className="mt-6 h-11">
            <RefreshCw aria-hidden="true" />
            Tentar novamente
          </Button>
        </section>
      </AppLayout>
    );
  }

  if (!section) {
    return (
      <AppLayout>
        <section className="surface mx-auto max-w-2xl px-6 py-12 text-center">
          <h1 className="text-2xl text-foreground">Sessão não encontrada</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Este conteúdo pode ter sido reorganizado.
          </p>
          <Button asChild variant="outline" className="mt-6 h-11">
            <Link to="/aulas">Voltar para Aulas</Link>
          </Button>
        </section>
      </AppLayout>
    );
  }

  if (section.title.trim().toLocaleLowerCase("pt-BR") === "mentorias em grupo" && section.modules[0]) {
    return <Navigate to={`/aulas/${section.modules[0].id}`} replace />;
  }

  const presentation = getSectionPresentation(section.productSlug, section.title);
  const title = presentation?.title ?? section.title;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1440px]">
        <Link
          to="/aulas"
          className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Todas as sessões
        </Link>

        <header className="mt-7 flex flex-col justify-between gap-6 border-b border-border/70 pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-primary">Sessão</p>
            <h1 className="mt-2 text-balance">{title}</h1>
            {presentation?.description && (
              <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                {presentation.description}
              </p>
            )}
          </div>

          <div className="w-full max-w-sm">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{section.completedLessons} de {section.totalLessons} aulas concluídas</span>
              <span>{section.progressPercent}%</span>
            </div>
            <Progress
              value={section.progressPercent}
              aria-label={`Progresso da sessão ${title}`}
              className="h-1"
            />
          </div>
        </header>

        <section aria-label={`Módulos de ${title}`} className="pt-8">
          {section.modules.length > 0 ? (
            <ModuleGrid modules={section.modules} productSlug={section.productSlug} />
          ) : (
            <div className="surface px-6 py-12 text-center text-sm text-muted-foreground">
              Esta sessão ainda não possui módulos.
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
