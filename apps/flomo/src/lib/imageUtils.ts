/**
 * Image processing utilities for avatar management
 */

export interface ImageProcessingOptions {
  maxSize?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Checks if an image URL is from a cat API (external hosted)
 */
export const isCatImageUrl = (url: string): boolean => {
  return (
    url.includes('thecatapi.com') ||
    url.includes('cdn2.thecatapi.com') ||
    url.includes('api.thecatapi.com') ||
    url.includes('unsplash.com/photo-1514888286974') ||
    url.includes('unsplash.com/photo-1513360371669') ||
    url.includes('unsplash.com/photo-1495360010541') ||
    url.includes('unsplash.com/photo-1574158622682')
  );
};

/**
 * Optimizes image storage by determining if it should be stored as base64 or URL
 * Cat images from external APIs should remain as URLs to save database space
 */
export const optimizeImageStorage = async (
  imageSource: string | File,
  options: ImageProcessingOptions = {}
): Promise<string> => {
  // If it's already a URL, check if it's a cat image
  if (typeof imageSource === 'string') {
    if (isCatImageUrl(imageSource)) {
      // * Keep cat images as URLs - no need to convert to base64
      return imageSource;
    }
    // For other URLs, convert to base64 for consistency
    if (isValidUrl(imageSource)) {
      return await convertUrlToBase64(imageSource);
    }
    // If it's already base64, return as is
    if (isBase64Image(imageSource)) {
      return imageSource;
    }
  }

  // For file uploads, always convert to base64
  if (imageSource instanceof File) {
    return await processImageToBase64(imageSource, options);
  }

  throw new Error('Invalid image source');
};

/**
 * Compresses and resizes an image file to base64
 */
export const processImageToBase64 = async (
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> => {
  const { maxSize = 200, quality = 0.8, format = 'jpeg' } = options;

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = `image/${format}`;
        const compressedBase64 = canvas.toDataURL(mimeType, quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is a valid image
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 1
): string | null => {
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select a valid image file';
  }

  // Check specific formats
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a JPG, PNG, GIF, or WebP image';
  }

  return null;
};

/**
 * Gets the file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Checks if a string is a base64 image
 */
export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

/**
 * Checks if a string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Converts a URL to base64
 */
export const convertUrlToBase64 = async (url: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(base64);
    };

    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
};

/**
 * Gets the appropriate avatar source for display with cache busting
 */
export const getAvatarSource = (
  avatarUrl: string | null | undefined
): string | undefined => {
  if (!avatarUrl) {
    return undefined;
  }

  // If it's already base64, return as is
  if (isBase64Image(avatarUrl)) {
    return avatarUrl;
  }

  // If it's a valid URL, add cache busting parameter
  if (isValidUrl(avatarUrl)) {
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}t=${Date.now()}`;
  }

  // If it's neither, return undefined (will show fallback)
  return undefined;
};
