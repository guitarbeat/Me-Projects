
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Thermometer, MousePointer2, Activity, Wind, Music2, Settings, Sliders } from 'lucide-react';
import { SCALE_DEFS, EMOTIONAL_ZONES, getTempoFromArousal, getCompassLabel, ScaleDef } from './lib';
import { cn } from './ui';
import { useStore } from './store';

// --- HELPERS ---

const getMusicalAttributes = (v: number, a: number, t: number, inst: string) => {
    // 1. Dynamics (Arousal)
    let dynamics = 'Mezzo-Forte';
    if (a > 0.8) dynamics = 'Fortissimo (High Impact)';
    else if (a > 0.5) dynamics = 'Forte (Energetic)';
    else if (a > 0.2) dynamics = 'Mezzo-Forte (Active)';
    else if (a > -0.2) dynamics = 'Mezzo-Piano (Neutral)';
    else if (a > -0.6) dynamics = 'Piano (Subtle)';
    else dynamics = 'Pianissimo (Delicate)';

    // 2. Articulation (Arousal + Tension) - Instrument Specific
    let articulation = 'Natural';
    if (inst === 'pad') {
        if (t > 0.8) articulation = 'Distorted / Granular';
        else if (t > 0.5) articulation = 'Shimmer / Movement';
        else if (a > 0.5) articulation = 'Bright / Swelling';
        else if (a < -0.5) articulation = 'Deep / Drone';
        else articulation = 'Evolving Atmospheric';
    } else if (inst === 'pluck' || inst === 'rhodes') {
        if (t > 0.7) articulation = 'Detuned / Lo-Fi';
        else if (a > 0.6) articulation = 'Sharp / Percussive';
        else if (a < -0.4) articulation = 'Soft / Muted';
        else articulation = 'Clear / Resonant';
    } else {
        // Synth
        if (t > 0.7) articulation = 'Bitcrushed / Glitch';
        else if (a > 0.6) articulation = 'Staccato / Punchy';
        else if (a < -0.4) articulation = 'Sine / Legato';
        else articulation = 'Clean Saw / Pluck';
    }

    // 3. Harmonic Stability (Tension)
    let stability = 'Consonant';
    if (t > 0.9) stability = 'Chaotic / Breaking';
    else if (t > 0.7) stability = 'Dissonant / Complex';
    else if (t > 0.4) stability = 'Suspended / Tense';
    else if (t > 0.2) stability = 'Colored / Jazzy';
    else stability = 'Grounded / Resolved';

    return { dynamics, articulation, stability };
};

// --- MOOD SELECTOR ---

