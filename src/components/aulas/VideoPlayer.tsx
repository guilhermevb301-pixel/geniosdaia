import { BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  description?: string;
}

interface VideoPlayerProps {
  lesson: Lesson | null;
  onMarkComplete?: () => void;
}

export function VideoPlayer({ lesson, onMarkComplete }: VideoPlayerProps) {
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-card rounded-lg border border-border p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Selecione uma aula</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Escolha uma aula no menu ao lado para começar a assistir
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        {lesson.videoUrl ? (
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mx-auto mb-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Vídeo em breve</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{lesson.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{lesson.duration}</p>
          </div>
          {onMarkComplete && !lesson.completed && (
            <Button onClick={onMarkComplete} variant="accent" size="sm">
              Marcar como concluída
            </Button>
          )}
        </div>

        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </div>
    </div>
  );
}
