import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { RankingLists } from "@/components/dashboard/RankingLists";
import { EvolutionCard } from "@/components/dashboard/EvolutionCard";
import { WeeklyChallengeCard } from "@/components/dashboard/WeeklyChallengeCard";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useEffect, useMemo } from "react";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { useImagePreload } from "@/hooks/useImagePreload";

export default function Dashboard() {
  const { logActivity } = useUserStreak();
  const { banners } = useDashboardBanners();

  // Preload banner images for instant display
  const bannerImages = useMemo(() => 
    banners.map(b => b.image_url).filter(Boolean),
    [banners]
  );
  useImagePreload(bannerImages, { width: 1200 });

  // Log daily activity on dashboard load
  useEffect(() => {
    logActivity();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
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
