import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CourseProgress } from "@/components/aulas/CourseProgress";
import { ModuleGrid } from "@/components/aulas/ModuleGrid";

interface ModuleSection {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
}

interface ModuleWithProgress {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  section_id: string | null;
  completedLessons: number;
  totalLessons: number;
}

interface SectionGroup {
  section: ModuleSection;
  modules: ModuleWithProgress[];
}

export default function Aulas() {
  const { user } = useAuth();

  // Fetch sections
  const { data: sectionsData } = useQuery({
    queryKey: ["module_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_sections")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as ModuleSection[];
    },
  });

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
      section_id: module.section_id,
      completedLessons,
      totalLessons: moduleLessons.length,
    };
  });

  // Group modules by section
  const modulesWithoutSection = modules.filter((m) => !m.section_id);
  const sectionGroups: SectionGroup[] = (sectionsData || [])
    .map((section) => ({
      section,
      modules: modules
        .filter((m) => m.section_id === section.id)
        .sort((a, b) => a.order_index - b.order_index),
    }))
    .filter((group) => group.modules.length > 0);

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

        {/* Modules organized by sections */}
        <div className="space-y-8">
          {/* Modules without section first */}
          {modulesWithoutSection.length > 0 && (
            <ModuleGrid modules={modulesWithoutSection} />
          )}

          {/* Section groups with their modules */}
          {sectionGroups.map(({ section, modules: sectionModules }) => (
            <div key={section.id} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <ModuleGrid modules={sectionModules} />
            </div>
          ))}

          {/* Empty state when no modules at all */}
          {modules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <span className="text-4xl">📚</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Sem módulos disponíveis</h2>
              <p className="text-muted-foreground max-w-md">
                Os módulos ainda não foram adicionados. Aguarde o administrador adicionar o conteúdo.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
