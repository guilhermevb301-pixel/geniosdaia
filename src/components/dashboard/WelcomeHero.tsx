import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import guiHero from "@/assets/gui-hero.jpg";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function WelcomeHero() {
  const { user } = useAuth();

  // Última aula assistida, para o CTA principal
  const { data: lastLesson } = useQuery({
    queryKey: ["last_lesson", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, updated_at, lessons(title, module_id)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const lesson = lastLesson?.lessons as { title: string; module_id: string } | null | undefined;

  return (
    <section className="relative overflow-hidden rounded-lg border border-primary/20 bg-card">
      {/* Foto à direita, com fade para o fundo do card */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block">
        <img
          src={guiHero}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/70 to-transparent" />
      </div>

      {/* Brilho verde sutil atrás do texto */}
      <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 p-6 sm:max-w-[62%] md:p-8">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            Pronto pra colocar mais uma{" "}
            <span className="text-primary [font-size:inherit] [font-weight:inherit] [line-height:inherit]">
              IA pra trabalhar
            </span>{" "}
            hoje?
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {lesson
              ? "Você parou no meio de uma aula. Continue de onde parou."
              : "Comece pelo primeiro módulo e monte seu primeiro agente ainda hoje."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to={lesson ? `/aulas/${lesson.module_id}` : "/aulas"}>
              <Play className="h-4 w-4" />
              {lesson ? "Continuar assistindo" : "Começar agora"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/aulas">
              Ver todos os módulos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
