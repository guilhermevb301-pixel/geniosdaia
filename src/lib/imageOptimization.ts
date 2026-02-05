/**
 * Helper para otimização de imagens usando Supabase Storage Transformations
 * Reduz drasticamente o tamanho das imagens servidas como thumbnails
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Adiciona parâmetros de transformação a uma URL do Supabase Storage
 * @param url - URL original da imagem
 * @param options - Opções de otimização
 * @returns URL otimizada ou original se não for do Supabase
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string | null {
  if (!url) return null;
  
  // Só otimiza URLs do Supabase Storage
  if (!url.includes('supabase.co/storage')) return url;
  
  const { 
    width,
    height,
    quality = 75, 
    format = 'webp',
    resize = 'cover'
  } = options;
  
  const params = new URLSearchParams();
  
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  if (quality) params.set('quality', quality.toString());
  if (format && format !== 'origin') params.set('format', format);
  if (resize) params.set('resize', resize);
  
  // Se não há parâmetros, retorna URL original
  if (params.toString() === '') return url;
  
  // Adiciona parâmetros à URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}

/**
 * Presets comuns de otimização
 */
export const IMAGE_PRESETS = {
  // Para thumbnails em grids (3-4 colunas)
  thumbnail: { width: 400, quality: 75 },
  
  // Para cards menores (5+ colunas)
  smallThumbnail: { width: 300, quality: 75 },
  
  // Para ícones e avatares
  icon: { width: 100, quality: 80 },
  
  // Para imagens em modais (maior qualidade)
  modal: { width: 800, quality: 85 },
  
  // Para hero/banner images
  hero: { width: 1200, quality: 80 },
} as const;
