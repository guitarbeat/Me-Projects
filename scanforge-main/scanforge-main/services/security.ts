
/**
 * Security utilities for input validation and sanitization.
 */

// File signature magic bytes
const FILE_SIGNATURES = {
  JPEG: [0xFF, 0xD8, 0xFF],
  PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // "RIFF"
  WEBP_WEBP: [0x57, 0x45, 0x42, 0x50]  // "WEBP" at offset 8
};

/**
 * Checks the file's magic bytes against expected signatures.
 */
const checkFileSignature = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check JPEG
  if (bytes[0] === FILE_SIGNATURES.JPEG[0] &&
      bytes[1] === FILE_SIGNATURES.JPEG[1] &&
      bytes[2] === FILE_SIGNATURES.JPEG[2]) {
    return true;
  }

  // Check PNG
  if (
    bytes[0] === FILE_SIGNATURES.PNG[0] &&
    bytes[1] === FILE_SIGNATURES.PNG[1] &&
    bytes[2] === FILE_SIGNATURES.PNG[2] &&
    bytes[3] === FILE_SIGNATURES.PNG[3] &&
    bytes[4] === FILE_SIGNATURES.PNG[4] &&
    bytes[5] === FILE_SIGNATURES.PNG[5] &&
    bytes[6] === FILE_SIGNATURES.PNG[6] &&
    bytes[7] === FILE_SIGNATURES.PNG[7]
  ) {
    return true;
  }

  // Check WebP (RIFF....WEBP)
  if (
    bytes[0] === FILE_SIGNATURES.WEBP_RIFF[0] &&
    bytes[1] === FILE_SIGNATURES.WEBP_RIFF[1] &&
    bytes[2] === FILE_SIGNATURES.WEBP_RIFF[2] &&
    bytes[3] === FILE_SIGNATURES.WEBP_RIFF[3] &&
    bytes[8] === FILE_SIGNATURES.WEBP_WEBP[0] &&
    bytes[9] === FILE_SIGNATURES.WEBP_WEBP[1] &&
    bytes[10] === FILE_SIGNATURES.WEBP_WEBP[2] &&
    bytes[11] === FILE_SIGNATURES.WEBP_WEBP[3]
  ) {
    return true;
  }

  return false;
};

export const validateImageFile = async (file: File): Promise<void> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`);
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max allowed size is 10MB.`);
  }

  // Check magic bytes (prevent file extension spoofing)
  const isValidSignature = await checkFileSignature(file);
  if (!isValidSignature) {
    throw new Error(`File content does not match the extension. Please upload a valid ${file.type.split('/')[1]} file.`);
  }
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // Remove control characters (ASCII 0-31 except \n \r \t, and 127)
  // We allow newline (\n), carriage return (\r), and tab (\t)
  // ASCII 0-8, 11-12, 14-31, 127 are removed.
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Enforce max length (2000 chars)
  if (sanitized.length > 2000) {
    console.warn(`Input truncated from ${sanitized.length} to 2000 characters.`);
    sanitized = sanitized.slice(0, 2000);
  }

  return sanitized;
};
