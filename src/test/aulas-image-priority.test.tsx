import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Aulas from "@/pages/Aulas";

const sections = Array.from({ length: 4 }, (_, index) => ({
  id: `section-${index + 1}`,
  title: `Sessão ${index + 1}`,
  productSlug: [
    "agente-atendimento",
    "genios-ia",
    "clone-criativo",
    "influencer-ia",
  ][index],
  orderIndex: index,
  moduleCount: 1,
  totalLessons: 2,
  completedLessons: 0,
  progressPercent: 0,
  locked: false,
  modules: [],
}));

vi.mock("@/hooks/useCourseLibrary", () => ({
  useCourseLibrary: () => ({
    sections,
    modulesWithoutSection: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("Aulas image priority", () => {
  it("prioritizes only the first row of session covers", () => {
    const { container } = render(
      <MemoryRouter>
        <Aulas />
      </MemoryRouter>,
    );

    const images = Array.from(container.querySelectorAll("img"));
    expect(images).toHaveLength(3);
    expect(images.every((image) => image.getAttribute("loading") === "eager")).toBe(true);
  });
});
