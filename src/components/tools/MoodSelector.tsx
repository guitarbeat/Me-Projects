import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Thermometer, Zap } from 'lucide-react';
import { SCALE_DEFS, EMOTIONAL_ZONES, getTempoFromArousal, ScaleDef } from '../../lib';
import { cn } from '../ui';
import { useStore } from '../../lib';

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
        instrument,
        setTargetMood, 
        hoveredChord 
    } = useStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [beamX, setBeamX] = useState<number>(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [cursorPos, setCursorPos] = useState<{x:number, y:number} | null>(null);
    
    // Internal State Tracking
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const SENSITIVITY = 1.5;

    // Derived Data
    const calculatedBpm = getTempoFromArousal(mood.arousal);
    const accentColor = SCALE_DEFS[currentScale]?.palette.accent || '#facc15';
    
    // Update container size when ref changes
    useEffect(() => {
        if (!ref.current) return;
        const updateSize = () => {
            if (ref.current) {
                // setContainerSize({ width: ref.current.offsetWidth, height: ref.current.offsetHeight }); // Removed as zoneHoverStates is removed
            }
        };
        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, []);
    
    // Compute hover states for zones (using state instead of ref) - Removed as not used
    // const zoneHoverStates = useMemo(() => {
    //     if (!cursorPos) return new Map<number, boolean>();
    //     const cx = (cursorPos.x / containerSize.width) * 100;
    //     const cy = (cursorPos.y / containerSize.height) * 100;
    //     const states = new Map<number, boolean>();
    //     EMOTIONAL_ZONES.forEach((gem, i) => {
    //         const x = (gem.v + 1) / 2 * 100;
    //         const y = (-gem.a + 1) / 2 * 100;
    //         states.set(i, Math.hypot(cx - x, cy - y) < 12);
    //     });
    //     return states;
    // }, [cursorPos, containerSize]);

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
        const v = Math.sign(rawV) * Math.pow(Math.abs(rawV), SENSITIVITY);
        const a = Math.sign(rawA) * Math.pow(Math.abs(rawA), SENSITIVITY);
        
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
            e.preventDefault(); e.stopPropagation();
            
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
        e.preventDefault(); setIsDragging(true);
        updateMoodPad(e.clientX, e.clientY, true);
        try { (e.target as Element).setPointerCapture(e.pointerId); } catch { /* Ignore pointer capture errors */ }
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
        try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* Ignore pointer release errors */ }
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[var(--bg-main)] overflow-hidden flex flex-row select-none">
            
            {/* --- 3D SPACE VISUALIZER --- */}
            <div className="flex-1 relative overflow-hidden flex flex-col min-w-0" style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
                {isDragging && (
                    <div className="fixed top-0 bottom-0 w-[1px] bg-[var(--accent)] z-[9999] pointer-events-none" style={{ left: beamX, background: 'linear-gradient(to top, var(--accent) 0%, transparent 100%)', boxShadow: '0 0 15px var(--accent)', opacity: 0.8 }}>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                    </div>
                )}
                
                {/* TENSION HUD - Simplified */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-50", isScrolling ? "opacity-100" : "opacity-0")}>
                   <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--accent)] px-4 py-3 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <Thermometer size={16} className="text-[var(--accent)]" />
                       <div className="text-2xl font-black text-[var(--text-main)] tabular-nums">{(mood.tension * 100).toFixed(0)}<span className="text-xs text-[var(--accent)] ml-1">%</span></div>
                   </div>
               </div>

                {/* 3D INTERACTIVE SPACE */}
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
                    style={{ 
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* 3D GRID CONTAINER - Rotates and zooms based on mood */}
                    <div 
                        className="absolute inset-0 transition-transform duration-700 ease-out"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: `
                                translateZ(${-300 + mood.tension * 400}px)
                                rotateX(${15 - mood.arousal * 10}deg)
                                rotateY(${mood.valence * 15}deg)
                                scale(${1 + mood.tension * 0.3})
                            `
                        }}
                    >
                        {/* PERSPECTIVE GRID FLOOR */}
                        {Array.from({ length: 20 }).map((_, i) => {
                            const offset = (i - 10) * 60;
                            return (
                                <React.Fragment key={`grid-${i}`}>
                                    {/* Horizontal lines */}
                                    <div 
                                        className="absolute left-0 right-0 h-[1px] pointer-events-none"
                                        style={{
                                            top: '50%',
                                            background: `linear-gradient(90deg, transparent, var(--border-soft) 20%, var(--border-soft) 80%, transparent)`,
                                            transform: `translateZ(${offset}px) translateY(${offset}px)`,
                                            opacity: Math.max(0, 1 - Math.abs(i - 10) / 10) * 0.3
                                        }}
                                    />
                                    {/* Vertical lines */}
                                    <div 
                                        className="absolute top-0 bottom-0 w-[1px] pointer-events-none"
                                        style={{
                                            left: '50%',
                                            background: `linear-gradient(180deg, transparent, var(--border-soft) 20%, var(--border-soft) 80%, transparent)`,
                                            transform: `translateZ(${offset}px) translateX(${offset}px)`,
                                            opacity: Math.max(0, 1 - Math.abs(i - 10) / 10) * 0.3
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}

                        {/* SCALE DOMAIN SPHERES - 3D positioned */}
                        {Object.entries(SCALE_DEFS).map(([st, d]) => {
                            const def = d as ScaleDef;
                            // Map 2D coordinates to 3D space
                            const x = def.scaleCoordinates.v * 200; // -200 to +200
                            const y = -def.scaleCoordinates.a * 200;
                            const z = Math.sin(def.scaleCoordinates.v * Math.PI) * 50; // Add depth variation
                            const isActive = st === currentScale;
                            
                            // Calculate distance from current mood for glow effect
                            const dist = Math.hypot(
                                mood.valence - def.scaleCoordinates.v,
                                mood.arousal - def.scaleCoordinates.a
                            );
                            const proximity = Math.max(0, 1 - dist / 2);
                            
                            return (
                                <div 
                                    key={st} 
                                    className="absolute pointer-events-none transition-all duration-500"
                                    style={{ 
                                        left: '50%',
                                        top: '50%',
                                        transformStyle: 'preserve-3d',
                                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                                    }}
                                >
                                    {/* Scale sphere/domain */}
                                    <div 
                                        className="relative -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 flex items-center justify-center"
                                        style={{
                                            width: isActive ? '80px' : '40px',
                                            height: isActive ? '80px' : '40px',
                                            background: isActive 
                                                ? `radial-gradient(circle, ${def.palette.accent}40, ${def.palette.accent}10)`
                                                : `radial-gradient(circle, var(--bg-soft-hover), transparent)`,
                                            boxShadow: isActive 
                                                ? `0 0 ${40 + proximity * 60}px ${def.palette.accent}, inset 0 0 20px ${def.palette.accent}40`
                                                : `0 0 ${proximity * 30}px var(--text-dim)`,
                                            border: `1px solid ${isActive ? def.palette.accent : 'var(--border)'}`,
                                            opacity: isActive ? 1 : (0.3 + proximity * 0.5),
                                        }}
                                    >
                                        {/* Scale label */}
                                        {isActive && (
                                            <span 
                                                className="text-[10px] font-black tracking-wider uppercase"
                                                style={{ 
                                                    color: def.palette.accent,
                                                    textShadow: `0 0 10px ${def.palette.accent}`
                                                }}
                                            >
                                                {st}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Orbital rings for active scale */}
                                    {isActive && (
                                        <>
                                            <div 
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-30 animate-spin"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderColor: def.palette.accent,
                                                    animationDuration: '8s',
                                                    transform: 'translate(-50%, -50%) rotateX(60deg)'
                                                }}
                                            />
                                            <div 
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-20 animate-spin"
                                                style={{
                                                    width: '160px',
                                                    height: '160px',
                                                    borderColor: def.palette.accent,
                                                    animationDuration: '12s',
                                                    animationDirection: 'reverse',
                                                    transform: 'translate(-50%, -50%) rotateY(60deg)'
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* FLAT INTERACTION PLANE - Invisible but captures input */}
                    <div className="absolute inset-0 z-10" />

                    {/* Corner Labels - Subtle guides */}
                    <div className="absolute inset-4 pointer-events-none z-20">
                        <span className="absolute top-0 right-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Energetic</span>
                        <span className="absolute bottom-0 right-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Calm</span>
                        <span className="absolute top-0 left-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Tense</span>
                        <span className="absolute bottom-0 left-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Melancholy</span>
                    </div>

                    {/* CURSOR - Floats in 3D space */}
                    <div 
                        className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 transition-all duration-75 pointer-events-none flex items-center justify-center z-50"
                        style={{ 
                            left: `${(mood.valence + 1) * 50}%`, 
                            top: `${(1 - mood.arousal) * 50}%`,
                            borderColor: accentColor,
                            color: accentColor,
                            backgroundColor: `${accentColor}15`,
                            boxShadow: `
                                0 0 ${30 + mood.tension * 50}px ${accentColor},
                                inset 0 0 20px ${accentColor}40
                            `,
                            transform: `
                                translateZ(${mood.tension * 100}px)
                                scale(${1 + mood.tension * 0.4})
                            `,
                            filter: `blur(${mood.tension * 0.5}px)`
                        }}
                    >
                        <div className="absolute inset-0 rounded-full border border-current opacity-30 animate-ping" style={{ animationDuration: '2s' }}/>
                        <div className="w-2 h-2 bg-current rounded-full shadow-[0_0_15px_currentColor]"/>
                        
                        {/* Simplified Tooltip */}
                        {isDragging && (
                             <div className="absolute top-0 left-full ml-6 bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border)] rounded-lg px-3 py-2 whitespace-nowrap flex items-center gap-3 pointer-events-none animate-in fade-in slide-in-from-left-2 z-[60] shadow-xl">
                                 <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider">{currentScale}</span>
                                 <div className="w-px h-4 bg-[var(--border)]" />
                                 <span className="text-xs font-mono text-[var(--accent)]">{calculatedBpm} BPM</span>
                                 <div className="w-px h-4 bg-[var(--border)]" />
                                 <span className="text-xs font-mono text-[var(--text-muted)]">{(mood.tension * 100).toFixed(0)}% T</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MiniMoodSelector = () => {
    const { mood } = useStore();
    
    // Find closest zone
    const currentZone = useMemo(() => {
        let minDist = Infinity;
        let match = EMOTIONAL_ZONES[0];
        
        for (const zone of EMOTIONAL_ZONES) {
            const dist = Math.hypot(mood.valence - zone.v, mood.arousal - zone.a);
            if (dist < minDist) {
                minDist = dist;
                match = zone;
            }
        }
        return match;
    }, [mood.valence, mood.arousal]);

    return (
        <div className="flex items-center gap-3 px-4 w-full h-full bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)] overflow-hidden relative">
                 <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, 
                        rgba(250, 204, 21, ${(mood.arousal + 1) * 0.4}) 0%, 
                        rgba(59, 130, 246, ${(mood.valence + 1) * 0.4}) 100%)`, 
                    opacity: 0.8
                }}/>
                <Zap size={14} className="text-[var(--text-main)] relative z-10 mix-blend-overlay" />
            </div>
             <div className="flex flex-col min-w-0">
                 <span className="font-bold text-xs text-[var(--text-main)] truncate">Mood</span>
                 <span className="text-[10px] text-[var(--text-muted)] truncate capitalize">
                    {currentZone?.label.toLowerCase() || 'Neutral'} • Tension: {(mood.tension * 100).toFixed(0)}%
                 </span>
            </div>
        </div>
    );
};