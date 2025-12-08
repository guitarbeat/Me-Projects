
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, ChevronsLeftRight, Play, Pause, Square, Layers, Music, Activity, Lock, Unlock, Link as LinkIcon, Trash2, Network, ListMusic, Hexagon } from 'lucide-react';
import { InstrumentType, Chord, Note, ScaleType, CIRCLE_KEYS, ChordComplexity } from './lib';
import { cn, Surface, IconButton, Badge, DataPoint, DragHandle, Button } from './ui';
import { DraggableChord } from './sequencer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// --- STYLED HANDLE ---

const Handle = ({ className }: { className?: string }) => (
    <PanelResizeHandle className={cn("group flex h-4 w-full items-center justify-center -my-2 z-50 cursor-row-resize outline-none touch-none", className)}>
        <div className="absolute inset-x-4 h-px bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
        <div className="relative z-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-full p-0.5 text-[var(--text-dim)] transition-all shadow-sm group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:scale-110">
            <ChevronsUpDown size={12} strokeWidth={2.5} />
        </div>
    </PanelResizeHandle>
);

// --- RESIZABLE TOP PANEL ---

export const ResizableTopPanel = ({ children, minHeight = 100, maxHeight = 300, defaultHeight = 160 }: { children: React.ReactNode, minHeight?: number, maxHeight?: number, defaultHeight?: number }) => {
    const [height, setHeight] = useState(defaultHeight);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const delta = e.clientY - startY.current;
            const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + delta));
            setHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minHeight, maxHeight]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startY.current = e.clientY;
        startHeight.current = height;
    };

    return (
        <div style={{ height }} className="relative z-20 bg-[#0c0a09] border-b border-[var(--border)] shadow-lg flex flex-col shrink-0">
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
            <div 
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center group z-50 hover:bg-white/5 transition-colors -mb-1.5"
            >
                <div className="w-12 h-1 rounded-full bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
            </div>
        </div>
    );
};