export const MoodSelector = () => {
    // Connect to Store
    const { 
        mood, setMood, 
        scale: currentScale, 
        isScaleLocked, 
        bpm, 
        instrument,
        setTargetMood, 
        hoveredChord 
    } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showZones, setShowZones] = useState(false);
    const [beamX, setBeamX] = useState<number>(0);
    const [showHint, setShowHint] = useState(true);
    const [isScrolling, setIsScrolling] = useState(false);
    const [cursorPos, setCursorPos] = useState<{x:number, y:number} | null>(null);
    
    // Sensitivity Configuration
    const [sensitivity, setSensitivity] = useState(1.5);
    const [showSettings, setShowSettings] = useState(false);
    
    // Internal State Tracking
    const scrollTimeout = useRef<any>(null);
    const requestRef = useRef<number | undefined>(undefined);

    // Derived Data
    const attrs = useMemo(() => getMusicalAttributes(mood.valence, mood.arousal, mood.tension, instrument), [mood, instrument]);
    const calculatedBpm = getTempoFromArousal(mood.arousal);
    const accentColor = SCALE_DEFS[currentScale]?.palette.accent || '#facc15';

    // --- INTERACTION LOGIC ---

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
            // Update store directly. Store handles scale snapping and audio updates.
            setMood(v, a, mood.tension);
        }

        // Visual Preview
        if (setTargetMood) setTargetMood({ v, a });
    };

    // Sync hovered chord sentiment to preview
    useEffect(() => {
        if (!setTargetMood) return;
        if (hoveredChord && hoveredChord.sentiment) {
            setTargetMood({ v: hoveredChord.sentiment.valence, a: hoveredChord.sentiment.arousal });
        } else if (!isDragging) {
             setTargetMood(null);
        }
    }, [hoveredChord, isDragging, setTargetMood]);

    // Tension Scroll Handler
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); e.stopPropagation(); setShowHint(false);
            
            setIsScrolling(true);
            if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
            
            const delta = Math.sign(e.deltaY) * -0.05; 
            const newTension = Math.max(0, Math.min(1, mood.tension + delta));
            
            if (newTension !== mood.tension) {
                setMood(mood.valence, mood.arousal, newTension);
            }
        };
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if (el) el.removeEventListener('wheel', handleWheel); };
    }, [setMood, mood]);

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
        setIsDragging(false);
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
        if (setTargetMood) setTargetMood(null);
        try { (e.target as Element).releasePointerCapture(e.pointerId); } catch (e) {}
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[var(--bg-main)] overflow-hidden flex flex-row select-none">
            
            {/* --- VISUALIZERS --- */}
            <div className="flex-1 relative overflow-hidden perspective-[1000px] flex flex-col min-w-0">
                {isDragging && (
                    <div className="fixed top-0 bottom-0 w-[1px] bg-[var(--accent)] z-[9999] pointer-events-none" style={{ left: beamX, background: 'linear-gradient(to top, var(--accent) 0%, transparent 100%)', boxShadow: '0 0 15px var(--accent)', opacity: 0.8 }}>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                    </div>
                )}
                
                {/* TENSION HUD */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-50 flex flex-col items-center", isScrolling ? "opacity-100" : "opacity-0")}>
                   <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--accent)] px-6 py-4 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="flex items-center gap-2 mb-2">
                           <Thermometer size={12} className="text-[var(--accent)]" />
                           <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Harmonic Tension</span>
                       </div>
                       <div className="text-3xl font-black text-[var(--text-main)] tabular-nums tracking-tighter">{(mood.tension * 100).toFixed(0)}<span className="text-sm text-[var(--accent)]">%</span></div>
                       <div className="w-24 h-1 bg-[var(--border)] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[var(--accent)] transition-all duration-75" style={{width: `${mood.tension*100}%`}} /></div>
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
                            linear-gradient(to bottom, var(--bg-main) 0%, transparent 10%, transparent 90%, var(--bg-main) 100%)
                        `,
                        opacity: 1 - (mood.tension * 0.5)
                    }}/>
                    
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
                         style={{
                             backgroundImage: 'linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px)', 
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
                                    backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-soft-hover)', 
                                    transform: isActive ? 'scale(1.5)' : 'scale(1)',
                                    boxShadow: isActive ? '0 0 20px var(--text-main)' : 'none',
                                    opacity: isScaleLocked && !isActive ? 0.3 : 1
                                }}
                            >
                                <span className={cn("absolute -top-6 whitespace-nowrap text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border)] transition-opacity", isActive ? "text-[var(--text-main)] opacity-100" : "text-[var(--text-muted)] opacity-0")}>{st}</span>
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
                             <div className="absolute top-0 left-full ml-4 bg-[var(--bg-glass)] backdrop-blur border border-[var(--border)] rounded px-3 py-2 whitespace-nowrap flex flex-col items-start gap-1 pointer-events-none animate-in fade-in slide-in-from-left-2 z-[60] shadow-xl">
                                <div className="flex items-center justify-between w-full gap-4 border-b border-[var(--border)] pb-1 mb-0.5">
                                     <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-wider">{currentScale}</span>
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
                     <div className="bg-[var(--bg-glass)] backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-3">
                         <MousePointer2 size={14} className="text-[var(--accent)] animate-bounce" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Scroll/Pinch for Tension</span>
                     </div>
                </div>

                {/* Settings Toggle */}
                <div className="absolute top-6 right-6 pointer-events-auto z-20 flex flex-col items-end gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className={cn("w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200", showSettings ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-[var(--bg-soft)] border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")}>
                        <Settings size={14} />
                    </button>
                    {showSettings && (
                        <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border)] p-4 rounded-xl shadow-2xl w-64 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
                                <Sliders size={12} className="text-[var(--accent)]"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Input Mapping</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px]"><span className="text-[var(--text-dim)]">Pad Sensitivity</span><span className="font-mono text-[var(--accent)]">{sensitivity.toFixed(1)}</span></div>
                                    <input type="range" min="0.5" max="3.0" step="0.1" value={sensitivity} onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Zones Toggle */}
                <div className="absolute bottom-6 right-6 pointer-events-auto transition-all duration-300 z-20">
                     <button onClick={() => setShowZones(!showZones)} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md bg-[var(--bg-soft)] hover:bg-[var(--bg-soft-hover)] transition-colors">
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
                                <span className={cn("text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-colors", isHover ? "text-[var(--text-main)]" : "text-[var(--text-dim)]")}>{gem.label}</span>
                                <div className={cn("transition-all duration-300 ease-out overflow-hidden flex flex-col items-center", isHover ? "h-auto opacity-100 mt-1" : "h-0 opacity-0")}>
                                     <span className="text-[8px] font-mono text-[var(--accent)] bg-[var(--bg-glass)] backdrop-blur px-2 py-0.5 rounded border border-[var(--border)] shadow-xl whitespace-nowrap">{gem.desc}</span>
                                </div>
                            </div>
                        )
                     })}
                </div>
            </div>
        </div>
    );
};