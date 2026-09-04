import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { prefetchModules } from "@/lib/prefetchRoutes";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mocks.from },
}));

describe("route prefetch cache contracts", () => {
  it("stores Aulas modules under the query key consumed by the page", async () => {
    const modules = [{ id: "module-1", title: "Primeiro módulo" }];
    const order = vi.fn().mockResolvedValue({ data: modules, error: null });
    const select = vi.fn(() => ({ order }));
    mocks.from.mockReturnValue({ select });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await prefetchModules(queryClient);

    expect(queryClient.getQueryData(["modules"])).toEqual(modules);
    expect(queryClient.getQueryData(["modules-with-sections"])).toBeUndefined();
  });
});
