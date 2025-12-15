

import React, { useState } from 'react';
import { cn, IconButton } from './ui';
// Re-export panel components for backward compatibility
export { ResizableTopPanel, SplitView } from './resizable-panels';
import { useStore, ScaleType, CIRCLE_KEYS, InstrumentType, ChordComplexity, Chord, buildChord, CHROMATIC_SHARPS } from '../lib';
import { ChordPalette } from './sequencer';
import { 
    Play, Pause, Lock, Unlock, Link as LinkIcon, Trash2, 
    ListMusic, Network, Cloud, Keyboard, Music2, Zap, Gauge,
    ChevronDown, Moon, Sun, X,
    FolderOpen, Save, Clock, Minus, Plus, PenTool
} from 'lucide-react';

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
        toggleTheme, theme,
        selectedChordIndex, progression,
        setSelectedChordIndex
    } = useStore();


    const [showLibrary, setShowLibrary] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expansion when view changes
    useEffect(() => {
        setIsExpanded(false);
    }, [view]);

    const selectedChord = selectedChordIndex !== null && progression[selectedChordIndex] ? progression[selectedChordIndex] : null;

    const instruments: { id: InstrumentType, icon: any, label: string }[] = [
        { id: 'rhodes', icon: Keyboard, label: 'Keys' },
        { id: 'pad', icon: Cloud, label: 'Pad' },
        { id: 'pluck', icon: Music2, label: 'Pluck' },
        { id: 'synth', icon: Zap, label: 'Synth' }
    ];



    const handleChordUpdate = (updates: Partial<Chord>) => {
        if (!selectedChord || selectedChordIndex === null) return;
        
        const newRoot = updates.root || selectedChord.root;
        const newQuality = updates.quality || selectedChord.quality;
        const newExt = updates.extension !== undefined ? updates.extension : selectedChord.extension; // Fix: Use updates.extension if provided
        
        const newChord = buildChord(newRoot, newQuality, newExt, selectedChord.duration);
        // Preserve lyric if present
        if (selectedChord.lyrics) newChord.lyrics = selectedChord.lyrics;
        
        handleProgression('update', { index: selectedChordIndex, chord: newChord });
    };

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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
                {selectedChord ? (
                    <div className="h-full flex flex-col bg-[var(--bg-main)]">
                        <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-30">
                            <div className="flex items-center gap-2">
                                <PenTool size={16} className="text-[var(--accent)]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">Edit Chord</span>
                            </div>
                            <button onClick={() => { setSelectedChordIndex(null); }} className="text-[9px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] uppercase tracking-wider text-center">Done</button>
                        </div>

                        {/* Chord Editor */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Root */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Root</label>
                                    <select 
                                        value={selectedChord.root} 
                                        onChange={(e) => handleChordUpdate({ root: e.target.value })}
                                        className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    >
                                        {CHROMATIC_SHARPS.map(note => <option key={note} value={note}>{note}</option>)}
                                    </select>
                                </div>
                                {/* Quality */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Quality</label>
                                    <select 
                                        value={selectedChord.quality} 
                                        onChange={(e) => handleChordUpdate({ quality: e.target.value as any })}
                                        className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    >
                                        {['major', 'minor', 'dim', 'aug'].map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                </div>
                                {/* Extension */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Extension</label>
                                    <select 
                                        value={selectedChord.extension || ''} 
                                        onChange={(e) => handleChordUpdate({ extension: e.target.value || undefined })}
                                        className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                    >
                                        <option value="">None</option>
                                        {['7', 'maj7', 'sus2', 'sus4', 'add9', '9', '11', '13'].map(ext => <option key={ext} value={ext}>{ext}</option>)}
                                    </select>
                                </div>
                                {/* Duration */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Duration</label>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleChordUpdate({ duration: Math.max(0.25, selectedChord.duration - 0.25) })}
                                            className="p-2 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={selectedChord.duration} 
                                            onChange={(e) => handleChordUpdate({ duration: parseFloat(e.target.value) || 1 })}
                                            step="0.25"
                                            min="0.25"
                                            className="flex-1 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                        />
                                        <button 
                                            onClick={() => handleChordUpdate({ duration: selectedChord.duration + 0.25 })}
                                            className="p-2 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Guitar Diagram */}
                            <div className="mt-6">
                                <h4 className="text-[10px] uppercase font-bold text-[var(--text-dim)] mb-2">Guitar Voicing</h4>
                                <GuitarChordDiagram chord={selectedChord} />
                            </div>

                            {/* Lyrics */}
                            <div className="mt-6">
                                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Lyrics</label>
                                <input 
                                    type="text"
                                    value={selectedChord.lyrics || ''}
                                    onChange={(e) => handleChordUpdate({ lyrics: e.target.value })}
                                    placeholder="Add lyrics..."
                                    className="w-full bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all mt-1"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-2 border-l border-[var(--border)] h-full">
                            <button onClick={() => handleProgression('remove', selectedChordIndex)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ) : (
                    <SplitView 
                        top={
                            <ResizableTopPanel 
                                minHeight={150} 
                                maxHeight={600} 
                                defaultHeight={350}
                                title={
                                    <div className="flex items-center gap-2">
                                        {view === 'sequencer' && <ListMusic size={16} className="text-[var(--accent)]" />}
                                        {view === 'harmony' && <Network size={16} className="text-[var(--accent)]" />}
                                        {view === 'songwriting' && <PenTool size={16} className="text-[var(--accent)]" />}
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                            {view === 'sequencer' ? 'Sequencer' : view === 'harmony' ? 'Harmonic Map' : 'Songwriting'}
                                        </span>
                                    </div>
                                }
                                isExpanded={isExpanded}
                                onExpand={() => setIsExpanded(!isExpanded)}
                                onClose={view !== 'sequencer' ? () => setView('sequencer') : undefined}
                            >
                                <div className="h-full w-full relative bg-[var(--bg-main)]">
                                    {view === 'sequencer' && <SequencerView />}
                                    {view === 'harmony' && <TonnetzWrapper />}
                                    {view === 'songwriting' && <SongwritingView />}
                                </div>
                            </ResizableTopPanel>
                        }
                        bottom={
                            <div className="flex-1 min-h-0 flex border-t border-[var(--border)] relative bg-[var(--bg-surface)]/30">
                                {/* Palette */}
                                <div className="flex-1 relative">
                                    <ChordPalette className="px-3" />
                                </div>

                                {/* Right Sidebar: Views & Instruments */}
                                <div className="w-[50px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-surface)] flex flex-col items-center py-3 gap-3 z-10 overflow-y-auto custom-scrollbar">
                                    {/* View Toggles */}
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => setView('sequencer')} 
                                            title="Sequencer View"
                                            className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                                view === 'sequencer' 
                                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                                            )}
                                        >
                                            <ListMusic size={18} strokeWidth={1.5} />
                                        </button>
                                        <button 
                                            onClick={() => setView('harmony')} 
                                            title="Harmonic Map View"
                                            className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                                view === 'harmony' 
                                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                                            )}
                                        >
                                            <Network size={18} strokeWidth={1.5} />
                                        </button>
                                        <button 
                                            onClick={() => setView('songwriting')} 
                                            title="Songwriting View"
                                            className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200", 
                                                view === 'songwriting' 
                                                    ? "bg-[var(--bg-element)] text-[var(--accent)] shadow-sm border border-[var(--border)] ring-1 ring-[var(--accent)]/20" 
                                                    : "text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] hover:scale-105"
                                            )}
                                        >
                                            <PenTool size={18} strokeWidth={1.5} />
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
                        }
                    />
                )}
            </div>
        </div>
    );
};

