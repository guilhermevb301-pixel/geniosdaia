import { type KeyboardEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

const MAX_DOT_INDICATORS = 5;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnnouncementCarousel() {
  const { banners, isLoading } = useDashboardBanners();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const syncPosition = () => {
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
    };

    syncPosition();
    api.on("select", syncPosition);
    api.on("reInit", syncPosition);

    return () => {
      api.off("select", syncPosition);
      api.off("reInit", syncPosition);
    };
  }, [api]);

  if (isLoading) {
    return <Skeleton className="h-[168px] w-full rounded-lg sm:h-[188px] lg:h-[212px]" />;
  }

  if (banners.length === 0) {
    return null;
  }

  const scrollPrevious = () => api?.scrollPrev(prefersReducedMotion());
  const scrollNext = () => api?.scrollNext(prefersReducedMotion());
  const scrollTo = (index: number) => api?.scrollTo(index, prefersReducedMotion());

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  };

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: "start" }}
      className="w-full"
      onKeyDownCapture={handleKeyDown}
    >
      <CarouselContent className="ml-0">
        {banners.map((banner, index) => {
          const isExternal = banner.button_url.startsWith("http");
          const accessibleName = banner.title || banner.button_text || "Ver promoção";

          const cardContent = (
            <div className="relative h-[168px] max-h-[212px] cursor-pointer overflow-hidden rounded-lg sm:h-[188px] lg:h-[212px]">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${banner.gradient || "from-primary to-emerald-900"}`}
              />

              {banner.image_url ? (
                <ImageWithSkeleton
                  src={banner.image_url}
                  alt=""
                  containerClassName="absolute inset-0"
                  className="h-full w-full object-cover"
                  objectFit="cover"
                  optimizedWidth={1200}
                  priority={index === 0}
                />
              ) : null}

              {(banner.title || banner.subtitle || banner.button_text) && (
                <div className="absolute inset-0 flex items-center p-4 sm:p-6">
                  <div className="max-w-[76%] rounded-md bg-black/70 px-4 py-3 shadow-lg backdrop-blur-sm sm:max-w-lg sm:px-5 sm:py-4 lg:max-w-xl">
                    {banner.title && (
                      <p className="line-clamp-2 text-lg font-semibold leading-tight text-white drop-shadow-sm sm:text-xl">
                        {banner.title}
                      </p>
                    )}
                    {banner.subtitle && (
                      <p className="mt-1 line-clamp-2 max-w-lg text-sm leading-snug text-white/85 drop-shadow-sm">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && (
                      <span className="mt-4 inline-flex h-8 origin-left items-center rounded-md bg-[#34d399] px-3 text-xs font-semibold text-[#052e27] shadow-sm group-hover:scale-[1.02] group-hover:opacity-90">
                        {banner.button_text}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );

          return (
            <CarouselItem key={banner.id} className="basis-full pl-0">
              {isExternal ? (
                <a
                  href={banner.button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={accessibleName}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34d399]"
                >
                  {cardContent}
                </a>
              ) : (
                <Link
                  to={banner.button_url}
                  aria-label={accessibleName}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34d399]"
                >
                  {cardContent}
                </Link>
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {banners.length > 1 && (
        <>
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrevious}
              disabled={!api}
              aria-label="Promoção anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-[#34d399] shadow-sm hover:scale-105 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!api}
              aria-label="Próxima promoção"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-[#34d399] shadow-sm hover:scale-105 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {banners.length <= MAX_DOT_INDICATORS ? (
            <div
              className="absolute bottom-3 right-3 z-10 flex items-center rounded-full bg-black/45 px-1.5 backdrop-blur-sm"
              role="group"
              aria-label={`Promoção ${current + 1} de ${count || banners.length}`}
            >
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => scrollTo(index)}
                  disabled={!api}
                  aria-label={`Ir para promoção ${index + 1} de ${count || banners.length}`}
                  aria-current={index === current ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:scale-110 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] disabled:pointer-events-none disabled:opacity-40"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      index === current ? "bg-[#34d399]" : "bg-white/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Promoção ${current + 1} de ${count || banners.length}`}
              className="absolute bottom-3 right-3 z-10 whitespace-nowrap rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur-sm"
            >
              {current + 1} de {count || banners.length}
            </div>
          )}
        </>
      )}
    </Carousel>
  );
}
