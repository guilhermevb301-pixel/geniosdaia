import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";

vi.stubGlobal(
  "IntersectionObserver",
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.mock("@/hooks/useDashboardBanners", () => ({
  useDashboardBanners: () => ({
    isLoading: false,
    banners: [
      {
        id: "one",
        title: "Confira as próximas lives",
        subtitle: "Encontros ao vivo",
        image_url: "",
        button_text: "Ver agenda",
        button_url: "/eventos",
        gradient: "",
        order_index: 0,
        is_active: true,
        created_at: "2026-09-04T00:00:00.000Z",
        height: 212,
        width_type: "full",
      },
    ],
  }),
}));

describe("AnnouncementCarousel", () => {
  it("renders the promotion as an accessible destination", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AnnouncementCarousel />
      </MemoryRouter>,
    );

    const destination = screen.getByRole("link", { name: /confira as próximas lives/i });

    expect(destination).toHaveAttribute("href", "/eventos");
    expect(destination).toHaveAttribute("aria-label", "Confira as próximas lives");
  });
});
