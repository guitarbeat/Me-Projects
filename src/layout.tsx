
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, ChevronsLeftRight, Play, Pause, Square, Layers, Music, Activity, Lock, Unlock, Magnet, Trash2, Network, ListMusic, Hexagon } from 'lucide-react';
import { InstrumentType, Chord, Note, ScaleType, CIRCLE_KEYS, ChordComplexity } from './lib';
import { cn, Surface, IconButton, Badge, DataPoint, DragHandle, Button } from './ui';
import { DraggableChord } from './sequencer';

// --- SHARED HOOKS ---

const useDrag = (onDrag: (delta: number) => void, onEnd?: () => void) => {
    const startVal = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const handlers = {
        onPointerDown: (e: React.PointerEvent) => {
            setIsDragging(true);
            startVal.current = e.clientY;
            try {
                (e.target as Element).setPointerCapture(e.pointerId);
            } catch (err) {
                // Ignore if capture fails
            }
            e.preventDefault();
        },
        onPointerMove: (e: React.PointerEvent) => {
            if (isDragging) onDrag(e.clientY - startVal.current);
        },
        onPointerUp: (e: React.PointerEvent) => {
            setIsDragging(false);
            try {
                (e.target as Element).releasePointerCapture(e.pointerId);
            } catch (err) {}
            if (onEnd) onEnd();
        }
    };
    return { isDragging, handlers };
};

// --- LAYOUT COMPONENTS ---

export const PanelWrapper = ({ minimise, children, overlay, anchor, bgColor, isDragging }: any) => {
    const scale = 1 - (1 - (1 - minimise)) * 0.05;
    const blur = minimise * 16;
    const transformOrigin = anchor === 'top' ? 'top center' : 'bottom center';
    
    return (
        <div 
            className={cn("relative w-full h-full overflow-hidden shadow-2xl ring-1 ring-white/5 flex flex-col will-change-transform bg-[var(--bg-main)]", isDragging ? "transition-none" : "transition-all duration-500 ease-[var(--ease-out-expo)]")}
            style={{ transform: `scale(${scale})`, transformOrigin, backgroundColor: bgColor, borderRadius: minimise > 0.05 ? '24px' : '0px' }}
        >
            <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative transition-all duration-500"
                style={{ filter: `blur(${blur}px)`, opacity: Math.max(0, 1 - minimise * 1.5), pointerEvents: minimise > 0.3 ? 'none' : 'auto' }}>
                {children}
            </div>
            
            {/* Overlay for minimized state */}
            <div className={cn("absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-500 pointer-events-none", minimise > 0.5 && "pointer-events-auto")} 
                style={{ opacity: Math.max(0, (minimise - 0.4) * 2) }}>
                {minimise > 0.1 && <Surface variant="overlay" className="p-2 hover:scale-105 transition-transform duration-300">{overlay}</Surface>}
            </div>
        </div>
    );
};

export const ResizableTopPanel = ({ children, minHeight, maxHeight, defaultHeight }: any) => {
    const [h, setH] = useState(defaultHeight);
    const [collapsed, setCollapsed] = useState(false);
    const startH = useRef(defaultHeight);
    
    const { isDragging, handlers } = useDrag((dy) => {
        if (collapsed && dy > 20) { setCollapsed(false); setH(minHeight); startH.current = minHeight; return; }
        const newH = Math.min(Math.max(startH.current + dy, minHeight), maxHeight);
        if (startH.current + dy < minHeight - 40) setCollapsed(true);
        else setH(newH);
    }, () => startH.current = h);

    return (
        <div className={cn("w-full relative z-[60] bg-[#0c0a09] shadow-lg transition-all ease-[var(--ease-out-expo)] group/panel border-b border-[var(--border)]", isDragging ? "duration-0" : "duration-500")} 
             style={{ height: collapsed ? 12 : h }}>
            <div className={cn("w-full h-full overflow-hidden transition-all duration-500 ease-[var(--ease-out-expo)] relative", collapsed ? "opacity-0 -translate-y-4" : "opacity-100")} 
                 style={{ paddingBottom: 16 }}>
                {children}
            </div>
            <DragHandle className="absolute bottom-0 inset-x-0 h-3 z-50" active={isDragging} {...handlers} onClick={() => setCollapsed(!collapsed)} />
        </div>
    );
};

