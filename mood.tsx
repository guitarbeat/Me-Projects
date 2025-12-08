
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Thermometer, MousePointer2, Play, Activity, Wind, Crosshair, Settings, Sliders, Music2 } from 'lucide-react';
import { ScaleType, SCALE_DEFS, EMOTIONAL_ZONES, getTempoFromArousal, getCompassLabel, Chord, ScaleDef, InstrumentType } from './lib';
import { cn } from './ui';

// --- HELPERS ---

const getMusicalAttributes = (v: number, a: number, t: number, inst: InstrumentType) => {
    // 1. Dynamics (Arousal)
    let dynamics = 'mf';
    if (a > 0.8) dynamics = 'fff (Massive)';
    else if (a > 0.6) dynamics = 'ff (Fortissimo)';
    else if (a > 0.2) dynamics = 'f (Forte)';
    else if (a > -0.2) dynamics = 'mf (Balanced)';
    else if (a > -0.6) dynamics = 'mp (Gentle)';
    else dynamics = 'pp (Whisper)';

    // 2. Articulation (Arousal + Tension) - Instrument Specific
    let articulation = 'Natural';
    if (inst === 'pad') {
        if (t > 0.7) articulation = 'Gated / Stutter';
        else if (a > 0.5) articulation = 'Swell / Bloom';
        else if (a < -0.4) articulation = 'Static / Drone';
        else articulation = 'Evolving';
    } else if (inst === 'pluck' || inst === 'rhodes') {
        if (t > 0.7) articulation = 'Tremolo / Trill';
        else if (a > 0.6) articulation = 'Percussive / Snap';
        else if (a < -0.4) articulation = 'Dampened / Muted';
        else articulation = 'Sustain';
    } else {
        // Synth / Default
        if (t > 0.7) articulation = 'Distorted / Glitch';
        else if (a > 0.6) articulation = 'Staccato / Stab';
        else if (a < -0.4) articulation = 'Legato / Glide';
        else articulation = 'Detached';
    }

    // 3. Texture/Stability (Tension + Valence)
    let stability = 'Stable';
    if (t > 0.85) stability = 'Breaking Point';
    else if (t > 0.6) stability = 'Dissonant / Complex';
    else if (t > 0.35) stability = 'Unresolved';
    else if (t > 0.15) stability = 'Floating';
    else stability = 'Grounded';

    return { dynamics, articulation, stability };
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
    hoveredChord?: any; 
    onPreviewMood?: (mood: { v: number, a: number } | null) => void;
    instrument: InstrumentType; 
}

