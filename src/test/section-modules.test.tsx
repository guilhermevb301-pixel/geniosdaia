import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import SectionModules from "@/pages/SectionModules";

const libraryState = vi.hoisted(() => ({
  locked: false,
}));

vi.mock("@/hooks/useCourseLibrary", () => ({
  useCourseLibrary: () => ({
    sections: [
      {
        id: "section-influencers",
        title: "INFLUENCERS DE IA",
        productSlug: "influencer-ia",
        orderIndex: 3,
        moduleCount: 2,
        totalLessons: 4,
        completedLessons: 1,
        progressPercent: 25,
        locked: libraryState.locked,
        modules: [
          {
            id: "module-1",
            title: "Influencer com IA",
            description: "Crie sua própria influencer.",
            coverImageUrl: null,
            orderIndex: 0,
            sectionId: "section-influencers",
            completedLessons: 1,
            totalLessons: 2,
            progressPercent: 50,
          },
          {
            id: "module-2",
            title: "Monetização com influencers",
            description: null,
            coverImageUrl: null,
            orderIndex: 1,
            sectionId: "section-influencers",
            completedLessons: 0,
            totalLessons: 2,
            progressPercent: 0,
          },
        ],
      },
    ],
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/aulas/sessao/section-influencers"]}>
      <Routes>
        <Route path="/aulas/sessao/:sectionId" element={<SectionModules />} />
        <Route path="/acesso-negado" element={<h1>Acesso negado</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SectionModules", () => {
  it("shows only modules from the selected session", () => {
    libraryState.locked = false;
    renderPage();

    expect(screen.getByRole("heading", { name: "Influencers de IA" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /abrir módulo/i })).toHaveLength(2);
    expect(screen.getByText("1 de 4 aulas concluídas")).toBeInTheDocument();
  });

  it("redirects a locked session without rendering its modules", () => {
    libraryState.locked = true;
    renderPage();

    expect(screen.getByRole("heading", { name: "Acesso negado" })).toBeInTheDocument();
    expect(screen.queryByText("Influencer com IA")).not.toBeInTheDocument();
  });
});
