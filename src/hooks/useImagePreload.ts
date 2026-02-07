import { useEffect, useRef } from "react";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface PreloadOptions {
  width?: number;
  quality?: number;
}

/**
 * Hook to preload critical images by injecting <link rel="preload"> hints
 * This makes images load before they're rendered, providing instant display
 */
export function useImagePreload(
  urls: (string | null | undefined)[],
  options: PreloadOptions = {}
) {
  const preloadedRef = useRef<Set<string>>(new Set());
  const linksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    const { width = 400, quality = 75 } = options;

    // Filter valid URLs and optimize them
    const validUrls = urls
      .filter((url): url is string => !!url)
      .map((url) => getOptimizedImageUrl(url, { width, quality }))
      .filter((url) => !preloadedRef.current.has(url));

    if (validUrls.length === 0) return;

    // Create preload links for new URLs
    validUrls.forEach((url) => {
      if (preloadedRef.current.has(url)) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      link.fetchPriority = "high";
      document.head.appendChild(link);

      linksRef.current.push(link);
      preloadedRef.current.add(url);
    });

    // Cleanup on unmount
    return () => {
      linksRef.current.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
      linksRef.current = [];
    };
  }, [urls, options.width, options.quality]);
}

/**
 * Preload a single image imperatively (useful for hover effects)
 */
export function preloadImage(url: string, options: PreloadOptions = {}): void {
  if (!url) return;

  const { width = 400, quality = 75 } = options;
  const optimizedUrl = getOptimizedImageUrl(url, { width, quality });

  // Use Image constructor for simpler preloading
  const img = new Image();
  img.src = optimizedUrl;
}

/**
 * Preload multiple images imperatively
 */
export function preloadImages(
  urls: (string | null | undefined)[],
  options: PreloadOptions = {}
): void {
  urls.filter((url): url is string => !!url).forEach((url) => preloadImage(url, options));
}
