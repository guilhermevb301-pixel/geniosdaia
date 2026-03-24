/**
 * Image optimization using wsrv.nl free CDN proxy
 *
 * Why wsrv.nl instead of Supabase Storage Transformations?
 * - Supabase transformations require Pro plan (not available on Lovable)
 * - wsrv.nl is free, open-source, globally distributed CDN
 * - Handles resize, compression, format conversion, AND edge caching
 * - Works with ANY image URL (Supabase, YouTube, external)
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
  /** Generate a tiny blur placeholder (20px wide) */
  blur?: boolean;
}

// In-memory cache for already-constructed URLs
const urlCache = new Map<string, string>();

/**
 * Optimizes an image URL through wsrv.nl CDN proxy
 * Provides real resizing, compression, format conversion and edge caching
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string | null {
  if (!url) return null;

  // Don't double-proxy
  if (url.includes('wsrv.nl')) return url;

  const {
    width,
    height,
    quality = 75,
    format = 'webp',
    resize = 'cover',
    blur = false,
  } = options;

  // Build cache key
  const cacheKey = `${url}|${width}|${height}|${quality}|${format}|${resize}|${blur}`;
  if (urlCache.has(cacheKey)) return urlCache.get(cacheKey)!;

  // Build wsrv.nl URL
  const params = new URLSearchParams();
  params.set('url', url);

  if (blur) {
    // Tiny blur placeholder: 20px wide, low quality, with blur filter
    params.set('w', '20');
    params.set('q', '30');
    params.set('blur', '5');
    params.set('output', 'webp');
  } else {
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());

    // Format
    if (format && format !== 'origin') {
      params.set('output', format);
    }

    // Resize mode
    if (resize === 'cover') params.set('fit', 'cover');
    else if (resize === 'contain') params.set('fit', 'contain');
    else if (resize === 'fill') params.set('fit', 'fill');
  }

  // Enable progressive loading and strip metadata
  params.set('il', ''); // interlace/progressive
  params.set('n', '-1'); // no upscaling

  const optimizedUrl = `https://wsrv.nl/?${params.toString()}`;
  urlCache.set(cacheKey, optimizedUrl);

  return optimizedUrl;
}

/**
 * Get a tiny blur placeholder URL (for blur-up effect)
 */
export function getBlurPlaceholderUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return getOptimizedImageUrl(url, { blur: true });
}

/**
 * Clear the URL cache (useful for testing or memory management)
 */
export function clearImageUrlCache(): void {
  urlCache.clear();
}

/**
 * Presets for common use cases
 */
export const IMAGE_PRESETS = {
  // Module thumbnails in grids (3-4 columns)
  thumbnail: { width: 600, quality: 80, format: 'webp' as const },

  // Smaller cards (5+ columns)
  smallThumbnail: { width: 450, quality: 80, format: 'webp' as const },

  // Icons and avatars
  icon: { width: 150, quality: 80, format: 'webp' as const },

  // Modal/detail images
  modal: { width: 1000, quality: 85, format: 'webp' as const },

  // Hero/banner images
  hero: { width: 1600, quality: 82, format: 'webp' as const },

  // Continue learning cards
  card: { width: 500, quality: 80, format: 'webp' as const },
} as const;
