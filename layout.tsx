
import React, { useState, useRef } from 'react';
import { Play, Square, ListMusic, Network, Pause, Magnet, Trash2, Lock, Unlock, Music, Activity, Layers, Hexagon } from 'lucide-react';
import { InstrumentType, SPLIT_CONSTANTS, ChordComplexity, Note, ScaleType, CIRCLE_KEYS } from './lib';
import { cn, Surface, IconButton, Badge, DataPoint } from './ui';

// --- LAYOUT COMPONENTS ---

interface PanelWrapperProps {
    minimise: number;
    isFull: boolean;
    bgColor: string;
    children: React.ReactNode;
    overlay: React.ReactNode;
    anchor: 'top' | 'bottom';
}

export const PanelWrapper = ({ minimise, isFull, bgColor, children, overlay, anchor }: PanelWrapperProps) => {
    const scale = 1 - (1 - (1 - minimise)) * 0.15;
    const blurRadius = minimise * 8;
    const borderRadius = isFull ? (minimise > 0 ? 32 : 0) : 32;

    return (
        <div 
            className="relative w-full h-full overflow-hidden interact-base"
            style={{
                borderRadius: `${borderRadius}px`,
                transform: `scale(${scale})`,
                transformOrigin: anchor === 'top' ? 'top center' : 'bottom center',
                backgroundColor: bgColor,
            }}
        >
            <div 
                className="w-full h-full interact-base relative"
                style={{
                    filter: `blur(${blurRadius}px)`,
                    opacity: Math.max(0, 1 - minimise * 1.5),
                    pointerEvents: minimise > 0.5 ? 'none' : 'auto'
                }}
            >
                {children}
            </div>
            
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none interact-base"
                style={{ opacity: Math.max(0, (minimise - 0.5) * 2) }}
            >
                {overlay}
            </div>
        </div>
    );
};

interface ResizableTopPanelProps {
    children: React.ReactNode;
    minHeight: number;
    maxHeight: number;
    defaultHeight: number;
}

export const ResizableTopPanel = ({ children, minHeight, maxHeight, defaultHeight }: ResizableTopPanelProps) => {
    const [height, setHeight] = useState(defaultHeight);
    const [isDragging, setIsDragging] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const startY = useRef<number>(0);
    const startHeight = useRef<number>(0);

    const handleDragStart = (e: React.PointerEvent) => {
        setIsDragging(true);
        startY.current = e.clientY;
        startHeight.current = height;
        (e.target as Element).setPointerCapture(e.pointerId);
        
        if (isCollapsed) {
            setIsCollapsed(false);
            setHeight(minHeight);
        }
    };

    const handleDragMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const delta = e.clientY - startY.current;
        const newHeight = Math.min(Math.max(startHeight.current + delta, minHeight), maxHeight);
        setHeight(newHeight);
    };

    const handleDragEnd = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };
    
    const toggleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div 
            className="w-full relative z-50 transition-all duration-500 ease-[var(--ease-spring)]"
            style={{ 
                height: isCollapsed ? 28 : height,
                marginBottom: isCollapsed ? 0 : 4
            }}
        >
            <div className={cn("w-full h-full overflow-hidden bg-[var(--bg-main)] relative transition-opacity duration-300", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
                {children}
            </div>

            {/* Drag Handle */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center cursor-row-resize z-50 group translate-y-1/2"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onDoubleClick={toggleCollapse}
            >
                <div className={cn(
                    "w-12 h-1 rounded-full transition-all duration-300", 
                    isDragging ? "bg-[var(--accent)] scale-x-150" : "bg-[var(--bg-element)] group-hover:bg-[var(--accent)]"
                )} />
            </div>
        </div>
    );
};

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
}

