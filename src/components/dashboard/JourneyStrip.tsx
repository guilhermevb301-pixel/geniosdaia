import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useUserXP } from "@/hooks/useUserXP";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useUserBadges } from "@/hooks/useUserBadges";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function JourneyStrip() {
  const { user } = useAuth();
  const { levelInfo, isLoading: isLoadingXP } = useUserXP();
  const { currentStreak, isLoading: isLoadingStreak } = useUserStreak();
  const { badgesWithStatus, isLoading: isLoadingBadges } = useUserBadges();

  const { data: lessonsCompleted } = useQuery({
    queryKey: ["dashboard_lessons_completed", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  if (isLoadingXP || isLoadingStreak || isLoadingBadges) {
    return <div className="h-[76px] animate-pulse rounded-lg bg-muted" />;
  }

  const earnedBadges = badgesWithStatus.filter((b) => b.earned).length;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card px-6 py-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-medium">
          Nível {levelInfo.level} · {levelInfo.name}
        </span>
        {currentStreak > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center gap-3">
        <span className="shrink-0 text-xs text-muted-foreground">
          {levelInfo.xpInLevel} XP
        </span>
        <Progress value={levelInfo.progress} className="h-[3px] flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {levelInfo.xpForNextLevel} XP
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-5 text-xs text-muted-foreground">
        <span>
          <strong className="font-semibold text-foreground">{lessonsCompleted ?? 0}</strong> aulas
        </span>
        <span>
          <strong className="font-semibold text-foreground">{earnedBadges}</strong> conquistas
        </span>
      </div>
    </section>
  );
}
