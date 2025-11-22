
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ScaleType, Note } from '../types';
import { getScaleNotes, MODE_COORDINATES, getTempoFromArousal, getPsychologyDescription } from '../utils/musicTheory';
import { audioEngine } from '../utils/audioEngine';
import { Gauge } from "lucide-react";

// --- Constants from previous EmojiGridMapper ---
const EMOTION_COLORS: any = {
  "pleasant-energetic": {
    primary: "from-yellow-500/80 to-orange-600/80",
    accent: "hsl(45, 93%, 47%)", 
    gradientColors: "rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2)",
    borderColor: "rgba(250, 204, 21, 0.5)",
    shadowColor: "rgba(234, 179, 8, 0.3)"
  },
  "pleasant-calm": {
    primary: "from-green-500/80 to-emerald-600/80",
    accent: "hsl(142, 71%, 45%)", 
    gradientColors: "rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(74, 222, 128, 0.5)",
    shadowColor: "rgba(34, 197, 94, 0.3)"
  },
  "unpleasant-energetic": {
    primary: "from-red-500/80 to-rose-600/80",
    accent: "hsl(0, 84%, 60%)", 
    gradientColors: "rgba(239, 68, 68, 0.2), rgba(244, 63, 94, 0.2)",
    borderColor: "rgba(248, 113, 113, 0.5)",
    shadowColor: "rgba(239, 68, 68, 0.3)"
  },
  "unpleasant-calm": {
    primary: "from-blue-500/80 to-indigo-600/80",
    accent: "hsl(217, 91%, 60%)", 
    gradientColors: "rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2)",
    borderColor: "rgba(96, 165, 250, 0.5)",
    shadowColor: "rgba(59, 130, 246, 0.3)"
  },
  "neutral": {
    primary: "from-slate-500/80 to-slate-600/80",
    accent: "hsl(206, 42%, 56%)", 
    gradientColors: "rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.2)",
    borderColor: "rgba(148, 163, 184, 0.5)",
    shadowColor: "rgba(100, 116, 139, 0.3)"
  }
};

const EMOJI_RADIUS = 24; 
const DEFAULT_CONTAINER_SIZE = 300;

const getEmotionDetails = (valence: number, arousal: number) => {
  const r = Math.sqrt(valence * valence + arousal * arousal);
  
  if (r < 0.15) return { emoji: "😐", label: "Neutral", quadrant: "neutral" };

  // QUADRANT 1: Pleasant Energetic
  if (valence >= 0 && arousal >= 0) {
    const quadrant = "pleasant-energetic";
    if (r > 0.8) return { emoji: "😍", label: "Lovestruck", quadrant };
    if (r > 0.5) return { emoji: "😊", label: "Happy", quadrant };
    return { emoji: "😌", label: "Content", quadrant };
  }
  
  // QUADRANT 2: Unpleasant Energetic
  if (valence < 0 && arousal >= 0) {
    const quadrant = "unpleasant-energetic";
    if (r > 0.8) return { emoji: "🤬", label: "Enraged", quadrant };
    if (r > 0.5) return { emoji: "😠", label: "Aggressive", quadrant };
    return { emoji: "😟", label: "Worried", quadrant };
  }

  // QUADRANT 3: Unpleasant Calm
  if (valence < 0 && arousal < 0) {
    const quadrant = "unpleasant-calm";
    if (r > 0.8) return { emoji: "😭", label: "Despairing", quadrant };
    if (r > 0.5) return { emoji: "😔", label: "Sad", quadrant };
    return { emoji: "😐", label: "Apathetic", quadrant };
  }

  // QUADRANT 4: Pleasant Calm
  if (valence >= 0 && arousal < 0) {
    const quadrant = "pleasant-calm";
    if (r > 0.8) return { emoji: "✨", label: "Magical", quadrant };
    if (r > 0.5) return { emoji: "😴", label: "Serene", quadrant };
    return { emoji: "🍵", label: "Relaxed", quadrant };
  }

  return { emoji: "😐", label: "Neutral", quadrant: "neutral" };
};

