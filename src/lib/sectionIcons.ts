import agenteAtendimento from "@/assets/module-icons/agente-atendimento.webp";
import geniosIa from "@/assets/module-icons/genios-ia.webp";
import cloneCriativo from "@/assets/module-icons/clone-criativo.webp";
import influencerIa from "@/assets/module-icons/influencer-ia.webp";
import fotosProfissionais from "@/assets/module-icons/fotos-profissionais.webp";
import videosCinematograficos from "@/assets/module-icons/videos-cinematograficos.webp";
import bonusGenios from "@/assets/module-icons/bonus-genios.webp";

export const SECTION_ICONS: Record<string, string> = {
  "agente-atendimento": agenteAtendimento,
  "genios-ia": geniosIa,
  "clone-criativo": cloneCriativo,
  "influencer-ia": influencerIa,
  "fotos-profissionais": fotosProfissionais,
  "videos-cinematograficos": videosCinematograficos,
  "bonus-genios": bonusGenios,
};

export function getSectionIcon(productSlug: string | null | undefined): string | null {
  if (!productSlug) return null;
  return SECTION_ICONS[productSlug] ?? null;
}
