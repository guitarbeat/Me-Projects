import React from 'react';
import { ChevronsUpDown, Play, Pause, Square, Layers, Music, Activity, Lock, Unlock, Magnet, Trash2, Network, ListMusic, Hexagon } from 'lucide-react';
import { InstrumentType, Chord, Note, ScaleType, CIRCLE_KEYS, ChordComplexity } from './lib';
import { cn, Surface, IconButton, Badge, DataPoint, DragHandle, Button } from './ui';
import { DraggableChord } from './sequencer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// --- CONTROL PANEL ---

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
        <div className="w-full h-full flex flex-col p-2 gap-2 select-none overflow-hidden">
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

// --- WRAPPERS ---

export const PanelWrapper = ({ minimise, children, overlay, anchor, bgColor }: any) => {
    const scale = 1 - (1 - (1 - minimise)) * 0.05;
    const blur = minimise * 16;
    const transformOrigin = anchor === 'top' ? 'top center' : 'bottom center';
    
    return (
        <div 
            className="relative w-full h-full overflow-hidden shadow-2xl ring-1 ring-white/5 flex flex-col will-change-transform bg-[var(--bg-main)] transition-all duration-300 ease-[var(--ease-out-expo)]"
            style={{ transform: `scale(${scale})`, transformOrigin, backgroundColor: bgColor, borderRadius: minimise > 0.05 ? '24px' : '0px' }}
        >
            <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative transition-all duration-300"
                style={{ filter: `blur(${blur}px)`, opacity: Math.max(0, 1 - minimise * 1.5), pointerEvents: minimise > 0.3 ? 'none' : 'auto' }}>
                {children}
            </div>
            
            {/* Overlay for minimized state */}
            <div className={cn("absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-300 pointer-events-none", minimise > 0.5 && "pointer-events-auto")} 
                style={{ opacity: Math.max(0, (minimise - 0.4) * 2) }}>
                {minimise > 0.1 && <Surface variant="overlay" className="p-2 hover:scale-105 transition-transform duration-300">{overlay}</Surface>}
            </div>
        </div>
    );
};

// --- NEW LAYOUT SYSTEM ---

export const ResizableTopPanel = ({ children, minHeight, maxHeight, defaultHeight }: any) => {
    return (
        <div className="w-full relative z-[60] bg-[#0c0a09] shadow-lg border-b border-[var(--border)]" style={{ height: defaultHeight }}>
             {children}
        </div>
    );
};

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: { top: React.ReactNode, bottom: React.ReactNode, topOverlay?: React.ReactNode, bottomOverlay?: React.ReactNode }) => {
    return (
        <PanelGroup direction="vertical" className="absolute inset-0 bg-black">
            <Panel defaultSize={50} minSize={20} maxSize={80}>
                {({ size }) => (
                     <PanelWrapper minimise={size < 30 ? 1-((size-5)/25) : 0} overlay={topOverlay} anchor="bottom" bgColor="var(--bg-panel)">
                        {top}
                     </PanelWrapper>
                )}
            </Panel>
            
            <PanelResizeHandle className="relative z-50 flex items-center justify-center interact-base touch-none group h-4 -my-2 w-full cursor-row-resize outline-none">
                 <div className="absolute inset-x-4 h-px bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
                 <div className="relative z-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-full p-0.5 text-[var(--text-dim)] transition-all shadow-sm group-active:border-[var(--accent)] group-active:text-[var(--accent)] group-active:scale-110">
                     <ChevronsUpDown size={12} strokeWidth={2.5} />
                 </div>
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={20} maxSize={80}>
                {({ size }) => (
                     <PanelWrapper minimise={size < 30 ? (30-size)/25 : 0} overlay={bottomOverlay} anchor="top" bgColor="var(--bg-panel)">
                        {bottom}
                     </PanelWrapper>
                )}
            </Panel>
        </PanelGroup>
    );
};