
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop, RotateCcw, MousePointer2 } from 'lucide-react';
import { useCanvasScale } from '../hooks/useCanvasScale';

interface Props { 
  imageUrl: string; 
  mode: 'mask' | 'erase';
  onSave: (url: string, boundingBox?: number[]) => void; 
  onCancel: () => void; 
}

const CanvasEditor: React.FC<Props> = ({ imageUrl, mode, onSave, onCancel }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number, y: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && selection && selection.w > 5) handleSave();
        if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const { ref: containerRef, bounds, scale } = useCanvasScale(image?.width, image?.height);

  const getImgCoords = (e: React.MouseEvent) => {
    if (!image || !imageContainerRef.current) return { x: 0, y: 0 };
    
    // Get the exact screen position of the rendered image
    const rect = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the image
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Convert screen pixels to image pixels using scale, and clamp to image bounds
    return {
      x: Math.max(0, Math.min(image.width, clientX / scale)),
      y: Math.max(0, Math.min(image.height, clientY / scale))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    
    const coords = getImgCoords(e);
    dragStart.current = coords;
    setIsDragging(true);
    setSelection({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    e.preventDefault();
    
    const current = getImgCoords(e);
    
    const x = Math.min(current.x, dragStart.current.x);
    const y = Math.min(current.y, dragStart.current.y);
    const w = Math.abs(current.x - dragStart.current.x);
    const h = Math.abs(current.y - dragStart.current.y);
    
    setSelection({ x, y, w, h });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleSave = () => {
    if (!selection || selection.w === 0 || selection.h === 0) {
      onCancel();
      return;
    }
    // Convert to [ymin, xmin, ymax, xmax] format expected by App
    const bbox = [
      Math.round(selection.y),
      Math.round(selection.x),
      Math.round(selection.y + selection.h),
      Math.round(selection.x + selection.w)
    ];
    // We pass the original URL as the "guide" since we aren't painting a mask anymore
    onSave(imageUrl, bbox);
  };

  if (!image) return <div className="flex items-center justify-center h-full text-zinc-500">Loading...</div>;

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 overflow-hidden select-none">
       {/* Instruction Overlay */}
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="px-6 py-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-full text-sm text-zinc-200 font-medium shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
             <MousePointer2 className="w-4 h-4 text-blue-400 animate-pulse"/>
             <span>Drag to select the area you want to edit</span>
             <div className="w-px h-4 bg-zinc-700 mx-1"></div>
             <span className="text-zinc-500 text-xs">Press Enter to Confirm</span>
          </div>
       </div>

       {/* Canvas Area */}
       <div 
         ref={containerRef} 
         className="flex-1 relative flex items-center justify-center bg-zinc-900 cursor-crosshair touch-none"
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
       >
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', 
                   backgroundSize: '32px 32px'
                 }}>
          </div>

          {bounds.width > 0 && (
            <div 
              ref={imageContainerRef}
              style={{ 
                width: image.width * scale, 
                height: image.height * scale,
                position: 'relative'
              }} 
              className="shadow-2xl ring-1 ring-zinc-800 bg-black"
            >
                <img 
                   src={imageUrl} 
                   className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                   alt="Source" 
                />
                
                {/* Spotlight Effect Overlay (Darkens everything outside selection) */}
                {selection && selection.w > 0 && (
                  <>
                     {/* Top */}
                     <div className="absolute left-0 top-0 right-0 bg-black/60 pointer-events-none" style={{ height: selection.y * scale }} />
                     {/* Bottom */}
                     <div className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none" style={{ top: (selection.y + selection.h) * scale }} />
                     {/* Left */}
                     <div className="absolute left-0 bg-black/60 pointer-events-none" style={{ top: selection.y * scale, height: selection.h * scale, width: selection.x * scale }} />
                     {/* Right */}
                     <div className="absolute right-0 bg-black/60 pointer-events-none" style={{ top: selection.y * scale, height: selection.h * scale, left: (selection.x + selection.w) * scale }} />
                  </>
                )}

                {/* Selection Box */}
                {selection && selection.w > 0 && (
                  <div 
                    className="absolute border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 box-border"
                    style={{
                      left: selection.x * scale,
                      top: selection.y * scale,
                      width: selection.w * scale,
                      height: selection.h * scale,
                    }}
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap shadow-lg">
                        {Math.round(selection.w)} x {Math.round(selection.h)}
                     </div>
                     {/* Handles for visual cue */}
                     <div className="absolute -left-1 -top-1 w-2 h-2 bg-white border border-blue-600"></div>
                     <div className="absolute -right-1 -top-1 w-2 h-2 bg-white border border-blue-600"></div>
                     <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-white border border-blue-600"></div>
                     <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-white border border-blue-600"></div>
                  </div>
                )}
            </div>
          )}
       </div>

       {/* Floating Toolbar */}
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
              <button onClick={() => setSelection(null)} className="p-2.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors" title="Reset Selection">
                 <RotateCcw className="w-5 h-5"/>
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1"></div>

              <button onClick={onCancel} className="px-4 py-2 rounded-lg text-zinc-300 font-medium hover:bg-white/5 hover:text-white transition-colors text-sm">
                  Cancel
              </button>
              
              <button 
                onClick={handleSave} 
                disabled={!selection || selection.w < 5 || selection.h < 5}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Check className="w-4 h-4"/> Confirm Region
              </button>
          </div>
       </div>
    </div>
  );
};
export default CanvasEditor;
