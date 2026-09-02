import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
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

  // Só mostra o carrossel de anúncios quando há banner com conteúdo de verdade
  const hasBanners = banners.some((b) => b.image_url || b.title?.trim() || b.subtitle?.trim());

  // Log daily activity on dashboard load
  useEffect(() => {
    logActivity();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Boas-vindas + CTA principal */}
        <WelcomeHero />

        {/* Continuar de Onde Parou */}
        <ContinueLearning />

        {/* Gamification Row - Evolution + Challenge */}
        <div className="grid gap-4 md:grid-cols-2">
          <EvolutionCard />
          <WeeklyChallengeCard />
        </div>

        {/* Anúncios (só aparecem quando há banner com conteúdo) */}
        {hasBanners && <AnnouncementCarousel />}

        {/* Rankings */}
        <RankingLists />
      </div>
    </AppLayout>
  );
}
