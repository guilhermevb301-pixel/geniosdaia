import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Primeiro nome do aluno. Cai para o início do e-mail apenas quando ele
 * parece um nome de verdade — "joao@..." vira "Joao", mas "guilhermevb301@..."
 * é descartado para não saudar o aluno com um usuário cheio de números.
 */
function firstNameOf(fullName?: string | null, email?: string | null): string | null {
  const fromName = fullName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;

  const fromEmail = email?.split("@")[0]?.split(/[.+_-]/)[0];
  if (!fromEmail || !/^[a-zà-ú]{2,}$/i.test(fromEmail)) return null;
  return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1);
}

export function WelcomeHero() {
  const { user } = useAuth();

  // Nome salvo no perfil, quando existir
  const { data: profile } = useQuery({
    queryKey: ["user_profile_name", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

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

  const name = firstNameOf(
    profile?.display_name ?? (user?.user_metadata?.full_name as string | undefined),
    user?.email,
  );
  const lesson = lastLesson?.lessons as { title: string; module_id: string } | null | undefined;

  return (
    <section className="relative overflow-hidden">
      <div className="space-y-3">
        <p className="eyebrow text-primary">{greeting()}</p>
        <h1>{name ? `Olá, ${name}` : "Olá"}</h1>
        <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          {lesson
            ? "Você parou no meio de uma aula — continue de onde parou."
            : "Comece pelo primeiro módulo e monte seu primeiro agente ainda hoje."}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to={lesson ? `/aulas/${lesson.module_id}` : "/aulas"}>
            <Play className="h-4 w-4" />
            {lesson ? "Continuar assistindo" : "Começar agora"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/aulas">
            Ver todos os módulos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="rule mt-10" />
    </section>
  );
}
