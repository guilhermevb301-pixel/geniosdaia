import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          const CardContent = (
            <div
              className="relative h-44 rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            >
              {/* Background - Image or Gradient */}
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
              )}

              {/* Overlay with gradient for better text readability - Pressel Lab style */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-background/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-background/20 translate-y-1/2 -translate-x-1/2" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-white/90 mt-1 line-clamp-2 drop-shadow-md font-medium">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                <Button
                  variant="accent"
                  size="sm"
                  className="w-fit font-semibold shadow-lg"
                >
                  {banner.button_text || "Saiba Mais"}
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          );

          return (
            <CarouselItem key={banner.id} className="pl-2 md:pl-4 md:basis-1/2">
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
