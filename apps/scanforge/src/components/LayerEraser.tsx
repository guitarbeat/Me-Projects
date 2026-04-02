import React from 'react';
import { Undo, Save, X, Eraser } from 'lucide-react';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasScale } from '../hooks/useCanvasScale';

interface Props { currentUrl: string; previousUrl: string; onSave: (data: string) => void; onCancel: () => void; }

const LayerEraser: React.FC<Props> = ({ currentUrl, previousUrl, onSave, onCancel }) => {
  const { 
    canvasRef, 
    imageDimensions, 
    handlers, 
    brushSize, 
    setBrushSize, 
    undo, 
    save,
    canUndo
  } = useCanvasDrawing({ 
    imageUrl: currentUrl, 
    isDestructive: true, // Destructive mode: we are erasing the image itself
    initialBrushSize: 50
  });

  const { ref: containerRef, bounds, scale } = useCanvasScale(imageDimensions?.width, imageDimensions?.height);

  if (!imageDimensions) return <div className="flex items-center justify-center h-full text-zinc-500">Loading...</div>;

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 overflow-hidden select-none touch-none">
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-zinc-800/80 border border-zinc-700 rounded-full text-[10px] font-bold text-zinc-300 uppercase tracking-widest backdrop-blur-md">Eraser Mode</div>
       
       <div ref={containerRef} className="flex-1 relative flex items-center justify-center bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
          {bounds.width > 0 && (
             <div style={{ width: imageDimensions.width * scale, height: imageDimensions.height * scale }} className="relative shadow-2xl ring-1 ring-zinc-800 bg-black">
                {/* Previous Layer Background (visible through erased areas) */}
                <img 
                   src={previousUrl} 
                   className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none" 
                   alt="Previous Layer"
                />

                {/* Canvas with Current Image being erased */}
                <canvas
                  ref={canvasRef}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '100%', height: '100%' }}
                  {...handlers}
                />
             </div>
          )}
       </div>
       
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-2 rounded-full shadow-2xl z-30">
        <button onClick={onCancel} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5"/></button>
        <div className="w-px h-5 bg-zinc-700 mx-1"></div>
        
        <div className="flex items-center gap-2 px-2">
            <Eraser className="w-4 h-4 text-zinc-400"/>
            <input type="range" min="10" max="150" value={brushSize} onChange={e=>setBrushSize(+e.target.value)} className="w-24 accent-white h-1 bg-zinc-700 rounded-lg appearance-none"/>
        </div>

        <button onClick={undo} disabled={!canUndo} className="p-2 rounded-full text-zinc-400 hover:text-white disabled:opacity-30"><Undo className="w-5 h-5"/></button>
        <button onClick={() => onSave(save())} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-full text-xs font-bold transition-colors shadow-lg"><Save className="w-4 h-4"/> Merge</button>
      </div>
    </div>
  );
};
export default LayerEraser;
