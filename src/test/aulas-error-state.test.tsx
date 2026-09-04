import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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

    expect(
      screen.getByRole("heading", { name: /não foi possível carregar suas aulas/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sem módulos disponíveis/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(mocks.refetchSections).toHaveBeenCalledOnce();
    expect(mocks.refetchModules).toHaveBeenCalledOnce();
    expect(mocks.refetchLessons).toHaveBeenCalledOnce();
    expect(mocks.refetchProgress).toHaveBeenCalledOnce();
  });
});
