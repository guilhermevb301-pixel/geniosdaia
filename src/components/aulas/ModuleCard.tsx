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
  sectionIconUrl?: string | null;
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
  sectionIconUrl,
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
    <Card className={`group overflow-hidden transition-all duration-300 h-full ${locked ? "cursor-pointer opacity-70" : "hover:-translate-y-0.5 cursor-pointer"}`}>
      <div className="relative">
        <AspectRatio ratio={1}>
          {coverImageUrl ? (
            <ImageWithSkeleton
              src={coverImageUrl}
              alt={title}
              className={`transition-transform duration-500 ${locked ? "grayscale" : "group-hover:scale-105"}`}
              containerClassName="h-full w-full"
              fallbackIcon={
                sectionIconUrl ? (
                  <img src={sectionIconUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-8 w-8 text-primary/40" />
                )
              }
              optimizedWidth={300}
              optimizedQuality={80}
              priority={priority}
            />
          ) : sectionIconUrl ? (
            <img
              src={sectionIconUrl}
              alt={title}
              className={`h-full w-full object-cover transition-transform duration-300 ${locked ? "grayscale" : "group-hover:scale-105"}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-8 w-8 text-primary/40" />
            </div>
          )}
        </AspectRatio>

        {/* Vinheta escura + leve tint verde só nas bordas, mantendo a foto natural */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />

        {locked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5">
            <div className="rounded-full bg-muted p-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">Bloqueado</span>
          </div>
        )}

        {!locked && isCompleted && (
          <Badge className="absolute right-1.5 top-1.5 bg-primary hover:bg-primary/90 text-[10px] px-1.5 py-0">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completo
          </Badge>
        )}

        <span
          className={`absolute left-2 top-1.5 text-sm font-bold tabular-nums drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] ${
            locked ? "text-muted-foreground" : "text-primary"
          }`}
        >
          {String(orderIndex + 1).padStart(2, "0")}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
      </div>

      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className={`text-sm font-semibold line-clamp-2 transition-colors ${locked ? "text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {!locked && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {totalLessons} aulas
            </span>
            <Progress value={progressPercent} className="h-1 flex-1" />
            <span className="shrink-0 font-medium tabular-nums text-primary">
              {Math.round(progressPercent)}%
            </span>
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
