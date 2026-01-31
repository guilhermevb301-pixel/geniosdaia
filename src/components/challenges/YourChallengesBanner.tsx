import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Sparkles, TrendingUp, ArrowRight, Clock, Zap, CheckCircle2, RotateCcw } from "lucide-react";
import { LEVEL_NAMES } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { DailyChallenge } from "@/hooks/useDailyChallenges";
import {
  UserChallengeProgress,
  calculateTimeLeft,
  calculatePercentRemaining,
} from "@/hooks/useUserChallengeProgress";

interface YourChallengesBannerProps {
  userTrack: string;
  userLevel: number;
  recommendedCount: number;
  selectedObjectivesCount: number;
  onScrollToObjectives?: () => void;
  // Active challenge props
  activeChallenge?: DailyChallenge;
  activeProgress?: UserChallengeProgress;
  onCompleteChallenge?: () => void;
  onRestartChallenge?: () => void;
  isCompleting?: boolean;
  isRestarting?: boolean;
}

export function YourChallengesBanner({
  userTrack,
  userLevel,
  recommendedCount,
  selectedObjectivesCount,
  onScrollToObjectives,
  activeChallenge,
  activeProgress,
  onCompleteChallenge,
  onRestartChallenge,
  isCompleting,
  isRestarting,
}: YourChallengesBannerProps) {
  const levelName = LEVEL_NAMES[userLevel] || "Aprendiz";
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(activeProgress?.deadline || null));
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(activeChallenge?.checklist?.length || 0).fill(false)
  );
  
  const trackLabels: Record<string, string> = {
    agentes: "Agentes de IA",
    videos: "Criação de Vídeos",
    fotos: "Fotografia Profissional",
    crescimento: "Crescimento Digital",
    propostas: "Propostas Comerciais",
  };

  const trackLabel = trackLabels[userTrack] || "Geral";

  // Update countdown every second when there's an active challenge
  useEffect(() => {
    if (!activeProgress?.deadline) return;
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(activeProgress.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeProgress?.deadline]);

  // Reset checked items when challenge changes
  useEffect(() => {
    setCheckedItems(new Array(activeChallenge?.checklist?.length || 0).fill(false));
  }, [activeChallenge?.id, activeChallenge?.checklist?.length]);

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = !newItems[index];
      return newItems;
    });
  };

  const percentRemaining = activeProgress
    ? calculatePercentRemaining(activeProgress.started_at, activeProgress.deadline)
    : 0;

  const allItemsChecked =
    activeChallenge?.checklist && activeChallenge.checklist.length > 0
      ? checkedItems.every(Boolean)
      : true;

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

  const difficultyLabels: Record<string, string> = {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado",
  };

  // Active challenge view
  if (activeChallenge && activeProgress) {
    return (
      <div className="space-y-4">
        {/* Banner with countdown */}
        <Card className="relative overflow-hidden border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-indigo-800" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <CardContent className="relative p-6 sm:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    DESAFIO ATIVO
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white/90">
                    {difficultyLabels[activeChallenge.difficulty] || "Intermediário"}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white/90">
                    {trackLabel}
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold">{activeChallenge.title}</h2>
                
                <p className="text-white/80 max-w-xl">{activeChallenge.objective}</p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                    <Target className="h-4 w-4 text-accent" />
                    <span className="text-sm">
                      Trilha: <span className="font-medium">{trackLabel}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm">
                      Nível {userLevel}: <span className="font-medium">{levelName}</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Progresso do tempo</span>
                    <span>{Math.round(percentRemaining)}% restante</span>
                  </div>
                  <Progress
                    value={percentRemaining}
                    className={cn(
                      "h-2 bg-white/20",
                      percentRemaining < 20 && "[&>div]:bg-destructive",
                      percentRemaining >= 20 && "[&>div]:bg-emerald-400"
                    )}
                  />
                </div>
              </div>

              {/* Countdown circle */}
              <div className="flex flex-col items-center justify-center gap-3 min-w-[180px]">
                <div className={cn(
                  "text-center p-6 rounded-2xl backdrop-blur",
                  timeLeft.expired ? "bg-destructive/20" : "bg-accent/20"
                )}>
                  <Clock className={cn(
                    "h-6 w-6 mx-auto mb-2",
                    timeLeft.expired ? "text-destructive" : "text-accent"
                  )} />
                  <div className={cn(
                    "text-2xl font-bold",
                    timeLeft.expired ? "text-destructive" : "text-accent"
                  )}>
                    {formatTime()}
                  </div>
                  <div className="text-sm text-white/70">
                    tempo restante
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist card */}
        <Card>
          <CardContent className="p-6">
            {activeChallenge.checklist && activeChallenge.checklist.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Checklist ({checkedItems.filter(Boolean).length}/{activeChallenge.checklist.length})
                </p>
                <div className="space-y-2">
                  {activeChallenge.checklist.map((item, idx) => (
                    <label
                      key={idx}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 border border-border/50",
                        checkedItems[idx] && "bg-primary/5 border-primary/30"
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
                onClick={onRestartChallenge}
                disabled={isRestarting}
                variant="outline"
                className="w-full mt-4 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                size="lg"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                {isRestarting ? "Reiniciando..." : "Reiniciar Desafio"}
              </Button>
            ) : (
              <Button
                onClick={onCompleteChallenge}
                disabled={!allItemsChecked || isCompleting}
                className="w-full mt-4"
                size="lg"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {isCompleting ? "Concluindo..." : "Completei Este Desafio"}
              </Button>
            )}

            {!timeLeft.expired && !allItemsChecked && activeChallenge.checklist && activeChallenge.checklist.length > 0 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Complete todos os itens do checklist para finalizar
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view (no active challenge)
  return (
    <Card className="relative overflow-hidden border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent hover:bg-accent text-accent-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                PERSONALIZADO PARA VOCÊ
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">Seus Desafios</h2>
            
            <p className="text-white/80 max-w-xl">
              {selectedObjectivesCount > 0 
                ? `Baseado nos seus ${selectedObjectivesCount} objetivos selecionados, encontramos desafios perfeitos para sua jornada.`
                : "Defina seus objetivos abaixo para receber desafios personalizados para sua jornada."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  Trilha: <span className="font-medium">{trackLabel}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  Nível {userLevel}: <span className="font-medium">{levelName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 min-w-[180px]">
            <div className={cn(
              "text-center p-6 rounded-2xl backdrop-blur",
              recommendedCount > 0 ? "bg-accent/20" : "bg-white/10"
            )}>
              <div className="text-4xl font-bold text-accent">
                {recommendedCount}
              </div>
              <div className="text-sm text-white/80">
                desafios para você
              </div>
            </div>

            {selectedObjectivesCount === 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onScrollToObjectives}
                className="gap-2"
              >
                Definir Objetivos
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}