import { AppLayout } from "@/components/layout/AppLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { RankingLists } from "@/components/dashboard/RankingLists";
import { EvolutionCard } from "@/components/dashboard/EvolutionCard";
import { WeeklyChallengeCard } from "@/components/dashboard/WeeklyChallengeCard";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useEffect } from "react";

export default function Dashboard() {
  const { logActivity } = useUserStreak();

  // Log daily activity on dashboard load
  useEffect(() => {
    logActivity();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Hero Banner com Frase Motivacional */}
        <HeroBanner />

        {/* Carousel de Anúncios */}
        <AnnouncementCarousel />

        {/* Gamification Row - Evolution + Challenge */}
        <div className="grid gap-4 md:grid-cols-2">
          <EvolutionCard />
          <WeeklyChallengeCard />
        </div>

        {/* Cards de Estatísticas */}
        <StatsCards />

        {/* Continuar de Onde Parou */}
        <ContinueLearning />

        {/* Rankings */}
        <RankingLists />
      </div>
    </AppLayout>
  );
}
