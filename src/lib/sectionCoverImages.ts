import agenteAtendimento from "@/assets/module-icons/agente-atendimento.webp";
import geniosIa from "@/assets/module-icons/genios-ia.webp";
import cloneCriativo from "@/assets/module-icons/clone-criativo.webp";
import influencerIa from "@/assets/module-icons/influencer-ia.webp";
import fotosProfissionais from "@/assets/module-icons/fotos-profissionais.webp";
import videosCinematograficos from "@/assets/module-icons/videos-cinematograficos.webp";
import bonusGenios from "@/assets/module-icons/bonus-genios.webp";

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

export function getSectionPresentation(
  productSlug: string | null | undefined,
): SectionPresentation | null {
  if (!productSlug) return null;
  return SECTION_PRESENTATION[productSlug] ?? null;
}

export function getSectionCoverImage(
  productSlug: string | null | undefined,
): string | null {
  return getSectionPresentation(productSlug)?.coverImage ?? null;
}
