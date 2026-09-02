import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  completedLessons: number;
  totalLessons: number;
}

export function CourseProgress({ completedLessons, totalLessons }: CourseProgressProps) {
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
      <span className="shrink-0 text-[13px] font-medium">Progresso do curso</span>
      <Progress value={progressPercent} className="h-[5px] flex-1" />
      <span className="shrink-0 text-xs text-muted-foreground">
        {completedLessons} de {totalLessons} aulas
      </span>
    </div>
  );
}
