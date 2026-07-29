
import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface Point { x: number; y: number }

export interface Stroke {
  points: Point[];
  size: number;
  tool: 'brush' | 'eraser';
}

interface UseCanvasDrawingProps {
  imageUrl: string;
  isDestructive?: boolean; 
  strokeColor?: string;
  initialBrushSize?: number;
}

export const useCanvasDrawing = ({ 
  imageUrl, 
  isDestructive = false, 
  strokeColor = 'red',
  initialBrushSize = 30 
}: UseCanvasDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(initialBrushSize);
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser'>('brush');
  const [cursorPos, setCursorPos] = useState<Point | null>(null);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[') setBrushSize(s => Math.max(5, s - 5));
      if (e.key === ']') setBrushSize(s => Math.min(200, s + 5));
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        setStrokes(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform to clear full buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Image (only for destructive mode)
    if (isDestructive) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // Draw Strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;
      
      if (isDestructive) {
         ctx.globalCompositeOperation = 'destination-out';
         ctx.strokeStyle = 'black'; 
      } else {
         if (stroke.tool === 'brush') {
           ctx.globalCompositeOperation = 'source-over';
           ctx.strokeStyle = strokeColor;
         } else {
           ctx.globalCompositeOperation = 'destination-out';
         }
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [image, strokes, isDestructive, strokeColor]);

  // Trigger render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!image) return;
    // e.preventDefault(); // allow default mostly, prevent scrolling conditionally if needed
    setIsDrawing(true);
    const pos = getPos(e);
    const newStroke: Stroke = {
      points: [pos],
      size: brushSize,
      tool: currentTool,
    };
    setStrokes([...strokes, newStroke]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    setCursorPos(pos);

    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling while drawing
    
    const newStrokes = [...strokes];
    const lastStroke = newStrokes[newStrokes.length - 1];
    lastStroke.points.push(pos);
    setStrokes(newStrokes);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const undo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const clear = () => {
    setStrokes([]);
  };

  const getResultDataUrl = () => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  };

  // Calculates [ymin, xmin, ymax, xmax] in PIXELS
  const getBoundingBox = (): number[] | null => {
    if (!canvasRef.current || strokes.length === 0) return null;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Get pixel data
    const w = canvas.width;
    const h = canvas.height;
    // Optimization: if strokes are simple, we could calculate from stroke points, 
    // but pixel data is accurate for erasers/overlapping.
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return null;

    // Add a small padding (10px) to ensure coverage
    const padding = 10;
    return [
      Math.max(0, minY - padding),
      Math.max(0, minX - padding),
      Math.min(h, maxY + padding),
      Math.min(w, maxX + padding)
    ];
  };

  return {
    canvasRef,
    imageDimensions: image ? { width: image.width, height: image.height } : null,
    handlers: {
      onMouseDown: startDrawing,
      onMouseMove: draw,
      onMouseUp: stopDrawing,
      onMouseLeave: (e: any) => { stopDrawing(); setCursorPos(null); },
      onMouseEnter: (e: any) => { if(e.buttons === 1) startDrawing(e); },
      onTouchStart: startDrawing,
      onTouchMove: draw,
      onTouchEnd: stopDrawing
    },
    brushSize,
    setBrushSize,
    currentTool,
    setCurrentTool,
    undo,
    clear,
    save: getResultDataUrl,
    getBoundingBox,
    canUndo: strokes.length > 0,
    cursorPos
  };
};
