
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LucideIcon, Play, Square, Plus, X, ChevronDown, Music, Activity, Disc, Sliders, Zap, Layers, RefreshCw, ArrowRight, Loader2, Piano, Waves, Mic2, GripHorizontal, Gauge, Brain } from 'lucide-react';
import { Chord, ScaleType, Note, InstrumentType, SCALE_DEFS, CIRCLE_KEYS, getScaleNotes, generateChordsForScale, generateOrbitalLayout, analyzeVoiceLeading, audioEngine, analyzeHarmony, buildChord, getHarmonicCompatibility, getTempoFromArousal, getPsychologyDescription, EMOJI_RADIUS, EMOTIONS, getEmo } from './lib';

// --- UI PRIMITIVES ---
export const cn = (...c: (string|undefined|false)[]) => c.filter(Boolean).join(' ');

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
    label?: string;
}

export const Surface: React.FC<SurfaceProps> = ({children, className, active, onClick, label, ...props}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <div 
            onClick={onClick as any}
            onKeyDown={onClick ? handleKeyDown : undefined}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-pressed={active}
            aria-label={label}
            className={cn(
                "bg-[#09090b] border border-white/5 rounded-xl overflow-hidden relative transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black", 
                active && "border-[var(--accent)] bg-[var(--accent)]/5", 
                onClick && "cursor-pointer hover:bg-white/5", 
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const Typo: React.FC<{variant?:string, className?:string, children:React.ReactNode}> = ({variant='body', className, children}) => (
    <div className={cn({
        'h1': "text-3xl font-light text-white", 'h2': "text-xl font-light text-white", 'h3': "text-sm font-bold text-zinc-100", 
        'label': "text-[9px] font-bold uppercase tracking-widest text-zinc-500", 'body': "text-sm text-zinc-400"
    }[variant] || "text-sm", className)}>{children}</div>
);

export const Button: React.FC<any> = ({icon:Icon, children, variant='ghost', className, ...p}) => (
    <button className={cn("h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-black", 
    variant==='primary'?"bg-zinc-100 text-black hover:bg-white": variant==='danger'?"bg-red-500/10 text-red-400":"text-zinc-500 hover:text-white hover:bg-white/5", className)} {...p}>
        {Icon && <Icon size={14} aria-hidden="true"/>}
        {children}
    </button>
);

export const Tabs: React.FC<{items:{id:string,icon:any,label:string}[], active:string, onChange:(id:string)=>void}> = ({items, active, onChange}) => (
    <div role="tablist" className="flex bg-[#050507] border-b border-white/5 p-1 overflow-x-auto scrollbar-hide shrink-0">
        {items.map(t => (
            <button 
                key={t.id} 
                role="tab"
                aria-selected={active===t.id}
                onClick={()=>onChange(t.id)} 
                className={cn("flex-1 py-3 min-w-[80px] flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]", active===t.id?"text-white":"text-zinc-600 hover:text-zinc-400")}
            >
                <t.icon size={14} className={active===t.id?"text-[var(--accent)]":"opacity-50"} aria-hidden="true"/>
                {t.label}
                {active===t.id && <div className="absolute bottom-0 w-8 h-0.5 bg-[var(--accent)] rounded-full"/>}
            </button>
        ))}
    </div>
);

// --- COMPLICATION BAR (Dynamic Splitter) ---
export const ComplicationBar: React.FC<any> = ({ active, onChange, onDragStart, data, isDragging }) => {
    const handleDragKeyDown = (e: React.KeyboardEvent) => {
        // Simple accessibility fallback implies just focusing buttons, drag via keyboard is complex
    };

    return (
        <div className="h-6 -my-3 z-50 flex items-center justify-center relative shrink-0">
            <div 
                role="toolbar"
                aria-label="View Controls and Resize Handle"
                onMouseDown={onDragStart}
                onTouchStart={onDragStart}
                onKeyDown={handleDragKeyDown}
                className={cn(
                    "h-12 bg-[#18181b] ring-1 ring-white/10 rounded-full flex items-center p-1 shadow-[0_20px_50px_-20px_black] cursor-row-resize backdrop-blur-xl transition-all duration-300 gap-1 select-none",
                    isDragging ? "scale-105 ring-[var(--accent)] shadow-[0_0_30px_-10px_var(--accent)]" : "hover:ring-white/20"
                )}
            >
                 {/* Orbit */}
                 <button 
                    aria-label="Orbit View"
                    aria-pressed={active==='orbit'}
                    onClick={(e)=>{e.stopPropagation(); onChange('orbit')}} 
                    className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", active==='orbit'?"bg-white/10 text-[var(--accent)]":"text-zinc-500 hover:text-zinc-300")}
                >
                    <Zap size={16} fill={active==='orbit'?"currentColor":"none"} aria-hidden="true"/>
                 </button>
                 
                 <div className="w-px h-3 bg-white/5" aria-hidden="true"/>
    
                 {/* Theory */}
                 <button 
                    aria-label={`Theory View: ${data.key} ${data.scale}`}
                    aria-pressed={active==='theory'}
                    onClick={(e)=>{e.stopPropagation(); onChange('theory')}} 
                    className={cn("h-10 px-3 rounded-full flex flex-col items-center justify-center transition-all min-w-[70px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", active==='theory'?"bg-white/10":"text-zinc-500 hover:text-zinc-300")}
                >
                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", active==='theory'?"text-[var(--accent)]":"opacity-50")}>Theory</span>
                    <span className={cn("text-[9px] font-mono font-bold leading-none mt-0.5", active==='theory'?"text-white":"opacity-50")}>{data.key} {data.scale.substring(0,3)}</span>
                 </button>
    
                 <div className="w-px h-3 bg-white/5" aria-hidden="true"/>
    
                 {/* Sound */}
                 <button 
                    aria-label="Sound Controls"
                    aria-pressed={active==='sound'}
                    onClick={(e)=>{e.stopPropagation(); onChange('sound')}} 
                    className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", active==='sound'?"bg-white/10 text-[var(--accent)]":"text-zinc-500 hover:text-zinc-300")}
                >
                    <Sliders size={16} aria-hidden="true"/>
                 </button>
            </div>
        </div>
    );
};

// --- HEADER ---
export const Header: React.FC<any> = ({ bpm, setBpm, isPlaying, togglePlay, keyNote, setKey, scale, setScale }) => (
    <header className="h-16 flex items-center justify-between px-6 shrink-0 z-10 relative bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            <div className="flex flex-col">
                <label htmlFor="key-select" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Key</label>
                <select id="key-select" className="bg-transparent text-white font-bold outline-none text-sm cursor-pointer hover:text-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded" value={keyNote} onChange={e=>setKey(e.target.value)}>
                    {CIRCLE_KEYS.map(k=><option key={k} value={k}>{k}</option>)}
                </select>
            </div>
            <div className="flex flex-col">
                <label htmlFor="scale-select" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Scale</label>
                <select id="scale-select" className="bg-transparent text-white font-bold outline-none text-sm cursor-pointer hover:text-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded" value={scale} onChange={e=>setScale(e.target.value)}>
                    {Object.keys(SCALE_DEFS).map(s=><option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex flex-col">
                <label htmlFor="bpm-input" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">BPM</label>
                <input id="bpm-input" type="number" className="bg-transparent text-[var(--accent)] font-mono font-bold outline-none w-12 text-sm focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/>
            </div>
        </div>
        <Button variant={isPlaying?'danger':'primary'} icon={isPlaying?Square:Play} onClick={togglePlay} className="shadow-lg" aria-label={isPlaying ? "Stop Playback" : "Start Playback"}>
            {isPlaying?'Stop':'Play'}
        </Button>
    </header>
);

// --- TIMELINE / TOP PANEL ---
export const ProgressionStrip: React.FC<any> = ({ progression, setProgression, activeIndex }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (activeIndex !== null && scrollRef.current) scrollRef.current.children[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, [activeIndex]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            setProgression(progression.filter((_: any, i: number) => i !== index));
        }
    };

    return (
        <div className="flex-1 w-full flex items-center justify-center relative group">
            <div ref={scrollRef} role="list" aria-label="Chord Progression Timeline" className="flex items-center px-[50vw] overflow-x-auto custom-scrollbar gap-2 w-full h-full pb-8 pt-4 snap-x snap-center">
                {progression.length===0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 pointer-events-none gap-2" aria-hidden="true">
                        <Layers size={24} className="opacity-20"/>
                        <span className="text-xs tracking-widest uppercase opacity-40">Drag Chords to Compose</span>
                    </div>
                )}
                {progression.map((c: Chord, i: number) => (
                    <div role="listitem" key={i} className="flex items-center snap-center relative">
                        <div 
                            tabIndex={0}
                            role="button"
                            aria-label={`Chord ${i+1}: ${c.symbol} ${c.quality}`}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className={cn("w-28 h-40 rounded-2xl border flex flex-col items-center justify-between py-6 relative group transition-all shrink-0 cursor-pointer backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", activeIndex===i ? "bg-zinc-900 border-[var(--accent)] scale-110 z-10 shadow-[0_0_30px_-5px_var(--accent)] text-white" : "bg-[#09090b]/50 border-white/5 hover:border-white/20 hover:bg-white/5 text-zinc-400")}
                        >
                            <span className="text-3xl font-light tracking-tighter" aria-hidden="true">{c.symbol}</span>
                            <span className="sr-only">{c.root} {c.quality} {c.extension}</span>
                            <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded" aria-label={`Roman Numeral ${c.romanNumeral}`}>{c.romanNumeral}</span>
                            <span className="text-[8px] uppercase tracking-widest opacity-50">{c.emotionalDesc}</span>
                            <button 
                                onClick={(e)=>{ e.stopPropagation(); setProgression(progression.filter((_:any,x:number)=>x!==i)) }} 
                                aria-label={`Remove chord ${c.symbol} at position ${i+1}`}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-400 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                                <X size={10} aria-hidden="true"/>
                            </button>
                        </div>
                        {i<progression.length-1 && <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-1" aria-hidden="true"/>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ORBITAL STAGE ---
export const GravityStage: React.FC<any> = ({ chords, onAdd, contextChord }) => {
    const nodes = useMemo(() => generateOrbitalLayout(chords), [chords]);
    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" aria-label="Orbital Chord Selector">
            <div className="absolute w-[60%] aspect-square rounded-full border border-white/5 border-dashed opacity-50 animate-spin-slow" style={{animationDuration:'60s'}} aria-hidden="true"/>
            <div className="absolute w-[30%] aspect-square rounded-full border border-white/5 opacity-30" aria-hidden="true"/>
            
            {nodes.map((n:any, i) => {
                const isSug = contextChord && getHarmonicCompatibility(contextChord, n).score > 0.8 && contextChord.root !== n.root;
                return (
                    <button 
                        key={i} 
                        onClick={()=>onAdd(n)} 
                        aria-label={`Add ${n.symbol} (${n.romanNumeral})`}
                        style={{left:`${n.x}%`, top:`${n.y}%`}} 
                        className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex flex-col items-center justify-center transition-all shadow-lg backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", 
                        i===0?"w-20 h-20 bg-zinc-950 border-[var(--accent)] z-10 shadow-[0_0_40px_-10px_var(--accent)] scale-110":
                        "w-14 h-14 bg-zinc-900/80 border-white/5 hover:border-[var(--accent)] hover:scale-125 hover:z-50 text-zinc-500 hover:text-white",
                        isSug && "border-[var(--accent)]/50 shadow-[0_0_20px_var(--accent)] animate-pulse"
                    )}>
                        <span className="font-bold text-sm tracking-tight">{n.symbol}</span>
                        <span className={cn("text-[8px] uppercase tracking-widest mt-0.5", i===0?"text-[var(--accent)]":"opacity-50")}>{n.romanNumeral}</span>
                    </button>
                )
            })}
        </div>
    );
};

// --- EMOJI MAPPER (Visual Component re-added for Vibe Tab) ---
export const EmojiGridMapper: React.FC<any> = ({ onChange, scale, onTempo, onScaleSelect }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(300);
    const [pos, setPos] = useState({ x: 150, y: 150 });
    const [drag, setDrag] = useState(false);
  
    useEffect(() => { 
        const resize = () => { if (ref.current) setSize(Math.min(ref.current.clientWidth, ref.current.clientHeight)); };
        resize(); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
    }, []);
  
    useEffect(() => {
        if (scale && !drag && SCALE_DEFS[scale]) {
            const c = SCALE_DEFS[scale].coords;
            setPos({ x: (size/2) + (c.x * (size/2 * 0.8)), y: (size/2) - (c.y * (size/2 * 0.8)) });
        }
    }, [scale, size, drag]);
  
    const handle = (e: any) => {
       if (!ref.current) return;
       const r = ref.current.getBoundingClientRect();
       const cx = size/2, cy = size/2, maxR = cx - EMOJI_RADIUS;
       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
       const clientY = e.touches ? e.touches[0].clientY : e.clientY;
       let x = clientX - r.left, y = clientY - r.top;
       const d = Math.sqrt((x-cx)**2 + (y-cy)**2);
       if (d > maxR) { x = cx + ((x-cx)/d)*maxR; y = cy + ((y-cy)/d)*maxR; }
       setPos({ x, y });
       const v = (x-cx)/maxR, a = (cy-y)/maxR;
       let best: ScaleType | null = null, min = 0.35;
       Object.entries(SCALE_DEFS).forEach(([k, def]) => {
          const dist = Math.sqrt((v - (def.coords.x*0.8))**2 + (a - (def.coords.y*0.8))**2);
          if (dist < min) { min = dist; best = k as ScaleType; }
       });
       if (best && best !== scale) onScaleSelect?.(best);
       const data = { ...getEmo(v,a), v, a, bpm: getTempoFromArousal(a), description: getPsychologyDescription(v,a) };
       onChange(data); onTempo?.(data.bpm);
    };
  
    const start = (e: any) => { e.stopPropagation(); setDrag(true); document.addEventListener('mousemove', handle); document.addEventListener('mouseup', stop); document.addEventListener('touchmove', handle); document.addEventListener('touchend', stop); };
    const stop = () => { setDrag(false); document.removeEventListener('mousemove', handle); document.removeEventListener('mouseup', stop); document.removeEventListener('touchmove', handle); document.removeEventListener('touchend', stop); };
  
    const cx = size/2, cy = size/2, max = cx - EMOJI_RADIUS;
    const v = (pos.x-cx)/max, a = (cy-pos.y)/max;
    const emo = getEmo(v, a);
  
    return (
      <div className="w-full h-full max-w-[320px] mx-auto p-8 aspect-square relative touch-none" aria-label="Emotional Vibe Selector">
          <div ref={ref} onMouseDown={start} onTouchStart={start} className="w-full h-full rounded-full border border-white/5 bg-[#050505] relative cursor-crosshair overflow-hidden shadow-2xl" role="application" aria-label="Vibe Grid">
              <div className="absolute inset-0 transition-opacity duration-500" style={{background: `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, ${EMOTIONS[emo.q].grad}, transparent 100%)`, opacity: drag?0.7:0.4, mixBlendMode:'screen'}}/>
              {Object.entries(SCALE_DEFS).map(([k, def]) => (
                  <div key={k} className={cn("absolute w-1 h-1 rounded-full transition-all", k===scale?"bg-white shadow-[0_0_10px_white] w-2 h-2":"bg-white/20")} style={{left: (size/2)+(def.coords.x*0.8*(size/2)), top: (size/2)-(def.coords.y*0.8*(size/2)), transform:'translate(-50%,-50%)'}}/>
              ))}
              <div className={cn("absolute w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center text-xl transition-transform shadow-2xl z-20", drag&&"scale-110")} style={{left:pos.x, top:pos.y, transform:'translate(-50%,-50%)'}}>{emo.emoji}</div>
          </div>
      </div>
    );
};
  
export const MoodSelector: React.FC<any> = ({ currentScale, currentKey, onMoodSelect, onManualScaleSelect, onTempoChange }) => {
    const def = SCALE_DEFS[currentScale], meta = def?.meta || { title: currentScale, desc: 'Custom', characteristic: 'Unique' };
    return (
      <div className="w-full h-full flex items-center justify-center relative p-4 gap-8">
          <div className="text-right z-10 w-48 hidden sm:block">
              <Typo variant="label" className="text-[var(--accent)] mb-2">Current Mode</Typo>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase leading-none mb-2">{meta.title}</h1>
              <div className="text-xs text-white uppercase font-bold">{meta.desc}</div>
          </div>
          <EmojiGridMapper onChange={onMoodSelect} scale={currentScale} onTempo={onTempoChange} onScaleSelect={onManualScaleSelect} />
      </div>
    );
};

// --- THEORY TOOLS ---
export const TheoryTools: React.FC<any> = ({ chords, onAdd, progression, k }) => {
    const [view, setView] = useState('palette');
    const [analysis, setAnalysis] = useState("");
    useEffect(() => { if(view==='analyze' && progression.length) analyzeHarmony(progression, k).then(setAnalysis) }, [view, progression, k]);

    return (
        <div className="flex flex-col h-full w-full bg-[#09090b]">
            <div role="tablist" className="flex gap-2 p-4 border-b border-white/5 shrink-0 justify-center">
                {['palette','analyze','guide'].map(v => (
                    <button 
                        key={v} 
                        role="tab"
                        aria-selected={view===v}
                        onClick={()=>setView(v)} 
                        className={cn("text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]", view===v?"bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20":"bg-white/5 text-zinc-500 border-transparent hover:border-white/10 hover:text-zinc-300")}
                    >
                        {v}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {view==='palette' && <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 pb-8">{chords.map((c:Chord,i:number)=><Surface key={i} label={`Add ${c.symbol}`} onClick={()=>onAdd(c)} className="p-3 text-center hover:border-[var(--accent)] aspect-square flex flex-col items-center justify-center group"><div className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">{c.symbol}</div><div className="text-[9px] text-zinc-500 font-bold uppercase">{c.romanNumeral}</div></Surface>)}</div>}
                {view==='analyze' && (
                    <div className="space-y-6 max-w-2xl mx-auto pt-4">
                        {analysis ? <div className="p-6 bg-white/5 rounded-xl text-sm italic border-l-2 border-[var(--accent)] leading-relaxed text-zinc-300 shadow-lg" role="status">"{analysis}"</div> : <div className="text-center opacity-50 py-10 flex flex-col items-center"><Loader2 className="animate-spin mb-2" aria-hidden="true"/> Analyzing Structure...</div>}
                        <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8">
                            {progression.map((c:Chord, i:number) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-[#09090b] border border-white/20 flex items-center justify-center text-[8px] font-mono text-zinc-500" aria-hidden="true">{i+1}</div>
                                    <Surface className="flex items-center gap-4 p-4 border border-white/5 hover:border-[var(--accent)]/50 transition-colors">
                                        <div className="flex-1"><div className="font-bold text-lg text-white">{c.symbol}</div><div className="text-[10px] text-[var(--accent)] uppercase tracking-widest">{c.functionLabel}</div></div>
                                        <div className="text-right"><div className="text-xs text-zinc-500 italic">{c.emotionalDesc}</div><div className="text-[9px] font-bold text-zinc-700 bg-black/30 px-2 py-0.5 rounded inline-block mt-1">{c.romanNumeral}</div></div>
                                    </Surface>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {view==='guide' && (
                    <div className="space-y-4 max-w-md mx-auto pt-4">
                         <Typo variant="label" className="mb-2 block">Cadence Generator</Typo>
                         <Surface label="Add 2-5-1 Jazz Cadence" className="p-6 flex items-center justify-between cursor-pointer hover:border-[var(--accent)] group bg-[#121214]" onClick={()=>onAdd([buildChord('D','Minor',{extension:'m7'}), buildChord('G','Dominant',{extension:'7'}), buildChord('C','Major',{extension:'Maj7'})])}>
                            <div><div className="font-bold mb-1 text-zinc-200">2-5-1 Jazz Cadence</div><div className="flex gap-2 text-xs font-mono text-zinc-500 mt-2"><span className="text-[var(--accent)] bg-[var(--accent)]/10 px-1 rounded">ii7</span><ArrowRight size={10} className="mt-1" aria-hidden="true"/><span>V7</span><ArrowRight size={10} className="mt-1" aria-hidden="true"/><span>Imaj7</span></div></div>
                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-black transition-colors"><Plus size={20} aria-hidden="true"/></div>
                         </Surface>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SOUND CONTROLS ---
export const Controls: React.FC<any> = ({ currentInstrument, onSetInstrument, chords, play }) => (
    <div className="flex items-center justify-center h-full bg-[#09090b]">
        <div className="grid grid-cols-2 gap-4 p-8 max-w-lg w-full">
            {[ {id:'rhodes', label:'Keys', icon:Piano}, {id:'pad', label:'Pad', icon:Waves}, {id:'pluck', label:'Pluck', icon:Zap}, {id:'synth', label:'Synth', icon:Mic2} ].map((i:any)=>(
                <Surface key={i.id} label={`Select Instrument: ${i.label}`} active={currentInstrument===i.id} onClick={()=>{onSetInstrument(i.id); if(chords[0]) play(chords[0]);}} className="p-8 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform cursor-pointer group">
                    <i.icon size={32} className={cn("transition-colors duration-300", currentInstrument===i.id?"text-[var(--accent)]":"opacity-40 group-hover:opacity-80")} aria-hidden="true"/>
                    <span className={cn("font-bold text-xs uppercase tracking-widest mt-2", currentInstrument===i.id?"text-white":"text-zinc-600")}>{i.label}</span>
                </Surface>
            ))}
        </div>
    </div>
);
