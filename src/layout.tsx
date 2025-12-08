
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Play, Pause, Square, Zap, Cloud, Music2, Keyboard, Lock, Unlock, Link as LinkIcon, Trash2, Network, ListMusic, Layers, Music, Gauge, Activity, Sun, Moon } from 'lucide-react';
import { InstrumentType, Note, ScaleType, CIRCLE_KEYS, ChordComplexity } from './lib';
import { cn, IconButton, Breadcrumbs } from './ui';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useStore, useDerivedData } from './lib';

const Handle = ({ className }: { className?: string }) => (
    <PanelResizeHandle className={cn("group flex h-4 w-full items-center justify-center -my-2 z-50 cursor-row-resize outline-none touch-none", className)}>
        <div className="absolute inset-x-4 h-px bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
        <div className="relative z-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-full p-0.5 text-[var(--text-dim)] transition-all shadow-sm group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:scale-110">
            <ChevronsUpDown size={12} strokeWidth={2.5} />
        </div>
    </PanelResizeHandle>
);

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
        const handleMouseUp = () => { setIsDragging(false); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
        if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); document.body.style.cursor = 'row-resize'; document.body.style.userSelect = 'none'; }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isDragging, minHeight, maxHeight]);

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); startY.current = e.clientY; startHeight.current = height; };

    return (
        <div style={{ height }} className="relative z-20 bg-[var(--bg-main)] border-b border-[var(--border)] shadow-lg flex flex-col shrink-0">
            <div className="flex-1 overflow-hidden">{children}</div>
            <div onMouseDown={handleMouseDown} className="absolute bottom-0 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center group z-50 hover:bg-[var(--bg-soft-hover)] transition-colors -mb-1.5">
                <div className="w-12 h-1 rounded-full bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
            </div>
        </div>
    );
};

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: { top: React.ReactNode, bottom: React.ReactNode, topOverlay?: React.ReactNode, bottomOverlay?: React.ReactNode }) => {
    return (
        <div className="h-full w-full">
            <PanelGroup direction="vertical">
                <Panel defaultSize={50} minSize={20} className="relative">
                    <div className="absolute inset-0 p-1 pb-0.5">
                        <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-t-xl overflow-hidden relative">
                            {top}
                             {topOverlay && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20"><div className="bg-[var(--bg-glass)] backdrop-blur border border-[var(--border-soft)] p-2 rounded-lg shadow-xl">{topOverlay}</div></div>}
                        </div>
                    </div>
                </Panel>
                <Handle />
                <Panel defaultSize={50} minSize={20} className="relative">
                    <div className="absolute inset-0 p-1 pt-0.5">
                        <div className="h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-b-xl overflow-hidden relative">
                            {bottom}
                             {bottomOverlay && <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20"><div className="bg-[var(--bg-glass)] backdrop-blur border border-[var(--border-soft)] p-2 rounded-lg shadow-xl">{bottomOverlay}</div></div>}
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export const ControlPanel = () => {
    const { isPlaying, togglePlay, complexity, setComplexity, handleProgression, key: currentKey, setKey, scale, setScale, isScaleLocked, toggleScaleLock, instrument, setInstrument, view, setView, bpm, setBpm, progression, playIndex, theme, toggleTheme } = useStore();
    const { analysis } = useDerivedData();
    const currentChord = isPlaying && playIndex !== null && progression[playIndex] ? progression[playIndex] : null;

    return (
        <div className="w-full h-full flex flex-col select-none bg-[var(--bg-main)] relative">
            {/* STATUS BAR */}
            <div className="h-7 w-full border-b border-[var(--border)] bg-[var(--bg-main)] flex items-center px-3 gap-2 shrink-0">
                <Breadcrumbs items={[{ label: 'Harmonic Studio', onClick: () => {} }, { label: `${currentKey} ${scale}`, onClick: () => {} }, { label: view, active: true }]} />
                <div className="flex-1" />
                <button onClick={toggleTheme} className="p-1 rounded hover:bg-[var(--bg-soft-hover)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors mr-2" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                </button>
                <div className="flex items-center gap-2 text-[9px] text-[var(--text-dim)] font-mono">
                    <span className="opacity-50">V 1.2.0</span>
                    <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", isPlaying ? "bg-green-500 animate-pulse" : "bg-[var(--border)]")}/>
                </div>
            </div>

            {/* HEADER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between p-3 gap-3 border-b border-[var(--border)] bg-[var(--bg-main)] min-h-[56px] relative z-20">
                <div className="flex flex-wrap items-center gap-2">
                    {/* KEY / SCALE */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 shadow-sm">
                        <div className="px-3 flex items-center gap-2 border-r border-[var(--border)] h-full bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] transition-colors">
                            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-wider">Key</span>
                            <div className="relative">
                                <select value={currentKey} onChange={e => setKey(e.target.value as Note)} className="bg-transparent font-bold text-sm outline-none cursor-pointer text-[var(--text-main)] hover:text-[var(--accent)] appearance-none text-center min-w-[20px] z-10 relative">
                                    {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="px-3 h-full flex items-center justify-center min-w-[100px] hover:bg-[var(--bg-surface)] transition-colors">
                            <select value={scale} onChange={e => setScale(e.target.value as ScaleType)} disabled={isScaleLocked} className="bg-transparent text-xs font-medium text-[var(--text-muted)] outline-none cursor-pointer w-full hover:text-[var(--text-main)] appearance-none">
                                {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button onClick={toggleScaleLock} className={cn("px-3 h-full flex items-center justify-center transition-colors hover:bg-[var(--bg-soft-hover)] border-l border-[var(--border)]", isScaleLocked ? "text-[var(--text-main)]" : "text-[var(--text-dim)]")} title={isScaleLocked ? "Unlock Scale" : "Lock Scale"}>
                            {isScaleLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                    </div>

                    {/* BPM */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 shadow-sm px-1.5 gap-2 group hover:border-[var(--accent)]/50 transition-colors">
                        <div className="flex items-center justify-center text-[var(--text-dim)]"><Gauge size={14} /></div>
                        <div className="flex items-center gap-2">
                             <input type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-16 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] hover:accent-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity"/>
                            <div className="relative min-w-[3ch]">
                                <input type="number" value={bpm} onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value)||120)))} className="bg-transparent text-xs font-mono font-bold text-center outline-none text-[var(--text-main)] w-full appearance-none m-0 p-0"/>
                                <span className="absolute -top-1 -right-2 text-[7px] text-[var(--text-dim)] font-bold">BPM</span>
                            </div>
                        </div>
                    </div>

                    {/* TRANSPORT */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        <button onClick={togglePlay} className={cn("flex items-center gap-2 px-4 h-full rounded-md text-xs font-bold transition-all", isPlaying ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")}>
                            {isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>} {isPlaying ? "Stop" : "Play"}
                        </button>
                        <div className="w-px h-4 bg-[var(--border)] mx-1" />
                        <IconButton icon={Square} size="sm" onClick={() => { if(isPlaying) togglePlay(); }} className="rounded hover:bg-[var(--bg-soft-hover)] text-[var(--text-muted)]" title="Stop" />
                        <IconButton icon={LinkIcon} size="sm" onClick={() => handleProgression('quantize')} title="Quantize" className="rounded hover:bg-[var(--bg-soft-hover)] text-[var(--text-muted)]" />
                        <IconButton icon={Trash2} size="sm" variant="danger" onClick={() => handleProgression('clear')} title="Clear All" className="rounded hover:bg-red-500/10 text-red-400" />
                    </div>

                    {/* COMPLEXITY */}
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        {['triad', '7th', '9th', '11th'].map((c) => (
                            <button key={c} onClick={() => setComplexity(c as ChordComplexity)} className={cn("px-3 h-full rounded-md text-[10px] font-bold uppercase transition-all border border-transparent", complexity === c ? "bg-[var(--accent)] text-black shadow-sm" : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")}>
                                {c.replace('triad', 'TRIAD').replace('th', 'TH')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* NOW PLAYING */}
                {currentChord && !currentChord.isRest && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
                         <div className="flex items-center gap-2"><Activity size={12} className="text-[var(--accent)] animate-pulse" /><span className="text-sm font-black text-[var(--accent)] tracking-tight">{currentChord.symbol}</span></div>
                         <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{currentChord.romanNumeral}</span>
                    </div>
                )}

                <div className="flex-1" />

                <div className="flex flex-wrap items-center gap-2">
                     <div className="hidden 2xl:flex items-center gap-2 mr-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-element)] rounded-lg border border-[var(--border)]"><Music size={12} className="text-yellow-400" /><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{analysis.vibe}</span></div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-element)] rounded-lg border border-[var(--border)]"><Layers size={12} className="text-emerald-400" /><span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{analysis.texture}</span></div>
                    </div>
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm">
                        <button onClick={() => setView('sequencer')} className={cn("px-3 h-full rounded-md flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all", view === 'sequencer' ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")}><ListMusic size={14} /> SEQ</button>
                        <button onClick={() => setView('harmony')} className={cn("px-3 h-full rounded-md flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all", view === 'harmony' ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")}><Network size={14} /> MAP</button>
                    </div>
                    <div className="flex items-center bg-[var(--bg-element)] rounded-lg border border-[var(--border)] overflow-hidden h-9 p-0.5 gap-0.5 shadow-sm ml-2">
                        {[{ id: 'rhodes', icon: Keyboard, label: 'Rhodes' }, { id: 'pad', icon: Cloud, label: 'Pad' }, { id: 'pluck', icon: Music2, label: 'Pluck' }, { id: 'synth', icon: Zap, label: 'Synth' }].map(inst => (
                            <button key={inst.id} onClick={() => setInstrument(inst.id as InstrumentType)} className={cn("w-9 h-full rounded-md flex items-center justify-center transition-all border border-transparent", instrument === inst.id ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-soft-hover)]")} title={inst.label}><inst.icon size={16} /></button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
