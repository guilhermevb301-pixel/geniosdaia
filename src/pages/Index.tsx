import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CoursesPreview } from "@/components/home/CoursesPreview";
import { TemplatesPreview } from "@/components/home/TemplatesPreview";
import { CommunitySection } from "@/components/home/CommunitySection";
import { MentorshipCTA } from "@/components/home/MentorshipCTA";
import { EventsPreview } from "@/components/home/EventsPreview";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CoursesPreview />
        <TemplatesPreview />
        <CommunitySection />
        <MentorshipCTA />
        <EventsPreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
