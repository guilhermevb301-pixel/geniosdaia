import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, CheckCircle2, Zap, Target, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import {
  UserChallengeProgress,
  calculateTimeLeft,
  calculatePercentRemaining,
} from "@/hooks/useUserChallengeProgress";

interface ActiveChallengeCardProps {
  progress: UserChallengeProgress;
  challenge: DailyChallenge;
  onComplete: () => void;
  onRestart: () => void;
  isCompleting?: boolean;
  isRestarting?: boolean;
}

export function ActiveChallengeCard({
  progress,
  challenge,
  onComplete,
  onRestart,
  isCompleting,
  isRestarting,
}: ActiveChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(progress.deadline));
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(challenge.checklist?.length || 0).fill(false)
  );

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(progress.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [progress.deadline]);

  const percentRemaining = calculatePercentRemaining(progress.started_at, progress.deadline);

  // Check if all checklist items are checked
  const allItemsChecked =
    challenge.checklist && challenge.checklist.length > 0
      ? checkedItems.every(Boolean)
      : true;

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = !newItems[index];
      return newItems;
    });
  };

  // Format time string
  const formatTime = () => {
    if (timeLeft.expired) return "Tempo esgotado!";

    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
    parts.push(`${timeLeft.minutes}min`);
    if (timeLeft.days === 0 && timeLeft.hours === 0) {
      parts.push(`${timeLeft.seconds}s`);
    }
    return parts.join(" ");
  };

  const difficultyColors: Record<string, string> = {
    iniciante: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    intermediario: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    avancado: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Zap className="h-3 w-3" />
            DESAFIO ATIVO
          </Badge>
          <div className="flex items-center gap-2">
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
            <Badge variant="secondary" className="text-xs">
              {challenge.track}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl mt-2">{challenge.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Countdown */}
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            timeLeft.expired
              ? "bg-destructive/10 border border-destructive/30"
              : "bg-muted/50"
          )}
        >
          <Clock
            className={cn(
              "h-6 w-6",
              timeLeft.expired ? "text-destructive" : "text-primary"
            )}
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Tempo restante</p>
            <p
              className={cn(
                "text-xl font-bold",
                timeLeft.expired ? "text-destructive" : "text-foreground"
              )}
            >
              {formatTime()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso do tempo</span>
            <span>{Math.round(percentRemaining)}% restante</span>
          </div>
          <Progress
            value={percentRemaining}
            className={cn(
              "h-2",
              percentRemaining < 20 && "[&>div]:bg-destructive"
            )}
          />
        </div>

        {/* Objective */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Objetivo</span>
          </div>
          <p className="text-sm text-muted-foreground">{challenge.objective}</p>
        </div>

        {/* Checklist */}
        {challenge.checklist && challenge.checklist.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Checklist ({checkedItems.filter(Boolean).length}/{challenge.checklist.length})
            </p>
            <div className="space-y-2 pl-1">
              {challenge.checklist.map((item, idx) => (
                <label
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                    checkedItems[idx] && "bg-primary/5"
                  )}
                >
                  <Checkbox
                    checked={checkedItems[idx]}
                    onCheckedChange={() => toggleItem(idx)}
                    className="mt-0.5"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      checkedItems[idx] && "line-through text-muted-foreground"
                    )}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Complete or Restart button */}
        {timeLeft.expired ? (
          <Button
            onClick={onRestart}
            disabled={isRestarting}
            variant="outline"
            className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            {isRestarting ? "Reiniciando..." : "Reiniciar Desafio"}
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            disabled={!allItemsChecked || isCompleting}
            className="w-full"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isCompleting ? "Concluindo..." : "Completei Este Desafio"}
          </Button>
        )}

        {!timeLeft.expired && !allItemsChecked && challenge.checklist && challenge.checklist.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Complete todos os itens do checklist para finalizar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
