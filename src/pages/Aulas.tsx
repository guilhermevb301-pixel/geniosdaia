import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CourseProgress } from "@/components/aulas/CourseProgress";
import { ModuleAccordion } from "@/components/aulas/ModuleAccordion";
import { VideoPlayer } from "@/components/aulas/VideoPlayer";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  description?: string;
  downloadUrl?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function Aulas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_progress", user?.id] });
    },
  });

  // Convert YouTube URL to embed URL
  function getYouTubeEmbedUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url;
  }

  // Build modules with lessons and progress
  const modules: Module[] = (modulesData || []).map((module) => {
    const moduleLessons = (lessonsData || [])
      .filter((lesson) => lesson.module_id === module.id)
      .map((lesson) => {
        const progress = progressData?.find((p) => p.lesson_id === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "",
          completed: progress?.completed || false,
          videoUrl: getYouTubeEmbedUrl(lesson.youtube_url),
          description: lesson.description || undefined,
          downloadUrl: lesson.download_url || undefined,
        };
      });

    return {
      id: module.id,
      title: module.title,
      lessons: moduleLessons,
    };
  });

  // Calculate progress
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (selectedLesson) {
      markCompleteMutation.mutate(selectedLesson.id);
      // Update local state immediately
      setSelectedLesson({ ...selectedLesson, completed: true });
    }
  };

  // No modules message
  if (modulesData && modulesData.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sem aulas disponíveis</h2>
          <p className="text-muted-foreground max-w-md">
            As aulas ainda não foram adicionadas. Aguarde o administrador adicionar o conteúdo.
          </p>
        </div>
      </AppLayout>
    );
  }

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

        {/* Split Layout */}
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Left Column - Progress & Modules */}
          <div className="space-y-4">
            <CourseProgress
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
            <ModuleAccordion
              modules={modules}
              selectedLessonId={selectedLesson?.id || null}
              onSelectLesson={handleSelectLesson}
            />
          </div>

          {/* Right Column - Video Player */}
          <div>
            <VideoPlayer
              lesson={selectedLesson}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
