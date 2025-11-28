
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ScaleType } from '../types';
import { SCALE_DEFS, getTempoFromArousal, getPsychologyDescription } from '../utils/musicTheory';
import { cn } from './UI';
import { Activity } from 'lucide-react';

export const EMOJI_RADIUS = 24;

export const EMOTIONS: any = {
  "pleasant-energetic": { accent: "hsl(45, 93%, 47%)", grad: "rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15)" },
  "pleasant-calm": { accent: "hsl(142, 71%, 45%)", grad: "rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15)" },
  "unpleasant-energetic": { accent: "hsl(0, 84%, 60%)", grad: "rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.15)" },
  "unpleasant-calm": { accent: "hsl(217, 91%, 60%)", grad: "rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15)" },
  "neutral": { accent: "hsl(206, 42%, 56%)", grad: "rgba(100, 116, 139, 0.05)" }
};

export const getEmo = (v: number, a: number) => {
  const r = Math.sqrt(v*v + a*a);
  if (r < 0.15) return { emoji: "😐", label: "Neutral", q: "neutral" };
  const q = v>=0 ? (a>=0 ? "pleasant-energetic" : "pleasant-calm") : (a>=0 ? "unpleasant-energetic" : "unpleasant-calm");
  const emojis = { "pleasant-energetic": ["😌","😊","🤩"], "pleasant-calm": ["🌱","🌊","✨"], "unpleasant-energetic": ["🔥","😤","🤬"], "unpleasant-calm": ["🥀","🌧️","🌑"] };
  const intensity = r > 0.8 ? 2 : r > 0.5 ? 1 : 0;
  return { emoji: emojis[q as keyof typeof emojis][intensity], q };
};

interface EmojiGridMapperProps {
  onChange: (data: any) => void;
  scale: ScaleType;
  onTempo?: (bpm: number) => void;
  onScaleSelect?: (scale: ScaleType) => void;
}

