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

  // Width type only applies on desktop (lg+)
  const getWidthClass = (widthType: string) => {
    switch (widthType) {
      case 'full': return 'lg:basis-full';
      case 'third': return 'lg:basis-1/3';
      default: return 'lg:basis-1/2'; // half
    }
  };

  // Calculate responsive heights with sensible limits
  const getResponsiveHeights = (desktopHeight: number) => {
    // Clamp desktop height between 120-400px
    const clampedDesktop = Math.max(120, Math.min(400, desktopHeight));
    // Mobile: 60% of desktop, min 100px, max 200px
    const mobile = Math.max(100, Math.min(200, Math.round(clampedDesktop * 0.6)));
    // Tablet: 75% of desktop, min 120px, max 280px
    const tablet = Math.max(120, Math.min(280, Math.round(clampedDesktop * 0.75)));
    
    return { mobile, tablet, desktop: clampedDesktop };
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
      <CarouselContent className="-ml-2 lg:-ml-4">
        {banners.map((banner) => {
          const isExternal = banner.button_url.startsWith("http");
          const heights = getResponsiveHeights(banner.height || 176);
          
          const CardContent = (
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer lg:hover:scale-[1.02] transition-transform duration-300"
              style={{
                "--h-mobile": `${heights.mobile}px`,
                "--h-tablet": `${heights.tablet}px`,
                "--h-desktop": `${heights.desktop}px`,
              } as React.CSSProperties}
            >
              {/* Container with responsive height via CSS variables */}
              <div className="w-full h-[var(--h-mobile)] sm:h-[var(--h-tablet)] lg:h-[var(--h-desktop)]">
                {/* Gradient fallback always visible behind image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient || 'from-primary to-purple-600'}`} />
                
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
              </div>
            </div>
          );

          return (
            <CarouselItem 
              key={banner.id} 
              className={`pl-2 lg:pl-4 basis-full ${getWidthClass(banner.width_type || 'half')}`}
            >
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
      {/* Show arrows only on desktop */}
      <CarouselPrevious className="hidden lg:flex -left-4 bg-card border-border hover:bg-muted" />
      <CarouselNext className="hidden lg:flex -right-4 bg-card border-border hover:bg-muted" />
    </Carousel>
  );
}
