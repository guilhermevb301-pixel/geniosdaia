import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementCarousel } from "@/components/dashboard/AnnouncementCarousel";
import type { DashboardBanner } from "@/hooks/useDashboardBanners";

const mocks = vi.hoisted(() => ({
  useDashboardBanners: vi.fn(),
  useEmblaCarousel: vi.fn(),
}));

vi.mock("@/hooks/useDashboardBanners", () => ({
  useDashboardBanners: mocks.useDashboardBanners,
}));

vi.mock("embla-carousel-react", () => ({
  default: mocks.useEmblaCarousel,
}));

type EmblaListener = Parameters<EmblaCarouselType["on"]>[1];

function createBanner(overrides: Partial<DashboardBanner> = {}): DashboardBanner {
  return {
    id: "one",
    title: "Confira as próximas lives",
    subtitle: "Encontros ao vivo",
    image_url: null,
    button_text: "Ver agenda",
    button_url: "/eventos",
    gradient: "",
    order_index: 0,
    is_active: true,
    created_at: "2026-09-04T00:00:00.000Z",
    height: 212,
    width_type: "full",
    ...overrides,
  };
}

function createControlledCarousel(totalSlides: number) {
  const listeners = new Map<EmblaEventType, Set<EmblaListener>>();
  let current = 0;

  const emit = (event: EmblaEventType) => {
    listeners.get(event)?.forEach((listener) => listener(api, event));
  };

  const on = vi.fn((event: EmblaEventType, listener: EmblaListener) => {
    const eventListeners = listeners.get(event) ?? new Set<EmblaListener>();
    eventListeners.add(listener);
    listeners.set(event, eventListeners);
    return api;
  });

  const off = vi.fn((event: EmblaEventType, listener: EmblaListener) => {
    listeners.get(event)?.delete(listener);
    return api;
  });

  const scrollNext = vi.fn((jump?: boolean) => {
    current = totalSlides > 0 ? (current + 1) % totalSlides : 0;
    emit("select");
  });

  const scrollPrev = vi.fn((jump?: boolean) => {
    current = totalSlides > 0 ? (current - 1 + totalSlides) % totalSlides : 0;
    emit("select");
  });

  const scrollTo = vi.fn((index: number, jump?: boolean) => {
    current = index;
    emit("select");
  });

  const api = {
    canScrollNext: () => totalSlides > 1,
    canScrollPrev: () => totalSlides > 1,
    off,
    on,
    scrollNext,
    scrollPrev,
    scrollTo,
    scrollSnapList: () => Array.from({ length: totalSlides }, (_, index) => index),
    selectedScrollSnap: () => current,
  } as unknown as EmblaCarouselType;

  return {
    api,
    off,
    on,
    scrollNext,
    scrollPrev,
    scrollTo,
    select(index: number) {
      current = index;
      emit("select");
    },
  };
}

function renderCarousel(banners: DashboardBanner[], isLoading = false) {
  const carousel = createControlledCarousel(banners.length);
  mocks.useDashboardBanners.mockReturnValue({ banners, isLoading, error: null });
  mocks.useEmblaCarousel.mockReturnValue([vi.fn(), carousel.api]);

  const result = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnnouncementCarousel />
    </MemoryRouter>,
  );

  return { ...result, carousel };
}

function setReducedMotion(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  );
}

