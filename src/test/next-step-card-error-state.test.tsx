import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextStepCard } from "@/components/dashboard/NextStepCard";

const mocks = vi.hoisted(() => ({
  failingTable: { current: "" },
  from: vi.fn(),
  refetch: vi.fn(),
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
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mocks.from },
}));

function createQueryResult(table: string) {
  const result = {
    data: [],
    error: table === mocks.failingTable.current ? new Error(`${table} unavailable`) : null,
  };
  const resolvedResult = Promise.resolve(result);
  const builder = {
    eq: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    then: resolvedResult.then.bind(resolvedResult),
  };

  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  return builder;
}

describe("NextStepCard error state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.failingTable.current = "";
    mocks.from.mockImplementation((table: string) => createQueryResult(table));
    mocks.useQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: mocks.refetch,
    });
  });

  it("shows a compact unavailable card and retries instead of linking to the library", () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <NextStepCard />
      </MemoryRouter>,
    );

    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByRole("heading", { name: /não foi possível carregar seu próximo passo/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver todas as aulas/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it.each([
    "module_sections",
    "modules",
    "lessons",
    "lesson_progress",
  ])("surfaces a failure returned by %s", async (table) => {
    mocks.failingTable.current = table;

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <NextStepCard />
      </MemoryRouter>,
    );

    const queryOptions = mocks.useQuery.mock.calls[0][0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(queryOptions.queryFn()).rejects.toThrow(`${table} unavailable`);
  });
});
