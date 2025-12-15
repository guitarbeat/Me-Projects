

import React, { useState } from 'react';
import { cn } from './ui';
// Re-export panel components for backward compatibility
export { ResizableTopPanel, SplitView } from './resizable-panels';
import { useStore, ScaleType, CIRCLE_KEYS, InstrumentType, Chord, buildChord, CHROMATIC_SHARPS } from '../lib';
import { ChordPalette } from './sequencer';
import { 
    Play, Pause, Lock, Unlock, Trash2, 
    ListMusic, Network, Cloud, Keyboard, Music2, Zap, Gauge,
    ChevronDown, Moon, Sun, X,
    FolderOpen, Save, Clock, Minus, Plus, PenTool, LucideIcon
} from 'lucide-react';
import { HarmonicSpace as TonnetzWrapper } from './tonnetz';
import { ProgressionStrip as SequencerView } from './sequencer';
import { PanelStack } from './resizable-panels';
import { MoodSelector } from './mood';
import { SongwritingBoard } from './songwriting';

import { GuitarChordDiagram } from './guitar';



// --- PROJECT LIBRARY MODAL ---

const ProjectLibrary = ({ onClose }: { onClose: () => void }) => {
    const { savedProjects, saveProject, loadProject, deleteProject } = useStore();
    const [name, setName] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        saveProject(name.trim());
        setName('');
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden relative scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[500px]">
                
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                    <div className="flex items-center gap-2 text-[var(--text-main)]">
                        <FolderOpen className="text-[var(--accent)]" size={16} />
                        <h3 className="text-sm font-bold tracking-wide uppercase">Project Library</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--bg-element)] rounded-md transition-colors"><X size={14} /></button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-hidden flex flex-col gap-4">
                    
                    {/* Save New */}
                    <form onSubmit={handleSave} className="flex gap-2 shrink-0">
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Project Name..."
                            className="flex-1 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!name.trim()}
                            className="px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-[var(--accent)]/10"
                        >
                            <Save size={14} /> Save
                        </button>
                    </form>
                    
                    <div className="h-px bg-[var(--border)] w-full shrink-0" />

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
                        {savedProjects.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-dim)] italic text-xs">
                                No saved projects yet.
                            </div>
                        ) : (
                            savedProjects.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors group">
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-[var(--text-main)] truncate">{p.name}</div>
                                        <div className="text-[10px] text-[var(--text-dim)] flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(p.timestamp).toLocaleDateString()} {new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            <span className="mx-1">•</span>
                                            <span className="uppercase">{p.state.key} {p.state.scale}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => { loadProject(p.id); onClose(); }}
                                            className="px-3 py-1.5 bg-[var(--bg-element)] hover:bg-[var(--accent)] hover:text-black border border-[var(--border)] rounded text-[10px] font-bold uppercase transition-colors"
                                        >
                                            Load
                                        </button>
                                        <button 
                                            onClick={() => deleteProject(p.id)}
                                            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-[var(--accent)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
            </div>
        </div>
    );
};




