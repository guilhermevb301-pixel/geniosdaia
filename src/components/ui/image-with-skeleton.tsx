import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, getBlurPlaceholderUrl } from "@/lib/imageOptimization";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
  fallbackIcon?: React.ReactNode;
  optimizedWidth?: number;
  optimizedQuality?: number;
  priority?: boolean;
}

/**
 * Progressive image component with:
 * - IntersectionObserver-based lazy loading (more reliable than native)
 * - Blur-up placeholder effect (tiny 20px blurred preview loads instantly)
 * - Smooth fade-in transition when full image loads
 * - Error fallback with custom icon
 * - CDN optimization via wsrv.nl
 */
export function ImageWithSkeleton({
  src,
  alt,
  className,
  containerClassName,
  objectFit = "cover",
  objectPosition = "center",
  fallbackIcon,
  optimizedWidth,
  optimizedQuality = 75,
  priority = false,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priority = immediately in view
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized URLs
  const optimizedSrc = optimizedWidth
    ? getOptimizedImageUrl(src, { width: optimizedWidth, quality: optimizedQuality })
    : getOptimizedImageUrl(src, { quality: optimizedQuality });

  const blurSrc = getBlurPlaceholderUrl(src);

  // IntersectionObserver for non-priority images
  useEffect(() => {
    if (priority || isInView) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before visible
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const objectFitClass =
    objectFit === "cover"
      ? "object-cover"
      : objectFit === "contain"
        ? "object-contain"
        : "object-fill";

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted", containerClassName)}
    >
      {/* Error fallback */}
      {hasError && fallbackIcon && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          {fallbackIcon}
        </div>
      )}

      {/* Blur placeholder - loads instantly (tiny ~500 byte image) */}
      {blurSrc && !hasError && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full scale-110",
            objectFitClass,
            "transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{ objectPosition, filter: "blur(10px)" }}
        />
      )}

      {/* Skeleton pulse while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Full image - only starts loading when in view */}
      {isInView && !hasError && (
        <img
          src={optimizedSrc || src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full",
            objectFitClass,
            "transition-opacity duration-500 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
}
