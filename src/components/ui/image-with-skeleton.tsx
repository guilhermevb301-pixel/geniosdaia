import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
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
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = optimizedWidth
    ? getOptimizedImageUrl(src, { width: optimizedWidth, quality: optimizedQuality })
    : src;

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      {hasError && fallbackIcon && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallbackIcon}
        </div>
      )}

      <img
        src={optimizedSrc || src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full",
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
