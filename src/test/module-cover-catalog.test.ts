import { describe, expect, it } from "vitest";
import {
  getModuleCover,
  MODULE_COVER_CATALOG,
} from "@/lib/moduleCoverCatalog";

const INVENTORY_MODULE_IDS = [
  "ef6a6949-ecbb-4eb2-a000-72fcdce58d30",
  "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
  "f53202aa-94ec-4270-add0-da334f1bdd44",
  "3045b87f-d748-4bd8-8aef-7b41f5ee04a4",
  "529970f8-4b1c-44cb-ad1e-efcc07fd2f72",
  "525bc166-7653-47ca-93b4-48f7e7dd7332",
  "18666f86-e909-499a-a3dd-6977056c348e",
  "59e98bdf-cb49-4af9-b53b-fe93aa23c4d2",
  "cc7ed96a-6af2-41eb-b7d3-d1b09ce202ee",
  "65bbe2f1-91d0-4388-b021-aa6beea6cb9c",
  "ae8f0be2-7635-4f89-86e5-859b39da791e",
  "7c645e12-86bd-4b53-ac39-b3bd4af654d8",
  "a0d54832-f009-4cc3-a384-303d958aa727",
  "84baf9e5-553b-48fc-bf7e-4d70357d50da",
  "f8019993-bdcc-4ea8-8a99-521c8135c4a0",
  "3df41aab-078d-44bc-b310-b4cab8acdbfe",
  "0fe24dfc-6ad6-4848-9229-926e99473386",
  "8cf99541-bb94-43f5-b863-7ca07a7d3320",
  "5102702c-10f8-4b50-86d3-30cceaa2f3b9",
  "58eb0981-8acd-490c-baa9-16bdb85e9930",
  "b2188455-ea07-4626-b8d0-a2f2bb5e1283",
  "98e5f69f-ffe0-48ef-a43b-051b9ba0c584",
  "4d962da0-cc40-496a-a294-a56343295f61",
  "58e79b39-a3da-4fd6-81c6-78d8ce6d0e5f",
  "87ebd1c4-70db-4430-b52e-df1cc56dd62b",
  "0407ac13-d59b-455a-8d54-c6e351fd0960",
  "64f46787-8efc-43fb-8c14-1bd8db442ed4",
  "f2883111-c4b8-443e-b440-65b7737a22f9",
  "d7b56db0-52d2-41e8-8469-386cd5ad465d",
] as const;

describe("module cover catalog", () => {
  it("keeps cover identity attached to the module UUID after reordering", () => {
    const expected = getModuleCover({
      moduleId: "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
      productSlug: "agente-atendimento",
      orderIndex: 1,
    });
    const afterReorder = getModuleCover({
      moduleId: "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
      productSlug: "agente-atendimento",
      orderIndex: 0,
    });

    expect(afterReorder).toEqual(expected);
    expect(afterReorder?.moduleId).toBe("0a58dcfd-8430-4cac-8295-3f178c2eaa97");
  });

  it("resolves neighboring known modules to different artwork metadata", () => {
    const first = getModuleCover({
      moduleId: "ef6a6949-ecbb-4eb2-a000-72fcdce58d30",
      productSlug: "agente-atendimento",
      orderIndex: 0,
    });
    const second = getModuleCover({
      moduleId: "0a58dcfd-8430-4cac-8295-3f178c2eaa97",
      productSlug: "agente-atendimento",
      orderIndex: 1,
    });

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toEqual(second);
    expect(first?.topic).not.toBe(second?.topic);
  });

  it("covers every module UUID from the read-only inventory", () => {
    const resolvedIds = INVENTORY_MODULE_IDS.filter((moduleId) =>
      getModuleCover({ moduleId, productSlug: null, orderIndex: -1 }),
    );

    expect(resolvedIds).toEqual(INVENTORY_MODULE_IDS);
    expect(resolvedIds).toHaveLength(29);
  });

  it("uses product and order as a legacy fallback", () => {
    const cover = getModuleCover({
      moduleId: null,
      productSlug: "videos-cinematograficos",
      orderIndex: 2,
    });

    expect(cover?.moduleId).toBe("87ebd1c4-70db-4430-b52e-df1cc56dd62b");
  });

  it("does not let an unknown UUID collide with a known legacy key", () => {
    expect(
      getModuleCover({
        moduleId: "future-module",
        productSlug: "videos-cinematograficos",
        orderIndex: 2,
      }),
    ).toBeNull();
  });

  it("keeps all 29 rendered visual signatures unique beyond identity fields", () => {
    const visualSignatures = MODULE_COVER_CATALOG.map((cover) =>
      [
        cover.icon,
        cover.layout,
        "reflection" in cover ? cover.reflection : "missing-reflection",
        cover.signature ?? "no-signature",
      ].join("|"),
    );

    expect(visualSignatures).toHaveLength(29);
    expect(new Set(visualSignatures)).toHaveLength(29);
  });

  it("returns null when neither stable nor legacy keys are known", () => {
    expect(
      getModuleCover({
        moduleId: "future-module",
        productSlug: "future-product",
        orderIndex: 99,
      }),
    ).toBeNull();
  });
});