// --- SPLIT VIEW ---

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: { top: React.ReactNode, bottom: React.ReactNode, topOverlay?: React.ReactNode, bottomOverlay?: React.ReactNode }) => {
    return (
        <div className="h-full w-full">
            <PanelGroup direction="vertical">
                <Panel defaultSize={50} minSize={20} className="relative">
                    <div className="absolute inset-0 p-1 pb-0.5">
                        <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-t-xl overflow-hidden relative">
                            {top}
                             {topOverlay && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                    <div className="bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border)] p-2 rounded-lg shadow-xl">
                                        {topOverlay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Panel>
                
                <Handle />

                <Panel defaultSize={50} minSize={20} className="relative">
                    <div className="absolute inset-0 p-1 pt-0.5">
                        <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-b-xl overflow-hidden relative">
                            {bottom}
                             {bottomOverlay && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                    <div className="bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border)] p-2 rounded-lg shadow-xl">
                                        {bottomOverlay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

// --- MAIN LAYOUT COMPONENT ---

interface MainLayoutProps {
    controls: React.ReactNode;
    top: React.ReactNode;
    bottom: React.ReactNode;
    topOverlay?: React.ReactNode;
    bottomOverlay?: React.ReactNode;
}

export const MainLayout = ({ controls, top, bottom, topOverlay, bottomOverlay }: MainLayoutProps) => {
    return (
        <div className="h-screen w-full flex flex-col bg-[var(--bg-main)]">
            <PanelGroup direction="vertical">
                {/* Control Panel Area */}
                <Panel defaultSize={18} minSize={14} maxSize={30} className="z-20 bg-[#0c0a09] border-b border-[var(--border)] shadow-lg">
                    <div className="h-full w-full overflow-hidden">
                        {controls}
                    </div>
                </Panel>
                
                <Handle />

                {/* Workspace Area */}
                <Panel className="relative z-10">
                    <PanelGroup direction="vertical">
                        {/* Top Workspace (Sequencer/Tonnetz) */}
                        <Panel defaultSize={50} minSize={20} className="relative">
                            <div className="absolute inset-0 p-1 pb-0.5">
                                <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-t-xl overflow-hidden relative">
                                    {top}
                                    {topOverlay && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                            <div className="bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border)] p-2 rounded-lg shadow-xl">
                                                {topOverlay}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>

                        <Handle />

                        {/* Bottom Workspace (Mood) */}
                        <Panel defaultSize={50} minSize={20} className="relative">
                            <div className="absolute inset-0 p-1 pt-0.5">
                                <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-b-xl overflow-hidden relative">
                                    {bottom}
                                    {bottomOverlay && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                            <div className="bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border)] p-2 rounded-lg shadow-xl">
                                                {bottomOverlay}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};

// --- CONTROL PANEL COMPONENT ---

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
        <div className="w-full h-full flex flex-col select-none bg-[#0c0a09]">
            {/* HEADER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between p-2 gap-2 border-b border-[var(--border)] bg-[#0c0a09] min-h-[56px]">
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* KEY / SCALE GROUP */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-md border border-[var(--border)] overflow-hidden h-9 shadow-sm">
                        <div className="px-3 flex items-center gap-2 border-r border-[var(--border)] h-full bg-[var(--bg-panel)]/50">
                            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-wider">Key</span>
                            <div className="relative">
                                <select 
                                    value={props.currentKey} 
                                    onChange={e => props.setKey(e.target.value as Note)} 
                                    className="bg-transparent font-bold text-sm outline-none cursor-pointer text-[var(--text-main)] hover:text-white appearance-none text-center min-w-[20px] z-10 relative"
                                >
                                    {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="px-2 h-full flex items-center justify-center min-w-[80px]">
                            <select 
                                value={props.scale} 
                                onChange={e => props.setScale(e.target.value as ScaleType)} 
                                disabled={props.isScaleLocked} 
                                className="bg-transparent text-xs font-medium text-[var(--text-muted)] outline-none cursor-pointer w-full hover:text-white appearance-none"
                            >
                                {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={props.toggleScaleLock}
                            className={cn("px-2 h-full flex items-center justify-center transition-colors hover:bg-white/5 border-l border-[var(--border)]", props.isScaleLocked ? "text-[var(--text-main)]" : "text-[var(--text-dim)]")}
                            title={props.isScaleLocked ? "Unlock Scale" : "Lock Scale"}
                        >
                            {props.isScaleLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                    </div>

                    {/* TRANSPORT GROUP */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-md border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        <button 
                            onClick={props.togglePlay}
                            className={cn(
                                "flex items-center gap-1.5 px-3 h-full rounded text-xs font-bold transition-all",
                                props.isPlaying ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                            )}
                        >
                            {props.isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
                            {props.isPlaying ? "Stop" : "Play"}
                        </button>
                        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
                        <IconButton icon={Square} size="sm" onClick={() => { if(props.isPlaying) props.togglePlay(); }} className="rounded hover:bg-white/5 text-[var(--text-muted)]" title="Stop" />
                        <IconButton icon={LinkIcon} size="sm" onClick={props.onSnap} title="Quantize" className="rounded hover:bg-white/5 text-[var(--text-muted)]" />
                        <IconButton icon={Trash2} size="sm" variant="danger" onClick={props.onClear} title="Clear All" className="rounded hover:bg-red-500/10 text-red-400" />
                    </div>

                    {/* COMPLEXITY GROUP */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-md border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        {['triad', '7th', '9th', '11th'].map((c) => (
                            <button 
                                key={c} 
                                onClick={() => props.setComplexity(c as ChordComplexity)} 
                                className={cn(
                                    "px-2.5 h-full rounded text-[10px] font-bold uppercase transition-all border border-transparent", 
                                    props.complexity === c 
                                        ? "bg-[var(--accent)] text-black shadow-sm border-black/10" 
                                        : "text-[var(--text-dim)] hover:text-white hover:bg-white/5"
                                )}
                            >
                                {c.replace('triad', 'TRIAD').replace('th', 'TH')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex flex-wrap items-center gap-2">
                    {/* ANALYSIS STATS */}
                     <div className="hidden xl:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-element)] rounded border border-[var(--border)]">
                            <Music size={12} className="text-yellow-400" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">{props.analysis.vibe}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-element)] rounded border border-[var(--border)]">
                            <Layers size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">{props.analysis.texture}</span>
                        </div>
                    </div>

                    {/* VIEW TOGGLE */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-md border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        <button onClick={() => props.setView('sequencer')} className={cn("px-3 h-full rounded flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all", props.view === 'sequencer' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white hover:bg-white/5")}>
                            <ListMusic size={14} /> SEQ
                        </button>
                        <button onClick={() => props.setView('harmony')} className={cn("px-3 h-full rounded flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all", props.view === 'harmony' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white hover:bg-white/5")}>
                            <Network size={14} /> MAP
                        </button>
                    </div>

                     {/* INSTRUMENT TOGGLE */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-md border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm ml-2">
                        {[
                            { id: 'rhodes', icon: Square },
                            { id: 'pad', icon: Layers },
                            { id: 'pluck', icon: Music },
                            { id: 'synth', icon: Activity }
                        ].map(inst => (
                            <button 
                                key={inst.id} 
                                onClick={() => props.setInstrument(inst.id as InstrumentType)}
                                className={cn(
                                    "w-8 h-full rounded flex items-center justify-center transition-all border border-transparent", 
                                    props.instrument === inst.id 
                                        ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent)]/10" 
                                        : "text-[var(--text-dim)] hover:text-white hover:bg-white/5"
                                )}
                                title={inst.id}
                            >
                                <inst.icon size={16} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PALETTE */}
             <div className="flex-1 min-h-0 relative bg-[var(--bg-main)]/50">
                 <div className="absolute top-3 left-4 z-10">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest border border-[var(--border)] px-2 py-1 rounded bg-[var(--bg-element)] shadow-sm">Chord Palette</span>
                 </div>
                 <div className="h-full overflow-x-auto custom-scrollbar flex items-center px-4 pt-8 gap-2">
                    {props.availableChords.map((c, i) => (
                        <DraggableChord key={i} chord={c} className="h-10 w-auto min-w-[70px] bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] shadow-sm border border-[var(--border)]" />
                    ))}
                 </div>
            </div>
        </div>
    );
};
