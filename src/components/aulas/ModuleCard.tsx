import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface ModuleCardProps {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  completedLessons: number;
  totalLessons: number;
  orderIndex: number;
}

export function ModuleCard({
  id,
  title,
  description,
  coverImageUrl,
  completedLessons,
  totalLessons,
  orderIndex,
}: ModuleCardProps) {
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isCompleted = totalLessons > 0 && completedLessons === totalLessons;

  return (
    <Link to={`/aulas/${id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer h-full">
        <div className="relative">
          <AspectRatio ratio={3 / 4}>
            {coverImageUrl ? (
              <ImageWithSkeleton
                src={coverImageUrl}
                alt={title}
                className="transition-transform duration-300 group-hover:scale-105"
                containerClassName="h-full w-full"
                fallbackIcon={<BookOpen className="h-12 w-12 text-primary/40" />}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <BookOpen className="h-12 w-12 text-primary/40" />
              </div>
            )}
          </AspectRatio>
          
          {isCompleted && (
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
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>

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
        </CardContent>
      </Card>
    </Link>
  );
}
