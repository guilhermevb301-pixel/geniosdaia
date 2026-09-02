import { ModuleCard } from "./ModuleCard";
import { ModuleCardSkeleton } from "./ModuleCardSkeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const DEFAULT_COVERS: Record<string, string> = {
  "VENDA SUA IA": "https://yffkvechnyttronvtunp.supabase.co/storage/v1/object/public/lesson-files/covers/capa-venda-sua-ia.png",
  "SEEDANCE 2": "https://yffkvechnyttronvtunp.supabase.co/storage/v1/object/public/lesson-files/covers/capa-seedance-2.png",
};

function resolveCover(title: string, url: string | null): string | null {
  if (url) return url;
  const key = Object.keys(DEFAULT_COVERS).find((k) => title.toUpperCase().includes(k));
  return key ? DEFAULT_COVERS[key] : null;
}

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
  isLoading?: boolean;
  locked?: boolean;
  buyUrl?: string;
  sectionIconUrl?: string | null;
}

const ITEM_BASIS =
  "basis-[62%] sm:basis-[42%] md:basis-[30%] lg:basis-[24%] xl:basis-[20%]";

export function ModuleCarousel({ modules, isLoading, locked = false, buyUrl, sectionIconUrl }: ModuleCarouselProps) {
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

  return (
    <Carousel
      opts={{ align: "start", dragFree: true }}
      className="group/carousel px-1"
    >
      <CarouselContent className="-ml-6">
        {modules.map((module, index) => (
          <CarouselItem key={module.id} className={`pl-6 ${ITEM_BASIS}`}>
            <ModuleCard
              id={module.id}
              title={module.title}
              description={module.description}
              coverImageUrl={resolveCover(module.title, module.cover_image_url)}
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
      <CarouselPrevious className="hidden md:flex opacity-0 group-hover/carousel:opacity-100 transition-opacity -left-3" />
      <CarouselNext className="hidden md:flex opacity-0 group-hover/carousel:opacity-100 transition-opacity -right-3" />
    </Carousel>
  );
}
