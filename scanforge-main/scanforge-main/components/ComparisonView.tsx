
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Columns, Eye, Download, ZoomIn, ZoomOut, Hand, Move, Paintbrush, Crop, Save, Trash2, Check } from 'lucide-react';
import { Stage, Layer as KonvaLayer, Image as KonvaImage, Group, Rect, Transformer, Line } from 'react-konva';
import useImage from 'use-image';
import useMeasure from 'react-use-measure';
import { Layer as AppLayer } from '../types';
import { useStore } from '../store';
import { cropLayerImage, flattenStrokesToLayer, flattenLayers, findLayerById } from '../services/layerUtils';
import { assetStore } from '../services/assetStore';

interface Props { 
  originalLayers: AppLayer[]; 
  currentLayers: AppLayer[]; 
  activeLayerId?: string;
  onLayerUpdate?: (id: string, updates: Partial<AppLayer>, createSnapshot?: boolean) => void;
}

// Render a single layer or group recursively
const LayerNode: React.FC<{
  layer: AppLayer;
  activeLayerId?: string;
  tool: string;
  onLayerUpdate?: (id: string, updates: Partial<AppLayer>, createSnapshot?: boolean) => void;
  onSelect?: (id: string) => void;
}> = React.memo(({ layer, activeLayerId, tool, onLayerUpdate, onSelect }) => {
  // Try to use layer.url; if it's missing (e.g. hydration lag), check assetId?
  // Actually the store hydration ensures .url is present as blob url.
  const [img, status] = useImage(layer.url || '', 'anonymous');
  
  if (!layer.isVisible) return null;

  const isActive = useMemo(() => layer.id === activeLayerId, [layer.id, activeLayerId]);
  const isLocked = !!layer.locked;
  const isDraggable = tool === 'move' && isActive && !!onLayerUpdate && !isLocked;

  const handleClick = (e: any) => {
    // Only select if not in specific tool modes that require clicking elsewhere
    if (tool !== 'paint' && tool !== 'crop' && tool !== 'eyedropper' && onSelect) {
        onSelect(layer.id);
        if (tool === 'move' || tool === 'hand') e.cancelBubble = true;
    }
  };

  if (layer.type === 'group') {
     return (
       <Group
         id={layer.id}
         x={layer.x}
         y={layer.y}
         rotation={layer.rotation || 0}
         scaleX={layer.scaleX || 1}
         scaleY={layer.scaleY || 1}
         opacity={layer.opacity}
         visible={layer.isVisible}
         draggable={isDraggable}
         listening={!isLocked}
         onClick={handleClick}
         onTap={handleClick}
         onDragEnd={(e) => {
            if (onLayerUpdate) onLayerUpdate(layer.id, { x: e.target.x(), y: e.target.y() }, true);
         }}
       >
         {layer.children?.map(child => (
            <LayerNode 
                key={child.id} 
                layer={child} 
                activeLayerId={activeLayerId} 
                tool={tool} 
                onLayerUpdate={onLayerUpdate}
                onSelect={onSelect} 
            />
         ))}
       </Group>
     );
  }

  const fallbackWidth = layer.width || img?.width || 256;
  const fallbackHeight = layer.height || img?.height || 256;

  if (status === 'loading' || status === 'failed' || !img) {
    return (
      <Rect
        id={layer.id}
        x={layer.x}
        y={layer.y}
        width={fallbackWidth}
        height={fallbackHeight}
        fill={status === 'loading' ? "#18181b" : "#27272a"}
        stroke={isActive && tool === 'move' ? "#3b82f6" : undefined}
        dash={[6, 4]}
        opacity={layer.opacity}
        draggable={isDraggable}
        listening={!isLocked}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={(e) => {
          if (onLayerUpdate) onLayerUpdate(layer.id, { x: e.target.x(), y: e.target.y() }, true);
        }}
      />
    );
  }

  return (
    <KonvaImage
      id={layer.id}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation || 0}
      scaleX={layer.scaleX || 1}
      scaleY={layer.scaleY || 1}
      opacity={layer.opacity}
      visible={layer.isVisible}
      draggable={isDraggable}
      listening={!isLocked}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={(e) => {
         if (onLayerUpdate) onLayerUpdate(layer.id, { x: e.target.x(), y: e.target.y() }, true);
      }}
      stroke={isActive && tool !== 'move' && tool !== 'hand' && tool !== 'paint' ? '#3b82f6' : undefined}
      strokeWidth={isActive && tool !== 'move' && tool !== 'hand' && tool !== 'paint' ? 2 / (img.scaleX || 1) : 0} 
    />
  );
});

