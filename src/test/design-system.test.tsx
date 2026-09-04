import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Terminal Premium tokens", () => {
  it("keeps RealFrame green primary and registers both mascot accents", () => {
    const css = fs.readFileSync("src/index.css", "utf8");
    expect(css).toContain("--primary: 160 64% 52%");
    expect(css).toContain("--codex: 226 100% 67%");
    expect(css).toContain("--claude: 16 76% 62%");
    expect(css).toContain("Geist Sans");
  });
});
