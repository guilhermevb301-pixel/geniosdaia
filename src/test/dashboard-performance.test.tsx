import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "@/pages/Dashboard";

const mocks = vi.hoisted(() => ({
  useDashboardBanners: vi.fn(),
  useImagePreload: vi.fn(),
  useUserStreak: vi.fn(),
}));

vi.mock("@/hooks/useDashboardBanners", () => ({
  useDashboardBanners: mocks.useDashboardBanners,
}));
vi.mock("@/hooks/useImagePreload", () => ({ useImagePreload: mocks.useImagePreload }));
vi.mock("@/hooks/useUserStreak", () => ({ useUserStreak: mocks.useUserStreak }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/dashboard/AnnouncementCarousel", () => ({ AnnouncementCarousel: () => null }));
vi.mock("@/components/dashboard/WelcomeHero", () => ({ WelcomeHero: () => null }));
vi.mock("@/components/dashboard/JourneyStrip", () => ({ JourneyStrip: () => null }));
vi.mock("@/components/dashboard/DashboardGrid", () => ({ DashboardGrid: () => null }));
vi.mock("@/components/dashboard/AchievementsStrip", () => ({ AchievementsStrip: () => null }));

describe("Dashboard image preload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useUserStreak.mockReturnValue({ logActivity: vi.fn() });
  });

  it("does not skip the first slide to preload a later banner image", () => {
    mocks.useDashboardBanners.mockReturnValue({
      banners: [
        { id: "empty", image_url: null, title: "Texto" },
        { id: "second", image_url: "https://example.com/second.jpg" },
      ],
    });

    render(<Dashboard />);

    expect(mocks.useImagePreload).toHaveBeenCalledWith(
      [],
      { width: 1200, maxPreload: 1 },
    );
  });

  it("preloads only the first slide image when it exists", () => {
    mocks.useDashboardBanners.mockReturnValue({
      banners: [
        { id: "first", image_url: "https://example.com/first.jpg" },
        { id: "second", image_url: "https://example.com/second.jpg" },
      ],
    });

    render(<Dashboard />);

    expect(mocks.useImagePreload).toHaveBeenCalledWith(
      ["https://example.com/first.jpg"],
      { width: 1200, maxPreload: 1 },
    );
  });

  it("uses the current activity logger when its reference changes", () => {
    const firstLogger = vi.fn();
    const currentLogger = vi.fn();
    mocks.useDashboardBanners.mockReturnValue({ banners: [] });
    mocks.useUserStreak.mockReturnValue({ logActivity: firstLogger });
    const { rerender } = render(<Dashboard />);

    mocks.useUserStreak.mockReturnValue({ logActivity: currentLogger });
    rerender(<Dashboard />);

    expect(firstLogger).toHaveBeenCalledTimes(1);
    expect(currentLogger).toHaveBeenCalledTimes(1);
  });
});
