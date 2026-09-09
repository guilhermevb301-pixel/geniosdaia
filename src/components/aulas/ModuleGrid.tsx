import { ModuleCard } from "@/components/aulas/ModuleCard";
import type { CourseModuleView } from "@/lib/courseLibrary";
import { getModuleCover } from "@/lib/moduleCoverCatalog";

interface ModuleGridProps {
  modules: CourseModuleView[];
  productSlug: string | null;
}

export function ModuleGrid({ modules, productSlug }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          id={module.id}
          title={module.title}
          description={module.description}
          coverImageUrl={module.coverImageUrl}
          coverMetadata={getModuleCover({
            moduleId: module.id,
            productSlug,
            orderIndex: module.orderIndex,
          })}
          completedLessons={module.completedLessons}
          totalLessons={module.totalLessons}
          orderIndex={module.orderIndex}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
