import { useState } from "react";
import { ChevronDown, Circle, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface ModuleAccordionProps {
  modules: Module[];
  selectedLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}

export function ModuleAccordion({
  modules,
  selectedLessonId,
  onSelectLesson,
}: ModuleAccordionProps) {
  const [openModules, setOpenModules] = useState<string[]>([modules[0]?.id || ""]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-2">
      {modules.map((module) => {
        const completedCount = module.lessons.filter((l) => l.completed).length;
        const isOpen = openModules.includes(module.id);

        return (
          <Collapsible
            key={module.id}
            open={isOpen}
            onOpenChange={() => toggleModule(module.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  isOpen
                    ? "bg-accent/10 border-accent/30"
                    : "bg-card border-border hover:border-accent/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      completedCount === module.lessons.length
                        ? "border-success bg-success"
                        : "border-muted-foreground"
                    )}
                  >
                    {completedCount === module.lessons.length && (
                      <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                    )}
                  </div>
                  <span className="font-medium text-sm text-left">{module.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{module.lessons.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                      selectedLessonId === lesson.id
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : selectedLessonId === lesson.id ? (
                      <Play className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
