import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import postcss, { type Rule } from "postcss";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "@/components/layout/AppLayout";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      email: "member@example.com",
      user_metadata: { full_name: "RealFrame Member" },
    },
    signOut: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUserXP", () => ({
  useUserXP: () => ({
    isLoading: false,
    levelInfo: {
      level: 3,
      name: "Criador",
      progress: 40,
      xpInLevel: 200,
      xpForNextLevel: 500,
    },
  }),
}));

vi.mock("@/hooks/useUserStreak", () => ({
  useUserStreak: () => ({ currentStreak: 7, isLoading: false }),
}));

vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => ({ isAdmin: false }),
}));

vi.mock("@/hooks/useIsMentor", () => ({
  useIsMentor: () => ({ isMentor: false }),
}));

vi.mock("@/hooks/useIsMentee", () => ({
  useIsMentee: () => ({ isMentee: false }),
}));

const css = fs.readFileSync("src/index.css", "utf8");
const stylesheet = postcss.parse(css);

function findRule(selector: string): Rule | undefined {
  let match: Rule | undefined;
  stylesheet.walkRules(selector, (rule) => {
    if (!match && rule.selector === selector) match = rule;
  });
  return match;
}

describe("Terminal Premium tokens", () => {
  it("keeps RealFrame green primary and registers both mascot accents", () => {
    const tokens = new Map<string, string>();
    const root = findRule(":root");

    root?.walkDecls(/^--(primary|codex|claude)$/, (declaration) => {
      tokens.set(declaration.prop, declaration.value);
    });

    expect(tokens).toEqual(
      new Map([
        ["--primary", "160 64% 52%"],
        ["--codex", "226 100% 67%"],
        ["--claude", "16 76% 62%"],
      ]),
    );

    const fontFamilies: string[] = [];
    stylesheet.walkAtRules("font-face", (fontFace) => {
      fontFace.walkDecls("font-family", (declaration) => {
        fontFamilies.push(declaration.value.replace(/["']/g, ""));
      });
    });

    expect(fontFamilies).toEqual(expect.arrayContaining(["Geist Sans", "Geist Mono"]));
  });

  it("exposes the reusable surface, label, and focus utility interfaces", () => {
    const selectors = new Set<string>();
    stylesheet.walkRules((rule) => {
      rule.selectors.forEach((selector) => selectors.add(selector));
    });

    expect([...selectors]).toEqual(
      expect.arrayContaining([
        ".surface",
        ".surface-raised",
        ".interactive-surface",
        ".micro-label",
        ".focus-ring",
      ]),
    );

    const interactiveSurface = findRule(".interactive-surface");
    const transition = interactiveSurface?.nodes.find(
      (node) => node.type === "decl" && node.prop === "transition",
    );
    const animatedProperties =
      transition?.type === "decl"
        ? transition.value.split(",").map((value) => value.trim().split(/\s+/)[0])
        : [];

    expect(animatedProperties.length).toBeGreaterThan(0);
    expect(animatedProperties.every((property) => ["transform", "opacity"].includes(property))).toBe(true);
  });

  it("renders a single XP progress bar in the application shell", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <AppLayout>
            <div>Dashboard content</div>
          </AppLayout>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
  });
});
