import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BookOpen, CheckCircle2, Lock } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { ModuleCoverArtwork } from "@/components/aulas/ModuleCoverArtwork";
import type { ModuleCoverMetadata } from "@/lib/moduleCoverCatalog";

interface ModuleCardProps {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  coverMetadata?: ModuleCoverMetadata | null;
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
  coverMetadata,
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

  const cardContent = (
    <article className="group/card flex h-full flex-col motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5">
      {/* Capa */}
      <div className="relative overflow-hidden rounded-[8px] border border-border group-hover/card:border-primary/40">
        <AspectRatio ratio={4 / 3}>
          {coverMetadata ? (
            <ModuleCoverArtwork metadata={coverMetadata} locked={locked} />
          ) : coverImageUrl ? (
            <ImageWithSkeleton
              src={coverImageUrl}
              alt={title}
              className={`motion-safe:transition-transform motion-safe:duration-300 ${
                locked
                  ? "grayscale"
                  : "[filter:brightness(0.9)_saturate(0.95)] group-hover/card:scale-[1.025]"
              }`}
              containerClassName="h-full w-full"
              fallbackIcon={
                sectionIconUrl ? (
                  <img src={sectionIconUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                )
              }
              optimizedWidth={400}
              optimizedQuality={80}
              priority={priority}
            />
          ) : sectionIconUrl ? (
            <img
              src={sectionIconUrl}
              alt={title}
              className={`h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 ${
                locked ? "grayscale" : "group-hover/card:scale-[1.025]"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <BookOpen className="h-7 w-7 text-muted-foreground/40" />
            </div>
          )}
        </AspectRatio>

        {/* Número do módulo, discreto no canto */}
        <span className="pointer-events-none absolute bottom-2.5 left-3 font-display text-[15px] leading-none tracking-wide text-white/75 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {String(orderIndex + 1).padStart(2, "0")}
        </span>

        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/70 backdrop-blur-[1px]">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="eyebrow text-muted-foreground">Bloqueado</span>
          </div>
        )}

        {!locked && isCompleted && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur-sm">
            <CheckCircle2 className="h-3 w-3" />
            Completo
          </span>
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-1 flex-col pt-3.5">
        <h3
          className={`mb-1 line-clamp-2 ${
            locked ? "text-muted-foreground" : "text-foreground group-hover/card:text-primary"
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className="mb-3 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {!locked && (
          <div className="mt-auto flex items-center gap-3 pt-1 text-[11.5px] text-muted-foreground/80">
            <span className="shrink-0">{totalLessons} aulas</span>
            <Progress
              value={progressPercent}
              aria-label={`Progresso do módulo ${title}`}
              className="h-[2px] flex-1"
            />
            <span className="shrink-0 tabular-nums">{Math.round(progressPercent)}%</span>
          </div>
        )}
      </div>
    </article>
  );

  if (locked && buyUrl) {
    return (
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring block h-full rounded-[8px]"
      >
        {cardContent}
      </a>
    );
  }

  if (locked) return <div className="h-full">{cardContent}</div>;

  return (
    <Link to={`/aulas/${id}`} className="focus-ring block h-full rounded-[8px]">
      {cardContent}
    </Link>
  );
}
