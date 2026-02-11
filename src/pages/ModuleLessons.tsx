import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoPlayer } from "@/components/aulas/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/notes/FavoriteButton";
import { NotesSidebar } from "@/components/notes/NotesSidebar";
import { CelebrationModal } from "@/components/certificates/CelebrationModal";
import { useCertificates } from "@/hooks/useCertificates";
import { useUserXP } from "@/hooks/useUserXP";
import { XP_REWARDS } from "@/lib/gamification";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  description?: string;
  downloadUrl?: string;
}

export default function ModuleLessons() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newCertificateCode, setNewCertificateCode] = useState("");
  
  const { issueCertificate, hasCertificate } = useCertificates();
  const { addXP } = useUserXP();

  // Fetch module info
  const { data: module } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
  });

  // Fetch lessons for this module
  const { data: lessonsData } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
    placeholderData: keepPreviousData,
  });

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ["lesson_progress", user?.id, moduleId],
    queryFn: async () => {
      if (!user || !lessonsData) return [];
      const lessonIds = lessonsData.map((l) => l.id);
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!lessonsData,
    placeholderData: keepPreviousData,
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
      
      // Add XP for lesson completion
      addXP({ amount: XP_REWARDS.LESSON_COMPLETED, actionType: "lesson_completed", referenceId: lessonId });
      
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lesson_progress"] });
      
      // Check if module is now complete
      if (moduleId && module && !hasCertificate(moduleId)) {
        const updatedProgress = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user!.id)
          .in("lesson_id", lessonsData!.map((l) => l.id));
        
        const completedCount = updatedProgress.data?.filter((p) => p.completed).length || 0;
        
        if (completedCount === lessonsData!.length) {
          // All lessons complete - issue certificate
          issueCertificate({
            moduleId,
            userName: user!.email?.split("@")[0] || "Aluno",
            moduleTitle: module.title,
            moduleDuration: module.description || undefined,
          }, {
            onSuccess: (result: { certificate_code?: string; alreadyExists?: boolean }) => {
              if (result && !result.alreadyExists && result.certificate_code) {
                setNewCertificateCode(result.certificate_code);
                setShowCelebration(true);
                addXP({ amount: XP_REWARDS.MODULE_COMPLETED, actionType: "module_completed", referenceId: moduleId });
              }
            }
          });
        }
      }
    },
  });

  // Convert YouTube URL to embed URL
  function getYouTubeEmbedUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
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

  // Build lessons with progress
  const lessons: Lesson[] = (lessonsData || []).map((lesson) => {
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

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (selectedLesson) {
      markCompleteMutation.mutate(selectedLesson.id);
      setSelectedLesson({ ...selectedLesson, completed: true });
    }
  };

  // Calculate progress
  const completedLessons = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;

  if (!module) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/aulas">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">{module.title}</h1>
              <p className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons} aulas completadas
              </p>
            </div>
          </div>
          
          {/* Favorite & Notes buttons */}
          {selectedLesson && (
            <div className="flex items-center gap-2">
              <FavoriteButton lessonId={selectedLesson.id} size="sm" />
              <NotesSidebar lessonId={selectedLesson.id} lessonTitle={selectedLesson.title} />
            </div>
          )}
        </div>

        {/* Split Layout */}
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Left Column - Lesson List */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="p-2">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        selectedLesson?.id === lesson.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : selectedLesson?.id === lesson.id ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          lesson.completed && "text-muted-foreground"
                        )}>
                          {index + 1}. {lesson.title}
                        </p>
                        {lesson.duration && (
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Column - Video Player */}
          <div>
            <VideoPlayer
              lesson={selectedLesson}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        moduleName={module.title}
        certificateCode={newCertificateCode}
      />
    </AppLayout>
  );
}
