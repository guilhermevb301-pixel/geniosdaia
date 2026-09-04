import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
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
    return <div className="h-11 animate-pulse rounded-md bg-muted" />;
  }

  const earnedBadges = badgesWithStatus.filter((b) => b.earned).length;

  return (
    <section
      aria-label="Resumo da sua jornada"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border/70 pb-4 text-xs text-muted-foreground"
    >
      <span className="whitespace-nowrap">
        <strong className="font-medium text-foreground">
          Nível {levelInfo.level} · {levelInfo.name}
        </strong>{" "}
        · {levelInfo.xpInLevel}/{levelInfo.xpForNextLevel} XP
      </span>

      <span className="flex items-center gap-1 whitespace-nowrap">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
      </span>

      <span className="whitespace-nowrap">
        <strong className="font-medium text-foreground">{lessonsCompleted ?? 0}</strong> aulas
      </span>
      <span className="whitespace-nowrap">
        <strong className="font-medium text-foreground">{earnedBadges}</strong> conquistas
      </span>
    </section>
  );
}
