import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { useUserXP } from "@/hooks/useUserXP";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useUserBadges } from "@/hooks/useUserBadges";
import { Sparkles, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EvolutionCard() {
  const { userXP, levelInfo, isLoading: isLoadingXP } = useUserXP();
  const { currentStreak, isLoading: isLoadingStreak } = useUserStreak();
  const { badgesWithStatus, isLoading: isLoadingBadges } = useUserBadges();

  const isLoading = isLoadingXP || isLoadingStreak || isLoadingBadges;

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sua Evolução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Sua Evolução
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* XP and Level Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-3xl font-bold text-foreground">
                {userXP?.total_xp || 0}
              </span>
              <span className="text-muted-foreground">XP</span>
            </div>
            <LevelBadge level={levelInfo.level} name={levelInfo.name} size="sm" />
          </div>
          
          {/* Streak */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Streak</p>
            <StreakCounter streak={currentStreak} size="lg" />
          </div>
        </div>

        {/* Progress to next level */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso para próximo nível</span>
            <span className="text-primary font-medium">
              {levelInfo.nextLevel || "Nível Máximo"}
            </span>
          </div>
          <Progress value={levelInfo.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {levelInfo.xpInLevel} / {levelInfo.xpForNextLevel} XP
          </p>
        </div>

        {/* Badges */}
        <div>
          <p className="text-sm font-medium mb-2">Conquistas</p>
          <BadgeGrid 
            badges={badgesWithStatus} 
            size="sm" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
