import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

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

  return (
    <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="w-full">
      <CarouselContent className="ml-0">
        {banners.map((banner) => {
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
                  priority
                />
              ) : null}

              <div className="absolute inset-y-0 left-0 w-[92%] bg-gradient-to-r from-black/85 via-black/55 to-transparent sm:w-4/5 lg:w-2/3" />

              {(banner.title || banner.subtitle || banner.button_text) && (
                <div className="absolute inset-0 flex items-center px-12 py-5 sm:px-14 sm:py-6">
                  <div className="max-w-xl">
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
                      <span className="mt-4 inline-flex h-8 items-center rounded-md bg-[#34d399] px-3 text-xs font-semibold text-[#052e27] shadow-sm transition-colors group-hover:bg-[#6ee7b7]">
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
          <CarouselPrevious
            aria-label="Promoção anterior"
            className="left-3 border-white/25 bg-black/45 text-white hover:border-[#34d399]/60 hover:bg-black/65 hover:text-[#34d399]"
          />
          <CarouselNext
            aria-label="Próxima promoção"
            className="right-3 border-white/25 bg-black/45 text-white hover:border-[#34d399]/60 hover:bg-black/65 hover:text-[#34d399]"
          />

          <div
            className="absolute bottom-3 right-3 z-10 flex items-center rounded-full bg-black/45 px-1.5 backdrop-blur-sm"
            role="group"
            aria-label={`Promoção ${current + 1} de ${count || banners.length}`}
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Ir para promoção ${index + 1} de ${count || banners.length}`}
                aria-current={index === current ? "true" : undefined}
                className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]"
              >
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === current ? "bg-[#34d399]" : "bg-white/55 hover:bg-white/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </Carousel>
  );
}
