import { useEffect, useRef } from "react";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface PreloadOptions {
  width?: number;
  quality?: number;
  /** Max number of images to preload (default: 4) */
  maxPreload?: number;
}

// Global set to avoid preloading the same image twice across components
const globalPreloaded = new Set<string>();

// Concurrency limiter: max 3 simultaneous preloads
let activePreloads = 0;
const MAX_CONCURRENT_PRELOADS = 3;
const preloadQueue: (() => void)[] = [];

function processQueue() {
  while (preloadQueue.length > 0 && activePreloads < MAX_CONCURRENT_PRELOADS) {
    const next = preloadQueue.shift();
    next?.();
  }
}

function enqueuePreload(url: string): void {
  if (globalPreloaded.has(url)) return;
  globalPreloaded.add(url);

  const doPreload = () => {
    activePreloads++;
    const img = new Image();
    img.onload = img.onerror = () => {
      activePreloads--;
      processQueue();
    };
    img.src = url;
  };

  if (activePreloads < MAX_CONCURRENT_PRELOADS) {
    doPreload();
  } else {
    preloadQueue.push(doPreload);
  }
}

/**
 * Hook to preload critical above-the-fold images with concurrency control.
 * Only preloads the first N images (default 4) to avoid flooding the network.
 */
export function useImagePreload(
  urls: (string | null | undefined)[],
  options: PreloadOptions = {}
) {
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const { width = 400, quality = 75, maxPreload = 4 } = options;

    const validUrls = urls
      .filter((url): url is string => !!url)
      .slice(0, maxPreload) // Only preload first N
      .map((url) => getOptimizedImageUrl(url, { width, quality }))
      .filter((url): url is string => !!url)
      .filter((url) => !globalPreloaded.has(url));

    if (validUrls.length === 0) return;

    processedRef.current = true;

    // Use requestIdleCallback to avoid blocking main thread
    const schedulePreloads = () => {
      validUrls.forEach((url) => enqueuePreload(url));
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(schedulePreloads, { timeout: 2000 });
    } else {
      setTimeout(schedulePreloads, 100);
    }
  }, [urls, options.width, options.quality, options.maxPreload]);
}

/**
 * Preload a single image imperatively (useful for hover prefetch)
 */
export function preloadImage(url: string, options: PreloadOptions = {}): void {
  if (!url) return;
  const { width = 400, quality = 75 } = options;
  const optimizedUrl = getOptimizedImageUrl(url, { width, quality });
  if (optimizedUrl) enqueuePreload(optimizedUrl);
}

/**
 * Preload multiple images imperatively
 */
export function preloadImages(
  urls: (string | null | undefined)[],
  options: PreloadOptions = {}
): void {
  const { maxPreload = 4 } = options;
  urls
    .filter((url): url is string => !!url)
    .slice(0, maxPreload)
    .forEach((url) => preloadImage(url, options));
}
