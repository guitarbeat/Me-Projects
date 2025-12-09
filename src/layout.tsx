
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { cn, IconButton } from './ui';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useStore, ScaleType, CIRCLE_KEYS } from './lib';
import { ChordPalette } from './sequencer';
import { 
    Play, Pause, Lock, Unlock, Link as LinkIcon, Trash2, 
    ListMusic, Network, Cloud, Keyboard, Music2, Zap, Gauge,
    ChevronsUp, ChevronsDown, ChevronUp, ChevronDown, MoreHorizontal
} from 'lucide-react';

// --- SHARED LAYOUT LOGIC ---

/**
 * Hook to calculate consistent layout metrics (padding, radius, gap)
 * based on container size, ensuring all panels behave responsively.
 */
function useDynamicLayout(ref: React.RefObject<HTMLElement>) {
    const [metrics, setMetrics] = useState({ radius: 24, padding: 12, gap: 8 });
    
    useLayoutEffect(() => {
        const update = () => {
            // Use window as fallback if ref not ready, but prefer ref for container-aware context
            const w = ref.current?.offsetWidth || window.innerWidth;
            const h = ref.current?.offsetHeight || window.innerHeight;
            const minDim = Math.min(w, h);
            
            // Dynamic scaling logic
            const radius = Math.max(16, Math.min(32, minDim * 0.05));
            const padding = Math.max(8, Math.min(20, minDim * 0.025));
            
            setMetrics({ 
                radius, 
                padding, 
                gap: Math.max(4, padding / 2) 
            });
        };

        const obs = new ResizeObserver(update);
        if (ref.current) obs.observe(ref.current);
        window.addEventListener('resize', update);
        update(); // Initial call
        
        return () => {
            obs.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    return metrics;
}

// --- STYLED COMPONENTS ---

interface HandleProps {
    className?: string;
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
}

const Handle = ({ className, vertical = false, isDragging, collapsed, onToggle }: HandleProps) => (
    <PanelResizeHandle className={cn("group flex items-center justify-center z-50 outline-none touch-none transition-all", vertical ? "w-5 h-full cursor-col-resize -mx-2.5" : "h-6 w-full cursor-row-resize -my-3", className)}>
        <div 
            onClick={(e) => { 
                // Only trigger toggle if strictly clicking the pill, not dragging
                if (onToggle) {
                    e.stopPropagation();
                    onToggle();
                }
            }}
            className={cn(
            "rounded-full bg-[var(--bg-element)] backdrop-blur-md border border-[var(--border)] transition-all duration-300 shadow-sm flex items-center justify-center",
            "group-hover:bg-[var(--bg-surface)] group-hover:border-[var(--accent)] group-hover:scale-105 cursor-pointer",
            "group-active:bg-[var(--accent)] group-active:border-[var(--accent)] group-active:scale-110 group-active:shadow-[0_0_15px_var(--accent)]",
            vertical 
                ? "w-1.5 h-12 group-hover:h-16" 
                : "h-3 w-16 group-hover:w-24 group-hover:h-5"
        )}>
            {!vertical && onToggle && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)] duration-200">
                    {collapsed ? <ChevronDown size={12} strokeWidth={3} /> : <ChevronUp size={12} strokeWidth={3} />}
                </div>
            )}
        </div>
    </PanelResizeHandle>
);

// --- RESIZABLE TOP PANEL ---

