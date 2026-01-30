import { useState } from "react";
import { BookOpen, Play, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  // Handle YouTube embed URLs
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];

  // Handle youtu.be URLs
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch URLs
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  return null;
}

export function VideoPlayer({ lesson, onMarkComplete }: VideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

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

  const videoId = lesson.videoUrl ? extractYouTubeId(lesson.videoUrl) : null;
  const isYouTubeVideo = !!videoId;

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        {lesson.videoUrl ? (
          isYouTubeVideo && !showVideo ? (
            // Lite YouTube Embed - Show thumbnail until clicked
            <button
              onClick={() => setShowVideo(true)}
              className="relative w-full h-full group cursor-pointer"
              aria-label="Reproduzir vídeo"
            >
              {/* Skeleton while thumbnail loads */}
              {!thumbnailLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              
              {/* YouTube Thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={lesson.title}
                loading="lazy"
                decoding="async"
                onLoad={() => setThumbnailLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  thumbnailLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-110 transition-all shadow-lg">
                  <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
                </div>
              </div>
            </button>
          ) : (
            // Full iframe - either non-YouTube or user clicked to play
            <iframe
              src={isYouTubeVideo 
                ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` 
                : lesson.videoUrl
              }
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
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
