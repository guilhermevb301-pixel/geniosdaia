import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Aulas from "@/pages/Aulas";

const mocks = vi.hoisted(() => ({
  refetchLessons: vi.fn(),
  refetchModules: vi.fn(),
  refetchProgress: vi.fn(),
  refetchSections: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: Symbol("keepPreviousData"),
  useQuery: mocks.useQuery,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "member-1" } }),
}));
vi.mock("@/hooks/useUserProducts", () => ({
  useUserProducts: () => ({ hasProduct: () => true, isLoading: false }),
}));
vi.mock("@/hooks/useImagePreload", () => ({ useImagePreload: vi.fn() }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/aulas/ModuleCarousel", () => ({
  ModuleCarousel: ({ isLoading, title }: { isLoading?: boolean; title?: string }) => (
    <div data-testid={isLoading ? "library-loading" : "library-trail"}>{title}</div>
  ),
}));

describe("Aulas error state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      switch (queryKey[0]) {
        case "module_sections":
          return {
            data: [],
            isError: false,
            refetch: mocks.refetchSections,
          };
        case "modules":
          return {
            data: undefined,
            isError: true,
            isLoading: false,
            refetch: mocks.refetchModules,
          };
        case "lessons":
          return {
            data: [],
            isError: false,
            isLoading: false,
            refetch: mocks.refetchLessons,
          };
        case "lesson_progress":
          return {
            data: [],
            isError: false,
            refetch: mocks.refetchProgress,
          };
        default:
          throw new Error(`Unexpected query key: ${String(queryKey[0])}`);
      }
    });
  });

  it("shows a clear unavailable state and retries the complete library data", () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Aulas />
      </MemoryRouter>,
    );

    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByRole("heading", { name: /não foi possível carregar suas aulas/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sem módulos disponíveis/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(mocks.refetchSections).toHaveBeenCalledOnce();
    expect(mocks.refetchModules).toHaveBeenCalledOnce();
    expect(mocks.refetchLessons).toHaveBeenCalledOnce();
    expect(mocks.refetchProgress).toHaveBeenCalledOnce();
  });

  it.each([
    "module_sections",
    "modules",
    "lessons",
    "lesson_progress",
  ])("keeps progress and trails hidden while %s is loading", (loadingQuery) => {
    mocks.useQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const key = String(queryKey[0]);
      const dataByQuery: Record<string, unknown[]> = {
        module_sections: [
          { id: "section-1", title: "Primeira trilha", order_index: 0, created_at: "", product_slug: null },
        ],
        modules: [
          {
            id: "module-1",
            title: "Módulo completo",
            description: null,
            cover_image_url: null,
            order_index: 0,
            section_id: "section-1",
          },
        ],
        lessons: [{ id: "lesson-1", module_id: "module-1", order_index: 0 }],
        lesson_progress: [],
      };

      return {
        data: dataByQuery[key],
        isError: false,
        isLoading: key === loadingQuery,
        refetch: vi.fn(),
      };
    });

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Aulas />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("library-loading")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: /progresso geral do curso/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("library-trail")).not.toBeInTheDocument();
  });
});