// --- Sub-component: Draggable Emoji ---
const DraggableEmoji = React.memo(
  ({ position, containerSize, isDragging, emotionData, onStart, bpm }: any) => {
    const { colors } = useMemo(() => ({
        colors: EMOTION_COLORS[emotionData.quadrant] || EMOTION_COLORS.neutral
    }), [emotionData.quadrant]);

    const leftPos = isNaN(position.x) ? '50%' : `${(position.x / containerSize) * 100}%`;
    const topPos = isNaN(position.y) ? '50%' : `${(position.y / containerSize) * 100}%`;

    return (
      <>
        {/* Pulse Effect */}
        <div 
            className="absolute rounded-full border-2 opacity-50 pointer-events-none"
            style={{
                left: leftPos, top: topPos,
                width: isDragging ? '80px' : '60px', height: isDragging ? '80px' : '60px',
                transform: 'translate(-50%, -50%)',
                borderColor: colors.accent,
                transition: 'all 0.3s ease-out',
                animation: isDragging ? `pulse ${60/bpm}s infinite` : 'none',
                zIndex: 40
            }}
        />

        {/* BPM Floating Label (Visible on Drag) */}
        <div 
            className={`absolute flex flex-col items-center justify-center transition-all duration-300 pointer-events-none z-50 ${isDragging ? 'opacity-100 -translate-y-12' : 'opacity-0 translate-y-0'}`}
            style={{ left: leftPos, top: topPos, transform: 'translate(-50%, -60px)' }}
        >
            <div className="bg-black/80 backdrop-blur text-white px-2 py-1 rounded-md text-[10px] font-bold font-mono border border-white/10 flex items-center gap-1">
                <Gauge size={10} className="text-[var(--accent)]" />
                {bpm} BPM
            </div>
        </div>

        <div
            onMouseDown={onStart}
            onTouchStart={onStart}
            className={`absolute w-12 h-12 flex items-center justify-center text-2xl rounded-full backdrop-blur-md border-2 transition-all duration-75 z-50 ${
            isDragging ? 'shadow-2xl scale-110 cursor-grabbing' : 'shadow-lg cursor-grab hover:scale-105'
            }`}
            style={{
            left: leftPos,
            top: topPos,
            transform: `translate(-50%, -50%)`,
            background: `linear-gradient(135deg, ${colors.gradientColors}, rgba(255,255,255,0.1))`,
            borderColor: colors.borderColor,
            boxShadow: `0 0 20px ${colors.shadowColor}`,
            touchAction: 'none'
            }}
        >
            {emotionData.emoji}
        </div>
        <style>{`
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
        `}</style>
      </>
    );
  }
);

