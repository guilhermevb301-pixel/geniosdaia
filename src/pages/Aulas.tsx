import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CourseProgress } from "@/components/aulas/CourseProgress";
import { ModuleGrid } from "@/components/aulas/ModuleGrid";

interface ModuleWithProgress {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  completedLessons: number;
  totalLessons: number;
}

export default function Aulas() {
  const { user } = useAuth();

  // Fetch modules
  const { data: modulesData } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch lessons
  const { data: lessonsData } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ["lesson_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Build modules with progress
  const modules: ModuleWithProgress[] = (modulesData || []).map((module) => {
    const moduleLessons = (lessonsData || []).filter(
      (lesson) => lesson.module_id === module.id
    );
    const completedLessons = moduleLessons.filter((lesson) =>
      progressData?.some((p) => p.lesson_id === lesson.id && p.completed)
    ).length;

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      cover_image_url: module.cover_image_url,
      order_index: module.order_index,
      completedLessons,
      totalLessons: moduleLessons.length,
    };
  });

  // Calculate total progress
  const totalLessons = modules.reduce((acc, m) => acc + m.totalLessons, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completedLessons, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Aulas</h1>
          <p className="text-sm text-muted-foreground">
            Seu curso de automação com n8n
          </p>
        </div>

        {/* Progress Bar */}
        <CourseProgress
          completedLessons={completedLessons}
          totalLessons={totalLessons}
        />

        {/* Module Grid */}
        <ModuleGrid modules={modules} />
      </div>
    </AppLayout>
  );
}