export default function ControlPanel() {
    const { 
        view,
        key: currentKey, 
        scale, 
        bpm, 
        isPlaying, 
        setKey, 
        setScale, 
        setBpm, 
        togglePlay,
        toggleScaleLock,
        isScaleLocked,
        theme,
        toggleTheme,
        progression,
        selectedChordIndex,
        setSelectedChordIndex,
        handleProgression,
        instrument,
        setInstrument
    } = useStore();

    // Flexible Panel State
    // Default: Map (Top) and Sequencer (Middle) and Palette (Bottom) are all visible?
    // Or maybe just Map and Sequencer?
    const [visiblePanels, setVisiblePanels] = useState({
        map: true,
        sequencer: true,
        palette: true,
        mood: false
    });

    const [showLibrary, setShowLibrary] = useState(false);

    // Derived state: is any panel "maximized" (meaning it's the ONLY one visible)?
    // Actually, "maximized" is just a visual concept. 
    // We check if only one is true.


    // Handlers
    const togglePanel = (key: keyof typeof visiblePanels) => {
        setVisiblePanels(prev => {
            const next = { ...prev, [key]: !prev[key] };
            // Prevent hiding all panels? Or allow it and show empty state?
            // Let's allow it but maybe show a "Open a panel" prompt if all closed.
            return next;
        });
    };



    const handleChordUpdate = (updates: Partial<Chord>) => {
        const selectedChord = selectedChordIndex !== null && progression[selectedChordIndex] ? progression[selectedChordIndex] : null;
        if (!selectedChord || selectedChordIndex === null) return;
        
        const newRoot = updates.root || selectedChord.root;
        const newQuality = updates.quality || selectedChord.quality;
        const newExt = updates.extension !== undefined ? updates.extension : selectedChord.extension;
        
        const newChord = buildChord(newRoot, newQuality, newExt, selectedChord.duration);
        if (selectedChord.lyrics) newChord.lyrics = selectedChord.lyrics;
        
        handleProgression('update', { index: selectedChordIndex, chord: newChord });
    };

    const selectedChord = selectedChordIndex !== null && progression[selectedChordIndex] ? progression[selectedChordIndex] : null;

    const instruments: { id: InstrumentType, icon: LucideIcon, label: string }[] = [
        { id: 'rhodes', icon: Keyboard, label: 'Keys' },
        { id: 'pad', icon: Cloud, label: 'Pad' },
        { id: 'pluck', icon: Music2, label: 'Pluck' },
        { id: 'synth', icon: Zap, label: 'Synth' }
    ];

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-500">
            {showLibrary && <ProjectLibrary onClose={() => setShowLibrary(false)} />}

            {/* TOP BAR */}
            <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                        <Music2 size={18} className="text-white" />
                    </div>
                    <span className="font-black text-lg tracking-tight hidden sm:inline-block">Harmonic<span className="text-[var(--accent)]">Studio</span></span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Key & Scale Controls (Same as before) */}
                    <div className="flex items-center gap-3 bg-[var(--bg-element)]/50 p-1 rounded-lg border border-[var(--border)]">
                        <div className="flex flex-col px-2">
                             <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Key</span>
                             <div className="flex items-baseline gap-1 relative group cursor-pointer">
                                 <select 
                                     value={currentKey} 
                                     onChange={(e) => setKey(e.target.value)}
                                     className="appearance-none bg-transparent font-black text-lg w-full outline-none cursor-pointer z-10 opacity-0 absolute inset-0"
                                 >
                                     {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                 </select>
                                 <span className="font-black text-lg">{currentKey}</span>
                                 <ChevronDown size={12} className="text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors"/>
                             </div>
                        </div>
                        <div className="w-px h-8 bg-[var(--border)]" />
                        <div className="flex flex-col px-2 flex-1 min-w-[120px]">
                             <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Scale</span>
                            <div className="flex items-baseline gap-1 relative group cursor-pointer">
                                 <select 
                                     value={scale} 
                                     onChange={(e) => setScale(e.target.value as ScaleType)}
                                     className="appearance-none bg-transparent font-bold text-sm w-full outline-none cursor-pointer z-10 opacity-0 absolute inset-0"
                                 >
                                     {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                                 <span className="font-bold text-sm truncate">{scale}</span>
                                 <ChevronDown size={12} className="text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors"/>
                             </div>
                        </div>
                        <button 
                            onClick={toggleScaleLock}
                            className={cn("p-1.5 rounded-md transition-all", isScaleLocked ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-panel)]")}
                            title={isScaleLocked ? "Scale Locked" : "Scale Unlocked"}
                        >
                            {isScaleLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>

                    <div className="h-8 w-px bg-[var(--border)]" />

                     {/* BPM & Play */}
                    <div className="flex items-center gap-3">
                         <div className="flex flex-col">
                             <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Tempo</span>
                             <div className="flex items-center gap-1 group">
                                 <Gauge size={12} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                                 <input 
                                     type="number" 
                                     value={bpm} 
                                     onChange={(e) => setBpm(Number(e.target.value))}
                                     className="w-12 bg-transparent font-bold text-sm text-right outline-none border-b border-transparent focus:border-[var(--accent)] transition-colors"
                                 />
                                 <span className="text-[10px] font-bold text-[var(--text-dim)]">BPM</span>
                             </div>
                         </div>
                        
                        <button 
                            onClick={togglePlay}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 border border-[var(--border)]",
                                isPlaying ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/30" : "bg-[var(--bg-element)] text-[var(--text-main)] hover:bg-[var(--bg-panel)]"
                            )}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                         onClick={() => setShowLibrary(true)}
                         className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] rounded-lg transition-colors"
                         title="Projects"
                    >
                        <FolderOpen size={18} strokeWidth={2} />
                    </button>
                    
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] rounded-lg transition-colors"
                        title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA ROW */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* LEFT: FLEXIBLE PANEL STACK */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 bg-[var(--bg-surface)]/30 p-2 gap-2 overflow-hidden",
                    // If chord editor is open, we might want to hide everything else?
                    // User requirement: "Dedicated full-screen chord editor UI"
                    // But maybe we can keep the new flex structure and just overlay the editor?
                    // The old code replaced `SplitView` with `EditChordView`.
                )}>
                    {selectedChord ? (
                        /* CHORD EDITOR VIEW (Replaces Panels when active) */
                        <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] flex flex-col overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200">
                             <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-30">
                                <div className="flex items-center gap-2">
                                    <PenTool size={16} className="text-[var(--accent)]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">Edit Chord</span>
                                </div>
                                <button onClick={() => { setSelectedChordIndex(null); }} className="text-[9px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] uppercase tracking-wider text-center px-3 py-1 bg-[var(--bg-element)] rounded-full border border-[var(--border)] hover:bg-[var(--bg-surface)] transition-all">Done</button>
                            </div>
                            
                            {/* Re-using the editor Content from previous version (simplified for brevity, assume similar structure) */}
                            {/* Ideally I should extract `ChordEditor` to a component, but I'll inline for now to match previous logic */}
                            <div className="flex-1 flex overflow-hidden">
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                     <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                                        {/* Editor Inputs... I will need to copy the editor JSX back here thoroughly or simplify */}
                                        {/* Since I am replacing the whole file content, I MUST include the editor JSX. */}
                                        
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Root</label>
                                                <select value={selectedChord.root} onChange={(e) => handleChordUpdate({ root: e.target.value })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"><option value="">-</option>{CHROMATIC_SHARPS.map(n => <option key={n} value={n}>{n}</option>)}</select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Quality</label>
                                                <select value={selectedChord.quality} onChange={(e) => handleChordUpdate({ quality: e.target.value as Chord['quality'] })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">{['major', 'minor', 'dim', 'aug'].map(q => <option key={q} value={q}>{q}</option>)}</select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                 <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Extension</label>
                                                 <select value={selectedChord.extension || ''} onChange={(e) => handleChordUpdate({ extension: e.target.value || undefined })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"><option value="">None</option>{['7', 'maj7', 'sus2', 'sus4', 'add9', '9', '11', '13'].map(x => <option key={x} value={x}>{x}</option>)}</select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-4">
                                             <div className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Duration</label>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleChordUpdate({ duration: Math.max(0.25, selectedChord.duration - 0.25) })} className="p-2 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg"><Minus size={14}/></button>
                                                    <input type="number" value={selectedChord.duration} onChange={(e) => handleChordUpdate({ duration: parseFloat(e.target.value) || 1 })} className="flex-1 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-center" />
                                                    <button onClick={() => handleChordUpdate({ duration: selectedChord.duration + 0.25 })} className="p-2 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                 <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Lyrics</label>
                                                 <input type="text" value={selectedChord.lyrics || ''} onChange={(e) => handleChordUpdate({ lyrics: e.target.value })} placeholder="Lyrics..." className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                                            </div>
                                        </div>
                                     </div>
                                     <div className="mt-8 max-w-2xl mx-auto border-t border-[var(--border)] pt-8">
                                         <h4 className="text-[10px] uppercase font-bold text-[var(--text-dim)] mb-4">Voicing</h4>
                                         <GuitarChordDiagram chord={selectedChord} />
                                     </div>
                                </div>
                            </div>
                        </div>
                    ) : ( 
                        /* FLEXIBLE PANELS */
                        <>
                            {/* Empty State */}
                            {!visiblePanels.map && !visiblePanels.sequencer && !visiblePanels.palette && (
                                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-dim)] animate-pulse">
                                    <ListMusic size={48} className="opacity-20 mb-4" />
                                    <p className="font-bold">No Panels Visible</p>
                                    <p className="text-xs">Use the sidebar to open panels</p>
                                </div>
                            )}

                            
                            {/* Songwriting Mode */}
                            {view === 'songwriting' ? (
                                <div className="flex-1 min-h-0 relative">
                                    <SongwritingBoard />
                                </div>
                            ) : (
                                /* Standard 3-Panel Layout */
                                <PanelStack 
                                    panels={[
                                        {
                                            id: 'map',
                                            title: 'Harmonic Map',
                                            content: <TonnetzWrapper />,
                                            defaultSize: 40,
                                            minSize: 10,
                                            collapsible: true, 
                                        },
                                        {
                                            id: 'sequencer',
                                            title: 'Sequencer',
                                            content: <SequencerView />,
                                            defaultSize: 30,
                                            minSize: 10,
                                            collapsible: true,
                                        },
                                        {
                                            id: 'palette',
                                            title: 'Palette',
                                            content: <ChordPalette className="px-3" />,
                                            defaultSize: 25,
                                            minSize: 10,
                                            collapsible: true,
                                        },
                                        {
                                            id: 'mood',
                                            title: 'Mood',
                                            content: <MoodSelector />,
                                            defaultSize: 15,
                                            minSize: 10,
                                            collapsible: true, 
                                        }
                                    ].filter(p => visiblePanels[p.id as keyof typeof visiblePanels])}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* RIGHT SIDEBAR: VIEW CONTROLS */}
                <div className="w-[50px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-surface)] flex flex-col items-center py-3 gap-3 z-10 overflow-y-auto custom-scrollbar">
                    {/* View Toggles */}
                    <div className="flex flex-col gap-2">
                        {/* Map Toggle */}
                        <button 
                            onClick={() => togglePanel('map')} 
                            title="Toggle Harmonic Map"
                            className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                visiblePanels.map 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <Network size={18} strokeWidth={1.5} />
                        </button>
                        
                        {/* Sequencer Toggle */}
                        <button 
                            onClick={() => togglePanel('sequencer')} 
                            title="Toggle Sequencer"
                            className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                visiblePanels.sequencer 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <ListMusic size={18} strokeWidth={1.5} />
                        </button>

                         {/* Palette Toggle */}
                         <button 
                            onClick={() => togglePanel('palette')} 
                            title="Toggle Chord Palette"
                            className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                visiblePanels.palette 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <PenTool size={18} strokeWidth={1.5} />
                        </button>

                         {/* Mood Toggle */}
                         <button 
                            onClick={() => togglePanel('mood')} 
                            title="Toggle Mood Selector"
                            className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                visiblePanels.mood 
                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                            )}
                        >
                            <Zap size={18} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="w-6 h-px bg-[var(--border)]" />

                    {/* Instruments */}
                    <div className="flex flex-col gap-2">
                        {instruments.map(inst => (
                            <button 
                                key={inst.id} 
                                onClick={() => setInstrument(inst.id)}
                                className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border border-transparent", 
                                    instrument === inst.id 
                                        ? "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20 shadow-sm" 
                                        : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]"
                                )}
                                title={inst.label}
                            >
                                <inst.icon size={16} strokeWidth={1.5} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

