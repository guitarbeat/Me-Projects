

import React, { useState } from 'react';
import { cn, IconButton } from './ui';
// Re-export panel components for backward compatibility
export { ResizableTopPanel, SplitView } from './resizable-panels';
import { useStore, ScaleType, CIRCLE_KEYS, InstrumentType, ChordComplexity, Chord, buildChord, CHROMATIC_SHARPS } from './lib';
import { ChordPalette } from './sequencer';
import { 
    Play, Pause, Lock, Unlock, Link as LinkIcon, Trash2, 
    ListMusic, Network, Cloud, Keyboard, Music2, Zap, Gauge,
    ChevronDown, Moon, Sun, Sparkles, Wand2, X, Loader2, Dices,
    FolderOpen, Save, Clock, Minus, Plus, PenTool
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { GuitarChordDiagram } from './guitar';

// --- AI COMPOSER MODAL ---

const AIComposer = ({ onClose, onGenerate }: { onClose: () => void, onGenerate: (prompt: string) => Promise<void> }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSurpriseMe = () => {
        const prompts = [
            "A neo-soul progression in Eb minor with extended chords",
            "A melancholic jazz ballad in C Dorian",
            "An uplifting pop anthem in D Major using suspended chords",
            "A dark cinematic sequence in F# Minor with tension",
            "A lo-fi hip hop loop with jazzy passing chords",
            "A dreamy Lydian soundscape for meditation",
            "A driving rock chorus in A Mixolydian with power chords"
        ];
        const random = prompts[Math.floor(Math.random() * prompts.length)];
        setPrompt(random);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        
        setLoading(true);
        setError(null);
        try {
            await onGenerate(prompt);
            onClose();
        } catch (err: unknown) {
            setError("Failed to generate. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden relative scale-100 animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
                    <div className="flex items-center gap-2 text-[var(--text-main)]">
                        <Sparkles className="text-[var(--accent)]" size={16} />
                        <h3 className="text-sm font-bold tracking-wide uppercase">AI Composer</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--bg-element)] rounded-md transition-colors"><X size={14} /></button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Describe your idea</label>
                                <button 
                                    type="button" 
                                    onClick={handleSurpriseMe}
                                    className="flex items-center gap-1 text-[10px] text-[var(--accent)] hover:underline font-medium"
                                >
                                    <Dices size={10} /> Surprise Me
                                </button>
                            </div>
                            <textarea 
                                autoFocus
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., A melancholic jazz progression in Eb minor ending with a picardy third..."
                                className="w-full h-24 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none transition-all"
                            />
                        </div>

                        {error && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}

                        <div className="flex justify-end gap-2 pt-2">
                             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] transition-colors">
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading || !prompt.trim()}
                                className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--accent)] text-black hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>}
                                {loading ? 'Composing...' : 'Generate Music'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-[var(--accent)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />
            </div>
        </div>
    );
};

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

    const [showAI, setShowAI] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);

    const selectedChord = selectedChordIndex !== null && progression[selectedChordIndex] ? progression[selectedChordIndex] : null;

    const instruments: { id: InstrumentType, icon: React.ComponentType<{ size?: number; className?: string }>, label: string }[] = [
        { id: 'rhodes', icon: Keyboard, label: 'Keys' },
        { id: 'pad', icon: Cloud, label: 'Pad' },
        { id: 'pluck', icon: Music2, label: 'Pluck' },
        { id: 'synth', icon: Zap, label: 'Synth' }
    ];

    const handleAIGeneration = async (userPrompt: string) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Define Strict Output Schema for structured chords
        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    root: { type: Type.STRING, description: "Root note (e.g., C, F#, Bb)" },
                    quality: { type: Type.STRING, description: "Major, Minor, Diminished, Augmented, Half-Dim, Dominant, Sus2, Sus4" },
                    extension: { type: Type.STRING, description: "Extension string (e.g., 7, 9, 11, maj7, m7) or empty" },
                    duration: { type: Type.NUMBER, description: "Duration in beats (default 4)" }
                },
                required: ["root", "quality", "duration"]
            }
        };

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: "You are a professional music composer. Generate a chord progression array based on the user's description. Map chords to simple root/quality/extension structure. For guitar-style requests, favor standard open chord keys (E, A, D, G, C) and mixolydian/blues influences where appropriate.",
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const json = JSON.parse(result.text || "[]");
        
        // Transform JSON to App Chords using internal builder
        const chords = json.map((c: { root: string; quality: string; extension?: string; duration?: number }) => {
            const chord = buildChord(c.root, c.quality, c.extension || '', c.duration || 4);
            return chord;
        });

        // Clear and Add
        if (chords.length > 0) {
            handleProgression('clear');
            handleProgression('add', { chords, index: 0 });
        }
    };

    const handleChordUpdate = (updates: Partial<Chord>) => {
        if (!selectedChord || selectedChordIndex === null) return;
        
        const newRoot = updates.root || selectedChord.root;
        const newQuality = updates.quality || selectedChord.quality;
        const newExt = updates.extension !== undefined ? updates.extension : selectedChord.extension;
        
        const newChord = buildChord(newRoot, newQuality, newExt, selectedChord.duration);
        // Preserve lyric if present
        if (selectedChord.lyrics) newChord.lyrics = selectedChord.lyrics;
        
        handleProgression('update', { index: selectedChordIndex, chord: newChord });
    };

    return (
        <div className="w-full h-full flex flex-col select-none font-sans text-[var(--text-main)] bg-[var(--bg-panel)] overflow-hidden relative">
            
            {showAI && <AIComposer onClose={() => setShowAI(false)} onGenerate={handleAIGeneration} />}
            {showLibrary && <ProjectLibrary onClose={() => setShowLibrary(false)} />}

            {/* Top Bar with Theme Toggle (Absolute) */}
             <div className="absolute top-3 left-3 z-30">
                <button 
                    onClick={toggleTheme} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-element)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                    {theme === 'dark' ? <Moon size={14}/> : <Sun size={14}/>}
                </button>
             </div>

            {/* CENTER CONTROL ISLANDS */}
            <div className="shrink-0 flex flex-col items-center justify-center gap-2.5 py-4 px-4 z-20">
                
                {selectedChord ? (
                    // --- SELECTED CHORD INSPECTOR ---
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-lg flex items-start gap-3">
                         {/* Guitar Diagram */}
                         <GuitarChordDiagram chord={selectedChord} className="hidden sm:block shrink-0" />
                         
                         <div className="flex-1 flex items-center justify-between bg-[var(--bg-element)] rounded-xl p-3 border border-[var(--border)] shadow-sm gap-4 h-[100px]">
                             
                             {/* Chord Edit Controls */}
                             <div className="flex flex-col gap-1.5 min-w-[140px]">
                                <div className="flex items-center gap-1">
                                    {/* Root */}
                                    <div className="relative bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] h-8 w-12 flex items-center justify-center hover:border-[var(--accent)] transition-colors">
                                         <select 
                                            value={selectedChord.root}
                                            onChange={(e) => handleChordUpdate({ root: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            {CHROMATIC_SHARPS.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <span className="text-sm font-black text-[var(--text-main)]">{selectedChord.root}</span>
                                    </div>

                                    {/* Quality */}
                                    <div className="relative bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] h-8 flex-1 flex items-center px-2 hover:border-[var(--accent)] transition-colors">
                                        <select 
                                            value={selectedChord.quality}
                                            onChange={(e) => handleChordUpdate({ quality: e.target.value as Chord['quality'] })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            {['Major', 'Minor', 'Dominant', 'Diminished', 'Augmented', 'Sus2', 'Sus4'].map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                         <span className="text-[10px] font-bold uppercase text-[var(--text-main)] truncate">{selectedChord.quality}</span>
                                         <ChevronDown size={10} className="ml-auto text-[var(--text-dim)]"/>
                                    </div>
                                </div>
                                
                                {/* Extension */}
                                <div className="relative bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] h-6 flex items-center px-2 hover:border-[var(--accent)] transition-colors w-full">
                                     <select 
                                        value={selectedChord.extension || ''}
                                        onChange={(e) => handleChordUpdate({ extension: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    >
                                        <option value="">Triad (None)</option>
                                        <option value="7">7th</option>
                                        <option value="9">9th</option>
                                        <option value="11">11th</option>
                                    </select>
                                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1 w-full">
                                        <span className="flex-1 truncate">{selectedChord.extension ? `${selectedChord.extension} Extension` : 'Basic Triad'}</span>
                                         <ChevronDown size={10} className="text-[var(--text-dim)]"/>
                                    </span>
                                </div>
                             </div>

                             {/* Duration Controls */}
                             <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1 bg-[var(--bg-surface)] rounded-lg p-1 border border-[var(--border)]">
                                     <button onClick={() => handleProgression('resize', { index: selectedChordIndex, duration: Math.max(0.25, selectedChord.duration - 0.25) })} className="p-1 hover:bg-[var(--bg-element)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"><Minus size={14}/></button>
                                     <div className="w-12 text-center flex flex-col items-center">
                                         <span className="text-xs font-bold text-[var(--text-main)]">{selectedChord.duration}</span>
                                         <span className="text-[8px] text-[var(--text-dim)] uppercase font-bold">Beats</span>
                                     </div>
                                     <button onClick={() => handleProgression('resize', { index: selectedChordIndex, duration: selectedChord.duration + 0.25 })} className="p-1 hover:bg-[var(--bg-element)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"><Plus size={14}/></button>
                                 </div>
                                 <button onClick={() => { setSelectedChordIndex(null); }} className="text-[9px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] uppercase tracking-wider text-center">Done</button>
                             </div>

                             {/* Actions */}
                             <div className="flex items-center gap-1 pl-2 border-l border-[var(--border)] h-full">
                                 <button onClick={() => handleProgression('remove', selectedChordIndex)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                             </div>
                         </div>
                    </div>
                ) : (
                    <>
                    {/* ROW 1: Musical Context */}
                    <div className="flex items-center gap-2">
                        {/* Key & Scale Group */}
                        <div className="flex items-center bg-[var(--bg-element)] rounded-lg p-1 border border-[var(--border)] shadow-sm h-9">
                            {/* Key */}
                            <div className="px-2 border-r border-[var(--border)] h-full flex items-center hover:bg-[var(--bg-surface)] rounded-l transition-colors">
                                <select 
                                    value={currentKey} 
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setKey(e.target.value)} 
                                    className="bg-transparent font-bold text-xs outline-none cursor-pointer text-[var(--text-main)] hover:text-[var(--accent)] appearance-none text-center min-w-[32px] h-full"
                                >
                                    {CIRCLE_KEYS.map((k: string) => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            
                            {/* Scale */}
                            <div className="relative h-full flex items-center justify-center hover:bg-[var(--bg-surface)] transition-colors px-1">
                                <select 
                                    value={scale} 
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setScale(e.target.value)} 
                                    disabled={isScaleLocked} 
                                    className="bg-transparent text-[11px] font-bold text-[var(--text-muted)] outline-none cursor-pointer w-[120px] hover:text-[var(--text-main)] appearance-none py-1 uppercase tracking-wide text-center truncate"
                                >
                                    {Object.values(ScaleType).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Lock */}
                            <button 
                                onClick={toggleScaleLock}
                                className={cn("w-8 h-full flex items-center justify-center transition-all hover:bg-[var(--bg-surface)] border-l border-[var(--border)] rounded-r", isScaleLocked ? "text-[var(--accent)]" : "text-[var(--text-dim)]")}
                                title={isScaleLocked ? "Scale Locked" : "Scale Unlocked"}
                            >
                                {isScaleLocked ? <Lock size={12} strokeWidth={2.5} /> : <Unlock size={12} />}
                            </button>
                        </div>

                        {/* BPM Group */}
                        <div className="flex items-center gap-2 bg-[var(--bg-element)] rounded-lg p-1 border border-[var(--border)] shadow-sm h-9 px-3">
                            <Gauge size={14} className="text-[var(--text-dim)]" />
                            <input 
                                type="number" 
                                value={bpm} 
                                onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value)||120)))}
                                className="bg-transparent text-xs font-mono font-bold text-center outline-none text-[var(--text-main)] w-12 appearance-none"
                            />
                        </div>
                    </div>

                    {/* ROW 2: Transport & Actions */}
                    <div className="flex items-center gap-2">
                        {/* Complexity */}
                        <div className="flex items-center bg-[var(--bg-element)] rounded-lg p-1 border border-[var(--border)] shadow-sm h-8">
                            <select 
                                value={complexity} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setComplexity(e.target.value as ChordComplexity)}
                                className="bg-transparent text-[10px] font-bold uppercase outline-none px-2 h-full text-[var(--text-dim)] hover:text-[var(--text-main)] appearance-none cursor-pointer"
                            >
                                {(['triad', '7th', '9th', '11th'] as ChordComplexity[]).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Play */}
                        <button 
                            onClick={togglePlay}
                            className={cn(
                                "flex items-center justify-center w-12 h-8 rounded-lg transition-all active:scale-95 shadow-lg",
                                isPlaying 
                                    ? "bg-[var(--accent)] text-black shadow-[var(--accent)]/20 hover:brightness-110" 
                                    : "bg-[var(--bg-element)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                            )}
                        >
                            {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-[var(--border)] mx-1" />

                        {/* Tools */}
                        <div className="flex items-center bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)] shadow-sm h-8 gap-0.5">
                            <IconButton icon={LinkIcon} size="sm" onClick={() => handleProgression('quantize')} title="Quantize" className="h-7 w-7 rounded-md" />
                            <IconButton icon={Trash2} size="sm" variant="danger" onClick={() => handleProgression('clear')} title="Clear" className="h-7 w-7 rounded-md" />
                            
                            {/* Library Button */}
                            <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
                            <button 
                                onClick={() => setShowLibrary(true)}
                                className="h-7 px-2 rounded-md flex items-center gap-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] transition-all text-[10px] font-bold uppercase tracking-wider"
                                title="Library"
                            >
                                <FolderOpen size={12} />
                            </button>

                            {/* AI Button */}
                            <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
                            <button 
                                onClick={() => setShowAI(true)}
                                className="h-7 px-2 rounded-md flex items-center gap-1.5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 text-violet-500 hover:from-violet-500/20 hover:to-fuchsia-500/20 transition-all text-[10px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
                                title="AI Composer"
                            >
                                <Sparkles size={10} />
                                <span>AI</span>
                            </button>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* BOTTOM: Palette & Sidebar */}
            <div className="flex-1 min-h-0 flex border-t border-[var(--border)] relative bg-[var(--bg-surface)]/30">
                {/* Palette */}
                <div className="flex-1 relative">
                    <ChordPalette className="px-3" />
                </div>

                {/* Right Sidebar: Views & Instruments */}
                <div className="w-[50px] shrink-0 border-l border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-center py-3 gap-3 z-10 overflow-y-auto custom-scrollbar">
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
        </div>
    );
};
