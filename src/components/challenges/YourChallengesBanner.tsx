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
  // Active challenge props (supports both single and multiple)
  activeChallenge?: DailyChallenge;
  activeChallenges?: DailyChallenge[];
  activeProgress?: UserChallengeProgress;
  activeProgressList?: UserChallengeProgress[];
  onCompleteChallenge?: (progressId: string) => void;
  onRestartChallenge?: (progressId: string) => void;
  isCompleting?: boolean;
  isRestarting?: boolean;
}

// Individual challenge card component
function ActiveChallengeItem({
  challenge,
  progress,
  onComplete,
  onRestart,
  isCompleting,
  isRestarting,
  userTrack,
  userLevel,
  isCompact = false,
}: {
  challenge: DailyChallenge;
  progress: UserChallengeProgress;
  onComplete: () => void;
  onRestart: () => void;
  isCompleting: boolean;
  isRestarting: boolean;
  userTrack: string;
  userLevel: number;
  isCompact?: boolean;
}) {
  const levelName = LEVEL_NAMES[userLevel] || "Aprendiz";
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(progress?.deadline || null));
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(challenge?.checklist?.length || 0).fill(false)
  );
  
  const trackLabels: Record<string, string> = {
    agentes: "Agentes de IA",
    videos: "Criação de Vídeos",
    fotos: "Fotografia Profissional",
    crescimento: "Crescimento Digital",
    propostas: "Propostas Comerciais",
  };

  const trackLabel = trackLabels[userTrack] || "Geral";

  // Update countdown every second
  useEffect(() => {
    if (!progress?.deadline) return;
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(progress.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [progress?.deadline]);

  // Reset checked items when challenge changes
  useEffect(() => {
    setCheckedItems(new Array(challenge?.checklist?.length || 0).fill(false));
  }, [challenge?.id, challenge?.checklist?.length]);

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = !newItems[index];
      return newItems;
    });
  };

  const percentRemaining = progress
    ? calculatePercentRemaining(progress.started_at, progress.deadline)
    : 0;

  const allItemsChecked =
    challenge?.checklist && challenge.checklist.length > 0
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

  if (isCompact) {
    // Compact version for multiple challenges grid
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-800 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  ATIVO
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white/90 text-xs">
                  {difficultyLabels[challenge.difficulty] || "Intermediário"}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white line-clamp-2">{challenge.title}</h3>
            </div>
            <div className={cn(
              "text-center p-3 rounded-xl backdrop-blur shrink-0",
              timeLeft.expired ? "bg-destructive/20" : "bg-accent/20"
            )}>
              <Clock className={cn(
                "h-4 w-4 mx-auto mb-1",
                timeLeft.expired ? "text-destructive" : "text-accent"
              )} />
              <div className={cn(
                "text-sm font-bold whitespace-nowrap",
                timeLeft.expired ? "text-destructive" : "text-accent"
              )}>
                {formatTime()}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress
              value={percentRemaining}
              className={cn(
                "h-1.5 bg-white/20",
                percentRemaining < 20 && "[&>div]:bg-destructive",
                percentRemaining >= 20 && "[&>div]:bg-emerald-400"
              )}
            />
          </div>
        </div>
        
        <CardContent className="p-4">
          {challenge.checklist && challenge.checklist.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Checklist ({checkedItems.filter(Boolean).length}/{challenge.checklist.length})
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {challenge.checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 border border-border/50 text-xs",
                      checkedItems[idx] && "bg-primary/5 border-primary/30"
                    )}
                  >
                    <Checkbox
                      checked={checkedItems[idx]}
                      onCheckedChange={() => toggleItem(idx)}
                      className="mt-0.5 h-3.5 w-3.5"
                    />
                    <span
                      className={cn(
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
              size="sm"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {isRestarting ? "Reiniciando..." : "Reiniciar"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={onComplete}
                disabled={!allItemsChecked || isCompleting}
                className="flex-1"
                size="sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isCompleting ? "Concluindo..." : "Completar"}
              </Button>
              <Button
                onClick={onRestart}
                disabled={isRestarting}
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full size version (single challenge)
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
                  {difficultyLabels[challenge.difficulty] || "Intermediário"}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white/90">
                  {trackLabel}
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold">{challenge.title}</h2>
              
              <p className="text-white/80 max-w-xl">{challenge.objective}</p>

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
          {challenge.checklist && challenge.checklist.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Checklist ({checkedItems.filter(Boolean).length}/{challenge.checklist.length})
              </p>
              <div className="space-y-2">
                {challenge.checklist.map((item, idx) => (
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
              onClick={onRestart}
              disabled={isRestarting}
              variant="outline"
              className="w-full mt-4 border-amber-500 text-amber-500 hover:bg-amber-500/10"
              size="lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              {isRestarting ? "Reiniciando..." : "Reiniciar Desafio"}
            </Button>
          ) : (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={onComplete}
                disabled={!allItemsChecked || isCompleting}
                className="flex-1"
                size="lg"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {isCompleting ? "Concluindo..." : "Completei Este Desafio"}
              </Button>
              <Button
                onClick={onRestart}
                disabled={isRestarting}
                variant="outline"
                size="lg"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reiniciar
              </Button>
            </div>
          )}

          {!timeLeft.expired && !allItemsChecked && challenge.checklist && challenge.checklist.length > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Complete todos os itens do checklist para finalizar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function YourChallengesBanner({
  userTrack,
  userLevel,
  recommendedCount,
  selectedObjectivesCount,
  onScrollToObjectives,
  activeChallenge,
  activeChallenges = [],
  activeProgress,
  activeProgressList = [],
  onCompleteChallenge,
  onRestartChallenge,
  isCompleting,
  isRestarting,
}: YourChallengesBannerProps) {
  const levelName = LEVEL_NAMES[userLevel] || "Aprendiz";
  
  const trackLabels: Record<string, string> = {
    agentes: "Agentes de IA",
    videos: "Criação de Vídeos",
    fotos: "Fotografia Profissional",
    crescimento: "Crescimento Digital",
    propostas: "Propostas Comerciais",
  };

  const trackLabel = trackLabels[userTrack] || "Geral";

  // Build a combined list from either props format
  const allActiveChallenges = activeChallenges.length > 0 
    ? activeChallenges 
    : (activeChallenge ? [activeChallenge] : []);
  
  const allActiveProgress = activeProgressList.length > 0 
    ? activeProgressList 
    : (activeProgress ? [activeProgress] : []);

  // Multiple active challenges view
  if (allActiveChallenges.length > 1 && allActiveProgress.length > 1) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Seus Desafios Ativos</h2>
              <p className="text-sm text-muted-foreground">
                {allActiveChallenges.length} desafios em andamento
              </p>
            </div>
          </div>
        </div>

        {/* Grid of active challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allActiveChallenges.map((challenge, idx) => {
            const progress = allActiveProgress[idx];
            if (!progress) return null;
            
            return (
              <ActiveChallengeItem
                key={progress.id}
                challenge={challenge}
                progress={progress}
                onComplete={() => onCompleteChallenge?.(progress.id)}
                onRestart={() => onRestartChallenge?.(progress.id)}
                isCompleting={isCompleting || false}
                isRestarting={isRestarting || false}
                userTrack={userTrack}
                userLevel={userLevel}
                isCompact
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Single active challenge view
  if (allActiveChallenges.length === 1 && allActiveProgress.length >= 1) {
    const singleChallenge = allActiveChallenges[0];
    const singleProgress = allActiveProgress[0];

    return (
      <ActiveChallengeItem
        challenge={singleChallenge}
        progress={singleProgress}
        onComplete={() => onCompleteChallenge?.(singleProgress.id)}
        onRestart={() => onRestartChallenge?.(singleProgress.id)}
        isCompleting={isCompleting || false}
        isRestarting={isRestarting || false}
        userTrack={userTrack}
        userLevel={userLevel}
        isCompact={false}
      />
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
