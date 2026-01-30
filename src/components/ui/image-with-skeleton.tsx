import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
  fallbackIcon?: React.ReactNode;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  containerClassName,
  objectFit = "cover",
  objectPosition = "center",
  fallbackIcon,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Skeleton while loading */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Error fallback */}
      {hasError && fallbackIcon && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallbackIcon}
        </div>
      )}

      {/* Image with lazy loading */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300 w-full h-full",
          isLoaded ? "opacity-100" : "opacity-0",
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
