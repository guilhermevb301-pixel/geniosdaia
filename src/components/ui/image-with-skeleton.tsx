import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

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

  const optimizedSrc = optimizedWidth
    ? getOptimizedImageUrl(src, { width: optimizedWidth, quality: optimizedQuality })
    : src;

  // Detect cached images instantly via ref callback
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {hasError && fallbackIcon && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallbackIcon}
        </div>
      )}

      <img
        ref={imgRef}
        src={optimizedSrc || src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full",
          isLoaded ? "opacity-100" : "opacity-0",
          !isLoaded && "transition-opacity duration-150",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          className
        )}
        style={{ objectPosition }}
      />
    </div>
  );
}
