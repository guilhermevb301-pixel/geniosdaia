import { AppLayout } from "@/components/layout/AppLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { RankingLists } from "@/components/dashboard/RankingLists";

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Hero Banner com Frase Motivacional */}
        <HeroBanner />

        {/* Carousel de Anúncios */}
        <AnnouncementCarousel />

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
