
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Thermometer, MousePointer2, Play, Activity, Music2, Zap, Wind } from 'lucide-react';
import { ScaleType, SCALE_DEFS, EMOTIONAL_ZONES, getTempoFromArousal, getCompassLabel, Chord } from './lib';
import { cn } from './ui';

// --- HELPERS ---

const getMusicalAttributes = (v: number, a: number, t: number) => {
    // Dynamics (Arousal)
    let dynamics = 'mf';
    if (a > 0.7) dynamics = 'ff (Fortissimo)';
    else if (a > 0.3) dynamics = 'f (Forte)';
    else if (a > -0.3) dynamics = 'mf (Mezzo-forte)';
    else if (a > -0.7) dynamics = 'mp (Mezzo-piano)';
    else dynamics = 'p (Piano)';

    // Articulation (Arousal + Tension)
    let articulation = 'Natural';
    if (a > 0.4 || t > 0.6) articulation = 'Staccato / Marcato';
    else if (a < -0.2) articulation = 'Legato';

    // Harmonic Color (Valence)
    let color = 'Neutral';
    if (v > 0.5) color = 'Bright / Luminous';
    else if (v > 0.1) color = 'Warm';
    else if (v < -0.5) color = 'Dark / Somber';
    else if (v < -0.1) color = 'Melancholic';

    // Stability (Tension)
    let stability = 'Stable';
    if (t > 0.7) stability = 'Highly Dissonant';
    else if (t > 0.3) stability = 'Unresolved';
    else if (t > 0.1) stability = 'Tending Out';

    return { dynamics, articulation, color, stability };
};

// --- MOOD SELECTOR ---

interface MoodSelectorProps {
    theme: string;
    currentScale: ScaleType;
    onManualScaleSelect: (s: ScaleType) => void;
    onTempoChange: (bpm: number) => void;
    mood: { valence: number; arousal: number; tension: number };
    onMoodChange: (v: number, a: number, t: number) => void;
    bpm: number;
    isScaleLocked: boolean;
    progression: Chord[];
    activeIndex: number | null;
    showPath: boolean;
    onJumpToChord?: (index: number) => void;
}

