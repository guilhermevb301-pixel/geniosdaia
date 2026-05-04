import { ModuleCard } from "./ModuleCard";
import { ModuleCardSkeleton } from "./ModuleCardSkeleton";

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

interface ModuleGridProps {
  modules: Module[];
  isLoading?: boolean;
}

export function ModuleGrid({ modules, isLoading }: ModuleGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ModuleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          id={module.id}
          title={module.title}
          description={module.description}
          coverImageUrl={resolveCover(module.title, module.cover_image_url)}
          completedLessons={module.completedLessons}
          totalLessons={module.totalLessons}
          orderIndex={module.order_index}
          priority={index < 5}
        />
      ))}
    </div>
  );
}
