import { describe, expect, it } from "vitest";
import { getBlurPlaceholderUrl, getOptimizedImageUrl } from "@/lib/imageOptimization";

describe("imageOptimization", () => {
  it("keeps local app assets out of the external image proxy", () => {
    expect(getOptimizedImageUrl("/assets/module-cover.webp", { width: 480 })).toBe(
      "/assets/module-cover.webp",
    );
    expect(getBlurPlaceholderUrl("/assets/module-cover.webp")).toBeNull();
  });

  it("still proxies remote images", () => {
    const optimizedUrl = getOptimizedImageUrl("https://example.com/cover.png", {
      width: 480,
      quality: 84,
    });

    expect(optimizedUrl).toContain("https://wsrv.nl/");
    expect(optimizedUrl).toContain("example.com");
  });
});
