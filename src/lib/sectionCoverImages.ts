import agenteAtendimento from "@/assets/session-covers/agents-claude-portrait.webp";
import geniosIa from "@/assets/session-covers/sales-portrait.webp";
import cloneCriativo from "@/assets/session-covers/clones-portrait.webp";
import influencerIa from "@/assets/session-covers/influencers-portrait.webp";
import fotosProfissionais from "@/assets/session-covers/images-portrait.webp";
import videosCinematograficos from "@/assets/session-covers/videos-portrait.webp";
import bonusGenios from "@/assets/session-covers/bonus-portrait.webp";
import groupMentorship from "@/assets/session-covers/group-mentorship-portrait.webp";

interface SectionPresentation {
  title: string;
  description: string;
  coverImage: string;
}

const SECTION_PRESENTATION: Readonly<Record<string, SectionPresentation>> = {
  "agente-atendimento": {
    title: "Agentes de IA + Claude",
    description: "Crie, opere e venda agentes que trabalham de verdade.",
    coverImage: agenteAtendimento,
  },
  "genios-ia": {
    title: "Gênios das Vendas",
    description: "Marketing, prospecção e vendas aplicados ao seu negócio.",
    coverImage: geniosIa,
  },
  "clone-criativo": {
    title: "Gênios dos Clones de IA",
    description: "Transforme personas em conteúdo e presença digital.",
    coverImage: cloneCriativo,
  },
  "influencer-ia": {
    title: "Influencers de IA",
    description: "Crie, posicione e monetize influenciadores digitais.",
    coverImage: influencerIa,
  },
  "fotos-profissionais": {
    title: "Gênios das Imagens",
    description: "Produza imagens profissionais com direção e consistência.",
    coverImage: fotosProfissionais,
  },
  "videos-cinematograficos": {
    title: "Gênios dos Vídeos",
    description: "Do conceito à cena final com as melhores ferramentas de IA.",
    coverImage: videosCinematograficos,
  },
  "bonus-genios": {
    title: "Bônus",
    description: "Recursos extras para acelerar sua execução.",
    coverImage: bonusGenios,
  },
};

const GROUP_MENTORSHIP_PRESENTATION: SectionPresentation = {
  title: "Mentorias em grupo",
  description: "Encontros ao vivo para avançar com direção e feedback.",
  coverImage: groupMentorship,
};

export function getSectionPresentation(
  productSlug: string | null | undefined,
  sectionTitle?: string | null,
): SectionPresentation | null {
  if (sectionTitle?.trim().toLocaleLowerCase("pt-BR") === "mentorias em grupo") {
    return GROUP_MENTORSHIP_PRESENTATION;
  }

  if (!productSlug) return null;
  return SECTION_PRESENTATION[productSlug] ?? null;
}

export function getSectionCoverImage(
  productSlug: string | null | undefined,
  sectionTitle?: string | null,
): string | null {
  return getSectionPresentation(productSlug, sectionTitle)?.coverImage ?? null;
}
