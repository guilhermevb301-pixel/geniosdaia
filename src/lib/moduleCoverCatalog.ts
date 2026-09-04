export type ModuleCoverAccent = "emerald" | "codex" | "claude";

export type ModuleCoverLayout =
  | "portal"
  | "workbench"
  | "network"
  | "funnel"
  | "orbit"
  | "vault"
  | "burst"
  | "broadcast"
  | "signal"
  | "radar"
  | "stage"
  | "portrait"
  | "stack"
  | "frame"
  | "split"
  | "market"
  | "studio"
  | "waveform"
  | "growth"
  | "browser";

export type ModuleCoverIconName =
  | "sparkles"
  | "wrench"
  | "bot-message"
  | "sale"
  | "braces"
  | "orbit"
  | "shield"
  | "gift"
  | "megaphone"
  | "zap"
  | "radar"
  | "play"
  | "persona"
  | "panels"
  | "video"
  | "door"
  | "bot"
  | "layers"
  | "switch-camera"
  | "chart"
  | "banana"
  | "camera"
  | "clapperboard"
  | "film"
  | "mic"
  | "trending"
  | "flame"
  | "browser";

export type ModuleCoverSignature = "codex" | "claude" | "pair";

export interface ModuleCoverMetadata {
  readonly moduleId: string;
  readonly productSlug: string;
  readonly orderIndex: number;
  readonly topic: string;
  readonly icon: ModuleCoverIconName;
  readonly layout: ModuleCoverLayout;
  readonly accent: ModuleCoverAccent;
  readonly signature?: ModuleCoverSignature;
}