const EmojiGridMapper: React.FC<EmojiGridMapperProps> = ({ onChange, scale, onTempo, onScaleSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(300);
  const [pos, setPos] = useState({ x: 150, y: 150 });
  const [drag, setDrag] = useState(false);
  const [hoveredScale, setHoveredScale] = useState<string | null>(null);
  
  useEffect(() => { 
      const resize = () => {
          if (ref.current) {
              const s = Math.min(ref.current.clientWidth, ref.current.clientHeight);
              setSize(s);
          }
      };
      resize(); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
  }, []);

  // Sync position when scale changes externally
  useEffect(() => {
      if (scale && !drag && SCALE_DEFS[scale]) {
          const c = SCALE_DEFS[scale].coords;
          const targetX = (size/2) + (c.x * (size/2 * 0.8));
          const targetY = (size/2) - (c.y * (size/2 * 0.8));
          
          if (Math.abs(pos.x - targetX) > 1 || Math.abs(pos.y - targetY) > 1) {
             setPos({ x: targetX, y: targetY });
          }
      }
  }, [scale, size, drag]);

  const handle = useCallback((e: any) => {
     if (!ref.current) return;
     const r = ref.current.getBoundingClientRect();
     const cx = size/2, cy = size/2, maxRadius = cx - EMOJI_RADIUS;
     
     const clientX = e.touches ? e.touches[0].clientX : e.clientX;
     const clientY = e.touches ? e.touches[0].clientY : e.clientY;
     
     let x = clientX - r.left;
     let y = clientY - r.top;
     
     const d = Math.sqrt((x-cx)**2 + (y-cy)**2);
     if (d > maxRadius) { x = cx + ((x-cx)/d)*maxRadius; y = cy + ((y-cy)/d)*maxRadius; }
     
     setPos({ x, y });
     
     const v = (x-cx) / maxRadius;
     const a = (cy-y) / maxRadius; // Y inverted
     
     let bestScale: ScaleType | null = null;
     let minDist = 0.35; // Wider snap area

     Object.entries(SCALE_DEFS).forEach(([k, def]) => {
        const dx = v - (def.coords.x * 0.8); 
        const dy = a - (def.coords.y * 0.8);
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) { minDist = dist; bestScale = k as ScaleType; }
     });

     if (bestScale && bestScale !== scale) {
        onScaleSelect?.(bestScale);
        setHoveredScale(bestScale);
     } else {
        setHoveredScale(null);
     }

     const data = { ...getEmo(v,a), v, a, bpm: getTempoFromArousal(a), description: getPsychologyDescription(v,a) };
     onChange(data); 
     onTempo?.(data.bpm);
  }, [size, onChange, onTempo, onScaleSelect, scale]);

  const start = (e: any) => { e.stopPropagation(); setDrag(true); document.addEventListener('mousemove', handle); document.addEventListener('mouseup', stop); document.addEventListener('touchmove', handle); document.addEventListener('touchend', stop); };
  const stop = () => { setDrag(false); document.removeEventListener('mousemove', handle); document.removeEventListener('mouseup', stop); document.removeEventListener('touchmove', handle); document.removeEventListener('touchend', stop); };

  const cx = size/2, cy = size/2, max = cx - EMOJI_RADIUS;
  const v = (pos.x-cx)/max, a = (cy-pos.y)/max;
  const emo = getEmo(v, a);
  const moodColor = EMOTIONS[emo.q];

  return (
    <div className="relative w-full h-full max-w-[320px] max-h-[320px] aspect-square mx-auto select-none touch-none p-8">
        <div ref={ref} 
             className="w-full h-full rounded-full border border-white/5 bg-[#050505] relative overflow-hidden shadow-2xl cursor-crosshair group/grid"
             onMouseDown={start} onTouchStart={start}
        >
            {/* Dynamic Background with Blend Mode */}
            <div className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                 style={{
                     background: `radial-gradient(circle 220px at ${pos.x}px ${pos.y}px, ${moodColor.grad}, transparent 100%)`,
                     opacity: drag ? 0.7 : 0.4,
                     mixBlendMode: 'screen'
                 }}
            />
            
            {/* Axes */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute top-1/2 left-4 right-4 h-px bg-white"/>
                 <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white"/>
            </div>

            {/* Scale Anchor Points */}
            {Object.entries(SCALE_DEFS).map(([k, def]) => {
                const sx = (size/2) + (def.coords.x * 0.8 * (size/2));
                const sy = (size/2) - (def.coords.y * 0.8 * (size/2));
                const isActive = k === scale;

                return (
                    <div key={k} 
                         className="absolute transition-all duration-500 z-10"
                         style={{ left: sx, top: sy, transform: 'translate(-50%, -50%)' }} 
                    >
                        {/* Tether Line */}
                        {isActive && (
                            <svg className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible">
                                <line 
                                    x1="150" y1="150" 
                                    x2={150 + (pos.x - sx)} y2={150 + (pos.y - sy)} 
                                    stroke="white" 
                                    strokeWidth="0.5" 
                                    strokeOpacity="0.2"
                                    strokeDasharray="2 4"
                                />
                            </svg>
                        )}

                        <div className={cn("rounded-full transition-all duration-300 relative z-10", isActive ? "w-2.5 h-2.5 bg-white shadow-[0_0_20px_white]" : "w-1 h-1 bg-white/20")}>
                             {isActive && <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />}
                        </div>
                        
                        {/* Label */}
                        <div className={cn(
                            "absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 pointer-events-none text-shadow-sm font-mono", 
                            isActive ? "text-white scale-100" : "text-white/20 scale-90"
                        )}>
                            {def.meta.title}
                        </div>
                    </div>
                );
            })}
            
            {/* Cursor */}
            <div 
                className={cn(
                    "absolute w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex flex-col items-center justify-center transition-transform duration-100 shadow-2xl z-20",
                    drag ? "scale-110 cursor-grabbing" : "cursor-grab"
                )}
                style={{ 
                    left: pos.x, top: pos.y, 
                    transform: 'translate(-50%,-50%)',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
                    boxShadow: `0 0 50px -15px ${moodColor.accent}80`
                }}
            >
                <div className="text-xl select-none filter drop-shadow-md transition-transform hover:scale-110">{emo.emoji}</div>
                <div className="absolute -bottom-6 bg-black/80 border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-mono text-[var(--accent)] flex items-center gap-1 shadow-lg pointer-events-none whitespace-nowrap backdrop-blur-md">
                    <Activity size={10} />
                    {getTempoFromArousal(a)} BPM
                </div>
            </div>
        </div>
    </div>
  );
};

export default EmojiGridMapper;