export const MoodSelector = ({ theme, currentScale, onManualScaleSelect, onTempoChange, mood, onMoodChange, bpm, isScaleLocked, progression=[], activeIndex, onJumpToChord, showPath }: MoodSelectorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showZones, setShowZones] = useState(false);
    const [beamX, setBeamX] = useState<number>(0);
    const [showHint, setShowHint] = useState(true);
    const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
    const [initialPinchTension, setInitialPinchTension] = useState<number>(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [cursorPos, setCursorPos] = useState<{x:number, y:number} | null>(null);
    const scrollTimeout = useRef<any>(null);

    // Derived musical data
    const attrs = useMemo(() => getMusicalAttributes(mood.valence, mood.arousal, mood.tension), [mood]);
    const zoneLabel = getCompassLabel(mood.valence, mood.arousal);
    const calculatedBpm = getTempoFromArousal(mood.arousal);

    // Calculate trajectory points with smoothing
    const trajectory = useMemo(() => {
        const points = progression.map((c: Chord, i: number) => {
            // Estimate sentiment positions based on chord qualities relative to generic center
            let v = 0;
            let a = 0;
            
            // Basic mapping
            if (c.quality === 'Major') { v = 0.5; a = 0.1; }
            else if (c.quality === 'Minor') { v = -0.4; a = -0.1; }
            else if (c.quality === 'Diminished') { v = -0.6; a = 0.3; }
            else if (c.quality === 'Dominant') { v = 0.2; a = 0.4; }
            
            // Adjust based on diatonic function (approximate)
            const offset = (i / progression.length) * 0.1; // Slight drift over time
            
            if (c.romanNumeral.includes('VII') || c.romanNumeral.includes('vii')) { a += 0.3; v -= 0.2; }
            if (c.romanNumeral.includes('V') || c.romanNumeral.includes('v')) { a += 0.2; }
            if (c.romanNumeral === 'I' || c.romanNumeral === 'i') { a -= 0.2; v += 0.1; }

            // Normalize to 0-100 range for SVG
            const x = (Math.max(-1, Math.min(1, v)) + 1) / 2 * 100;
            const y = (-Math.max(-1, Math.min(1, a)) + 1) / 2 * 100;
            
            return { x, y, index: i, chord: c };
        });

        // Generate Bezier Path
        if (points.length < 2) return { path: '', points };

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            // Simple control points for smooth curve
            const cp1x = p0.x + (p1.x - p0.x) * 0.5;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) * 0.5;
            const cp2y = p1.y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }

        return { path: d, points };
    }, [progression]);

    const moodRef = useRef(mood);
    moodRef.current = mood;

    const requestRef = useRef<number | undefined>(undefined);
    const lastBpm = useRef<number>(bpm);

    const accentColor = SCALE_DEFS[currentScale].palette.accent;

    const updateMoodPad = (clientX: number, clientY: number) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        setBeamX(clientX);
        setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const v = (x * 2) - 1;
        const a = -((y * 2) - 1);
        
        onMoodChange(v, a, moodRef.current.tension);
        
        if (!isScaleLocked) {
            let minDist = Infinity;
            let closest: ScaleType = currentScale;
            Object.entries(SCALE_DEFS).forEach(([st, def]) => {
                const d = Math.sqrt(Math.pow(v - def.scaleCoordinates.v, 2) + Math.pow(a - def.scaleCoordinates.a, 2));
                if (d < minDist) { minDist = d; closest = st as ScaleType; }
            });
            if (closest !== currentScale) {
                onManualScaleSelect(closest);
            }
        }
        
        const newBpm = getTempoFromArousal(a);
        if (newBpm !== lastBpm.current) {
            onTempoChange(newBpm);
            lastBpm.current = newBpm;
        }
    };

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHint(false);
            
            setIsScrolling(true);
            if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
            
            const direction = Math.sign(e.deltaY);
            const delta = direction * -0.05; 
            
            const newTension = Math.max(0, Math.min(1, moodRef.current.tension + delta));
            if (newTension !== moodRef.current.tension) {
                onMoodChange(moodRef.current.valence, moodRef.current.arousal, newTension);
            }
        };
        
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [onMoodChange]);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.chord-node')) return;
        
        setIsDragging(true);
        setShowHint(false);
        const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        updateMoodPad(clientX, clientY);
        (e.target as HTMLElement).setPointerCapture('pointerId' in e ? (e as any).pointerId : 0);
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && (e as React.TouchEvent).touches.length === 2) {
             setIsScrolling(true);
             if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
             scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);

             const touch1 = (e as React.TouchEvent).touches[0];
             const touch2 = (e as React.TouchEvent).touches[1];
             const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
             
             if (initialPinchDist === null) {
                 setInitialPinchDist(dist);
                 setInitialPinchTension(moodRef.current.tension);
             } else {
                 const scaleFactor = dist / initialPinchDist;
                 const delta = (scaleFactor - 1) * 1.5; 
                 const newTension = Math.max(0, Math.min(1, initialPinchTension + delta));
                 onMoodChange(moodRef.current.valence, moodRef.current.arousal, newTension);
             }
             return;
        } else {
             if (initialPinchDist !== null) setInitialPinchDist(null);
        }

        if (!isDragging) return;
        
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
        
        const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

        requestRef.current = requestAnimationFrame(() => {
            if (isDragging) {
                updateMoodPad(clientX, clientY);
            }
        });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setInitialPinchDist(null);
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const step = 0.1;
        let newV = mood.valence;
        let newA = mood.arousal;
        let handled = true;

        switch(e.key) {
            case 'ArrowUp': newA = Math.min(1, newA + step); break;
            case 'ArrowDown': newA = Math.max(-1, newA - step); break;
            case 'ArrowRight': newV = Math.min(1, newV + step); break;
            case 'ArrowLeft': newV = Math.max(-1, newV - step); break;
            default: handled = false;
        }

        if (handled) {
            e.preventDefault();
            setShowHint(false);
            onMoodChange(newV, newA, mood.tension);
        }
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-row select-none">
            
            <div className="flex-1 relative overflow-hidden perspective-[1000px] flex flex-col min-w-0">
                {isDragging && (
                    <div 
                        className="fixed top-0 bottom-0 w-[1px] bg-white z-[9999] pointer-events-none"
                        style={{ 
                            left: beamX,
                            background: 'linear-gradient(to top, var(--accent) 0%, transparent 100%)',
                            boxShadow: '0 0 15px var(--accent)',
                            opacity: 0.8
                        }}
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                    </div>
                )}
                
                {/* TENSION OVERLAY (Scroll Feedback) */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-50 flex flex-col items-center", isScrolling ? "opacity-100" : "opacity-0")}>
                   <div className="bg-black/80 backdrop-blur-xl border border-[var(--accent)] px-6 py-4 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="flex items-center gap-2 mb-2">
                           <Thermometer size={12} className="text-[var(--accent)]" />
                           <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Harmonic Tension</span>
                       </div>
                       <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                           {(mood.tension * 100).toFixed(0)}<span className="text-sm text-[var(--accent)]">%</span>
                       </div>
                       <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-[var(--accent)] transition-all duration-75" style={{width: `${mood.tension*100}%`}} />
                       </div>
                   </div>
               </div>

                <div 
                    ref={ref}
                    className="absolute inset-0 cursor-crosshair touch-none outline-none z-0"
                    tabIndex={0}
                    role="slider"
                    aria-label="Mood Selector"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onKeyDown={handleKeyDown}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* BACKGROUND GRADIENTS */}
                    <div className="absolute inset-0 w-full h-full transition-colors duration-1000" style={{
                        transform: `translateZ(-${mood.tension * 500}px) scale(${1 + mood.tension})`,
                        background: `
                            radial-gradient(circle at 100% 0%, rgba(250, 204, 21, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 0% 0%, rgba(220, 38, 38, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.4) 0%, transparent 70%),
                            linear-gradient(to bottom, #000000 0%, transparent 10%, transparent 90%, #000000 100%)
                        `,
                        opacity: 1 - (mood.tension * 0.5)
                    }}/>
                    
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
                         style={{
                             backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', 
                             backgroundSize: '50px 50px',
                             opacity: Math.max(0, (1 - mood.tension * 1.5)) * 0.15,
                             transform: `scale(${1 + mood.tension * 0.8})`
                         }} 
                    />

                    {/* AXIS LABELS */}
                    <div className="absolute inset-0 pointer-events-none">
                         {/* Vertical Axis (Arousal) */}
                         <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
                         <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-white/40 uppercase">High Energy</span>
                         <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-white/40 uppercase">Low Energy</span>

                         {/* Horizontal Axis (Valence) */}
                         <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black tracking-widest text-white/40 uppercase">Negative</span>
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-black tracking-widest text-white/40 uppercase">Positive</span>
                    </div>

                    {/* HARMONIC PATH (TRAJECTORY) */}
                    <div className={cn("absolute inset-0 pointer-events-none z-30 transition-opacity duration-500", showPath ? "opacity-100" : "opacity-0")} style={{ transform: 'translateZ(50px)' }}>
                         <svg className="absolute inset-0 w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                    <stop offset="20%" stopColor="rgba(255,255,255,0.3)" />
                                    <stop offset="80%" stopColor="rgba(255,255,255,0.3)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                             <path 
                                d={trajectory.path} 
                                fill="none" 
                                stroke="url(#pathGradient)" 
                                strokeWidth="2" 
                                strokeLinecap="round"
                                style={{ filter: 'url(#glow)' }}
                             />
                         </svg>
                         {trajectory.points.map((p: any, i: number) => (
                             <div 
                                key={i}
                                className={cn(
                                    "absolute w-6 h-6 -ml-3 -mt-3 rounded-full border border-white/20 bg-black/80 flex items-center justify-center chord-node transition-all duration-300 cursor-pointer pointer-events-auto hover:scale-125 hover:border-var(--accent) hover:text-[var(--accent)] group",
                                    i === activeIndex ? "bg-[var(--accent)] border-[var(--accent)] text-black font-bold scale-125 shadow-[0_0_15px_var(--accent)] z-50" : "z-40"
                                )}
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                onClick={(e) => { e.stopPropagation(); onJumpToChord?.(i); }}
                             >
                                 {i === activeIndex ? (
                                    <Play size={10} fill="black" />
                                 ) : (
                                    <span className="text-[9px] font-mono group-hover:hidden">{i + 1}</span>
                                 )}
                             </div>
                         ))}
                    </div>

                    {/* INTERACTIVE CURSOR & SONAR */}
                    <div 
                        className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 transition-transform duration-75 interact-base pointer-events-none flex items-center justify-center z-50"
                        style={{ 
                            left: `${(mood.valence + 1) * 50}%`, 
                            top: `${(1 - mood.arousal) * 50}%`,
                            borderColor: accentColor,
                            color: accentColor,
                            backgroundColor: `${accentColor}20`,
                            boxShadow: `0 0 ${20 + mood.tension * 40}px currentColor`, 
                            transform: `scale(${1 + mood.tension * 0.5})` 
                        }}
                    >
                        {/* Sonar Pings */}
                        <div className="absolute inset-0 rounded-full border border-current opacity-50 animate-ping" style={{ animationDuration: '2s' }}/>
                        <div className="absolute inset-0 rounded-full border border-current opacity-30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}/>
                        <div className="w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_10px_currentColor]"/>
                        
                        {/* Cursor Tooltip */}
                        {isDragging && (
                             <div className="absolute top-0 left-full ml-4 bg-black/80 backdrop-blur border border-white/20 rounded px-3 py-2 whitespace-nowrap flex flex-col items-start gap-1 pointer-events-none animate-in fade-in slide-in-from-left-2 z-[60] shadow-xl">
                                <div className="flex items-center justify-between w-full gap-4 border-b border-white/10 pb-1 mb-0.5">
                                     <span className="text-[10px] font-black text-white uppercase tracking-wider">{zoneLabel}</span>
                                     <span className="text-[9px] font-mono text-[var(--accent)]">{calculatedBpm} BPM</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5"><Activity size={8}/> {attrs.dynamics}</span>
                                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5"><Wind size={8}/> {attrs.articulation}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SCALE MARKERS */}
                    {Object.entries(SCALE_DEFS).map(([st, def]) => {
                        const x = (def.scaleCoordinates.v + 1) / 2 * 100;
                        const y = (-def.scaleCoordinates.a + 1) / 2 * 100;
                        const isActive = st === currentScale;
                        return (
                            <div key={st} className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full transition-all duration-500 shadow-lg pointer-events-none flex items-center justify-center group"
                                style={{ 
                                    left: `${x}%`, top: `${y}%`, 
                                    backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.2)', 
                                    transform: isActive ? 'scale(1.5)' : 'scale(1)',
                                    boxShadow: isActive ? '0 0 20px rgba(255,255,255,0.6)' : 'none',
                                    opacity: isScaleLocked && !isActive ? 0.3 : 1
                                }}
                            >
                                <span className={cn("absolute -top-6 whitespace-nowrap text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 transition-opacity", isActive ? "text-white opacity-100" : "text-white/50 opacity-0")}>{st}</span>
                            </div>
                        );
                    })}
                </div>

                <div className={cn(
                    "absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 transition-opacity duration-700 delay-500",
                    showHint ? "opacity-100" : "opacity-0"
                )}>
                     <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                         <MousePointer2 size={14} className="text-[var(--accent)] animate-bounce" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Scroll or Pinch to adjust Tension</span>
                         </div>
                     </div>
                </div>
                
                <div className="absolute bottom-6 right-6 pointer-events-auto transition-all duration-300 z-20">
                     <button onClick={() => setShowZones(!showZones)} className="text-[10px] text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md bg-black/20 hover:bg-black/40 transition-colors">
                        {showZones ? 'Hide Zones' : 'Show Zones'}
                     </button>
                </div>

                {/* EMOTIONAL ZONES OVERLAY */}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ opacity: showZones || isDragging ? 0.8 : 0 }}>
                     {EMOTIONAL_ZONES.map((gem, i) => {
                         const x = (gem.v + 1) / 2 * 100;
                         const y = (-gem.a + 1) / 2 * 100;
                         const isHover = cursorPos && Math.hypot(cursorPos.x / containerRef.current!.offsetWidth * 100 - x, cursorPos.y / containerRef.current!.offsetHeight * 100 - y) < 15;
                         
                         return (
                            <div key={i} className={cn("absolute flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300", isHover ? "scale-110 opacity-100" : "opacity-30")}
                                 style={{ left: `${x}%`, top: `${y}%` }}>
                                <span className="text-[10px] font-black tracking-widest text-white uppercase whitespace-nowrap">{gem.label}</span>
                                {isHover && <span className="text-[8px] font-mono text-[var(--accent)] bg-black/80 px-1 rounded">{gem.desc}</span>}
                            </div>
                        )
                     })}
                </div>
            </div>
        </div>
    );
};
