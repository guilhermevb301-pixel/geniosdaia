import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface CourseProgressProps {
  completedLessons: number;
  totalLessons: number;
}

export function CourseProgress({ completedLessons, totalLessons }: CourseProgressProps) {
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-sm">Progresso do Curso</h3>
            <p className="text-xs text-muted-foreground">
              {completedLessons} de {totalLessons} aulas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
