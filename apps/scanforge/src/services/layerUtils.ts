

import { Layer } from "../types";
import { assetStore } from "./assetStore";

// LRU Cache for images to prevent memory leaks and improve performance
const MAX_CACHE_SIZE = 50;
const imageCache = new Map<string, Promise<HTMLImageElement | ImageBitmap | null>>();

const loadImage = async (url: string): Promise<HTMLImageElement | ImageBitmap | null> => {
  if (imageCache.has(url)) {
    const promise = imageCache.get(url)!;
    // Refresh LRU
    imageCache.delete(url);
    imageCache.set(url, promise);
    return promise;
  }

  // Use createImageBitmap for better performance if url is a blob/data url
  const promise = (async () => {
     try {
       const res = await fetch(url);
       const blob = await res.blob();
       return await createImageBitmap(blob);
     } catch (e) {
       // Fallback to Image tag
       return new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
       });
     }
  })();

  imageCache.set(url, promise);

  if (imageCache.size > MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value;
    if (firstKey) imageCache.delete(firstKey);
  }

  return promise;
};

let sharedCanvas: HTMLCanvasElement | null = null;
const getSharedCanvas = () => {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }
  return sharedCanvas;
};

export const getFlatRenderList = (
  layers: Layer[], 
  parentOpacity = 1,
  parentX = 0,
  parentY = 0,
  parentRotation = 0,
  parentScaleX = 1,
  parentScaleY = 1
): { 
  id: string, url?: string, assetId?: string, opacity: number, zIndex: number, 
  x: number, y: number, width?: number, height?: number,
  rotation: number, scaleX: number, scaleY: number
}[] => {
  let list: any[] = [];
  
  layers.forEach((layer) => {
    if (!layer.isVisible) return;
    
    // Calculate absolute opacity
    const currentOpacity = layer.opacity * parentOpacity;

    // Calculate absolute position based on parent transforms
    const scaledX = (layer.x || 0) * parentScaleX;
    const scaledY = (layer.y || 0) * parentScaleY;

    const rad = (parentRotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotatedX = scaledX * cos - scaledY * sin;
    const rotatedY = scaledX * sin + scaledY * cos;

    const currentX = parentX + rotatedX;
    const currentY = parentY + rotatedY;

    const currentRotation = (layer.rotation || 0) + parentRotation;
    const currentScaleX = (layer.scaleX || 1) * parentScaleX;
    const currentScaleY = (layer.scaleY || 1) * parentScaleY;
    
    if (layer.type === 'group' && layer.children) {
      list = [...list, ...getFlatRenderList(
        layer.children, 
        currentOpacity, 
        currentX, 
        currentY,
        currentRotation,
        currentScaleX,
        currentScaleY
      )];
    } else if (layer.type === 'image' && (layer.url || layer.assetId)) {
      list.push({
        id: layer.id,
        // Fallback to url if assetId resolution happens later, or simple url if provided
        url: layer.url, 
        assetId: layer.assetId,
        opacity: currentOpacity,
        zIndex: 0,
        x: currentX,
        y: currentY,
        width: layer.width,
        height: layer.height,
        rotation: currentRotation,
        scaleX: currentScaleX,
        scaleY: currentScaleY
      });
    }
  });
  
  return list;
};

export const flattenLayers = async (layers: Layer[]): Promise<string> => {
  if (layers.length === 0) return '';
  
  const renderList = getFlatRenderList(layers);
  if (renderList.length === 0) return '';

  const loaded = await Promise.all(
    renderList.map(async (item) => {
      // Ensure we have a valid URL. If assetId is present but url is missing/stale, resolve it.
      let finalUrl = item.url;
      if (item.assetId && !item.url) {
          const resolved = await assetStore.getUrl(item.assetId);
          if (resolved) finalUrl = resolved;
      }
      
      if (!finalUrl) return null;
      const img = await loadImage(finalUrl);
      if (!img) return null;
      return { ...item, img };
    })
  );

  const validImages = loaded.filter((v): v is NonNullable<typeof loaded[number]> => !!v);
  if (validImages.length === 0) return '';

  let maxWidth = 0;
  let maxHeight = 0;
  validImages.forEach(({ img, x, y, width, height, scaleX, scaleY }) => {
    const w = (width || img.width) * Math.abs(scaleX);
    const h = (height || img.height) * Math.abs(scaleY);
    maxWidth = Math.max(maxWidth, x + w);
    maxHeight = Math.max(maxHeight, y + h);
  });

  const MAX_DIM = 4096;
  if (maxWidth > MAX_DIM || maxHeight > MAX_DIM) {
      // Simple downscale logic if composite is huge
      if (maxWidth > 8192 || maxHeight > 8192) {
         maxWidth = Math.min(maxWidth, 8192);
         maxHeight = Math.min(maxHeight, 8192);
      }
  }

  const canvas = getSharedCanvas();
  // Resize canvas - this clears it automatically
  canvas.width = Math.max(1, maxWidth);
  canvas.height = Math.max(1, maxHeight);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Explicitly reset transform just in case
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  validImages.forEach(({ img, opacity, x, y, width, height, rotation, scaleX, scaleY }) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    if (rotation) ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scaleX, scaleY);

    const w = width || img.width;
    const h = height || img.height;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  });

  return canvas.toDataURL('image/png');
};

export const findLayerById = (layers: Layer[], id: string): Layer | null => {
  for (const layer of layers) {
    if (layer.id === id) return layer;
    if (layer.children) {
      const found = findLayerById(layer.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const cropLayerImage = async (layer: Layer, cropRect: {x: number, y: number, w: number, h: number}): Promise<string> => {
  let url = layer.url;
  if (layer.assetId && !url) {
      url = await assetStore.getUrl(layer.assetId) || undefined;
  }
  if (!url) return '';
  
  const img = await loadImage(url);
  if (!img) return '';

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cropRect.w);
  canvas.height = Math.max(1, cropRect.h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.translate(-cropRect.x, -cropRect.y);

  ctx.translate(layer.x, layer.y);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scaleX || 1, layer.scaleY || 1);
  ctx.globalAlpha = layer.opacity;

  const w = layer.width || img.width;
  const h = layer.height || img.height;
  
  ctx.drawImage(img, 0, 0, w, h);
  
  return canvas.toDataURL('image/png');
};

export const flattenStrokesToLayer = async (
  strokes: { points: number[], color: string, size: number }[],
  x: number, y: number, w: number, h: number
): Promise<string> => {
  // Use OffscreenCanvas if available for speed
  if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      ctx.translate(-x, -y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      strokes.forEach(stroke => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        const p = stroke.points;
        if (p.length >= 2) {
            ctx.moveTo(p[0], p[1]);
            for(let i=2; i<p.length; i+=2) {
                ctx.lineTo(p[i], p[i+1]);
            }
        }
        ctx.stroke();
      });
      const blob = await canvas.convertToBlob();
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
      });
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.translate(-x, -y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  strokes.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      const p = stroke.points;
      if (p.length >= 2) {
          ctx.moveTo(p[0], p[1]);
          for(let i=2; i<p.length; i+=2) {
              ctx.lineTo(p[i], p[i+1]);
          }
      }
      ctx.stroke();
  });

  return canvas.toDataURL('image/png');
};
