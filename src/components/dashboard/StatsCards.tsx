import { useQuery } from "@tanstack/react-query";
import { BookOpen, Download, MessageSquare, Calendar } from "lucide-react";
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
      color: "text-primary",
      bgColor: "bg-primary/10",
      isLoading: loadingLessons,
    },
    {
      label: "Downloads de Templates",
      value: totalDownloads,
      icon: Download,
      color: "text-accent",
      bgColor: "bg-accent/10",
      isLoading: loadingDownloads,
    },
    {
      label: "Prompts Disponíveis",
      value: totalPrompts,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      isLoading: loadingPrompts,
    },
    {
      label: "Módulos no Curso",
      value: totalModules,
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      isLoading: loadingModules,
    },
  ];

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] group"
        >
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl md:text-3xl font-bold tabular-nums">
                    {stat.value?.toLocaleString("pt-BR")}
                  </p>
                )}
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
              <div
                className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
