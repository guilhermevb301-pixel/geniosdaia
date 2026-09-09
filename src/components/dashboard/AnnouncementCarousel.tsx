import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { MENTORSHIP_APPLICATION_URL } from "@/lib/contactLinks";

const MAX_DOT_INDICATORS = 5;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnnouncementCarousel() {
  const { banners, isLoading } = useDashboardBanners();
  const autoplay = useRef(
    Autoplay({
      delay: 5200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
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
    return (
      <Skeleton className="h-[124px] w-full rounded-lg sm:h-[136px] lg:h-[152px]" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const scrollPrevious = () => api?.scrollPrev(prefersReducedMotion());
  const scrollNext = () => api?.scrollNext(prefersReducedMotion());
  const scrollTo = (index: number) =>
    api?.scrollTo(index, prefersReducedMotion());

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
      opts={{ loop: true, align: "start", duration: 24 }}
      plugins={prefersReducedMotion() ? undefined : [autoplay.current]}
      className="w-full"
      onKeyDownCapture={handleKeyDown}
    >
      <CarouselContent className="ml-0">
        {banners.map((banner, index) => {
          const targetUrl =
            banner.button_url === "/mentoria"
              ? MENTORSHIP_APPLICATION_URL
              : banner.button_url;
          const isExternal = targetUrl.startsWith("http");
          const accessibleName =
            banner.title || banner.button_text || "Ver promoção";

          const cardContent = (
            <div className="relative h-[124px] cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-[#121514] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-[136px] lg:h-[152px]">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(52,211,153,0.22),transparent_34%),linear-gradient(105deg,rgba(18,21,20,0.98)_0%,rgba(18,21,20,0.9)_42%,rgba(18,21,20,0.34)_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-primary/70 via-primary/15 to-transparent"
              />

              {banner.image_url ? (
                <ImageWithSkeleton
                  src={banner.image_url}
                  alt=""
                  containerClassName="absolute inset-0"
                  className="h-full w-full object-cover opacity-55 mix-blend-screen saturate-[0.92] motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-[1.02]"
                  objectFit="cover"
                  objectPosition="center 42%"
                  optimizedWidth={1200}
                  priority={index === 0}
                />
              ) : null}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,15,17,0.98)_0%,rgba(13,15,17,0.88)_44%,rgba(13,15,17,0.2)_100%)]"
              />

              {(banner.title || banner.subtitle || banner.button_text) && (
                <div className="absolute inset-0 flex items-center px-4 py-4 sm:px-6 lg:px-8">
                  <div className="max-w-[76%] sm:max-w-[28rem] lg:max-w-[32rem]">
                    <span className="micro-label text-primary">Destaque</span>
                    {banner.title && (
                      <p className="mt-1.5 line-clamp-2 text-lg font-semibold leading-tight text-white drop-shadow-sm sm:text-xl lg:text-[1.4rem]">
                        {banner.title}
                      </p>
                    )}
                    {banner.subtitle && (
                      <p className="mt-1.5 line-clamp-1 max-w-lg text-xs leading-snug text-white/68 drop-shadow-sm sm:text-sm">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && (
                      <span className="mt-3 inline-flex h-8 origin-left items-center gap-2 rounded-md border border-primary/45 bg-primary/12 px-3 text-xs font-semibold text-primary backdrop-blur-sm group-hover:bg-primary group-hover:text-[#07130f]">
                        {banner.button_text}
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
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
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={accessibleName}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34d399]"
                >
                  {cardContent}
                </a>
              ) : (
                <Link
                  to={targetUrl}
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
          <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
            <button
              type="button"
              onClick={scrollPrevious}
              disabled={!api}
              aria-label="Promoção anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur-md hover:scale-105 hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!api}
              aria-label="Próxima promoção"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur-md hover:scale-105 hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399] disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {banners.length <= MAX_DOT_INDICATORS ? (
            <div
              className="absolute bottom-3 left-4 z-10 flex items-center rounded-full bg-black/35 px-1 backdrop-blur-sm sm:left-6"
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
                    className={`h-1.5 rounded-full ${
                      index === current
                        ? "w-5 bg-[#34d399]"
                        : "w-1.5 bg-white/45"
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
              className="absolute bottom-3 left-4 z-10 whitespace-nowrap rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur-sm sm:left-6"
            >
              {current + 1} de {count || banners.length}
            </div>
          )}
        </>
      )}
    </Carousel>
  );
}