interface ControlPanelProps {
    isPlaying: boolean;
    togglePlay: () => void;
    timeSig: { num: number, den: number };
    setTimeSig: (val: { num: number, den: number }) => void;
    complexity: ChordComplexity;
    setComplexity: (c: ChordComplexity) => void;
    onRest: () => void;
    onSnap: () => void;
    onClear: () => void;
    currentKey: Note;
    setKey: (n: Note) => void;
    scale: ScaleType;
    setScale: (s: ScaleType) => void;
    isScaleLocked: boolean;
    toggleScaleLock: () => void;
    showPath: boolean;
    togglePath: () => void;
    instrument: InstrumentType;
    setInstrument: (i: InstrumentType) => void;
    view: string;
    setView: (v: string) => void;
    progressionCount: number;
    scaleMeta: { desc: string; characteristic: string };
    analysis: { vibe: string; mode: string; texture: string };
    availableChords: Chord[];
}

export const ControlPanel = (props: ControlPanelProps) => {
    return (
        <div className="w-full h-full flex flex-col p-2 gap-2 select-none">
            {/* ROW 1: Main Controls */}
            <div className="flex flex-wrap items-center gap-2 min-h-[40px] shrink-0">
                
                {/* Key Center */}
                <Surface variant="element" className="flex items-center p-1 gap-2 h-10 px-2 shrink-0">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)]">Key</span>
                        <div className="flex items-center gap-1">
                            <select value={props.currentKey} onChange={e => props.setKey(e.target.value as Note)} className="bg-transparent font-bold text-sm outline-none cursor-pointer hover:text-[var(--accent)]">
                                {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <select value={props.scale} onChange={e => props.setScale(e.target.value as ScaleType)} disabled={props.isScaleLocked} className="bg-transparent text-xs font-medium text-[var(--text-muted)] outline-none cursor-pointer w-24 truncate hover:text-white">
                                {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)]" />
                    <IconButton icon={props.isScaleLocked ? Lock : Unlock} size="sm" onClick={props.toggleScaleLock} className={props.isScaleLocked ? "text-[var(--accent)]" : "text-[var(--text-dim)]"} />
                </Surface>

                {/* Transport */}
                <Surface variant="element" className="flex items-center p-1 gap-1 h-10 shrink-0">
                    <Button onClick={props.togglePlay} active={props.isPlaying} className={cn("w-20", props.isPlaying && "text-[var(--accent)]")}><Play size={14} fill={props.isPlaying?"currentColor":"none"}/> {props.isPlaying?"Stop":"Play"}</Button>
                    <div className="w-px h-4 bg-[var(--border)] mx-1" />
                    <IconButton onClick={props.onRest} icon={Pause} className="rotate-90" title="Add Rest" />
                    <IconButton onClick={props.onSnap} icon={Magnet} title="Quantize" />
                    <IconButton onClick={props.onClear} icon={Trash2} variant="danger" title="Clear All" />
                </Surface>

                {/* Complexity */}
                <Surface variant="element" className="flex items-center p-1 gap-1 h-10 shrink-0">
                    {['triad', '7th', '9th', '11th'].map(c => (
                        <button key={c} onClick={() => props.setComplexity(c as ChordComplexity)} 
                            className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase transition-all", props.complexity === c ? "bg-[var(--accent)] text-black" : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)]")}>
                            {c}
                        </button>
                    ))}
                </Surface>

                <div className="flex-1" />

                {/* Analysis Stats (Hidden on small screens) */}
                <div className="hidden md:flex items-center gap-2">
                    <DataPoint label="Vibe" value={props.analysis.vibe} icon={Music} color="text-yellow-400" className="h-10 w-24" />
                    <DataPoint label="Texture" value={props.analysis.texture} icon={Layers} color="text-emerald-400" className="h-10 w-24" />
                </div>

                {/* View Switcher */}
                <Surface variant="element" className="flex items-center p-0.5 gap-0.5 h-10 shrink-0">
                    <button onClick={() => props.setView('sequencer')} className={cn("px-3 h-full rounded flex items-center gap-2 text-[10px] font-bold uppercase transition-all", props.view === 'sequencer' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white")}>
                        <ListMusic size={14} /> Seq
                    </button>
                    <button onClick={() => props.setView('harmony')} className={cn("px-3 h-full rounded flex items-center gap-2 text-[10px] font-bold uppercase transition-all", props.view === 'harmony' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white")}>
                        <Network size={14} /> Map
                    </button>
                </Surface>
            </div>

            {/* ROW 2: Palette & Instruments */}
            <div className="flex-1 min-h-0 flex gap-2">
                {/* Chord Palette - Scrollable */}
                <Surface variant="panel" className="flex-1 bg-[var(--bg-element)]/50 flex flex-col overflow-hidden relative">
                     <div className="absolute top-0 left-0 px-2 py-1 bg-[var(--bg-panel)] border-b border-r border-[var(--border)] rounded-br-lg z-10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)]">Chord Palette</span>
                     </div>
                     <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center px-4 gap-2 pt-4">
                        {props.availableChords.map((c, i) => (
                            <DraggableChord key={i} chord={c} className="h-10 w-auto min-w-[70px] bg-[var(--bg-surface)]" />
                        ))}
                     </div>
                </Surface>

                {/* Instrument Selector */}
                <Surface variant="panel" className="w-auto bg-[var(--bg-element)]/50 flex items-center px-2 gap-1 shrink-0">
                    {[
                        { id: 'rhodes', icon: Square },
                        { id: 'pad', icon: Layers },
                        { id: 'pluck', icon: Music },
                        { id: 'synth', icon: Activity }
                    ].map(inst => (
                        <button key={inst.id} onClick={() => props.setInstrument(inst.id as InstrumentType)}
                            className={cn("p-2 rounded-md transition-all hover:scale-105", props.instrument === inst.id ? "text-[var(--accent)] bg-[var(--bg-surface)] shadow-sm" : "text-[var(--text-dim)] hover:text-white")} title={inst.id}>
                            <inst.icon size={16} />
                        </button>
                    ))}
                </Surface>
            </div>
        </div>
    );
};

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: { top: React.ReactNode, bottom: React.ReactNode, topOverlay?: React.ReactNode, bottomOverlay?: React.ReactNode }) => {
    const [split, setSplit] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    const onMove = (e: React.PointerEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const raw = (e.clientY - rect.top) / rect.height;
        const detents = [0.15, 0.5, 0.85];
        let snap = raw;
        for (const d of detents) if (Math.abs(raw - d) < 0.05) { snap = d; break; }
        setSplit(Math.max(0.1, Math.min(0.9, snap)));
    };

    return (
        <div ref={ref} className="absolute inset-0 flex flex-col bg-black">
            <div className={cn("relative min-h-0 w-full will-change-[flex]", isDragging ? "transition-none" : "transition-all duration-500 ease-[var(--ease-out-expo)]", "pb-1")} style={{ flex: split }}>
                <PanelWrapper minimise={split < 0.3 ? 1-((split-0.05)/0.25) : 0} overlay={topOverlay} anchor="bottom" bgColor="var(--bg-panel)" isDragging={isDragging}>
                    {top}
                </PanelWrapper>
            </div>
            
            <div className="relative z-50 flex items-center justify-center interact-base touch-none group h-4 -my-2 w-full cursor-row-resize"
                 onPointerDown={(e) => { 
                     setIsDragging(true); 
                     try { (e.target as Element).setPointerCapture(e.pointerId); } catch(err){}
                 }}
                 onPointerMove={(e) => { if(isDragging) onMove(e); }}
                 onPointerUp={(e) => { 
                     setIsDragging(false); 
                     try { (e.target as Element).releasePointerCapture(e.pointerId); } catch(err){}
                 }}>
                 <div className="absolute inset-x-4 h-px bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
                 <div className={cn("relative z-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-full p-0.5 text-[var(--text-dim)] transition-all shadow-sm", isDragging ? "border-[var(--accent)] text-[var(--accent)] scale-110" : "scale-100")}>
                     <ChevronsUpDown size={12} strokeWidth={2.5} />
                 </div>
            </div>

            <div className={cn("relative min-h-0 w-full will-change-[flex]", isDragging ? "transition-none" : "transition-all duration-500 ease-[var(--ease-out-expo)]", "pt-1")} style={{ flex: 1 - split }}>
                <PanelWrapper minimise={split > 0.7 ? (split-0.7)/0.25 : 0} overlay={bottomOverlay} anchor="top" bgColor="var(--bg-panel)" isDragging={isDragging}>
                    {bottom}
                </PanelWrapper>
            </div>
        </div>
    );
};