export const MoodSelector = ({ theme, currentScale, onManualScaleSelect, onTempoChange, mood, onMoodChange, bpm, isScaleLocked, progression=[], activeIndex, onJumpToChord, showPath, hoveredChord, onPreviewMood, instrument }: MoodSelectorProps) => {
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
    
    // Sensitivity Configuration
    const [sensitivity, setSensitivity] = useState(1.5);
    const [showSettings, setShowSettings] = useState(false);
    
    // Internal State Tracking for Sync
    const internalScaleChange = useRef(false);
    const scrollTimeout = useRef<any>(null);
    const moodRef = useRef(mood);
    moodRef.current = mood;
    const requestRef = useRef<number | undefined>(undefined);
    const lastBpm = useRef<number>(bpm);

    // Derived Data
    const attrs = useMemo(() => getMusicalAttributes(mood.valence, mood.arousal, mood.tension, instrument), [mood, instrument]);
    const zoneLabel = getCompassLabel(mood.valence, mood.arousal);
    const calculatedBpm = getTempoFromArousal(mood.arousal);
    const accentColor = SCALE_DEFS[currentScale].palette.accent;

    // --- SYNC EFFECTS ---

    // Sync Mood when Scale Changes (External Control Panel Change)
    useEffect(() => {
        // If the change came from dragging the pad, ignore this effect
        if (internalScaleChange.current) {
            internalScaleChange.current = false;
            return;
        }

        // If Scale changes externally (via dropdown), snap Mood to that Scale's definition
        const def = SCALE_DEFS[currentScale];
        if (def) {
            // We set the mood to the scale's "center of gravity"
            onMoodChange(def.scaleCoordinates.v, def.scaleCoordinates.a, def.scaleCoordinates.t);
            
            // Also update BPM if needed
            const targetBpm = getTempoFromArousal(def.scaleCoordinates.a);
            if (Math.abs(targetBpm - bpm) > 5) {
                onTempoChange(targetBpm);
            }
        }
    }, [currentScale]);

    // --- TRAJECTORY CALCULATION ---
    const trajectory = useMemo(() => {
        const points = progression.map((c: Chord, i: number) => {
            let v = 0, a = 0;
            if (c.quality === 'Major') { v = 0.5; a = 0.1; }
            else if (c.quality === 'Minor') { v = -0.4; a = -0.1; }
            else if (c.quality === 'Diminished') { v = -0.6; a = 0.3; }
            else if (c.quality === 'Dominant') { v = 0.2; a = 0.4; }
            
            if (c.romanNumeral.includes('VII') || c.romanNumeral.includes('vii')) { a += 0.3; v -= 0.2; }
            if (c.romanNumeral.includes('V') || c.romanNumeral.includes('v')) { a += 0.2; }
            if (c.romanNumeral === 'I' || c.romanNumeral === 'i') { a -= 0.2; v += 0.1; }

            const x = (Math.max(-1, Math.min(1, v)) + 1) / 2 * 100;
            const y = (-Math.max(-1, Math.min(1, a)) + 1) / 2 * 100;
            return { x, y, index: i, chord: c };
        });

        if (points.length < 2) return { path: '', points };

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i], p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) * 0.5, cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) * 0.5, cp2y = p1.y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return { path: d, points };
    }, [progression]);

    // --- INTERACTION LOGIC ---

    const updateScaleSelection = (v: number, a: number, t: number) => {
        if (isScaleLocked) return;

        let minDist = Infinity;
        let closest: ScaleType = currentScale;

        Object.entries(SCALE_DEFS).forEach(([st, def]) => {
            const sDef = def as ScaleDef;
            const d = Math.sqrt(
                Math.pow(v - sDef.scaleCoordinates.v, 2) + 
                Math.pow(a - sDef.scaleCoordinates.a, 2) + 
                Math.pow(t - sDef.scaleCoordinates.t, 2)
            );
            
            // Hysteresis: "Gravity" well for the current scale to prevent jitter
            const weightedDist = st === currentScale ? d * 0.75 : d;

            if (weightedDist < minDist) { minDist = weightedDist; closest = st as ScaleType; }
        });

        if (closest !== currentScale) {
            internalScaleChange.current = true; // Mark as internal change
            onManualScaleSelect(closest);
        }
    };

    const updateMoodPad = (clientX: number, clientY: number, commit: boolean = true) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        setBeamX(clientX);
        setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        
        const rawV = (x * 2) - 1;
        const rawA = -((y * 2) - 1);
        
        // Apply sensitivity curve
        const v = Math.sign(rawV) * Math.pow(Math.abs(rawV), sensitivity);
        const a = Math.sign(rawA) * Math.pow(Math.abs(rawA), sensitivity);
        
        if (commit) {
            const t = moodRef.current.tension;
            onMoodChange(v, a, t);
            updateScaleSelection(v, a, t);
            
            const newBpm = getTempoFromArousal(a);
            if (Math.abs(newBpm - lastBpm.current) > 2) {
                onTempoChange(newBpm);
                lastBpm.current = newBpm;
            }
        }

        if (onPreviewMood) onPreviewMood({ v, a });
    };

    // Sync hovered chord sentiment to preview
    useEffect(() => {
        if (!onPreviewMood) return;
        if (hoveredChord && hoveredChord.sentiment) {
            onPreviewMood({ v: hoveredChord.sentiment.valence, a: hoveredChord.sentiment.arousal });
        } else if (!isDragging) {
             onPreviewMood(null);
        }
    }, [hoveredChord, isDragging, onPreviewMood]);

    // Tension Scroll Handler
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); e.stopPropagation(); setShowHint(false);
            
            setIsScrolling(true);
            if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
            
            const delta = Math.sign(e.deltaY) * -0.05; 
            const newTension = Math.max(0, Math.min(1, moodRef.current.tension + delta));
            
            if (newTension !== moodRef.current.tension) {
                onMoodChange(moodRef.current.valence, moodRef.current.arousal, newTension);
                updateScaleSelection(moodRef.current.valence, moodRef.current.arousal, newTension);
            }
        };
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if (el) el.removeEventListener('wheel', handleWheel); };
    }, [onMoodChange, currentScale, isScaleLocked]);

    // Pointer Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('.chord-node')) return;
        e.preventDefault(); setIsDragging(true); setShowHint(false);
        updateMoodPad(e.clientX, e.clientY, true);
        try { (e.target as Element).setPointerCapture(e.pointerId); } catch (e) {}
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) {
            if (e.pointerType === 'mouse' && !hoveredChord) updateMoodPad(e.clientX, e.clientY, false);
            return;
        }
        if (e.isPrimary) {
            if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(() => updateMoodPad(e.clientX, e.clientY, true));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false); setInitialPinchDist(null);
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
        if (onPreviewMood) onPreviewMood(null);
        try { (e.target as Element).releasePointerCapture(e.pointerId); } catch (e) {}
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-row select-none">
            
            {/* --- VISUALIZERS --- */}
            <div className="flex-1 relative overflow-hidden perspective-[1000px] flex flex-col min-w-0">
                {isDragging && (
                    <div className="fixed top-0 bottom-0 w-[1px] bg-white z-[9999] pointer-events-none" style={{ left: beamX, background: 'linear-gradient(to top, var(--accent) 0%, transparent 100%)', boxShadow: '0 0 15px var(--accent)', opacity: 0.8 }}>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                    </div>
                )}
                
                {/* TENSION HUD */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-50 flex flex-col items-center", isScrolling ? "opacity-100" : "opacity-0")}>
                   <div className="bg-black/80 backdrop-blur-xl border border-[var(--accent)] px-6 py-4 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="flex items-center gap-2 mb-2">
                           <Thermometer size={12} className="text-[var(--accent)]" />
                           <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Harmonic Tension</span>
                       </div>
                       <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{(mood.tension * 100).toFixed(0)}<span className="text-sm text-[var(--accent)]">%</span></div>
                       <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[var(--accent)] transition-all duration-75" style={{width: `${mood.tension*100}%`}} /></div>
                   </div>
               </div>

                {/* INTERACTIVE PAD */}
                <div 
                    ref={ref}
                    className="absolute inset-0 cursor-crosshair touch-none outline-none z-0"
                    tabIndex={0}
                    role="slider"
                    aria-label="Mood Selector"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Background Gradients */}
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

                    {/* Scale Markers */}
                    {Object.entries(SCALE_DEFS).map(([st, d]) => {
                        const def = d as ScaleDef;
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

                    {/* Cursor */}
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
                        <div className="absolute inset-0 rounded-full border border-current opacity-50 animate-ping" style={{ animationDuration: '2s' }}/>
                        <div className="w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_10px_currentColor]"/>
                        
                        {isDragging && (
                             <div className="absolute top-0 left-full ml-4 bg-black/80 backdrop-blur border border-white/20 rounded px-3 py-2 whitespace-nowrap flex flex-col items-start gap-1 pointer-events-none animate-in fade-in slide-in-from-left-2 z-[60] shadow-xl">
                                <div className="flex items-center justify-between w-full gap-4 border-b border-white/10 pb-1 mb-0.5">
                                     <span className="text-[10px] font-black text-white uppercase tracking-wider">{currentScale}</span>
                                     <span className="text-[9px] font-mono text-[var(--accent)]">{calculatedBpm} BPM</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5"><Activity size={8}/> {attrs.dynamics}</span>
                                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5"><Wind size={8}/> {attrs.articulation}</span>
                                    <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5"><Music2 size={8}/> {attrs.stability}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hints */}
                <div className={cn("absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 transition-opacity duration-700 delay-500", showHint ? "opacity-100" : "opacity-0")}>
                     <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                         <MousePointer2 size={14} className="text-[var(--accent)] animate-bounce" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Scroll/Pinch for Tension</span>
                     </div>
                </div>

                {/* Settings Toggle */}
                <div className="absolute top-6 right-6 pointer-events-auto z-20 flex flex-col items-end gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className={cn("w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200", showSettings ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-black/20 border-white/10 text-white/40 hover:text-white hover:bg-black/40")}>
                        <Settings size={14} />
                    </button>
                    {showSettings && (
                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl w-64 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                                <Sliders size={12} className="text-[var(--accent)]"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Input Mapping</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px]"><span className="text-white/60">Pad Sensitivity</span><span className="font-mono text-[var(--accent)]">{sensitivity.toFixed(1)}</span></div>
                                    <input type="range" min="0.5" max="3.0" step="0.1" value={sensitivity} onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Zones Toggle */}
                <div className="absolute bottom-6 right-6 pointer-events-auto transition-all duration-300 z-20">
                     <button onClick={() => setShowZones(!showZones)} className="text-[10px] text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md bg-black/20 hover:bg-black/40 transition-colors">
                        {showZones ? 'Hide Zones' : 'Show Zones'}
                     </button>
                </div>

                {/* Zones Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                     {EMOTIONAL_ZONES.map((gem, i) => {
                         const x = (gem.v + 1) / 2 * 100;
                         const y = (-gem.a + 1) / 2 * 100;
                         let isHover = false;
                         if (cursorPos && containerRef.current) {
                             const cx = cursorPos.x / containerRef.current.offsetWidth * 100;
                             const cy = cursorPos.y / containerRef.current.offsetHeight * 100;
                             isHover = Math.hypot(cx - x, cy - y) < 12;
                         }
                         const isVisible = showZones || isDragging || isHover;
                         return (
                            <div key={i} className={cn("absolute flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300", isHover ? "z-10 scale-110 opacity-100" : isVisible ? "opacity-40 scale-100" : "opacity-0 scale-90")} style={{ left: `${x}%`, top: `${y}%` }}>
                                <span className={cn("text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-colors", isHover ? "text-white" : "text-white/60")}>{gem.label}</span>
                                <div className={cn("transition-all duration-300 ease-out overflow-hidden flex flex-col items-center", isHover ? "h-auto opacity-100 mt-1" : "h-0 opacity-0")}>
                                     <span className="text-[8px] font-mono text-[var(--accent)] bg-black/90 backdrop-blur px-2 py-0.5 rounded border border-white/10 shadow-xl whitespace-nowrap">{gem.desc}</span>
                                </div>
                            </div>
                        )
                     })}
                </div>
            </div>
        </div>
    );
};