interface CanvasStageProps {
  layers: AppLayer[];
  width: number;
  height: number;
  isEditable?: boolean;
  activeTool: string;
  stagePos: { x: number; y: number };
  stageScale: number;
  isSpacePanning: boolean;
  setStagePos: (pos: { x: number; y: number }) => void;
  onWheel?: (e: any) => void;
  onMouseDown?: (e: any) => void;
  onMouseMove?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  stageRef?: React.RefObject<any>;
  layerGroupRef?: React.RefObject<any>;
  trRef?: React.RefObject<any>;
  activeLayerId?: string;
  onLayerUpdate?: (id: string, updates: Partial<AppLayer>, createSnapshot?: boolean) => void;
  setActiveLayer?: (id: string) => void;
  strokes?: { points: number[]; color: string; size: number }[];
  currentPoints?: number[];
  brushSettings?: { color: string; size: number };
  cropRect?: { x: number; y: number; w: number; h: number } | null;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  layers,
  width,
  height,
  isEditable = false,
  activeTool,
  stagePos,
  stageScale,
  isSpacePanning,
  setStagePos,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  stageRef,
  layerGroupRef,
  trRef,
  activeLayerId,
  onLayerUpdate,
  setActiveLayer,
  strokes,
  currentPoints,
  brushSettings,
  cropRect
}) => {
  return (
    <Stage
        ref={isEditable ? stageRef : undefined}
        width={width}
        height={height}
        draggable={activeTool === 'hand' || isSpacePanning}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={isEditable ? onWheel : undefined}
        onDragMove={(e) => {
           if ((activeTool === 'hand' || isSpacePanning) && e.target === e.target.getStage()) {
             setStagePos({ x: e.target.x(), y: e.target.y() });
           }
        }}
        onMouseDown={isEditable ? onMouseDown : undefined}
        onMouseMove={isEditable ? onMouseMove : undefined}
        onMouseUp={isEditable ? onMouseUp : undefined}
        style={{ cursor: isSpacePanning ? 'grab' : activeTool === 'hand' ? 'grab' : activeTool === 'eyedropper' ? 'crosshair' : 'default' }}
    >
        <KonvaLayer ref={isEditable ? layerGroupRef : undefined}>
            {layers.map((layer) => (
                <LayerNode
                    key={layer.id}
                    layer={layer}
                    activeLayerId={activeLayerId}
                    tool={activeTool}
                    onLayerUpdate={isEditable ? onLayerUpdate : undefined}
                    onSelect={isEditable ? setActiveLayer : undefined}
                />
            ))}

            {isEditable && activeTool === 'paint' && strokes && (
                <>
                   {strokes.map((s, i) => (
                      <Line key={i} points={s.points} stroke={s.color} strokeWidth={s.size} lineCap="round" lineJoin="round" tension={0.5} />
                   ))}
                   {currentPoints && currentPoints.length > 0 && brushSettings && (
                      <Line points={currentPoints} stroke={brushSettings.color} strokeWidth={brushSettings.size} lineCap="round" lineJoin="round" tension={0.5} />
                   )}
                </>
            )}

            {isEditable && activeTool === 'crop' && cropRect && (
                <>
                    <Rect
                       x={-10000} y={-10000} width={20000} height={20000}
                       fill="black" opacity={0.5}
                       listening={false}
                    />
                    <Rect
                        x={cropRect.x}
                        y={cropRect.y}
                        width={cropRect.w}
                        height={cropRect.h}
                        stroke="white"
                        strokeWidth={1 / stageScale}
                        fill="transparent"
                        listening={false}
                        globalCompositeOperation="destination-out"
                    />
                    <Rect
                        x={cropRect.x}
                        y={cropRect.y}
                        width={cropRect.w}
                        height={cropRect.h}
                        stroke="#3b82f6"
                        strokeWidth={2 / stageScale}
                        dash={[5, 5]}
                    />
                </>
            )}

            {isEditable && activeTool === 'move' && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                        return newBox;
                    }}
                    anchorSize={10}
                    anchorCornerRadius={5}
                    rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                    onTransformEnd={(e) => {
                        if (!onLayerUpdate || !activeLayerId) return;
                        const node = e.target;
                        onLayerUpdate(activeLayerId, {
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                            scaleX: node.scaleX(),
                            scaleY: node.scaleY(),
                        }, true);
                    }}
                />
            )}
        </KonvaLayer>
    </Stage>
  );
};

