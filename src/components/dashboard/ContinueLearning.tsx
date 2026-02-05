import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">
            Continuar de onde parou
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!modulesInProgress || modulesInProgress.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">
            Continuar de onde parou
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/aulas" className="text-xs">
              Ver todas
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Você ainda não começou nenhum módulo
            </p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link to="/aulas">Começar a estudar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Continuar de onde parou
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/aulas" className="text-xs">
            Ver todas
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {modulesInProgress.map((module) => (
          <Link
            key={module.id}
            to={`/aulas/${module.id}`}
            className="group relative overflow-hidden rounded-lg border border-border bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Thumbnail */}
            <div className="relative h-24 overflow-hidden">
              {module.cover_image_url ? (
                <img
                  src={module.cover_image_url}
                  alt={module.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={module.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(module.progress)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {module.completedLessons}/{module.totalLessons} aulas
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
