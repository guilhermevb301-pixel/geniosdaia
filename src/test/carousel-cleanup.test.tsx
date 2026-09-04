import { render } from "@testing-library/react";
import type { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { describe, expect, it, vi } from "vitest";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const mocks = vi.hoisted(() => ({
  useEmblaCarousel: vi.fn(),
}));

vi.mock("embla-carousel-react", () => ({
  default: mocks.useEmblaCarousel,
}));

type EmblaListener = Parameters<EmblaCarouselType["on"]>[1];

describe("Carousel lifecycle", () => {
  it("removes select and reInit listeners with their registered callbacks", () => {
    const on = vi.fn();
    const off = vi.fn();
    const api = {
      canScrollNext: () => false,
      canScrollPrev: () => false,
      off,
      on,
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
    } as unknown as EmblaCarouselType;
    on.mockReturnValue(api);
    off.mockReturnValue(api);
    mocks.useEmblaCarousel.mockReturnValue([vi.fn(), api]);

    const { unmount } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Uma aula</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const registrations = on.mock.calls as [EmblaEventType, EmblaListener][];

    unmount();

    for (const event of ["select", "reInit"] as const) {
      const listener = registrations.find(([registeredEvent]) => registeredEvent === event)?.[1];
      expect(listener).toBeDefined();
      expect(off).toHaveBeenCalledWith(event, listener);
    }
  });
});