export const ControlPanel = (props: ControlPanelProps) => {
    return (
        <div className="w-full h-full bg-[var(--bg-main)] flex flex-col p-4 gap-4">
            
            {/* TOP ROW: Structure & Metadata */}
            <div className="flex items-start gap-4">
                {/* Key & Scale Group */}
                <Surface variant="element" className="flex items-center p-1 gap-1 shrink-0">
                    <div className="flex flex-col px-2">
                        <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Key Center</span>
                        <div className="flex items-center gap-2">
                            <select 
                                value={props.currentKey} 
                                onChange={(e) => props.setKey(e.target.value as Note)}
                                className="bg-transparent text-sm font-bold text-[var(--text-main)] outline-none cursor-pointer appearance-none hover:text-white"
                            >
                                {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <span className="text-[var(--border)]">/</span>
                            <select 
                                value={props.scale} 
                                onChange={(e) => props.setScale(e.target.value as ScaleType)}
                                className="bg-transparent text-sm font-medium text-[var(--text-muted)] outline-none cursor-pointer appearance-none hover:text-white w-24 truncate"
                            >
                                {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)] mx-1" />
                    <IconButton 
                        icon={props.isScaleLocked ? Lock : Unlock} 
                        size="sm"
                        onClick={props.toggleScaleLock}
                        active={props.isScaleLocked}
                        className={props.isScaleLocked ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}
                    />
                </Surface>

                {/* Analysis / Info */}
                <div className="flex-1 grid grid-cols-4 gap-2 h-[42px]">
                    <DataPoint label="Scale Vibe" value={props.scaleMeta.desc} icon={Music} color="text-yellow-400" />
                    <DataPoint label="Characteristic" value={props.scaleMeta.characteristic} icon={Hexagon} color="text-purple-400" />
                    <DataPoint label="Current Mood" value={props.analysis.vibe} icon={Activity} color="text-blue-400" />
                    <DataPoint label="Texture" value={props.analysis.texture} icon={Layers} color="text-emerald-400" />
                </div>
            </div>

            {/* BOTTOM ROW: Controls & Tools */}
            <div className="flex items-center gap-4 h-10">
                
                {/* Transport & Tools Group - COMPACT */}
                <Surface variant="element" className="flex items-center p-1 gap-1 h-full">
                    <IconButton 
                        onClick={props.togglePlay} 
                        icon={props.isPlaying ? Pause : Play} 
                        active={props.isPlaying}
                        className={props.isPlaying ? "text-[var(--accent)] animate-pulse" : "text-[var(--text-main)]"}
                    />
                    <div className="w-px h-4 bg-[var(--border)] mx-1" />
                    <IconButton onClick={props.onRest} icon={Pause} className="rotate-90" title="Add Rest" />
                    <IconButton onClick={props.onSnap} icon={Magnet} title="Quantize" />
                    <IconButton onClick={props.onClear} icon={Trash2} variant="danger" title="Clear All" />
                </Surface>

                {/* Meter & Harmony */}
                <Surface variant="element" className="flex items-center p-1 gap-1 h-full">
                    <div className="flex items-center gap-2 px-3 border-r border-[var(--border)]">
                         <span className="text-[10px] font-bold text-[var(--text-dim)]">4/4</span>
                    </div>
                    <div className="flex p-0.5 gap-0.5">
                        {['triad', '7th', '9th', '11th'].map((c) => (
                            <button
                                key={c}
                                onClick={() => props.setComplexity(c as ChordComplexity)}
                                className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold uppercase transition-all",
                                    props.complexity === c 
                                        ? "bg-[var(--accent)] text-black shadow-sm" 
                                        : "text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-white"
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </Surface>
                
                <div className="flex-1" />

                {/* View & Instrument */}
                <Surface variant="ghost" className="flex items-center gap-2 h-full">
                    <div className="flex bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)]">
                        <button 
                            onClick={() => props.setView('sequencer')}
                            className={cn("px-3 py-1.5 rounded-md flex items-center gap-2 text-[10px] font-bold uppercase transition-all", props.view === 'sequencer' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white")}
                        >
                            <ListMusic size={12} /> Sequencer <Badge>{props.progressionCount}</Badge>
                        </button>
                        <button 
                            onClick={() => props.setView('harmony')}
                            className={cn("px-3 py-1.5 rounded-md flex items-center gap-2 text-[10px] font-bold uppercase transition-all", props.view === 'harmony' ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white")}
                        >
                            <Network size={12} /> Harmony
                        </button>
                    </div>
                    
                    <div className="flex bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)]">
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
                                    "p-1.5 rounded-md transition-all hover:bg-[var(--bg-surface)]",
                                    props.instrument === inst.id ? "text-[var(--accent)] bg-[var(--bg-surface)] shadow-sm" : "text-[var(--text-dim)]"
                                )}
                                title={inst.id}
                            >
                                <inst.icon size={14} />
                            </button>
                        ))}
                    </div>
                </Surface>
            </div>
        </div>
    );
};

// --- SPLIT VIEW ---

interface SplitViewProps {
    top: React.ReactNode;
    bottom: React.ReactNode;
    topOverlay?: React.ReactNode;
    bottomOverlay?: React.ReactNode;
}

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: SplitViewProps) => {
    const [split, setSplit] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.PointerEvent) => {
        setIsDragging(true);
        (e.target as Element).setPointerCapture(e.pointerId);
        e.preventDefault();
    };

    const handleDragMove = (e: React.PointerEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const rawPercent = y / rect.height;
        
        // Detents
        let newSplit = rawPercent;
        const detents = [
            { val: SPLIT_CONSTANTS.lil / rect.height, snap: SPLIT_CONSTANTS.snapThreshold / 2 }, // Top Mini
            { val: 1 - (SPLIT_CONSTANTS.lil / rect.height), snap: SPLIT_CONSTANTS.snapThreshold / 2 }, // Bottom Mini
            { val: 0.5, snap: 0.05 } // Center
        ];

        for (const d of detents) {
            if (Math.abs(rawPercent - d.val) < d.snap) {
                newSplit = d.val;
                break;
            }
        }

        setSplit(Math.max(0.1, Math.min(0.9, newSplit)));
    };

    const handleDragEnd = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    // Calculate minimized states based on split position
    const topMinimised = split < 0.2 ? 1 - (split / 0.2) : 0;
    const bottomMinimised = split > 0.8 ? (split - 0.8) / 0.2 : 0;

    return (
        <div ref={containerRef} className="absolute inset-0 flex flex-col bg-black p-2 gap-2 touch-none select-none">
            {/* TOP PANEL */}
            <div className="relative min-h-0 transition-[height] duration-75 ease-out will-change-[height,flex]" style={{ flex: split }}>
                <PanelWrapper minimise={topMinimised} isFull={split > 0.9} bgColor="var(--bg-panel)" overlay={topOverlay} anchor="bottom">
                    {top}
                </PanelWrapper>
            </div>

            {/* DRAGGER */}
            <div 
                className="relative h-1 shrink-0 flex items-center justify-center cursor-row-resize z-50 group interact-base"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
            >
                <div className={cn(
                    "w-12 h-1 rounded-full transition-all duration-300", 
                    isDragging ? "bg-[var(--accent)] scale-x-150" : "bg-[var(--bg-element)] group-hover:bg-[var(--accent)]"
                )} />
                
                {/* Center Snap Indicator */}
                <div className={cn(
                    "absolute w-full border-t border-[var(--accent)] border-dashed opacity-0 pointer-events-none transition-opacity",
                    Math.abs(split - 0.5) < 0.01 && isDragging && "opacity-50"
                )} />
            </div>

            {/* BOTTOM PANEL */}
            <div className="relative min-h-0 transition-[height] duration-75 ease-out will-change-[height,flex]" style={{ flex: 1 - split }}>
                <PanelWrapper minimise={bottomMinimised} isFull={split < 0.1} bgColor="var(--bg-panel)" overlay={bottomOverlay} anchor="top">
                    {bottom}
                </PanelWrapper>
            </div>
        </div>
    );
};
