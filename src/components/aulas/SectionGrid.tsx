import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CourseSectionView } from "@/lib/courseLibrary";
import { SectionCard } from "./SectionCard";

interface SectionGridProps {
  sections: CourseSectionView[];
  isLoading?: boolean;
  buyUrls?: Readonly<Record<string, string>>;
}

const ITEM_BASIS =
  "basis-[68%] min-[480px]:basis-[54%] sm:basis-[42%] md:basis-[31%] lg:basis-[24%] xl:basis-[20%]";

export function SectionGrid({ sections, isLoading = false, buyUrls = {} }: SectionGridProps) {
  if (isLoading) {
    return (
      <div data-testid="library-loading" className="flex gap-4 overflow-hidden sm:gap-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={`${ITEM_BASIS} shrink-0`}>
            <Skeleton className="aspect-[9/16] w-full rounded-lg" />
            <div className="space-y-2 pt-3.5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-0.5 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Carousel
      opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
      className="px-0.5"
      aria-label="Sessões de aulas"
    >
      <CarouselContent className="-ml-4 sm:-ml-5">
        {sections.map((section, index) => (
          <CarouselItem key={section.id} className={`pl-4 sm:pl-5 ${ITEM_BASIS}`}>
            <SectionCard
              section={section}
              buyUrl={section.productSlug ? buyUrls[section.productSlug] : undefined}
              priority={index < 3}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        aria-label="Ver sessões anteriores"
        className="left-3 top-[42%] hidden h-10 w-10 border-white/15 bg-black/70 text-white backdrop-blur-sm hover:bg-black disabled:opacity-0 md:inline-flex"
      />
      <CarouselNext
        aria-label="Ver próximas sessões"
        className="right-3 top-[42%] hidden h-10 w-10 border-white/15 bg-black/70 text-white backdrop-blur-sm hover:bg-black disabled:opacity-0 md:inline-flex"
      />
    </Carousel>
  );
}
