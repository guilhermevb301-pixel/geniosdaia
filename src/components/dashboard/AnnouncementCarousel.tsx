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
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

export function AnnouncementCarousel() {
  const { banners, isLoading } = useDashboardBanners();

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Skeleton className="h-44 flex-1 rounded-xl" />
        <Skeleton className="h-44 flex-1 rounded-xl hidden md:block" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const getWidthClass = (widthType: string) => {
    switch (widthType) {
      case 'full': return 'md:basis-full';
      case 'third': return 'md:basis-1/3';
      default: return 'md:basis-1/2';
    }
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
      <CarouselContent className="-ml-2 md:-ml-4">
        {banners.map((banner) => {
          const isExternal = banner.button_url.startsWith("http");
          const bannerHeight = banner.height || 176;
          const CardContent = (
            <div
              style={{ height: `${bannerHeight}px` }}
              className="relative rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            >
              {/* Background - Image or Gradient */}
              {banner.image_url ? (
                <img
                  src={getOptimizedImageUrl(banner.image_url, { width: 800 }) || banner.image_url}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
              )}
            </div>
          );

          return (
            <CarouselItem key={banner.id} className={`pl-2 md:pl-4 ${getWidthClass(banner.width_type || 'half')}`}>
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
      <CarouselPrevious className="hidden md:flex -left-4 bg-card border-border hover:bg-muted" />
      <CarouselNext className="hidden md:flex -right-4 bg-card border-border hover:bg-muted" />
    </Carousel>
  );
}
