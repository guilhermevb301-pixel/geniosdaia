import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SectionGrid } from "@/components/aulas/SectionGrid";
import type { CourseSectionView } from "@/lib/courseLibrary";

const sections: CourseSectionView[] = Array.from({ length: 8 }, (_, index) => ({
  id: `section-${index + 1}`,
  title: index === 7 ? "Mentorias em grupo" : `Sessão ${index + 1}`,
  productSlug: [
    "agente-atendimento",
    "genios-ia",
    "clone-criativo",
    "influencer-ia",
    "fotos-profissionais",
    "videos-cinematograficos",
    "bonus-genios",
    null,
  ][index],
  orderIndex: index,
  moduleCount: index + 1,
  completedLessons: 0,
  totalLessons: 3,
  progressPercent: 0,
  locked: false,
  modules:
    index === 7
      ? [
          {
            id: "mentorship-module",
            title: "Mentorias em grupo",
            description: null,
            coverImageUrl: null,
            orderIndex: 0,
            sectionId: "section-8",
            completedLessons: 0,
            totalLessons: 3,
            progressPercent: 0,
          },
        ]
      : [],
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
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
});

describe("SectionGrid", () => {
  it("renders all database sessions in one horizontal carousel", () => {
    render(
      <MemoryRouter>
        <SectionGrid sections={sections} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("region", { name: "Sessões de aulas" })).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(8);
    expect(screen.getByText("Mentorias em grupo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir sessão Mentorias em grupo" })).toHaveAttribute(
      "href",
      "/aulas/mentorship-module",
    );
  });

  it("uses portrait 9:16 cover frames", () => {
    const { container } = render(
      <MemoryRouter>
        <SectionGrid sections={sections} />
      </MemoryRouter>,
    );

    const covers = container.querySelectorAll('[data-section-cover="portrait"]');
    expect(covers).toHaveLength(8);
    expect(Array.from(covers).every((cover) => cover.classList.contains("aspect-[9/16]"))).toBe(
      true,
    );
  });
});
