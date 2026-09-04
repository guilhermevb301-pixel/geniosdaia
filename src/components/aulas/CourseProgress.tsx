import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  completedLessons: number;
  totalLessons: number;
}

export function CourseProgress({ completedLessons, totalLessons }: CourseProgressProps) {
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex shrink-0 items-baseline justify-between gap-4 sm:block">
        <span className="text-[13px] font-medium">Progresso geral</span>
        <span className="ml-2 text-xs tabular-nums text-primary">
          {Math.round(progressPercent)}%
        </span>
      </div>
      <Progress
        value={progressPercent}
        aria-label="Progresso geral do curso"
        className="h-[4px] flex-1"
      />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {completedLessons}/{totalLessons} aulas concluídas
      </span>
    </div>
  );
}
