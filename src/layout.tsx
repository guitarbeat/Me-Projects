
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { cn, IconButton } from './ui';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useStore, ScaleType, CIRCLE_KEYS, InstrumentType, ChordComplexity } from './lib';
import { ChordPalette } from './sequencer';
import { 
    Play, Pause, Lock, Unlock, Link as LinkIcon, Trash2, 
    ListMusic, Network, Cloud, Keyboard, Music2, Zap, Gauge,
    ChevronsUp, ChevronsDown, ChevronUp, ChevronDown,
    MoreHorizontal
} from 'lucide-react';

// --- SHARED LAYOUT LOGIC ---

/**
 * Hook to calculate consistent layout metrics (padding, radius, gap)
 * based on container size, ensuring all panels behave responsively.
 */
function useDynamicLayout(ref: React.RefObject<HTMLElement>) {
    const [metrics, setMetrics] = useState({ radius: 24, padding: 12, gap: 8 });
    
    useEffect(() => {
        const update = () => {
            if (!ref.current) return;
            const w = ref.current.offsetWidth;
            const h = ref.current.offsetHeight;
            const minDim = Math.min(w, h);
            
            // Dynamic scaling logic: Tighter on small screens, spacious on large
            // Adjusted for better "island" separation
            const radius = Math.max(16, Math.min(28, minDim * 0.05));
            const padding = Math.max(8, Math.min(20, minDim * 0.025));
            
            setMetrics({ 
                radius, 
                padding, 
                gap: Math.max(4, padding * 0.5) 
            });
        };

        // Initial update
        update();

        const obs = new ResizeObserver(() => {
            requestAnimationFrame(update);
        });
        
        if (ref.current) {
            obs.observe(ref.current);
        }
        
        return () => obs.disconnect();
    }, [ref]);

    return metrics;
}

// --- STYLED HANDLE ---

interface HandleProps {
    className?: string;
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
}

const Handle = ({ className, vertical = false, isDragging, collapsed, onToggle }: HandleProps) => {
    return (
        <PanelResizeHandle className={cn("group flex items-center justify-center z-50 outline-none touch-none transition-all focus:outline-none", vertical ? "w-5 h-full cursor-col-resize -mx-2.5" : "h-6 w-full cursor-row-resize -my-3", className)}>
            <div 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => { 
                    if (onToggle) {
                        e.stopPropagation();
                        e.preventDefault(); 
                        onToggle();
                    }
                }}
                className={cn(
                    "rounded-full bg-[var(--bg-element)] backdrop-blur-md border border-[var(--border)] transition-all duration-300 shadow-sm flex items-center justify-center relative overflow-hidden",
                    "group-hover:bg-[var(--bg-surface)] group-hover:border-[var(--accent)] group-hover:scale-105 cursor-pointer",
                    "active:scale-95",
                    vertical 
                        ? "w-1.5 h-12 group-hover:h-16" 
                        : "h-1.5 w-16 group-hover:w-24 group-hover:h-5",
                    (isDragging || collapsed) && !vertical && "w-24 h-5 bg-[var(--accent)] border-[var(--accent)]"
                )}
            >
                {/* Visual Indicator for Toggle */}
                {!vertical && onToggle && (
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity duration-200 text-black", 
                        (collapsed || isDragging || className?.includes('hover')) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                        {collapsed ? <MoreHorizontal size={14} strokeWidth={3} /> : <ChevronUp size={12} strokeWidth={3} />}
                    </div>
                )}
                
                {/* Drag Indicator (Dots) - visible when not hovering/active */}
                {!collapsed && !isDragging && !className?.includes('hover') && (
                     <div className={cn("flex gap-0.5 opacity-0 group-hover:opacity-0 transition-opacity duration-200", !vertical && "flex-row", vertical && "flex-col")}>
                         <div className="w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
                         <div className="w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
                         <div className="w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]" />
                     </div>
                )}
            </div>
        </PanelResizeHandle>
    );
};

// --- RESIZABLE TOP PANEL ---

