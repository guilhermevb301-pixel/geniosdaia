import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import Aulas from "@/pages/Aulas";

const mocks = vi.hoisted(() => ({
  useImagePreload: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: Symbol("keepPreviousData"),
  useQuery: mocks.useQuery,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "member-1" } }) }));
vi.mock("@/hooks/useUserProducts", () => ({
  useUserProducts: () => ({ hasProduct: () => true, isLoading: false }),
}));
vi.mock("@/hooks/useImagePreload", () => ({ useImagePreload: mocks.useImagePreload }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const sections = [
  { id: "section-1", title: "Primeira trilha", order_index: 0, created_at: "", product_slug: null },
  { id: "section-2", title: "Segunda trilha", order_index: 1, created_at: "", product_slug: null },
];

const modules = [
  {
    id: "unmapped-cover-one",
    title: "Módulo prioritário",
    description: null,
    cover_image_url: "https://example.com/first-cover.jpg",
    order_index: 99,
    section_id: "section-1",
  },
  {
    id: "unmapped-cover-two",
    title: "Módulo posterior",
    description: null,
    cover_image_url: "https://example.com/second-cover.jpg",
    order_index: 98,
    section_id: "section-2",
  },
];

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("Aulas image priority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      switch (queryKey[0]) {
        case "module_sections":
          return { data: sections };
        case "modules":
          return { data: modules, isLoading: false };
        case "lessons":
          return { data: [], isLoading: false };
        case "lesson_progress":
          return { data: [] };
        default:
          throw new Error(`Unexpected query key: ${String(queryKey[0])}`);
      }
    });
  });

  it("marks covers from only the first visible trail as eager", () => {
    render(
      <MemoryRouter>
        <Aulas />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: "Módulo prioritário" })).toHaveAttribute(
      "loading",
      "eager",
    );
    expect(screen.queryByRole("img", { name: "Módulo posterior" })).not.toBeInTheDocument();
    expect(mocks.useImagePreload).toHaveBeenCalledWith(
      ["https://example.com/first-cover.jpg"],
      { width: 200, quality: 50, maxPreload: 5 },
    );
  });
});
