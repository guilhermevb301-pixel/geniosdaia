import { Skeleton } from "@/components/ui/skeleton";
import type { CourseSectionView } from "@/lib/courseLibrary";
import { SectionCard } from "./SectionCard";

interface SectionGridProps {
  sections: CourseSectionView[];
  isLoading?: boolean;
  buyUrls?: Readonly<Record<string, string>>;
}

export function SectionGrid({ sections, isLoading = false, buyUrls = {} }: SectionGridProps) {
  if (isLoading) {
    return (
      <div data-testid="library-loading" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          buyUrl={section.productSlug ? buyUrls[section.productSlug] : undefined}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
