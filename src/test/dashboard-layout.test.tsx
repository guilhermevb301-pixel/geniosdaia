import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

const { nextLiveEventMock, useQueryMock } = vi.hoisted(() => ({
  nextLiveEventMock: vi.fn(),
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: (previousData: unknown) => previousData,
  useQuery: useQueryMock,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "member-1" } }),
}));

vi.mock("@/hooks/useUserProducts", () => ({
  useUserProducts: () => ({
    hasProduct: () => true,
    isLoading: false,
  }),
}));

vi.mock("@/data/liveEvents", () => ({
  nextLiveEvent: nextLiveEventMock,
}));

describe("DashboardGrid", () => {
  beforeEach(() => {
    useQueryMock.mockReturnValue({
      data: {
        sections: [],
        modules: [],
        lessons: [],
        progress: [],
      },
      isLoading: false,
    });
    nextLiveEventMock.mockReturnValue(undefined);
  });

  it("uses a mobile-first grid with an 8/4 two-row desktop split", () => {
    render(
      <MemoryRouter>
        <DashboardGrid />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("dashboard-grid")).toHaveClass(
      "grid",
      "lg:grid-cols-12",
      "lg:grid-rows-2",
    );
    expect(screen.getByTestId("dashboard-grid")).not.toHaveClass("grid-cols-12");
    expect(screen.getByTestId("dashboard-learning-region")).toHaveClass(
      "lg:col-span-8",
      "lg:row-span-2",
    );
    expect(screen.getByTestId("dashboard-secondary-region")).toHaveClass(
      "lg:col-span-4",
      "lg:row-span-2",
      "lg:grid-rows-2",
    );
  });

  it("keeps useful destinations when learning and live data are empty", () => {
    render(
      <MemoryRouter>
        <DashboardGrid />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /ver todas as aulas/i })).toHaveAttribute(
      "href",
      "/aulas",
    );
    expect(screen.getByRole("link", { name: /ver lives e replays/i })).toHaveAttribute(
      "href",
      "/eventos",
    );
    expect(
      screen.getByRole("link", { name: /aplicar para mentoria/i }),
    ).toHaveAttribute("href", "/mentoria");
  });
});
