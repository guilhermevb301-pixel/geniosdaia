import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { JourneyStrip } from "@/components/dashboard/JourneyStrip";
import { NextStepCard } from "@/components/dashboard/NextStepCard";
import { RankingLists } from "@/components/dashboard/RankingLists";
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
      <div className="space-y-6">
        {/* Boas-vindas */}
        <WelcomeHero />

        {/* Jornada: nível, streak, XP, aulas concluídas, conquistas */}
        <JourneyStrip />

        {/* Seu próximo passo — um único CTA concreto, sem duplicar a listagem de Aulas */}
        <NextStepCard />

        {/* Anúncios (só aparecem quando há banner com conteúdo) */}
        {hasBanners && <AnnouncementCarousel />}

        {/* Desafio da semana + ranking da comunidade */}
        <div className="grid items-start gap-5 md:grid-cols-3">
          <div className="md:col-span-1">
            <WeeklyChallengeCard />
          </div>
          <div className="md:col-span-2">
            <RankingLists />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
