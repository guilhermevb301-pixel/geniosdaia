/**
 * File upload validation utilities
 * Prevents upload of malicious files, executable code, or excessively large files
 */

// Allowed MIME types for images
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// Allowed MIME types for JSON files
export const ALLOWED_JSON_TYPES = [
  'application/json',
  'text/json',
] as const;

// Allowed MIME types for ZIP files
export const ALLOWED_ZIP_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
] as const;

// Allowed file extensions for images
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Allowed file extensions for JSON
export const ALLOWED_JSON_EXTENSIONS = ['.json'];

// Allowed file extensions for ZIP
export const ALLOWED_ZIP_EXTENSIONS = ['.zip'];

// Allowed MIME types for video files
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
] as const;

// Allowed file extensions for video
export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4'];

// Maximum file sizes
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_JSON_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Get the file extension from filename (lowercase, with dot)
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Validate an image file for upload
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Tipos permitidos: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  // Check file extension matches MIME type
  const extension = getFileExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo inválida. Extensões permitidas: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate a JSON file for upload
 */
export function validateJsonFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_JSON_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_JSON_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_JSON_TYPES.includes(file.type as typeof ALLOWED_JSON_TYPES[number])) {
    return {
      valid: false,
      error: 'Tipo de arquivo inválido. Apenas arquivos JSON são permitidos.',
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!ALLOWED_JSON_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Extensão de arquivo inválida. Apenas arquivos .json são permitidos.',
    };
  }

  return { valid: true };
}

/**
 * Validate a ZIP file for upload
 */
export function validateZipFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_ZIP_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_ZIP_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_ZIP_TYPES.includes(file.type as typeof ALLOWED_ZIP_TYPES[number])) {
    return {
      valid: false,
      error: 'Tipo de arquivo inválido. Apenas arquivos ZIP são permitidos.',
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!ALLOWED_ZIP_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Extensão de arquivo inválida. Apenas arquivos .zip são permitidos.',
    };
  }

  return { valid: true };
}

/**
 * Validate a video file for upload
 */
export function validateVideoFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type as typeof ALLOWED_VIDEO_TYPES[number])) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Apenas arquivos MP4 são permitidos.`,
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo inválida. Apenas arquivos .mp4 são permitidos.`,
    };
  }

  return { valid: true };
}

/**
 * Read and validate JSON content from a file
 * Returns the parsed JSON if valid, or throws an error
 */
export async function validateJsonContent(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        resolve(parsed);
      } catch {
        reject(new Error('Arquivo JSON inválido. Verifique a estrutura do arquivo.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo.'));
    };
    reader.readAsText(file);
  });
}
