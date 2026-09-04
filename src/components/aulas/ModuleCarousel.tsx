import { ModuleCard } from "./ModuleCard";
import { ModuleCardSkeleton } from "./ModuleCardSkeleton";
import { Progress } from "@/components/ui/progress";
import { getModuleCover } from "@/lib/moduleCoverCatalog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface Module {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  section_id?: string | null;
  completedLessons: number;
  totalLessons: number;
}

interface ModuleCarouselProps {
  modules: Module[];
  title?: string;
  productSlug?: string | null;
  isLoading?: boolean;
  locked?: boolean;
  buyUrl?: string;
  sectionIconUrl?: string | null;
}

const ITEM_BASIS =
  "basis-[68%] min-[480px]:basis-[56%] sm:basis-[42%] md:basis-[30%] lg:basis-[24%] xl:basis-[22%]";

export function ModuleCarousel({
  modules,
  title,
  productSlug,
  isLoading,
  locked = false,
  buyUrl,
  sectionIconUrl,
}: ModuleCarouselProps) {
  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${ITEM_BASIS} shrink-0`}>
            <ModuleCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  const totalLessons = modules.reduce((total, module) => total + module.totalLessons, 0);
  const completedLessons = modules.reduce(
    (total, module) => total + module.completedLessons,
    0,
  );
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Carousel
      opts={{ align: "start", dragFree: true }}
      className="px-1"
    >
      {title && (
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className={`truncate text-base font-semibold ${locked ? "text-muted-foreground" : "text-foreground"}`}>
              {title.trim()}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <Progress
                value={progressPercent}
                aria-label={`Progresso em ${title.trim()}`}
                className="h-[3px] w-28 sm:w-36"
              />
              <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
                {completedLessons}/{totalLessons} aulas
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {locked && buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mr-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
              >
                Desbloquear
              </a>
            )}
            <div className="hidden items-center gap-2 md:flex">
              <CarouselPrevious
                aria-label={`Ver aulas anteriores de ${title.trim()}`}
                className="static h-8 w-8 translate-x-0 translate-y-0 rounded-md"
              />
              <CarouselNext
                aria-label={`Ver próximas aulas de ${title.trim()}`}
                className="static h-8 w-8 translate-x-0 translate-y-0 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      <CarouselContent className="-ml-4 sm:-ml-5">
        {modules.map((module, index) => (
          <CarouselItem key={module.id} className={`pl-4 sm:pl-5 ${ITEM_BASIS}`}>
            <ModuleCard
              id={module.id}
              title={module.title}
              description={module.description}
              coverMetadata={getModuleCover({
                moduleId: module.id,
                productSlug,
                orderIndex: Number.isFinite(module.order_index)
                  ? module.order_index
                  : index,
              })}
              coverImageUrl={module.cover_image_url}
              sectionIconUrl={sectionIconUrl}
              completedLessons={module.completedLessons}
              totalLessons={module.totalLessons}
              orderIndex={Number.isFinite(module.order_index) ? module.order_index : index}
              priority={index < 5}
              locked={locked}
              buyUrl={buyUrl}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