// --- Sub-component: EmojiGridMapper ---
const EmojiGridMapper: React.FC<any> = ({ onChartPositionChange, currentScale, onManualModeSelect, onTempoChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(DEFAULT_CONTAINER_SIZE);
  const [position, setPosition] = useState({ x: DEFAULT_CONTAINER_SIZE/2, y: DEFAULT_CONTAINER_SIZE/2 });
  const [isDragging, setIsDragging] = useState(false);
  const lastScaleRef = useRef<ScaleType | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize(Math.min(rect.width, rect.height));
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const calculateEmotionData = useCallback((x: number, y: number, size: number) => {
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - EMOJI_RADIUS;
      const valence = (x - centerX) / radius; 
      const arousal = (centerY - y) / radius; // Up is positive arousal (Energy)
      const basicDetails = getEmotionDetails(valence, arousal);
      
      // Calculate BPM based on Arousal (Energy)
      const bpm = getTempoFromArousal(arousal);
      const description = getPsychologyDescription(valence, arousal);

      return { 
          ...basicDetails, 
          valence, 
          arousal, 
          bpm,
          description
      };
  }, []);

  useEffect(() => {
      if (currentScale && currentScale !== lastScaleRef.current && !isDragging) {
          const coords = MODE_COORDINATES[currentScale];
          if (coords && containerSize > 0) {
              const centerX = containerSize / 2;
              const centerY = containerSize / 2;
              const radius = containerSize / 2 - EMOJI_RADIUS;
              setPosition({ x: centerX + (coords.x * radius), y: centerY - (coords.y * radius) });
              lastScaleRef.current = currentScale;
          }
      }
  }, [currentScale, containerSize, isDragging]);

  const handleDrag = useCallback((e: any) => {
     if (!containerRef.current) return;
     const clientPos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
     const rect = containerRef.current.getBoundingClientRect();
     let x = clientPos.x - rect.left;
     let y = clientPos.y - rect.top;

     const centerX = containerSize / 2;
     const centerY = containerSize / 2;
     const maxRadius = containerSize / 2 - EMOJI_RADIUS;
     const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
     
     if (dist > maxRadius) {
         x = centerX + ((x - centerX)/dist)*maxRadius;
         y = centerY + ((y - centerY)/dist)*maxRadius;
     }

     setPosition({ x, y });
     
     const data = calculateEmotionData(x, y, containerSize);
     onChartPositionChange(data);
     if (onTempoChange) onTempoChange(data.bpm);

  }, [containerSize, calculateEmotionData, onChartPositionChange, onTempoChange]);

  const onStart = (e: any) => {
      e.stopPropagation();
      setIsDragging(true);
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('touchmove', handleDrag, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
  };

  const onEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
  };

  const currentEmotionData = useMemo(() => calculateEmotionData(position.x, position.y, containerSize), [position, containerSize, calculateEmotionData]);
  
  const activeColor = EMOTION_COLORS[currentEmotionData.quadrant]?.accent || '#94a3b8';

  return (
    <div className="w-full flex flex-col items-center justify-center h-full">
      {/* Increased padding to prevent emoji clipping */}
      <div className="relative w-full aspect-square max-w-[360px] p-10">
        <div ref={containerRef} className="relative w-full h-full">
            {/* Background Layer (Clipped) */}
            <div className="absolute inset-0 rounded-full border border-slate-700/50 bg-slate-900/30 backdrop-blur-md shadow-inner overflow-hidden group z-0">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.2) 100%)'}}></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>
                
                {/* Axis Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-white/30 font-bold">High Energy</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-white/30 font-bold">Low Energy</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] uppercase tracking-widest text-white/30 font-bold">Negative</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[9px] uppercase tracking-widest text-white/30 font-bold">Positive</div>
            </div>

            {/* Draggable Emoji Layer (Unclipped) */}
            <DraggableEmoji
                position={position}
                containerSize={containerSize}
                isDragging={isDragging}
                emotionData={currentEmotionData}
                onStart={onStart}
                bpm={currentEmotionData.bpm}
            />
        </div>
      </div>
      
      {/* New Readout Design */}
      <div className="mt-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="flex items-center gap-4 mb-3 bg-white/5 p-2 pr-4 rounded-xl border border-white/5">
            <span className="text-4xl filter drop-shadow-lg transform hover:scale-110 transition-transform cursor-default">
                {currentEmotionData.emoji}
            </span> 
            
            {/* Gradient Bar */}
            <div 
                className="w-32 h-8 rounded-lg shadow-inner" 
                style={{
                    background: `linear-gradient(to right, #ffffff, ${activeColor})`
                }}
            ></div>
          </div>
          
          <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-[0.2em] drop-shadow-sm">
              {currentEmotionData.description}
          </p>
      </div>
    </div>
  );
};


interface MoodSelectorProps {
  currentScale: ScaleType;
  currentKey: Note;
  onMoodSelect: (data: any) => void;
  onManualScaleSelect: (scale: ScaleType) => void;
  onTempoChange?: (bpm: number) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentScale, currentKey, onMoodSelect, onManualScaleSelect, onTempoChange }) => {
  const lastScaleRef = useRef<ScaleType | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Handle sonic preview when scale changes
  const handleChartChange = (data: any) => {
      onMoodSelect(data);
  };

  // Effect to play sound when scale changes from external or internal source
  useEffect(() => {
      if (currentScale !== lastScaleRef.current) {
          if (debounceRef.current) window.clearTimeout(debounceRef.current);
          
          debounceRef.current = window.setTimeout(() => {
             // Play preview of scale
             const notes = getScaleNotes(currentKey, currentScale); 
             audioEngine.playDiscovery(notes);
          }, 200); 

          lastScaleRef.current = currentScale;
      }
  }, [currentScale, currentKey]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0c0c0e] relative overflow-hidden">
        {/* Background ambient decoration */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20"></div>
        </div>

        <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center p-6">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">The Inspiration Engine</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Explore the relationship between <span className="text-[var(--accent)]">Mood</span> (Mode) and <span className="text-[var(--accent)]">Energy</span> (Tempo). 
                    Drag the emoji to find your sonic sweet spot.
                </p>
            </div>

            {/* The Vibe Mapper */}
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center">
                <EmojiGridMapper 
                    currentScale={currentScale}
                    onChartPositionChange={handleChartChange}
                    onManualModeSelect={onManualScaleSelect}
                    onTempoChange={onTempoChange}
                />
            </div>
        </div>
    </div>
  );
};

export default MoodSelector;
