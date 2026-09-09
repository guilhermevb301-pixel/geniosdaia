import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { Progress } from "@/components/ui/progress";
import type { CourseSectionView } from "@/lib/courseLibrary";
import { getSectionPresentation } from "@/lib/sectionCoverImages";

interface SectionCardProps {
  section: CourseSectionView;
  buyUrl?: string;
  priority?: boolean;
}

export function SectionCard({ section, buyUrl, priority = false }: SectionCardProps) {
  const presentation = getSectionPresentation(section.productSlug);
  const title = presentation?.title ?? section.title;
  const description = presentation?.description;
  const image = presentation?.coverImage;

  const body = (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-card transition-colors duration-300 hover:border-primary/45">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {image ? (
          <ImageWithSkeleton
            src={image}
            alt=""
            containerClassName="absolute inset-0"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            objectFit="cover"
            optimizedWidth={720}
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(52,211,153,0.16),transparent_42%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <span className="text-xs font-medium text-white/75">
            {section.moduleCount} {section.moduleCount === 1 ? "módulo" : "módulos"}
          </span>
          {section.locked ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/45 px-2 py-1 text-[11px] font-medium backdrop-blur-sm">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Bloqueado
            </span>
          ) : (
            <ArrowRight
              className="h-4 w-4 translate-x-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold leading-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-auto pt-5">
          {section.locked ? (
            <span className="text-xs font-medium text-primary">Conhecer acesso</span>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  {section.completedLessons} de {section.totalLessons} aulas
                </span>
                <span>{section.progressPercent}%</span>
              </div>
              <Progress
                value={section.progressPercent}
                aria-label={`Progresso da sessão ${title}`}
                className="h-1"
              />
            </>
          )}
        </div>
      </div>
    </article>
  );

  if (section.locked) {
    return buyUrl ? (
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Desbloquear sessão ${title}`}
        className="focus-ring block h-full rounded-lg"
      >
        {body}
      </a>
    ) : (
      <div aria-label={`Sessão ${title} bloqueada`} className="h-full">
        {body}
      </div>
    );
  }

  return (
    <Link
      to={`/aulas/sessao/${section.id}`}
      aria-label={`Abrir sessão ${title}`}
      className="focus-ring block h-full rounded-lg"
    >
      {body}
    </Link>
  );
}
