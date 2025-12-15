

import React, { useState } from 'react';
import { cn } from './UI';
// Re-export panel components
import { useStore, ScaleType, CIRCLE_KEYS, Chord, buildChord, CHROMATIC_SHARPS } from '../lib';
import { 
    Play, Pause, Lock, Unlock, Trash2, 
    ListMusic, Network, Keyboard, Music2, Zap, Gauge,
    Moon, Sun, X,
    FolderOpen, Save, Clock, Minus, Plus, PenTool
} from 'lucide-react';
import { UnifiedPanel } from './UnifiedPanel';
import { PanelStack } from './ResizablePanels';
import { SongwritingBoard } from './SongwritingBoard';

import { GuitarChordDiagram } from './GuitarChord';



// --- SETTINGS POPOVER ---

const SettingsPopover = ({ 
    onClose, 
    currentKey, setKey, 
    scale, setScale, 
    bpm, setBpm, 
    isScaleLocked, toggleScaleLock 
}: { 
    onClose: () => void,
    currentKey: string, setKey: (k: string) => void,
    scale: string, setScale: (s: string) => void,
    bpm: number, setBpm: (b: number) => void,
    isScaleLocked: boolean, toggleScaleLock: () => void
}) => (
    <div className="absolute left-14 bottom-4 z-50 w-72 glass-panel rounded-lg p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
                <Music2 size={14} className="text-[var(--accent)]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Studio Settings</h4>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[var(--bg-element)] text-[var(--text-muted)] hover:text-white rounded-full transition-colors"><X size={14}/></button>
        </div>

        {/* Key */}
        <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Metric Key</label>
            <div className="grid grid-cols-4 gap-1.5">
                {CIRCLE_KEYS.map(k => (
                    <button 
                        key={k} 
                        onClick={() => setKey(k)}
                        className={cn(
                            "text-xs font-bold py-1.5 rounded-md border transition-none",
                            currentKey === k 
                            ? "bg-[var(--accent)] text-black border-[var(--accent)]" 
                            : "bg-[var(--bg-element)] border-transparent text-[var(--text-muted)] hover:text-white hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
                        )}
                    >
                        {k}
                    </button>
                ))}
            </div>
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Tonality</label>
                <button 
                    onClick={toggleScaleLock} 
                    title={isScaleLocked ? "Unlock Scale" : "Lock Scale"} 
                    className={cn(
                        "p-1.5 rounded transition-colors", 
                        isScaleLocked ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--text-dim)] hover:text-white"
                    )}
                >
                    {isScaleLocked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
            </div>
            <select 
                value={scale} 
                onChange={(e) => setScale(e.target.value as ScaleType)}
                className="w-full bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-shadow hover:bg-[var(--bg-surface)] cursor-pointer appearance-none"
            >
                {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        {/* Tempo */}
        <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Tempo</label>
            <div className="flex items-center gap-3 bg-[var(--bg-element)] p-2 rounded-lg border border-[var(--border)]">
                <Gauge size={14} className="text-[var(--text-dim)]" />
                <input 
                    type="range" min="40" max="220" 
                    value={bpm} 
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="flex-1 h-1 bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
                <span className="text-xs font-mono font-bold w-8 text-right text-[var(--text-main)]">{bpm}</span>
            </div>
        </div>
    </div>
);

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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel rounded-lg overflow-hidden relative flex flex-col max-h-[500px]">
                
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
                            className="px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs uppercase tracking-wider rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-none"
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
        setView,
    } = useStore();

    // Flexible Panel State
    // Default: Map (Top) and Sequencer (Middle) and Palette (Bottom) are all visible?
    const [showSettings, setShowSettings] = useState(false);

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

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-500">
            {showLibrary && <ProjectLibrary onClose={() => setShowLibrary(false)} />}

            {/* TOP BAR REMOVED - Controls moved to Sidebar */}


            {/* MAIN CONTENT AREA ROW */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* LEFT SIDEBAR (GLOBAL CONTROLS) */}
                <div className="w-14 border-r border-[var(--border)] flex flex-col items-center py-4 gap-3 shrink-0 z-40 bg-[var(--bg-main)]">
                    
                    {/* Transport (Play/Pause) on Top */}
                    <button 
                        onClick={togglePlay}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] transition-colors",
                            isPlaying ? "bg-[var(--accent)] text-black" : "bg-[var(--bg-element)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        )}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <div className="w-6 h-px bg-[var(--border)]" />

                    {/* Show/Hide Toggles */}
                    <button 
                        onClick={() => togglePanel('map')}
                        className={cn("p-2 rounded-lg transition-colors", visiblePanels.map ? "text-[var(--accent)] bg-[var(--bg-element)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                        title="Harmonic Map"
                    >
                        <Network size={18} />
                    </button>
                    <button 
                        onClick={() => togglePanel('sequencer')}
                        className={cn("p-2 rounded-lg transition-colors", visiblePanels.sequencer ? "text-[var(--accent)] bg-[var(--bg-element)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                        title="Sequencer"
                    >
                        <ListMusic size={18} />
                    </button>
                    <button 
                        onClick={() => togglePanel('palette')}
                        className={cn("p-2 rounded-lg transition-colors", visiblePanels.palette ? "text-[var(--accent)] bg-[var(--bg-element)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                        title="Chord Palette"
                    >
                        <PenTool size={18} />
                    </button>
                    <button 
                        onClick={() => togglePanel('mood')}
                        className={cn("p-2 rounded-lg transition-colors", visiblePanels.mood ? "text-[var(--accent)] bg-[var(--bg-element)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                        title="Mood Selector"
                    >
                        <Zap size={18} />
                    </button>

                     <div className="w-6 h-px bg-[var(--border)]" />
                     
                     {/* Songwriting Mode Toggle */}
                     <button 
                        onClick={() => setView(view === 'songwriting' ? 'standard' : 'songwriting')}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            view === 'songwriting' 
                                ? "text-[var(--accent)] bg-[var(--bg-element)]" 
                                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        )}
                        title={view === 'songwriting' ? "Exit Songwriting Mode" : "Songwriting Mode"}
                    >
                        <Keyboard size={18} />
                    </button>

                    <div className="flex-1" />

                    {/* Bottom Controls */}
                    
                    {/* Settings Trigger */}
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "p-2 rounded-lg transition-colors", 
                            showSettings ? "text-[var(--accent)] bg-[var(--bg-element)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        )}
                        title="Global Settings (Key, Scale, Tempo)"
                    >
                        <Music2 size={18} />
                        {showSettings && (
                           <SettingsPopover 
                               onClose={() => setShowSettings(false)}
                               currentKey={currentKey} setKey={setKey}
                               scale={scale} setScale={setScale}
                               bpm={bpm} setBpm={setBpm}
                               isScaleLocked={isScaleLocked} toggleScaleLock={toggleScaleLock}
                           />
                        )}
                    </button>

                    <button 
                         onClick={() => setShowLibrary(true)}
                         className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors"
                         title="Projects"
                    >
                        <FolderOpen size={18} />
                    </button>

                    <button 
                        onClick={toggleTheme} 
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* MAIN PANEL CONTENT */}
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
                            {!visiblePanels.map && !visiblePanels.sequencer && !visiblePanels.palette && !visiblePanels.mood && (
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
                                        visiblePanels.map && {
                                            id: 'map',
                                            content: <UnifiedPanel id="map" onClose={() => togglePanel('map')} />,
                                            defaultSize: 40,
                                            collapsible: true, // Allow collapsing
                                            collapsedSize: 0,
                                            minSize: 15
                                        },
                                        visiblePanels.sequencer && {
                                            id: 'sequencer',
                                            content: <UnifiedPanel id="sequencer" onClose={() => togglePanel('sequencer')} />,
                                            defaultSize: 30,
                                            collapsible: true,
                                            collapsedSize: 0,
                                            minSize: 15
                                        },
                                        (visiblePanels.palette || visiblePanels.mood) && { // Grouped Tools Panel
                                            id: 'tools', 
                                            content: (
                                                <div className="flex h-full w-full gap-2 overflow-hidden">
                                                    {visiblePanels.palette && (
                                                        <div className="flex-1 min-w-0 h-full">
                                                            <UnifiedPanel id="palette" onClose={() => togglePanel('palette')} />
                                                        </div>
                                                    )}
                                                    {visiblePanels.mood && (
                                                        <div className="flex-1 min-w-0 h-full">
                                                             <UnifiedPanel id="mood" onClose={() => togglePanel('mood')} />
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                            defaultSize: 30,
                                            collapsible: true,
                                            collapsedSize: 0,
                                            minSize: 15
                                        }
                                    ].filter(Boolean)}
                                    direction="vertical"
                                />
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

