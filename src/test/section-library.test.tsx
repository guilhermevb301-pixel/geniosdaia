import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Aulas from "@/pages/Aulas";

const sections = [
  "Agentes de IA + Claude",
  "Genios das Vendas",
  "Genios dos Clones de IA",
  "Influencers de IA",
  "Genios das Imagens",
  "Genios dos Videos",
  "Bonus",
];

const productSlugs = [
  "agente-atendimento",
  "genios-ia",
  "clone-criativo",
  "influencer-ia",
  "fotos-profissionais",
  "videos-cinematograficos",
  "bonus-genios",
];

const sectionViews = sections.map((title, index) => ({
  id: `section-${index + 1}`,
  title,
  productSlug: productSlugs[index],
  orderIndex: index,
  moduleCount: index + 1,
  totalLessons: 5,
  completedLessons: index === 0 ? 2 : 0,
  progressPercent: index === 0 ? 40 : 0,
  locked: false,
  modules: [],
}));

vi.mock("@/hooks/useCourseLibrary", () => ({
  useCourseLibrary: () => ({
    sections: sectionViews,
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

describe("session library", () => {
  it("shows sessions first without exposing their modules", () => {
    render(
      <MemoryRouter>
        <Aulas />
      </MemoryRouter>,
    );

    expect(screen.getByText("sessões")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /abrir sessão/i })).toHaveLength(7);
    expect(screen.queryByText("Instalando as Ferramentas")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /abrir sessão agentes de ia \+ claude/i }),
    ).toHaveAttribute("href", "/aulas/sessao/section-1");
  });

  it("shows aggregated progress for a started session", () => {
    render(
      <MemoryRouter>
        <Aulas />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("progressbar", {
        name: "Progresso da sessão Agentes de IA + Claude",
      }),
    ).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("2 de 5 aulas")).toBeInTheDocument();
  });
});
