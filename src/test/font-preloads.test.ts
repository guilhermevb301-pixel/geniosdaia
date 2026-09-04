import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("document font preloads", () => {
  it("preloads only the Geist font files used by the design system", () => {
    const html = fs.readFileSync("index.html", "utf8");
    const document = new DOMParser().parseFromString(html, "text/html");
    const fontPreloads = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]'),
    ).map((link) => link.getAttribute("href"));

    expect(fontPreloads).toEqual([
      "/fonts/geist-sans-variable.woff2",
      "/fonts/geist-mono-variable.woff2",
    ]);
  });
});