export const MODULE_COVER_CATALOG = [
  {
    moduleId: "ef6a6949-ecbb-4eb2-a000-72fcdce58d30",
    productSlug: "agente-atendimento",
    orderIndex: 0,
    topic: "service-welcome",
    icon: "sparkles",
    layout: "portal",
    accent: "codex",
    signature: "pair",
  },
  {
    moduleId: "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
    productSlug: "agente-atendimento",
    orderIndex: 1,
    topic: "tool-installation",
    icon: "wrench",
    layout: "workbench",
    accent: "emerald",
  },
  {
    moduleId: "f53202aa-94ec-4270-add0-da334f1bdd44",
    productSlug: "agente-atendimento",
    orderIndex: 2,
    topic: "service-agent",
    icon: "bot-message",
    layout: "network",
    accent: "codex",
  },
  {
    moduleId: "3045b87f-d748-4bd8-8aef-7b41f5ee04a4",
    productSlug: "agente-atendimento",
    orderIndex: 3,
    topic: "sell-your-agent",
    icon: "sale",
    layout: "funnel",
    accent: "emerald",
  },
  {
    moduleId: "529970f8-4b1c-44cb-ad1e-efcc07fd2f72",
    productSlug: "agente-atendimento",
    orderIndex: 4,
    topic: "claude-introduction",
    icon: "braces",
    layout: "portal",
    accent: "claude",
    signature: "claude",
  },
  {
    moduleId: "525bc166-7653-47ca-93b4-48f7e7dd7332",
    productSlug: "agente-atendimento",
    orderIndex: 5,
    topic: "claude-copilot",
    icon: "orbit",
    layout: "orbit",
    accent: "claude",
  },
  {
    moduleId: "18666f86-e909-499a-a3dd-6977056c348e",
    productSlug: "agente-atendimento",
    orderIndex: 6,
    topic: "claude-secret-weapon",
    icon: "shield",
    layout: "vault",
    accent: "claude",
  },
  {
    moduleId: "59e98bdf-cb49-4af9-b53b-fe93aa23c4d2",
    productSlug: "agente-atendimento",
    orderIndex: 7,
    topic: "service-bonus",
    icon: "gift",
    layout: "burst",
    accent: "emerald",
  },
  {
    moduleId: "cc7ed96a-6af2-41eb-b7d3-d1b09ce202ee",
    productSlug: "genios-ia",
    orderIndex: 19,
    topic: "marketing",
    icon: "megaphone",
    layout: "broadcast",
    accent: "claude",
  },
  {
    moduleId: "65bbe2f1-91d0-4388-b021-aa6beea6cb9c",
    productSlug: "genios-ia",
    orderIndex: 23,
    topic: "virality",
    icon: "zap",
    layout: "signal",
    accent: "codex",
  },
  {
    moduleId: "ae8f0be2-7635-4f89-86e5-859b39da791e",
    productSlug: "genios-ia",
    orderIndex: 24,
    topic: "prospecting",
    icon: "radar",
    layout: "radar",
    accent: "emerald",
  },
  {
    moduleId: "7c645e12-86bd-4b53-ac39-b3bd4af654d8",
    productSlug: "clone-criativo",
    orderIndex: 0,
    topic: "creative-course-intro",
    icon: "play",
    layout: "stage",
    accent: "codex",
    signature: "pair",
  },
  {
    moduleId: "a0d54832-f009-4cc3-a384-303d958aa727",
    productSlug: "clone-criativo",
    orderIndex: 1,
    topic: "persona-creation",
    icon: "persona",
    layout: "portrait",
    accent: "claude",
  },
  {
    moduleId: "84baf9e5-553b-48fc-bf7e-4d70357d50da",
    productSlug: "clone-criativo",
    orderIndex: 2,
    topic: "content-creation",
    icon: "panels",
    layout: "stack",
    accent: "emerald",
  },
  {
    moduleId: "f8019993-bdcc-4ea8-8a99-521c8135c4a0",
    productSlug: "clone-criativo",
    orderIndex: 3,
    topic: "heygen",
    icon: "video",
    layout: "frame",
    accent: "codex",
  },
  {
    moduleId: "3df41aab-078d-44bc-b310-b4cab8acdbfe",
    productSlug: "influencer-ia",
    orderIndex: 0,
    topic: "influencer-welcome",
    icon: "door",
    layout: "portal",
    accent: "claude",
    signature: "pair",
  },
  {
    moduleId: "0fe24dfc-6ad6-4848-9229-926e99473386",
    productSlug: "influencer-ia",
    orderIndex: 1,
    topic: "ai-influencer",
    icon: "bot",
    layout: "portrait",
    accent: "codex",
  },
  {
    moduleId: "8cf99541-bb94-43f5-b863-7ca07a7d3320",
    productSlug: "influencer-ia",
    orderIndex: 2,
    topic: "ai-influencer-alternative",
    icon: "layers",
    layout: "split",
    accent: "claude",
  },
  {
    moduleId: "5102702c-10f8-4b50-86d3-30cceaa2f3b9",
    productSlug: "influencer-ia",
    orderIndex: 3,
    topic: "influencer-monetization",
    icon: "chart",
    layout: "market",
    accent: "emerald",
  },
  {
    moduleId: "58eb0981-8acd-490c-baa9-16bdb85e9930",
    productSlug: "influencer-ia",
    orderIndex: 4,
    topic: "influencer-bonus",
    icon: "gift",
    layout: "burst",
    accent: "claude",
  },
  {
    moduleId: "b2188455-ea07-4626-b8d0-a2f2bb5e1283",
    productSlug: "fotos-profissionais",
    orderIndex: 7,
    topic: "nanobanana-pro",
    icon: "banana",
    layout: "studio",
    accent: "claude",
  },
  {
    moduleId: "98e5f69f-ffe0-48ef-a43b-051b9ba0c584",
    productSlug: "fotos-profissionais",
    orderIndex: 9,
    topic: "professional-photo-session",
    icon: "camera",
    layout: "frame",
    accent: "emerald",
  },
  {
    moduleId: "4d962da0-cc40-496a-a294-a56343295f61",
    productSlug: "videos-cinematograficos",
    orderIndex: 0,
    topic: "veo-3",
    icon: "clapperboard",
    layout: "stage",
    accent: "emerald",
  },
  {
    moduleId: "58e79b39-a3da-4fd6-81c6-78d8ce6d0e5f",
    productSlug: "videos-cinematograficos",
    orderIndex: 1,
    topic: "kling",
    icon: "film",
    layout: "orbit",
    accent: "codex",
  },
  {
    moduleId: "87ebd1c4-70db-4430-b52e-df1cc56dd62b",
    productSlug: "videos-cinematograficos",
    orderIndex: 2,
    topic: "seedance-2",
    icon: "switch-camera",
    layout: "signal",
    accent: "claude",
  },
  {
    moduleId: "0407ac13-d59b-455a-8d54-c6e351fd0960",
    productSlug: "videos-cinematograficos",
    orderIndex: 3,
    topic: "ai-podcast",
    icon: "mic",
    layout: "waveform",
    accent: "codex",
  },
  {
    moduleId: "64f46787-8efc-43fb-8c14-1bd8db442ed4",
    productSlug: "videos-cinematograficos",
    orderIndex: 4,
    topic: "video-monetization",
    icon: "trending",
    layout: "growth",
    accent: "emerald",
  },
  {
    moduleId: "f2883111-c4b8-443e-b440-65b7737a22f9",
    productSlug: "bonus-genios",
    orderIndex: 15,
    topic: "viral-videos",
    icon: "flame",
    layout: "broadcast",
    accent: "claude",
  },
  {
    moduleId: "d7b56db0-52d2-41e8-8469-386cd5ad465d",
    productSlug: "bonus-genios",
    orderIndex: 19,
    topic: "sales-page",
    icon: "browser",
    layout: "browser",
    accent: "emerald",
  },
] as const satisfies readonly ModuleCoverMetadata[];

export interface ModuleCoverLookup {
  moduleId: string | null | undefined;
  productSlug: string | null | undefined;
  orderIndex: number;
}

const coversByModuleId: ReadonlyMap<string, ModuleCoverMetadata> = new Map(
  MODULE_COVER_CATALOG.map((cover) => [cover.moduleId, cover]),
);

const coversByLegacyKey: ReadonlyMap<string, ModuleCoverMetadata> = new Map(
  MODULE_COVER_CATALOG.map((cover) => [
    `${cover.productSlug}:${cover.orderIndex}`,
    cover,
  ]),
);

export function getModuleCover({
  moduleId,
  productSlug,
  orderIndex,
}: ModuleCoverLookup): ModuleCoverMetadata | null {
  if (moduleId) {
    const stableCover = coversByModuleId.get(moduleId);
    if (stableCover) return stableCover;
  }

  if (!productSlug || !Number.isFinite(orderIndex)) return null;
  return coversByLegacyKey.get(`${productSlug}:${orderIndex}`) ?? null;
}