export const ResizableTopPanel = ({ 
    children, 
    minHeight = 110, 
    maxHeight = 400, 
    defaultHeight = 180 
}: { 
    children: React.ReactNode, 
    minHeight?: number, 
    maxHeight?: number, 
    defaultHeight?: number 
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(defaultHeight);
    const [lastHeight, setLastHeight] = useState(defaultHeight);
    const [isDragging, setIsDragging] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Drag State Refs
    const startY = useRef(0);
    const startHeight = useRef(0);
    
    // Layout Metrics
    const { radius, padding, gap } = useDynamicLayout(wrapperRef);

    // Calculate minimized dimensions
    // When collapsed, we want it to be basically just padding + handle area.
    // Let's say handle area is ~12px visual height, plus padding top/bottom.
    const collapsedHeight = padding * 2 + 16; 

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            
            // Calculate delta
            const delta = e.clientY - startY.current;
            const absoluteMax = Math.min(maxHeight, window.innerHeight * 0.7);
            
            // Allow dragging down to minHeight, but not into collapsed zone manually unless handled separately
            // Actually, let's allow dragging to resize.
            const newHeight = Math.max(minHeight, Math.min(absoluteMax, startHeight.current + delta));
            
            setHeight(newHeight);
            
            if (isCollapsed && Math.abs(delta) > 5) {
                setIsCollapsed(false);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Snap logic: if dragged too small, just clamp to minHeight
                if (height < minHeight) {
                    setHeight(minHeight);
                    setIsCollapsed(false); // dragging usually implies user wants to see it
                } else {
                    setLastHeight(height);
                }
            }
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
    }, [isDragging, minHeight, maxHeight, isCollapsed, height]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        startY.current = e.clientY;
        startHeight.current = isCollapsed ? collapsedHeight : height;
        if (isCollapsed) {
             setIsCollapsed(false);
             setHeight(lastHeight);
        }
    };

    const toggleCollapse = useCallback(() => {
        if (isCollapsed) {
            // Expand
            setHeight(Math.max(lastHeight, minHeight));
            setIsCollapsed(false);
        } else {
            // Collapse
            setLastHeight(height);
            setHeight(collapsedHeight);
            setIsCollapsed(true);
        }
    }, [isCollapsed, height, lastHeight, minHeight, collapsedHeight]);

    // Shared Card Style
    const containerStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        boxShadow: '0 0 0 1px var(--border), 0 4px 20px -5px rgba(0,0,0,0.3)',
        // Hardware acceleration to fix anti-aliasing clipping
        transform: 'translate3d(0,0,0)',
        isolation: 'isolate', 
        transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.2s',
    };

    return (
        <div 
            ref={wrapperRef} 
            style={{ height: height }} 
            className="relative z-30 shrink-0 w-full transition-[height] duration-400 cubic-bezier(0.16, 1, 0.3, 1) will-change-[height]"
        >
            <div 
                className="absolute inset-0 transition-all duration-300" 
                style={{ 
                    padding: `${padding}px`, 
                    paddingBottom: isCollapsed ? `${padding}px` : `${gap}px` 
                }}
            >
                <div className="h-full w-full bg-[var(--bg-panel)] overflow-hidden relative group" style={containerStyle}>
                    <div className={cn("h-full w-full transition-opacity duration-300 delay-75", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
                        {children}
                    </div>
                </div>
            </div>

            {/* Manual Resize Handle with Toggle */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-5 cursor-row-resize flex items-center justify-center z-50 -mb-2.5"
                onMouseDown={handleMouseDown}
            >
                 <div 
                    onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                    className={cn(
                        "h-1.5 w-16 rounded-full bg-[var(--bg-element)] border border-[var(--border)] shadow-sm flex items-center justify-center transition-all duration-300",
                        "hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:w-24 hover:h-5 hover:text-black",
                        isDragging ? "w-24 h-5 bg-[var(--accent)] border-[var(--accent)] text-black" : "text-transparent",
                        isCollapsed && "bg-[var(--accent)] border-[var(--accent)] w-16 h-1.5 text-black hover:scale-110"
                    )}
                >
                     {isCollapsed ? null : <ChevronUp size={12} strokeWidth={3}/>}
                </div>
            </div>
        </div>
    );
};

// --- RESPONSIVE SPLIT VIEW ---

interface SplitViewProps {
    top: React.ReactNode;
    bottom: React.ReactNode;
    topOverlay?: React.ReactNode;
    bottomOverlay?: React.ReactNode;
}

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: SplitViewProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { radius, padding, gap } = useDynamicLayout(containerRef);

    const cardStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        boxShadow: '0 0 0 1px var(--border), 0 10px 40px -10px rgba(0,0,0,0.5)',
        // Hardware acceleration ensures border-radius clips children properly
        transform: 'translate3d(0,0,0)', 
        isolation: 'isolate',
        transition: 'border-radius 0.2s',
    };

    return (
        <div ref={containerRef} className="h-full w-full bg-[var(--bg-main)] overflow-hidden relative">
            
            <PanelGroup direction="vertical" className="relative z-10">
                <Panel defaultSize={55} minSize={20} className="relative transition-all duration-300">
                    <div className="absolute inset-0 transition-all duration-300" style={{ padding: `${padding}px`, paddingBottom: `${gap}px` }}>
                        <div className="h-full w-full bg-[var(--bg-panel)] border-none overflow-hidden relative group" style={cardStyle}>
                            {top}
                            {topOverlay && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 w-auto max-w-[90%] flex justify-center">
                                    <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-soft)] p-2 rounded-full shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-500">
                                        {topOverlay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Panel>
                
                <Handle />

                <Panel defaultSize={45} minSize={20} className="relative transition-all duration-300">
                    <div className="absolute inset-0 transition-all duration-300" style={{ padding: `${padding}px`, paddingTop: `${gap}px` }}>
                        <div className="h-full w-full bg-[var(--bg-panel)] border-none overflow-hidden relative group" style={cardStyle}>
                            {bottom}
                            {bottomOverlay && (
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 w-auto max-w-[90%] flex justify-center">
                                    <div className="bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-soft)] p-2 rounded-full shadow-2xl animate-in slide-in-from-top-2 fade-in duration-500">
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

// --- CONTROL PANEL COMPONENT ---

export const ControlPanel = () => {
    const { 
        isPlaying, togglePlay, 
        complexity, setComplexity,
        handleProgression,
        key: currentKey, setKey, 
        scale, setScale, 
        isScaleLocked, toggleScaleLock,
        instrument, setInstrument, 
        view, setView,
        bpm, setBpm,
        toggleTheme
    } = useStore();

    const instruments: { id: InstrumentType, icon: any, label: string }[] = [
        { id: 'rhodes', icon: Keyboard, label: 'Keys' },
        { id: 'pad', icon: Cloud, label: 'Pad' },
        { id: 'pluck', icon: Music2, label: 'Pluck' },
        { id: 'synth', icon: Zap, label: 'Synth' }
    ];

    return (
        <div className="w-full h-full flex flex-col select-none font-sans text-[var(--text-main)]">
            
            {/* PRIMARY TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between px-3 py-3 gap-2 min-h-[56px] relative z-20 bg-[var(--bg-panel)] shrink-0">
                
                 {/* GROUP 1: GLOBAL SETTINGS */}
                 <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                    {/* App Title / Theme */}
                    <button 
                        onClick={toggleTheme} 
                        className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-all outline-none group bg-[var(--bg-element)] p-1.5 pr-3 rounded-full border border-transparent hover:border-[var(--border)]"
                        title="Toggle Theme"
                    >
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isPlaying ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] scale-110" : "bg-[var(--text-dim)] group-hover:bg-[var(--text-main)]")} />
                        <span className="text-[10px] font-black tracking-widest uppercase hidden md:block">Harmonic</span>
                    </button>
                    
                    <div className="w-px h-6 bg-[var(--border)] opacity-50 hidden sm:block" />

                    {/* Musical Context Group */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] shadow-sm p-0.5 h-8 transition-all hover:border-[var(--border-hover)]">
                            <div className="px-1 border-r border-[var(--border)] h-full flex items-center hover:bg-[var(--bg-surface)] rounded-l transition-colors">
                                <select 
                                    value={currentKey} 
                                    onChange={(e: any) => setKey(e.target.value)} 
                                    className="bg-transparent font-bold text-xs outline-none cursor-pointer text-[var(--text-main)] hover:text-[var(--accent)] appearance-none text-center min-w-[32px] h-full"
                                    title="Root Key"
                                >
                                    {CIRCLE_KEYS.map((k: string) => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="px-2 h-full flex items-center justify-center min-w-[90px] hover:bg-[var(--bg-surface)] transition-colors relative group/scale">
                                <select 
                                    value={scale} 
                                    onChange={(e: any) => setScale(e.target.value)} 
                                    disabled={isScaleLocked} 
                                    className="bg-transparent text-[10px] font-bold text-[var(--text-muted)] outline-none cursor-pointer w-full hover:text-[var(--text-main)] appearance-none py-1 uppercase tracking-wide"
                                    title="Scale Type"
                                >
                                    {Object.values(ScaleType).map((s: any) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={toggleScaleLock}
                                className={cn("px-2.5 h-full flex items-center justify-center transition-all hover:bg-[var(--bg-surface)] border-l border-[var(--border)] rounded-r", isScaleLocked ? "text-[var(--accent)] bg-[var(--accent)]/5" : "text-[var(--text-dim)]")}
                                title={isScaleLocked ? "Scale Locked" : "Scale Unlocked"}
                            >
                                {isScaleLocked ? <Lock size={10} strokeWidth={2.5} /> : <Unlock size={10} />}
                            </button>
                        </div>

                        {/* Tempo */}
                        <div className="flex items-center gap-2 bg-[var(--bg-element)] rounded-lg border border-[var(--border)] px-2.5 h-8 shadow-sm group hover:border-[var(--accent)]/50 hover:shadow-[0_0_10px_var(--accent)_inset] transition-all cursor-text">
                            <Gauge size={12} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors" />
                            <input 
                                type="number" 
                                value={bpm} 
                                onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value)||120)))}
                                className="bg-transparent text-[10px] font-mono font-bold text-center outline-none text-[var(--text-main)] w-[3ch] appearance-none"
                                title="BPM"
                            />
                        </div>
                    </div>
                </div>

                {/* GROUP 2: ACTION & TOOLS */}
                <div className="flex items-center gap-3 ml-auto">
                    
                    {/* Complexity Selector */}
                     <div className="hidden xl:flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] p-0.5 h-8 shadow-sm gap-0.5">
                        {(['triad', '7th', '9th', '11th'] as ChordComplexity[]).map((c) => (
                            <button 
                                key={c} 
                                onClick={() => setComplexity(c)} 
                                className={cn(
                                    "px-3 h-full rounded-md text-[9px] font-bold uppercase transition-all border border-transparent", 
                                    complexity === c 
                                        ? "bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm border-[var(--border)]" 
                                        : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                                )}
                            >
                                {c.replace('triad', 'Triad').replace('th', '')}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-[var(--border)] hidden sm:block opacity-50" />

                    {/* Transport Controls */}
                    <div className="flex items-center gap-1 bg-[var(--bg-element)] rounded-lg border border-[var(--border)] p-0.5 h-8 shadow-sm">
                        <button 
                            onClick={togglePlay}
                            className={cn(
                                "flex items-center gap-2 px-3 h-full rounded-md text-[10px] font-bold transition-all border border-transparent active:scale-95",
                                isPlaying 
                                    ? "bg-[var(--accent)] text-black shadow-[0_2px_10px_var(--accent)] hover:brightness-110" 
                                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                            )}
                        >
                            {isPlaying ? <Pause size={10} fill="currentColor"/> : <Play size={10} fill="currentColor"/>}
                            <span className="hidden sm:inline tracking-wider">{isPlaying ? "STOP" : "PLAY"}</span>
                        </button>
                        
                        <div className="w-px h-4 bg-[var(--border)] mx-1" />
                        
                        <IconButton icon={LinkIcon} size="md" onClick={() => handleProgression('quantize')} title="Quantize" className="rounded-md h-full w-8 hover:bg-[var(--bg-surface)] text-[var(--text-dim)] hover:text-[var(--text-main)]" />
                        <IconButton icon={Trash2} size="md" variant="danger" onClick={() => handleProgression('clear')} title="Clear Sequence" className="rounded-md h-full w-8 hover:bg-red-500/10" />
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW: PALETTE & VIEW CONTROLS */}
            <div className="flex-1 min-h-0 flex bg-[var(--bg-main)]/30 border-t border-[var(--border)]">
                {/* Responsive Palette: Grows into available space */}
                <div className="flex-1 min-w-0 bg-[var(--bg-soft)]/20 relative">
                     <div className="absolute inset-0">
                        <ChordPalette className="p-3" />
                     </div>
                </div>

                {/* Right Sidebar Tools */}
                <div className="shrink-0 flex flex-col gap-3 px-3 py-3 border-l border-[var(--border)] bg-[var(--bg-panel)]/50 backdrop-blur-sm overflow-y-auto w-[68px] items-center">
                     {/* View Toggles */}
                    <div className="flex flex-col gap-2 w-full">
                        <button 
                            onClick={() => setView('sequencer')} 
                            title="Sequencer View"
                            className={cn(
                                "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300", 
                                view === 'sequencer' 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-md border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <ListMusic size={20} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={() => setView('harmony')} 
                            title="Harmonic Map View"
                            className={cn(
                                "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300", 
                                view === 'harmony' 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-md border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <Network size={20} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="h-px w-8 bg-[var(--border)]" />

                     {/* Instrument Selector */}
                    <div className="flex flex-col gap-2 w-full">
                        {instruments.map(inst => (
                            <button 
                                key={inst.id} 
                                onClick={() => setInstrument(inst.id)}
                                className={cn(
                                    "w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 border border-transparent", 
                                    instrument === inst.id 
                                        ? "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20 shadow-sm" 
                                        : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]"
                                )}
                                title={inst.label}
                            >
                                <inst.icon size={18} strokeWidth={1.5} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
