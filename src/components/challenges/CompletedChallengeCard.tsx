import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { cn, formatEstimatedTime } from "@/lib/utils";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import { UserChallengeProgress } from "@/hooks/useUserChallengeProgress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompletedChallengeCardProps {
  challenge: DailyChallenge;
  progress: UserChallengeProgress;
}

export function CompletedChallengeCard({ challenge, progress }: CompletedChallengeCardProps) {
  const difficultyColors: Record<string, string> = {
    iniciante: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    intermediario: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    avancado: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const completedAt = progress.completed_at
    ? formatDistanceToNow(new Date(progress.completed_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  return (
    <Card className="overflow-hidden border-emerald-500/30 bg-emerald-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Check icon */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                COMPLETADO
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  difficultyColors[challenge.difficulty] || difficultyColors.intermediario
                )}
              >
                {challenge.difficulty === "iniciante"
                  ? "Iniciante"
                  : challenge.difficulty === "avancado"
                  ? "Avançado"
                  : "Intermediário"}
              </Badge>
            </div>

            <h4 className="font-medium text-sm mb-1">{challenge.title}</h4>

            <p className="text-xs text-muted-foreground line-clamp-1">
              {challenge.objective}
            </p>

            {/* Completion info */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {challenge.estimated_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatEstimatedTime(challenge.estimated_minutes, challenge.estimated_time_unit)}
                </span>
              )}
              {completedAt && <span>Concluído {completedAt}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
