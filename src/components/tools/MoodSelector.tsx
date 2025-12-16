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
                
                {/* TENSION HUD */}
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
                    {/* DYNAMIC COLOR BACKGROUND - Shifts with tension */}
                    <div 
                        className="absolute inset-0 transition-all duration-1000"
                        style={{
                            background: `
                                radial-gradient(circle at 50% 50%, 
                                    ${mood.tension > 0.5 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(59, 130, 246, 0.3)'} 0%, 
                                    transparent 70%
                                ),
                                linear-gradient(${180 + mood.valence * 45}deg, 
                                    rgba(16, 185, 129, ${0.1 + mood.arousal * 0.2}), 
                                    rgba(139, 92, 246, ${0.1 + mood.tension * 0.3})
                                )
                            `
                        }}
                    />

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
                            const opacity = Math.max(0, 1 - Math.abs(i - 10) / 10) * (0.2 + mood.tension * 0.2);
                            return (
                                <React.Fragment key={`grid-${i}`}>
                                    <div 
                                        className="absolute left-0 right-0 h-[1px] pointer-events-none transition-opacity duration-500"
                                        style={{
                                            top: '50%',
                                            background: `linear-gradient(90deg, transparent, ${mood.tension > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(96, 165, 250, 0.4)'} 20%, ${mood.tension > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(96, 165, 250, 0.4)'} 80%, transparent)`,
                                            transform: `translateZ(${offset}px) translateY(${offset}px)`,
                                            opacity
                                        }}
                                    />
                                    <div 
                                        className="absolute top-0 bottom-0 w-[1px] pointer-events-none transition-opacity duration-500"
                                        style={{
                                            left: '50%',
                                            background: `linear-gradient(180deg, transparent, ${mood.tension > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(96, 165, 250, 0.4)'} 20%, ${mood.tension > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(96, 165, 250, 0.4)'} 80%, transparent)`,
                                            transform: `translateZ(${offset}px) translateX(${offset}px)`,
                                            opacity
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })}

                        {/* STARFIELD - Particles flowing through space */}
                        {Array.from({ length: Math.floor(150 + mood.tension * 100) }).map((_, i) => {
                            // Distribute particles in 3D grid
                            const gridSize = 8;
                            const spacing = 100;
                            const ix = (i % gridSize) - gridSize / 2;
                            const iy = (Math.floor(i / gridSize) % gridSize) - gridSize / 2;
                            const iz = Math.floor(i / (gridSize * gridSize)) - 2;
                            
                            const x = ix * spacing + ((i * 17) % 40) - 20; // Add variation
                            const y = iy * spacing + ((i * 23) % 40) - 20;
                            const z = iz * spacing + ((i * 31) % 60) - 30;
                            
                            // Depth-based sizing and opacity
                            const depth = Math.abs(z) / 300;
                            const size = Math.max(1, 3 - depth * 2);
                            const opacity = Math.max(0.1, 0.6 - depth);
                            
                            return (
                                <div
                                    key={`star-${i}`}
                                    className="absolute rounded-full pointer-events-none"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                                        background: mood.tension > 0.5 
                                            ? `rgba(251, 146, 60, ${opacity})` 
                                            : `rgba(147, 197, 253, ${opacity})`,
                                        boxShadow: `0 0 ${2 + mood.tension * 4}px currentColor`,
                                        transition: 'background 0.5s, box-shadow 0.5s'
                                    }}
                                />
                            );
                        })}

                        {/* SCALE PARTICLE CLUSTERS - Each scale is a cluster of particles */}
                        {Object.entries(SCALE_DEFS).map(([st, d]) => {
                            const def = d as ScaleDef;
                            const x = def.scaleCoordinates.v * 200;
                            const y = -def.scaleCoordinates.a * 200;
                            const z = Math.sin(def.scaleCoordinates.v * Math.PI) * 50;
                            const isActive = st === currentScale;
                            
                            const dist = Math.hypot(
                                mood.valence - def.scaleCoordinates.v,
                                mood.arousal - def.scaleCoordinates.a
                            );
                            const proximity = Math.max(0, 1 - dist / 2);
                            
                            // Particle cluster size based on activity
                            const particleCount = isActive ? 30 : 15;
                            const clusterRadius = isActive ? 25 : 15;
                            
                            return (
                                <div 
                                    key={st} 
                                    className="absolute pointer-events-none"
                                    style={{ 
                                        left: '50%',
                                        top: '50%',
                                        transformStyle: 'preserve-3d',
                                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                                    }}
                                >
                                    {/* Nebula fog for active scale */}
                                    {isActive && (
                                        <div 
                                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-pulse"
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                background: `radial-gradient(circle, ${def.palette.accent}40, transparent)`,
                                                animationDuration: '3s'
                                            }}
                                        />
                                    )}

                                    {/* Particle cluster */}
                                    {Array.from({ length: particleCount }).map((_, i) => {
                                        const angle = (i / particleCount) * Math.PI * 2;
                                        const r = ((i % 3) + 1) * (clusterRadius / 3);
                                        const px = Math.cos(angle) * r;
                                        const py = Math.sin(angle) * r;
                                        const pz = ((i * 7) % 10) - 5;
                                        const size = isActive ? (2 + (i % 3)) : (1 + (i % 2));
                                        
                                        return (
                                            <div
                                                key={`cluster-${st}-${i}`}
                                                className="absolute rounded-full"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    width: `${size}px`,
                                                    height: `${size}px`,
                                                    transform: `translate3d(${px}px, ${py}px, ${pz}px) translate(-50%, -50%)`,
                                                    background: isActive ? def.palette.accent : 'var(--text-dim)',
                                                    boxShadow: isActive 
                                                        ? `0 0 ${8 + proximity * 12}px ${def.palette.accent}`
                                                        : `0 0 ${proximity * 6}px var(--text-dim)`,
                                                    opacity: isActive ? 0.9 : (0.3 + proximity * 0.4),
                                                    transition: 'all 0.5s ease-out'
                                                }}
                                            />
                                        );
                                    })}
                                    
                                    {/* Scale label */}
                                    {isActive && (
                                        <div 
                                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8"
                                            style={{
                                                transform: 'translate(-50%, -100%)'
                                            }}
                                        >
                                            <span 
                                                className="text-[10px] font-black tracking-wider uppercase whitespace-nowrap px-2 py-1 rounded-md"
                                                style={{ 
                                                    color: def.palette.accent,
                                                    textShadow: `0 0 10px ${def.palette.accent}`,
                                                    background: `${def.palette.accent}15`,
                                                    border: `1px solid ${def.palette.accent}40`
                                                }}
                                            >
                                                {st}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* FLAT INTERACTION PLANE */}
                    <div className="absolute inset-0 z-10" />

                    {/* Corner Labels */}
                    <div className="absolute inset-4 pointer-events-none z-20">
                        <span className="absolute top-0 right-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Energetic</span>
                        <span className="absolute bottom-0 right-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Calm</span>
                        <span className="absolute top-0 left-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Tense</span>
                        <span className="absolute bottom-0 left-0 text-[var(--text-dim)] text-[10px] font-bold opacity-20 tracking-widest uppercase">Melancholy</span>
                    </div>

                    {/* CURSOR - Floats in 3D with energy pulses */}
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
                        {/* Energy pulse rings */}
                        <div className="absolute inset-0 rounded-full border border-current opacity-30 animate-ping" style={{ animationDuration: '2s' }}/>
                        <div className="absolute inset-[-50%] rounded-full border border-current opacity-10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}/>
                        <div className="w-2 h-2 bg-current rounded-full shadow-[0_0_15px_currentColor]"/>
                        
                        {/* Tooltip */}
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