describe("AnnouncementCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setReducedMotion(false);
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private callback: IntersectionObserverCallback) {}

        observe(target: Element) {
          this.callback(
            [{ isIntersecting: true, target } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        }

        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders nothing when there are no banners", () => {
    const { container } = renderCarousel([]);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one internal promotion without navigation controls", () => {
    const banner = createBanner({ image_url: "https://example.com/banner.jpg" });
    const unexpectedConsoleErrors: unknown[][] = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (!args.some((argument) => String(argument).includes("fetchPriority"))) {
        unexpectedConsoleErrors.push(args);
      }
    });
    const { container } = renderCarousel([banner]);
    const destination = screen.getByRole("link", { name: banner.title });
    const images = Array.from(container.querySelectorAll('img:not([aria-hidden="true"])'));

    expect(destination).toHaveAttribute("href", "/eventos");
    expect(destination).toHaveAttribute("aria-label", banner.title);
    expect(screen.queryByRole("button", { name: "Promoção anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próxima promoção" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /promoção 1 de 1/i })).not.toBeInTheDocument();
    expect(images.length).toBeGreaterThan(0);
    expect(images.every((image) => image.getAttribute("alt") === "")).toBe(true);
    expect(unexpectedConsoleErrors).toHaveLength(0);
  });

  it("preserves external links and accessible-name fallbacks", async () => {
    const banners = [
      createBanner({ id: "title", title: "Agenda da comunidade" }),
      createBanner({
        id: "button",
        title: "",
        button_text: "Conhecer programa",
        button_url: "https://example.com/programa",
      }),
      createBanner({ id: "fallback", title: "", button_text: null, button_url: "/promocao" }),
    ];
    renderCarousel(banners);

    expect(screen.getByRole("link", { name: "Agenda da comunidade" })).toHaveAttribute(
      "aria-label",
      "Agenda da comunidade",
    );

    const externalLink = screen.getByRole("link", { name: "Conhecer programa" });
    expect(externalLink).toHaveAttribute("href", "https://example.com/programa");
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Ver promoção" })).toHaveAttribute("href", "/promocao");

    await waitFor(() => expect(screen.getByRole("button", { name: "Próxima promoção" })).toBeEnabled());
  });

  it("shows focusable controls and dots without color-transition classes", async () => {
    const banners = [
      createBanner({ id: "one" }),
      createBanner({ id: "two", title: "Segunda promoção" }),
      createBanner({ id: "three", title: "Terceira promoção" }),
    ];
    const { container } = renderCarousel(banners);

    const previous = await screen.findByRole("button", { name: "Promoção anterior" });
    const next = screen.getByRole("button", { name: "Próxima promoção" });
    const dots = screen.getAllByRole("button", { name: /ir para promoção/i });

    await waitFor(() => expect(next).toBeEnabled());
    expect(previous).toBeEnabled();
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");

    next.focus();
    expect(next).toHaveFocus();
    dots[1].focus();
    expect(dots[1]).toHaveFocus();

    expect(container.querySelector('[class*="transition"]')).not.toBeInTheDocument();
    expect(screen.getAllByText("Ver agenda")[0]).toHaveClass("bg-[#34d399]");
    expect(screen.getAllByText("Ver agenda")[0].className).not.toContain("#6ee7b7");
  });

  it("provides 44px touch targets while keeping indicator dots visually small", async () => {
    const banners = [createBanner({ id: "one" }), createBanner({ id: "two" })];
    renderCarousel(banners);

    const previous = await screen.findByRole("button", { name: "Promoção anterior" });
    const next = screen.getByRole("button", { name: "Próxima promoção" });
    const dots = screen.getAllByRole("button", { name: /ir para promoção/i });

    expect(previous).toHaveClass("h-11", "w-11");
    expect(next).toHaveClass("h-11", "w-11");
    dots.forEach((dot) => {
      expect(dot).toHaveClass("h-11", "w-11");
      expect(dot.firstElementChild).toHaveClass("h-2", "w-2");
    });
  });

  it("uses one compact live status instead of overflowing dots for eight banners", async () => {
    const banners = Array.from({ length: 8 }, (_, index) =>
      createBanner({ id: `banner-${index + 1}`, title: `Promoção ${index + 1}` }),
    );
    renderCarousel(banners);

    const next = await screen.findByRole("button", { name: "Próxima promoção" });
    const status = screen.getByRole("status", { name: "Promoção 1 de 8" });

    expect(screen.queryAllByRole("button", { name: /ir para promoção/i })).toHaveLength(0);
    expect(screen.queryByRole("group", { name: "Promoção 1 de 8" })).not.toBeInTheDocument();
    expect(status).toHaveClass("whitespace-nowrap");
    expect(status).toHaveTextContent("1 de 8");

    fireEvent.click(next);

    await waitFor(() => {
      expect(screen.getByRole("status", { name: "Promoção 2 de 8" })).toHaveTextContent("2 de 8");
    });
  });

  it("prioritizes only the initially visible banner image", () => {
    const banners = [
      createBanner({ id: "one", image_url: "https://example.com/one.jpg" }),
      createBanner({ id: "two", image_url: "https://example.com/two.jpg" }),
      createBanner({ id: "three", image_url: "https://example.com/three.jpg" }),
    ];
    const { container } = renderCarousel(banners);
    const images = Array.from(container.querySelectorAll('img:not([aria-hidden="true"])'));

    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("loading", "eager");
    expect(images.slice(1).every((image) => image.getAttribute("loading") === "lazy")).toBe(true);
  });

  it("uses instant Embla navigation when reduced motion is requested", async () => {
    setReducedMotion(true);
    const banners = [
      createBanner({ id: "one" }),
      createBanner({ id: "two" }),
      createBanner({ id: "three" }),
    ];
    const { carousel } = renderCarousel(banners);

    const previous = screen.getByRole("button", { name: "Promoção anterior" });
    const next = screen.getByRole("button", { name: "Próxima promoção" });
    const dots = screen.getAllByRole("button", { name: /ir para promoção/i });
    const region = screen.getByRole("region");

    await waitFor(() => expect(next).toBeEnabled());
    fireEvent.click(next);
    fireEvent.click(previous);
    fireEvent.click(dots[2]);
    fireEvent.keyDown(region, { key: "ArrowLeft" });

    expect(carousel.scrollNext).toHaveBeenCalledWith(true);
    expect(carousel.scrollPrev).toHaveBeenCalledWith(true);
    expect(carousel.scrollTo).toHaveBeenCalledWith(2, true);
    expect(carousel.scrollPrev).toHaveBeenCalledTimes(2);
  });

  it("synchronizes the active dot when the carousel selection changes", async () => {
    const banners = [
      createBanner({ id: "one" }),
      createBanner({ id: "two" }),
      createBanner({ id: "three" }),
    ];
    const { carousel } = renderCarousel(banners);
    const dots = screen.getAllByRole("button", { name: /ir para promoção/i });

    act(() => carousel.select(2));

    await waitFor(() => expect(dots[2]).toHaveAttribute("aria-current", "true"));
    expect(dots[0]).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("group", { name: "Promoção 3 de 3" })).toBeInTheDocument();
  });

  it("removes its select and reInit listeners on unmount", () => {
    const banners = [createBanner({ id: "one" }), createBanner({ id: "two" })];
    const { carousel, unmount } = renderCarousel(banners);
    const registered = carousel.on.mock.calls as [EmblaEventType, EmblaListener][];

    unmount();

    const sharedCallbacks = registered
      .filter(([event]) => event === "select")
      .map(([, listener]) => listener)
      .filter((listener) =>
        registered.some(([event, candidate]) => event === "reInit" && candidate === listener),
      );

    expect(
      sharedCallbacks.some(
        (listener) =>
          carousel.off.mock.calls.some(
            ([event, candidate]) => event === "select" && candidate === listener,
          ) &&
          carousel.off.mock.calls.some(
            ([event, candidate]) => event === "reInit" && candidate === listener,
          ),
      ),
    ).toBe(true);
  });
});
