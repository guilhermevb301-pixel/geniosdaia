import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useDashboardBanners } from "@/hooks/useDashboardBanners";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

export function AnnouncementCarousel() {
  const { banners, isLoading } = useDashboardBanners();

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Skeleton className="h-32 sm:h-36 lg:h-44 flex-1 rounded-xl" />
        <Skeleton className="h-32 sm:h-36 lg:h-44 flex-1 rounded-xl hidden lg:block" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 6500,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="ml-0">
        {banners.map((banner) => {
          const isExternal = banner.button_url.startsWith("http");

          const CardContent = (
            <div className="relative rounded-xl overflow-hidden cursor-pointer lg:hover:scale-[1.02] transition-transform duration-300">
              {/* Proporção fixa (bate com a proporção das imagens geradas: 21:9) — sem isso, o cover corta as laterais em telas largas */}
              <div className="w-full aspect-[21/9]">
                {/* Gradient fallback always visible behind image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient || 'from-primary to-emerald-900'}`} />

                {/* Image with skeleton loading */}
                {banner.image_url ? (
                  <ImageWithSkeleton
                    src={banner.image_url}
                    alt="Banner"
                    containerClassName="absolute inset-0"
                    className="w-full h-full"
                    objectFit="cover"
                    optimizedWidth={1200}
                    priority={true} // Banners are always above-the-fold
                  />
                ) : null}

                {/* Escurece a base para o texto ficar legível */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {/* Título e subtítulo do banner */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {banner.title && (
                      <p className="text-[15px] font-semibold leading-tight text-white drop-shadow">
                        {banner.title}
                      </p>
                    )}
                    {banner.subtitle && (
                      <p className="mt-0.5 text-[13px] leading-snug text-white/85 drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && (
                      <span className="mt-2 inline-block text-[11px] font-medium text-white/90 underline underline-offset-2">
                        {banner.button_text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <CarouselItem key={banner.id} className="basis-full pl-0">
              {isExternal ? (
                <a href={banner.button_url} target="_blank" rel="noopener noreferrer">
                  {CardContent}
                </a>
              ) : (
                <Link to={banner.button_url}>
                  {CardContent}
                </Link>
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
      {/* Setas sobrepostas ao banner (agora que ele ocupa a largura toda) */}
      {banners.length > 1 && (
        <>
          <CarouselPrevious className="left-3 border-white/20 bg-black/40 text-white hover:bg-black/60" />
          <CarouselNext className="right-3 border-white/20 bg-black/40 text-white hover:bg-black/60" />
        </>
      )}
    </Carousel>
  );
}