export const ResizableTopPanel = ({ 
    children, 
    minHeight = 80, 
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

    // Auto-stabilize height on window resize
    useEffect(() => {
        const handleResize = () => {
            const safeMax = window.innerHeight * 0.6; 
            if (height > safeMax && !isCollapsed) {
                setHeight(safeMax);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [height, isCollapsed]);

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const delta = e.clientY - startY.current;
            const absoluteMax = Math.min(maxHeight, window.innerHeight * 0.7);
            
            // If dragging, we are not collapsed
            if (isCollapsed) setIsCollapsed(false);

            const newHeight = Math.max(minHeight, Math.min(absoluteMax, startHeight.current + delta));
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
    }, [isDragging, minHeight, maxHeight, isCollapsed]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        startY.current = e.clientY;
        startHeight.current = height;
    };

    const toggleCollapse = () => {
        if (isCollapsed) {
            setHeight(lastHeight);
            setIsCollapsed(false);
        } else {
            setLastHeight(height);
            setHeight(minHeight);
            setIsCollapsed(true);
        }
    };

    // Shared Card Style
    const containerStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        boxShadow: '0 0 0 1px var(--border), 0 10px 40px -10px rgba(0,0,0,0.5)',
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    return (
        <div 
            ref={wrapperRef} 
            style={{ height: isCollapsed ? minHeight : height }} 
            className="relative z-30 shrink-0 transition-[height] duration-400 cubic-bezier(0.16, 1, 0.3, 1) will-change-[height]"
        >
            <div 
                className="absolute inset-0 transition-all duration-300" 
                style={{ 
                    padding: `${padding}px`, 
                    paddingBottom: isCollapsed ? `${padding}px` : `${gap}px` 
                }}
            >
                <div className="h-full w-full bg-[var(--bg-panel)] overflow-hidden relative group" style={containerStyle}>
                    {children}
                </div>
            </div>

            {/* Custom Resize Handle / Minimize Toggle */}
            <div 
                onMouseDown={handleMouseDown}
                onDoubleClick={toggleCollapse}
                className="absolute bottom-0 left-0 right-0 h-5 cursor-row-resize flex items-center justify-center group z-50 hover:bg-transparent -mb-2.5 touch-none"
            >
                <div 
                    onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                    className={cn(
                        "rounded-full bg-[var(--bg-element)] backdrop-blur-md border border-[var(--border)] transition-all duration-300 shadow-sm flex items-center justify-center",
                        "group-hover:bg-[var(--bg-surface)] group-hover:border-[var(--accent)] group-hover:scale-105 cursor-pointer",
                        "active:scale-95",
                        isDragging ? "bg-[var(--accent)] w-24 h-4 shadow-[0_0_10px_var(--accent)]" : "h-1.5 w-16 group-hover:h-4 group-hover:w-20"
                    )}
                >
                    <div className={cn("transition-opacity duration-200 text-[var(--accent)]", isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100")}>
                        {isCollapsed ? <ChevronDown size={12} strokeWidth={3}/> : <ChevronUp size={12} strokeWidth={3}/>}
                    </div>
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

    const containerStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        boxShadow: '0 0 0 1px var(--border), 0 20px 50px -10px rgba(0,0,0,0.8)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    return (
        <div ref={containerRef} className="h-full w-full bg-[var(--bg-main)] overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)] blur-[150px] rounded-full mix-blend-screen opacity-10 animate-pulse" style={{animationDuration:'10s'}}/>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500 blur-[200px] rounded-full mix-blend-screen opacity-5" />
            </div>

            <PanelGroup direction="vertical" className="relative z-10">
                <Panel defaultSize={55} minSize={20} className="relative transition-all duration-300">
                    <div className="absolute inset-0" style={{ padding: `${padding}px`, paddingBottom: `${gap}px` }}>
                        <div className="h-full w-full bg-[var(--bg-panel)] border-none overflow-hidden relative group" style={containerStyle}>
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
                    <div className="absolute inset-0" style={{ padding: `${padding}px`, paddingTop: `${gap}px` }}>
                        <div className="h-full w-full bg-[var(--bg-panel)] border-none overflow-hidden relative group" style={containerStyle}>
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

    return (
        <div className="w-full h-full flex flex-col select-none font-sans text-[var(--text-main)]">
            
            {/* PRIMARY TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 gap-3 min-h-[56px] relative z-20 bg-[var(--bg-panel)]">
                
                 {/* GROUP 1: GLOBAL SETTINGS */}
                 <div className="flex items-center gap-2 sm:gap-4">
                    {/* App Title / Theme */}
                    <button 
                        onClick={toggleTheme} 
                        className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-all outline-none group bg-[var(--bg-element)]/50 p-1.5 pr-3 rounded-full border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-element)] hover:shadow-sm"
                        title="Toggle Theme"
                    >
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isPlaying ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] scale-110" : "bg-[var(--text-dim)] group-hover:bg-[var(--text-main)]")} />
                        <span className="text-[10px] font-black tracking-widest uppercase hidden md:block">Harmonic</span>
                    </button>
                    
                    <div className="w-px h-6 bg-[var(--border)] opacity-50" />

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
                <div className="flex items-center gap-3">
                    
                    {/* Complexity Selector */}
                     <div className="hidden xl:flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] p-0.5 h-8 shadow-sm gap-0.5">
                        {['triad', '7th', '9th', '11th'].map((c) => (
                            <button 
                                key={c} 
                                onClick={() => setComplexity(c as any)} 
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
                        {[
                            { id: 'rhodes', icon: Keyboard, label: 'Keys' },
                            { id: 'pad', icon: Cloud, label: 'Pad' },
                            { id: 'pluck', icon: Music2, label: 'Pluck' },
                            { id: 'synth', icon: Zap, label: 'Synth' }
                        ].map(inst => (
                            <button 
                                key={inst.id} 
                                onClick={() => setInstrument(inst.id as any)}
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
