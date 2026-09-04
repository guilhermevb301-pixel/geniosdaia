import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { JourneyStrip } from "@/components/dashboard/JourneyStrip";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AchievementsStrip } from "@/components/dashboard/AchievementsStrip";
import { useUserStreak } from "@/hooks/useUserStreak";
import { useEffect, useMemo } from "react";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { useImagePreload } from "@/hooks/useImagePreload";

export default function Dashboard() {
  const { logActivity } = useUserStreak();
  const { banners } = useDashboardBanners();

  // Preload banner images for instant display
  const bannerImages = useMemo(() => {
    const firstBannerImage = banners.find((banner) => Boolean(banner.image_url))?.image_url;
    return firstBannerImage ? [firstBannerImage] : [];
  }, [banners]);
  useImagePreload(bannerImages, { width: 1200, maxPreload: 1 });

  // Só mostra o carrossel de anúncios quando há banner com conteúdo de verdade
  const hasBanners = banners.some((b) => b.image_url || b.title?.trim() || b.subtitle?.trim());

  // Log daily activity on dashboard load
  useEffect(() => {
    logActivity();
  }, [logActivity]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <WelcomeHero />
          <JourneyStrip />
        </div>

        <DashboardGrid />

        {/* Anúncios (só aparecem quando há banner com conteúdo) */}
        {hasBanners && <AnnouncementCarousel />}

        {/* Conquistas desbloqueadas */}
        <AchievementsStrip />
      </div>
    </AppLayout>
  );
}
