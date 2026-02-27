

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressAndResizeImage = async (file: File | Blob, maxDimension = 2560): Promise<string> => {
  // Use createImageBitmap for performance (decodes on background thread)
  const bitmap = await createImageBitmap(file);
  
  let { width, height } = bitmap;
  
  // Calculate dimensions
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }
  
  // Use OffscreenCanvas if available for non-blocking main thread
  if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context unavailable");
      
      ctx.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvas.convertToBlob({
          type: (file.type === 'image/png' || ('name' in file && (file as File).name.toLowerCase().endsWith('.png'))) ? 'image/png' : 'image/jpeg',
          quality: 0.92
      });
      bitmap.close();
      
      // Convert blob to base64 for compatibility with current return type
      // In future refactor, return Blob directly
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
      });
  } else {
      // Fallback to standard canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close();
        throw new Error("Canvas context unavailable");
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      
      const isPng = file.type === 'image/png' || ('name' in file && (file as File).name.toLowerCase().endsWith('.png'));
      return canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92);
  }
};

export const cropImage = (base64Image: string, bbox: number[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // bbox is [ymin, xmin, ymax, xmax]
      const [y1, x1, y2, x2] = bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      if (width <= 0 || height <= 0) {
        reject(new Error("Invalid crop dimensions"));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, x1, y1, width, height, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};
