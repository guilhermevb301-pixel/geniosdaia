import { useState } from "react";
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
  /** Largura para otimização automática (apenas URLs do Supabase) */
  optimizedWidth?: number;
  /** Qualidade para otimização (1-100, padrão 75) */
  optimizedQuality?: number;
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
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Aplica otimização se width especificado
  const optimizedSrc = optimizedWidth
    ? getOptimizedImageUrl(src, { width: optimizedWidth, quality: optimizedQuality })
    : src;

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
        src={optimizedSrc || src}
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
