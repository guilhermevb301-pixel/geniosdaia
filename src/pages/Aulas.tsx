import { RefreshCw, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionGrid } from "@/components/aulas/SectionGrid";
import { Button } from "@/components/ui/button";
import { useCourseLibrary } from "@/hooks/useCourseLibrary";

const BUY_URLS: Readonly<Record<string, string>> = {
  "genios-ia": "https://pay.kiwify.com.br/dZG6AiO",
  "agente-atendimento": "https://pay.kiwify.com.br/gg698sf",
  "videos-cinematograficos": "https://pay.kiwify.com.br/a8LzNm8",
  "fotos-profissionais": "https://pay.kiwify.com.br/HdtzNv8",
  "influencer-ia": "https://pay.kiwify.com.br/Itaz5PH",
  "clone-criativo": "https://pay.kiwify.com.br/vcFgUbO",
};

export default function Aulas() {
  const { sections, isLoading, isError, refetch } = useCourseLibrary();

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="flex flex-col justify-between gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-primary">Biblioteca</p>
            <h1 className="mt-2">Aulas</h1>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              Escolha uma sessão e avance com clareza, módulo por módulo.
            </p>
          </div>
          {!isLoading && !isError && (
            <p className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">{sections.length}</strong>{" "}
              sessões
            </p>
          )}
        </header>

        <div className="pt-7 md:pt-8">
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
                  Houve uma falha temporária ao buscar o conteúdo. Tente novamente.
                </p>
                <Button type="button" variant="outline" onClick={() => void refetch()} className="mt-6 h-11">
                  <RefreshCw aria-hidden="true" />
                  Tentar novamente
                </Button>
              </div>
            </section>
          ) : isLoading ? (
            <SectionGrid sections={[]} isLoading />
          ) : sections.length > 0 ? (
            <SectionGrid sections={sections} buyUrls={BUY_URLS} />
          ) : (
            <section className="surface px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-foreground">Nenhuma sessão disponível</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                O conteúdo da biblioteca ainda está sendo organizado.
              </p>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
