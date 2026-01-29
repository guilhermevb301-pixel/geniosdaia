import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ModuleProgress {
  id: string;
  title: string;
  cover_image_url: string | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

export function ContinueLearning() {
  const { user } = useAuth();

  const { data: modulesInProgress, isLoading } = useQuery({
    queryKey: ["modulesInProgress", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar módulos
      const { data: modules } = await supabase
        .from("modules")
        .select("id, title, cover_image_url")
        .order("order_index");

      if (!modules) return [];

      // Buscar progresso do usuário
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);

      // Buscar todas as aulas
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, module_id");

      if (!lessons) return [];

      const progressMap = new Map(
        progress?.map((p) => [p.lesson_id, p.completed]) || []
      );

      const modulesWithProgress: ModuleProgress[] = modules.map((module) => {
        const moduleLessons = lessons.filter((l) => l.module_id === module.id);
        const completedLessons = moduleLessons.filter(
          (l) => progressMap.get(l.id)
        ).length;
        const totalLessons = moduleLessons.length;
        const progressPercent =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          id: module.id,
          title: module.title,
          cover_image_url: module.cover_image_url,
          totalLessons,
          completedLessons,
          progress: progressPercent,
        };
      });

      // Filtrar módulos em progresso (iniciados mas não completos)
      return modulesWithProgress
        .filter((m) => m.progress > 0 && m.progress < 100)
        .slice(0, 3);
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">
            Continuar de onde parou
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!modulesInProgress || modulesInProgress.length === 0) {
    return (
      <Card className="bg-card border-border card-glow">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">
            Continuar de onde parou
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
            <Link to="/aulas">
              Ver todas
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-sm">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Você ainda não começou nenhum módulo
            </p>
            <Button variant="link" asChild className="mt-2 text-primary">
              <Link to="/aulas">Começar a estudar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border card-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">
          Continuar de onde parou
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
          <Link to="/aulas">
            Ver todas
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {modulesInProgress.map((module) => (
          <Link
            key={module.id}
            to={`/aulas/${module.id}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-secondary/50 hover:border-primary/50 transition-all duration-300 hover-scale"
          >
            {/* Thumbnail */}
            <div className="relative h-28 overflow-hidden">
              {module.cover_image_url ? (
                <img
                  src={module.cover_image_url}
                  alt={module.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center glow-primary">
                  <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={module.progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums font-medium">
                  {Math.round(module.progress)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {module.completedLessons}/{module.totalLessons} aulas
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
