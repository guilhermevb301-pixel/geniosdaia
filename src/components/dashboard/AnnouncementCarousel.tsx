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

  // Calculate responsive heights with sensible limits
  const getResponsiveHeights = (desktopHeight: number) => {
    // Clamp desktop height between 120-400px
    const clampedDesktop = Math.max(120, Math.min(400, desktopHeight));
    // Mobile (< 640px): 55% of desktop, min 100px, max 180px
    const mobile = Math.max(100, Math.min(180, Math.round(clampedDesktop * 0.55)));
    // Tablet (640px - 767px): 70% of desktop, min 120px, max 280px
    const tablet = Math.max(120, Math.min(280, Math.round(clampedDesktop * 0.70)));
    // Laptop (768px - 1023px): 85% of desktop, min 160px, max 350px
    const laptop = Math.max(160, Math.min(350, Math.round(clampedDesktop * 0.85)));
    
    return { mobile, tablet, laptop, desktop: clampedDesktop };
  };

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
          const heights = getResponsiveHeights(banner.height || 176);
          
          const CardContent = (
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer lg:hover:scale-[1.02] transition-transform duration-300"
              style={{
                "--h-mobile": `${heights.mobile}px`,
                "--h-tablet": `${heights.tablet}px`,
                "--h-laptop": `${heights.laptop}px`,
                "--h-desktop": `${heights.desktop}px`,
              } as React.CSSProperties}
            >
              {/* Container with responsive height via CSS variables */}
              <div className="w-full h-[var(--h-mobile)] sm:h-[var(--h-tablet)] md:h-[var(--h-laptop)] lg:h-[var(--h-desktop)]">
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