const ComparisonView: React.FC<Props> = ({ originalLayers, currentLayers, activeLayerId, onLayerUpdate }) => {
  const { activeTool, setActiveTool, brushSettings, setBrushSettings, addLayer, setActiveLayer } = useStore();
  const [mode, setMode] = useState<'side-by-side' | 'toggle'>('toggle');
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Viewport State
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  
  const [containerRef, bounds] = useMeasure();
  const trRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  // --- Crop State ---
  const [cropRect, setCropRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // --- Paint State ---
  const [strokes, setStrokes] = useState<{ points: number[], color: string, size: number }[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isPainting, setIsPainting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize scale
  useEffect(() => {
     if (bounds.width > 0 && stageScale === 1 && originalLayers.length > 0) {
        if (bounds.width < 1000) setStageScale(bounds.width / 1000); 
     }
  }, [bounds.width]);

  // Spacebar panning listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            setIsSpacePanning(true);
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            setIsSpacePanning(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Transformer logic
  useEffect(() => {
    if (trRef.current && layerGroupRef.current) {
      if (activeLayerId && activeTool === 'move') {
        const activeLayer = findLayerById(currentLayers, activeLayerId);
        if (activeLayer && !activeLayer.locked) {
            const selectedNode = layerGroupRef.current.findOne('#' + activeLayerId);
            if (selectedNode) {
              trRef.current.nodes([selectedNode]);
              trRef.current.getLayer().batchDraw();
              return;
            }
        }
      }
      trRef.current.nodes([]);
    }
  }, [activeLayerId, activeTool, currentLayers]);

  // --- Interaction Handlers ---

  const getStagePointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.min(10, Math.max(0.05, newScale));

    setStageScale(clampedScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStagePos(newPos);
  };

  const handleStageMouseDown = (e: any) => {
    if (activeTool === 'hand' || isSpacePanning) return;
    
    if (activeTool === 'eyedropper') {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const ctx = stage.toCanvas({ 
            x: pointer.x, y: pointer.y, width: 1, height: 1, pixelRatio: 1 
        }).getContext('2d');
        
        if (ctx) {
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const hex = "#" + ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1);
            setBrushSettings({ color: hex });
            setActiveTool('paint');
        }
        return;
    }

    const pos = getStagePointerPos();

    if (activeTool === 'crop') {
        setIsCropping(true);
        setCropRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }

    if (activeTool === 'paint') {
        setIsPainting(true);
        setCurrentPoints([pos.x, pos.y]);
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (activeTool === 'hand' || isSpacePanning) return;
    const pos = getStagePointerPos();

    if (activeTool === 'crop' && isCropping && cropRect) {
        setCropRect({
            ...cropRect,
            w: pos.x - cropRect.x,
            h: pos.y - cropRect.y
        });
    }

    if (activeTool === 'paint' && isPainting) {
        setCurrentPoints([...currentPoints, pos.x, pos.y]);
    }
  };

  const handleStageMouseUp = () => {
    if (activeTool === 'crop') {
        setIsCropping(false);
        if (cropRect) {
            const r = { ...cropRect };
            if (r.w < 0) { r.x += r.w; r.w = Math.abs(r.w); }
            if (r.h < 0) { r.y += r.h; r.h = Math.abs(r.h); }
            setCropRect(r);
        }
    }

    if (activeTool === 'paint' && isPainting) {
        setIsPainting(false);
        if (currentPoints.length > 2) {
            setStrokes([...strokes, { points: currentPoints, color: brushSettings.color, size: brushSettings.size }]);
        }
        setCurrentPoints([]);
    }
  };

  const commitPaint = async () => {
     if (strokes.length === 0) return;
     try {
         let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
         strokes.forEach(s => {
             for(let i=0; i<s.points.length; i+=2) {
                 minX = Math.min(minX, s.points[i]);
                 maxX = Math.max(maxX, s.points[i]);
                 minY = Math.min(minY, s.points[i+1]);
                 maxY = Math.max(maxY, s.points[i+1]);
             }
         });
         const pad = 100;
         minX -= pad; minY -= pad; maxX += pad; maxY += pad;

         const url = await flattenStrokesToLayer(strokes, minX, minY, maxX - minX, maxY - minY);
         
         addLayer({
             id: crypto.randomUUID(),
             type: 'image',
             name: 'Paint Layer',
             url, // Store will convert to assetId
             isVisible: true,
             opacity: 1,
             x: minX,
             y: minY
         });
         setStrokes([]);
         setActiveTool('hand');
     } catch (e) {
         console.error("Paint fail", e);
     }
  };

  const applyCrop = async () => {
      if (!cropRect || !activeLayerId || !onLayerUpdate) return;
      if (cropRect.w < 5 || cropRect.h < 5) return; 

      const layer = currentLayers.find(l => l.id === activeLayerId);
      if (!layer) return;
      if (layer.locked) return;

      try {
         const newUrl = await cropLayerImage(layer, cropRect);
         onLayerUpdate(activeLayerId, {
             url: newUrl, // Store updates assetId
             x: cropRect.x,
             y: cropRect.y,
             width: cropRect.w,
             height: cropRect.h,
             rotation: 0,
             scaleX: 1,
             scaleY: 1
         }, true);
         setCropRect(null);
         setActiveTool('hand');
      } catch (e) {
         console.error("Crop fail", e);
      }
  };

  const handleZoom = (direction: 1 | -1) => {
    const scaleBy = 1.2;
    const newScale = direction > 0 ? stageScale * scaleBy : stageScale / scaleBy;
    setStageScale(Math.min(10, Math.max(0.05, newScale)));
  };

  const handleDownload = async () => {
      setIsExporting(true);
      try {
        let layersToExport = [...currentLayers];
        
        if (strokes.length > 0) {
           let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
           strokes.forEach(s => {
               for(let i=0; i<s.points.length; i+=2) {
                   minX = Math.min(minX, s.points[i]);
                   maxX = Math.max(maxX, s.points[i]);
                   minY = Math.min(minY, s.points[i+1]);
                   maxY = Math.max(maxY, s.points[i+1]);
               }
           });
           
           if (minX !== Infinity) {
             const pad = 100;
             minX -= pad; minY -= pad; maxX += pad; maxY += pad;
             
             const strokeUrl = await flattenStrokesToLayer(strokes, minX, minY, maxX - minX, maxY - minY);
             // We need to store this transient asset temporarily or just use the data URL for flatten
             // flattenLayers supports normal URLs so data URL is fine for export
             layersToExport.push({
                 id: 'temp-export-paint',
                 type: 'image',
                 name: 'Temp Paint',
                 url: strokeUrl,
                 isVisible: true,
                 opacity: 1,
                 x: minX,
                 y: minY
             });
           }
        }
  
        const compositeUrl = await flattenLayers(layersToExport);
        if (!compositeUrl) throw new Error("Export failed - no content");
  
        const link = document.createElement('a');
        link.href = compositeUrl;
        link.download = `scanforge-export-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
          console.error("Export error", e);
          alert("Failed to generate export. Please try again.");
      } finally {
          setIsExporting(false);
      }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950">
        <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#18181b]">
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', 
                   backgroundSize: '32px 32px',
                   backgroundPosition: `${stagePos.x}px ${stagePos.y}px`
                 }}>
            </div>

            {bounds.width > 0 && bounds.height > 0 && (
                mode === 'side-by-side' ? (
                    <div className="flex w-full h-full">
                         <div className="flex-1 border-r border-zinc-800 relative bg-black/20">
                            <CanvasStage
                              layers={originalLayers}
                              width={bounds.width / 2}
                              height={bounds.height}
                              isEditable={false}
                              activeTool={activeTool}
                              stagePos={stagePos}
                              stageScale={stageScale}
                              isSpacePanning={isSpacePanning}
                              setStagePos={setStagePos}
                            />
                         </div>
                         <div className="flex-1 relative bg-black/20">
                            <CanvasStage
                              layers={currentLayers}
                              width={bounds.width / 2}
                              height={bounds.height}
                              isEditable={true}
                              activeTool={activeTool}
                              stagePos={stagePos}
                              stageScale={stageScale}
                              isSpacePanning={isSpacePanning}
                              setStagePos={setStagePos}
                              onWheel={handleWheel}
                              onMouseDown={handleStageMouseDown}
                              onMouseMove={handleStageMouseMove}
                              onMouseUp={handleStageMouseUp}
                              stageRef={stageRef}
                              layerGroupRef={layerGroupRef}
                              trRef={trRef}
                              activeLayerId={activeLayerId}
                              onLayerUpdate={onLayerUpdate}
                              setActiveLayer={setActiveLayer}
                              strokes={strokes}
                              currentPoints={currentPoints}
                              brushSettings={brushSettings}
                              cropRect={cropRect}
                            />
                         </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative"
                        onMouseDown={() => { if(activeTool === 'hand' || isSpacePanning) setShowOriginal(true); }} 
                        onMouseUp={() => setShowOriginal(false)} 
                    >
                         <CanvasStage
                            layers={showOriginal ? originalLayers : currentLayers} 
                            width={bounds.width} 
                            height={bounds.height} 
                            isEditable={!showOriginal}
                            activeTool={activeTool}
                            stagePos={stagePos}
                            stageScale={stageScale}
                            isSpacePanning={isSpacePanning}
                            setStagePos={setStagePos}
                            onWheel={!showOriginal ? handleWheel : undefined}
                            onMouseDown={!showOriginal ? handleStageMouseDown : undefined}
                            onMouseMove={!showOriginal ? handleStageMouseMove : undefined}
                            onMouseUp={!showOriginal ? handleStageMouseUp : undefined}
                            stageRef={!showOriginal ? stageRef : undefined}
                            layerGroupRef={!showOriginal ? layerGroupRef : undefined}
                            trRef={!showOriginal ? trRef : undefined}
                            activeLayerId={activeLayerId}
                            onLayerUpdate={!showOriginal ? onLayerUpdate : undefined}
                            setActiveLayer={!showOriginal ? setActiveLayer : undefined}
                            strokes={strokes}
                            currentPoints={currentPoints}
                            brushSettings={brushSettings}
                            cropRect={cropRect}
                         />
                    </div>
                )
            )}

            {activeTool === 'crop' && cropRect && cropRect.w > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 z-50">
                    <button onClick={applyCrop} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-xl font-bold text-xs hover:bg-blue-500">
                        <Check className="w-3.5 h-3.5"/> Apply Crop
                    </button>
                    <button onClick={() => setCropRect(null)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-full shadow-xl font-bold text-xs hover:bg-zinc-700">Cancel</button>
                </div>
            )}
            {activeTool === 'paint' && strokes.length > 0 && (
                <div className="absolute top-4 right-4 flex gap-2 z-50 bg-black/50 p-2 rounded-lg backdrop-blur">
                    <button onClick={commitPaint} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-500">
                        <Save className="w-3.5 h-3.5"/> Save Layer
                    </button>
                    <button onClick={() => setStrokes([])} className="p-1.5 text-zinc-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-auto">
            <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-1 rounded-full shadow-2xl">
                 <button onClick={() => setActiveTool('hand')} className={`p-2.5 rounded-full transition-all ${activeTool === 'hand' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Pan (Spacebar)">
                    <Hand className="w-4 h-4"/>
                 </button>
                 <button onClick={() => setActiveTool('move')} className={`p-2.5 rounded-full transition-all ${activeTool === 'move' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Move">
                    <Move className="w-4 h-4"/>
                 </button>
                 <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                 <button onClick={() => setActiveTool('crop')} className={`p-2.5 rounded-full transition-all ${activeTool === 'crop' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Crop">
                    <Crop className="w-4 h-4"/>
                 </button>
                 <button onClick={() => setActiveTool('paint')} className={`p-2.5 rounded-full transition-all ${activeTool === 'paint' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`} title="Paint">
                    <Paintbrush className="w-4 h-4"/>
                 </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-1.5 rounded-full shadow-2xl">
                <button onClick={() => setMode(m => m === 'side-by-side' ? 'toggle' : 'side-by-side')} className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                    {mode === 'side-by-side' ? <Columns className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
                <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                <button onClick={() => handleZoom(-1)} className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"><ZoomOut className="w-4 h-4"/></button>
                <span className="text-[10px] text-zinc-500 font-mono w-10 text-center">{Math.round(stageScale * 100)}%</span>
                <button onClick={() => handleZoom(1)} className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"><ZoomIn className="w-4 h-4"/></button>
                <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                <button onClick={handleDownload} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-full text-[10px] font-bold transition-colors disabled:opacity-50">
                    <Download className="w-3.5 h-3.5"/> {isExporting ? '...' : 'EXPORT'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ComparisonView;
