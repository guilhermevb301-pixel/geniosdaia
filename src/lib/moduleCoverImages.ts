import serviceWelcome from "@/assets/module-covers-3d/service-welcome.webp";
import toolInstallation from "@/assets/module-covers-3d/tool-installation.webp";
import serviceAgent from "@/assets/module-covers-3d/service-agent.webp";
import sellYourAgent from "@/assets/module-covers-3d/sell-your-agent.webp";
import claudeIntroduction from "@/assets/module-covers-3d/claude-introduction.webp";
import claudeCopilot from "@/assets/module-covers-3d/claude-copilot.webp";
import claudeSecretWeapon from "@/assets/module-covers-3d/claude-secret-weapon.webp";
import serviceBonus from "@/assets/module-covers-3d/service-bonus.webp";
import marketing from "@/assets/module-covers-3d/marketing.webp";
import virality from "@/assets/module-covers-3d/virality.webp";
import prospecting from "@/assets/module-covers-3d/prospecting.webp";
import creativeCourseIntro from "@/assets/module-covers-3d/creative-course-intro.webp";
import personaCreation from "@/assets/module-covers-3d/persona-creation.webp";
import contentCreation from "@/assets/module-covers-3d/content-creation.webp";
import heygen from "@/assets/module-covers-3d/heygen.webp";
import influencerWelcome from "@/assets/module-covers-3d/influencer-welcome.webp";
import aiInfluencer from "@/assets/module-covers-3d/ai-influencer.webp";
import aiInfluencerAlternative from "@/assets/module-covers-3d/ai-influencer-alternative.webp";
import influencerMonetization from "@/assets/module-covers-3d/influencer-monetization.webp";
import influencerBonus from "@/assets/module-covers-3d/influencer-bonus.webp";
import nanobananaPro from "@/assets/module-covers-3d/nanobanana-pro.webp";
import professionalPhotoSession from "@/assets/module-covers-3d/professional-photo-session.webp";
import veo3 from "@/assets/module-covers-3d/veo-3.webp";
import kling from "@/assets/module-covers-3d/kling.webp";
import seedance2 from "@/assets/module-covers-3d/seedance-2.webp";
import aiPodcast from "@/assets/module-covers-3d/ai-podcast.webp";
import videoMonetization from "@/assets/module-covers-3d/video-monetization.webp";
import viralVideos from "@/assets/module-covers-3d/viral-videos.webp";
import salesPage from "@/assets/module-covers-3d/sales-page.webp";

const MODULE_COVER_IMAGES: Readonly<Record<string, string>> = {
  "service-welcome": serviceWelcome,
  "tool-installation": toolInstallation,
  "service-agent": serviceAgent,
  "sell-your-agent": sellYourAgent,
  "claude-introduction": claudeIntroduction,
  "claude-copilot": claudeCopilot,
  "claude-secret-weapon": claudeSecretWeapon,
  "service-bonus": serviceBonus,
  marketing,
  virality,
  prospecting,
  "creative-course-intro": creativeCourseIntro,
  "persona-creation": personaCreation,
  "content-creation": contentCreation,
  heygen,
  "influencer-welcome": influencerWelcome,
  "ai-influencer": aiInfluencer,
  "ai-influencer-alternative": aiInfluencerAlternative,
  "influencer-monetization": influencerMonetization,
  "influencer-bonus": influencerBonus,
  "nanobanana-pro": nanobananaPro,
  "professional-photo-session": professionalPhotoSession,
  "veo-3": veo3,
  kling,
  "seedance-2": seedance2,
  "ai-podcast": aiPodcast,
  "video-monetization": videoMonetization,
  "viral-videos": viralVideos,
  "sales-page": salesPage,
};

export function getModuleCoverImage(topic: string): string | null {
  return MODULE_COVER_IMAGES[topic] ?? null;
}
