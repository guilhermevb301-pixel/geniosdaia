import { useQuery } from "@tanstack/react-query";
import { BookOpen, Download, MessageSquare, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function StatsCards() {
  const { user } = useAuth();

  // Total de aulas completadas pelo usuário
  const { data: completedLessons, isLoading: loadingLessons } = useQuery({
    queryKey: ["completedLessons", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Total de downloads de templates
  const { data: totalDownloads, isLoading: loadingDownloads } = useQuery({
    queryKey: ["totalDownloads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("downloads_count");
      return data?.reduce((acc, t) => acc + (t.downloads_count || 0), 0) || 0;
    },
  });

  // Total de prompts disponíveis
  const { data: totalPrompts, isLoading: loadingPrompts } = useQuery({
    queryKey: ["totalPrompts"],
    queryFn: async () => {
      const { count } = await supabase
        .from("prompts")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Total de módulos
  const { data: totalModules, isLoading: loadingModules } = useQuery({
    queryKey: ["totalModules"],
    queryFn: async () => {
      const { count } = await supabase
        .from("modules")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const stats = [
    {
      label: "Aulas Concluídas",
      value: completedLessons,
      icon: BookOpen,
      isLoading: loadingLessons,
    },
    {
      label: "Downloads de Templates",
      value: totalDownloads,
      icon: Download,
      isLoading: loadingDownloads,
    },
    {
      label: "Prompts Disponíveis",
      value: totalPrompts,
      icon: MessageSquare,
      isLoading: loadingPrompts,
    },
    {
      label: "Módulos no Curso",
      value: totalModules,
      icon: Layers,
      isLoading: loadingModules,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="group relative overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-300 hover-scale card-glow"
        >
          {/* Subtle glow overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardContent className="relative p-5 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {stat.isLoading ? (
                  <Skeleton className="h-10 w-20 mb-2" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold tabular-nums text-gradient">
                    {stat.value?.toLocaleString("pt-BR")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {stat.label}
                </p>
              </div>
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:glow-sm">
                <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-primary transition-all duration-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
