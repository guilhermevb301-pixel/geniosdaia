import { ModuleCard } from "./ModuleCard";

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
}

export function ModuleGrid({ modules }: ModuleGridProps) {
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Sem módulos disponíveis</h2>
        <p className="text-muted-foreground max-w-md">
          Os módulos ainda não foram adicionados. Aguarde o administrador adicionar o conteúdo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {modules.map((module, index) => (
        <ModuleCard
          key={module.id}
          id={module.id}
          title={module.title}
          description={module.description}
          coverImageUrl={module.cover_image_url}
          completedLessons={module.completedLessons}
          totalLessons={module.totalLessons}
          orderIndex={module.order_index}
          priority={index < 5} // First 5 modules load eagerly
        />
      ))}
    </div>
  );
}
