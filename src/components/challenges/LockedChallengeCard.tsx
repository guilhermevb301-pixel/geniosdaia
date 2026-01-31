import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock } from "lucide-react";
import { cn, formatEstimatedTime } from "@/lib/utils";
import { DailyChallenge } from "@/hooks/useDailyChallenges";

interface LockedChallengeCardProps {
  challenge: DailyChallenge;
  position: number;
}

export function LockedChallengeCard({ challenge, position }: LockedChallengeCardProps) {
  const difficultyColors: Record<string, string> = {
    iniciante: "bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20",
    intermediario: "bg-amber-500/10 text-amber-400/60 border-amber-500/20",
    avancado: "bg-red-500/10 text-red-400/60 border-red-500/20",
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-muted/30 opacity-70">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Position and lock icon */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">#{position}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
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
              <Badge variant="secondary" className="text-xs opacity-60">
                {challenge.track}
              </Badge>
            </div>

            <h4 className="font-medium text-sm text-muted-foreground mb-1">
              {challenge.title}
            </h4>

            <p className="text-xs text-muted-foreground/70 line-clamp-2">
              {challenge.objective}
            </p>

            {/* Time estimate */}
            {challenge.estimated_minutes && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                {formatEstimatedTime(challenge.estimated_minutes, challenge.estimated_time_unit)}
              </div>
            )}
          </div>
        </div>

        {/* Locked message */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-xs text-center text-muted-foreground">
            Complete o desafio anterior para desbloquear
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
