import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { prefetchBanners, prefetchModules } from "@/lib/prefetchRoutes";

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

  it("stores dashboard banners under the exact query key consumed by the hook", async () => {
    const banners = [{ id: "banner-1", title: "Novidade" }];
    const order = vi.fn().mockResolvedValue({ data: banners, error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    mocks.from.mockReturnValue({ select });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await prefetchBanners(queryClient);

    expect(queryClient.getQueryData(["dashboardBanners"])).toEqual(banners);
    expect(queryClient.getQueryData(["dashboard-banners"])).toBeUndefined();
  });
});
