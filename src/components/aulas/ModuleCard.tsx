import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BookOpen, CheckCircle2, Lock } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface ModuleCardProps {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  completedLessons: number;
  totalLessons: number;
  orderIndex: number;
  priority?: boolean;
  locked?: boolean;
  buyUrl?: string;
}

export function ModuleCard({
  id,
  title,
  description,
  coverImageUrl,
  completedLessons,
  totalLessons,
  orderIndex,
  priority = false,
  locked = false,
  buyUrl,
}: ModuleCardProps) {
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isCompleted = totalLessons > 0 && completedLessons === totalLessons;

  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (buyUrl) window.open(buyUrl, "_blank", "noopener,noreferrer");
  };

  const cardContent = (
    <Card className={`group overflow-hidden transition-all duration-300 h-full ${locked ? "cursor-pointer opacity-70" : "hover:scale-[1.02] hover:shadow-lg cursor-pointer"}`}>
      <div className="relative">
        <AspectRatio ratio={3 / 4}>
          {coverImageUrl ? (
            <ImageWithSkeleton
              src={coverImageUrl}
              alt={title}
              className={`transition-transform duration-300 ${locked ? "grayscale" : "group-hover:scale-105"}`}
              containerClassName="h-full w-full"
              fallbackIcon={<BookOpen className="h-12 w-12 text-primary/40" />}
              optimizedWidth={500}
              optimizedQuality={80}
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </AspectRatio>

        {locked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Bloqueado</span>
          </div>
        )}

        {!locked && isCompleted && (
          <Badge className="absolute right-2 top-2 bg-primary hover:bg-primary/90">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completo
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-3">
          <span className="text-xs font-medium text-muted-foreground">
            Módulo {orderIndex + 1}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className={`font-semibold line-clamp-2 transition-colors ${locked ? "text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        {!locked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedLessons}/{totalLessons} aulas
              </span>
              <span className="font-medium text-primary">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (locked) {
    return <div onClick={handleLockedClick}>{cardContent}</div>;
  }

  return <Link to={`/aulas/${id}`}>{cardContent}</Link>;
}
