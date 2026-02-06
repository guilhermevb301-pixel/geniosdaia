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
      
      <CardHeader className="relative pb-2 p-3 sm:p-4 md:p-6 md:pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Sua Evolução
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
        {/* XP and Level Section */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {userXP?.total_xp || 0}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">XP</span>
            </div>
            <LevelBadge level={levelInfo.level} name={levelInfo.name} size="sm" />
          </div>
          
          {/* Streak */}
          <div className="text-right shrink-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Streak</p>
            <StreakCounter streak={currentStreak} size="lg" />
          </div>
        </div>

        {/* Progress to next level */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground truncate">Próximo nível</span>
            <span className="text-primary font-medium shrink-0">
              {levelInfo.nextLevel || "Máximo"}
            </span>
          </div>
          <Progress value={levelInfo.progress} className="h-1.5 sm:h-2" />
          <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
            {levelInfo.xpInLevel} / {levelInfo.xpForNextLevel} XP
          </p>
        </div>

        {/* Badges */}
        <div>
          <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Conquistas</p>
          <BadgeGrid 
            badges={badgesWithStatus} 
            size="sm" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
