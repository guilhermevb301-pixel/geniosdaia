import { describe, expect, it } from "vitest";
import { MODULE_COVER_CATALOG } from "@/lib/moduleCoverCatalog";
import { getModuleCoverImage } from "@/lib/moduleCoverImages";

describe("3D module cover images", () => {
  it("provides an optimized image for every catalogued module topic", () => {
    for (const module of MODULE_COVER_CATALOG) {
      expect(getModuleCoverImage(module.topic), module.topic).toMatch(/\.webp$/);
    }
  });
});
