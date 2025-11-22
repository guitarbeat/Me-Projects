
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Note, ScaleType, Chord, InstrumentType, VoicingType, ChordComplexity, HarmonicBank } from './types';
import { generateChordsForScale, generateSecondaryDominants, generateBorrowedChords, getScaleNotes, getVoicedNotes, SCALE_PALETTES } from './utils/musicTheory';
import { audioEngine } from './utils/audioEngine';
import CircleOfFifths from './components/CircleOfFifths';
import GravityStage from './components/GravityStage';
import { UnifiedHarmonicScope, PitchConstellation } from './components/Visualizers';
import MoodSelector from './components/MoodSelector';
import TheoryAnalysis from './components/TheoryAnalysis';
import ComposeView from './components/ComposeView';
import { 
    Sparkles, Box, Layers,
    Settings2, X, Search, Disc, Smile
} from 'lucide-react';

// --- Types ---
type ViewMode = 'toy' | 'game' | 'tool';
type ToolLeftPanelMode = 'scope' | 'circle';

const App: React.FC = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState<ViewMode>('toy');
  const [showSettings, setShowSettings] = useState(false);
  
  // Tool View State
  const [toolLeftPanel, setToolLeftPanel] = useState<ToolLeftPanelMode>('scope');

  // Musical State
  const [currentKey, setCurrentKey] = useState<Note>('C');
  const [scaleType, setScaleType] = useState<ScaleType>(ScaleType.Major);
  const [complexity, setComplexity] = useState<ChordComplexity>('triad');
  const [voicing, setVoicing] = useState<VoicingType>('Root');
  const [harmonicBank, setHarmonicBank] = useState<HarmonicBank>('diatonic');
  const [progression, setProgression] = useState<Chord[]>([]);
  const [activeChord, setActiveChord] = useState<Chord | null>(null); // For visualizer persistence
  
  // Transport State
  const [bpm, setBpm] = useState(100);

  // Audio Preview Ref
  const previewTimeoutRef = useRef<number | null>(null);

  // --- Effects ---
  useEffect(() => {
      const palette = SCALE_PALETTES[scaleType];
      if (palette) {
          document.documentElement.style.setProperty('--accent', palette.accent);
      }
  }, [scaleType]);

  // --- Computed ---
  const displayedChords = useMemo(() => {
      if (harmonicBank === 'secondary') return generateSecondaryDominants(currentKey, scaleType);
      if (harmonicBank === 'borrowed') return generateBorrowedChords(currentKey, scaleType);
      return generateChordsForScale(currentKey, scaleType, complexity);
  }, [currentKey, scaleType, complexity, harmonicBank]);

  const scaleNotes = useMemo(() => getScaleNotes(currentKey, scaleType), [currentKey, scaleType]);

  // --- Handlers ---
  const handleChordTrigger = (chord: Chord) => {
      setActiveChord(chord);
      
      if (previewTimeoutRef.current) window.clearTimeout(previewTimeoutRef.current);
      
      const voicedNotes = getVoicedNotes(chord, voicing);
      audioEngine.playChord(voicedNotes, 1.5);
  };

  const handleAddChord = (chord: Chord) => {
    setProgression((prev) => [...prev, chord]);
    handleChordTrigger(chord);
  };

  const handleMoodSelect = (data: any) => {
     // Scale mapping from EmojiGridMapper data is handled visually/sonically
  };

  // --- Renderers ---

  // 1. THE TOY (Exploration)
  const renderToyView = () => (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#09090b] to-black opacity-80 z-0"></div>
        
        {/* The Massive Harmonic Lens (Visual Connection) */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ${activeChord ? 'opacity-30 scale-100' : 'opacity-0 scale-90'}`}>
            {activeChord && (
                <PitchConstellation 
                    notes={activeChord.notes} 
                    root={activeChord.root} 
                    size={800} 
                    showLabels={false} 
                />
            )}
        </div>

        {/* The Solar System (Interaction) */}
        <div className="relative w-full h-full max-w-5xl max-h-screen z-10 animate-in zoom-in-95 duration-1000">
            <GravityStage 
                currentKey={currentKey}
                scaleType={scaleType}
                chords={displayedChords}
                onAddChord={handleAddChord} // In Toy mode, click just plays
                onInspectChord={(c) => setActiveChord(c)}
                triggerMode="click"
                onChordClick={handleChordTrigger}
            />
        </div>

        {/* Introduction Text */}
        {!activeChord && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
                <h2 className="text-3xl font-bold text-white/10 tracking-tighter mb-2">Touch the Spheres</h2>
                <p className="text-xs text-white/10 uppercase tracking-widest">Explore the harmony</p>
             </div>
        )}
    </div>
  );

  // 2. THE GAME (Composition)
  const renderGameView = () => (
      <ComposeView 
        currentKey={currentKey}
        scaleType={scaleType}
        displayedChords={displayedChords}
        progression={progression}
        setProgression={setProgression}
        onPlayChord={handleChordTrigger}
        bpm={bpm}
        onSetKey={setCurrentKey}
        onOpenSettings={() => setShowSettings(true)}
      />
  );

  // 3. THE TOOL (Analysis & Export)
  const renderToolView = () => (
    <div className="h-full flex flex-col lg:flex-row bg-[#09090b] animate-in slide-in-from-right-4 duration-300">
        {/* Left Panel (Visualizers) */}
        <div className="flex-1 border-r border-white/5 overflow-hidden flex flex-col bg-[#0c0c0e]">
            {/* Panel Toggle */}
            <div className="flex items-center justify-center gap-2 p-2 border-b border-white/5">
                <button 
                    onClick={() => setToolLeftPanel('scope')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2
                    ${toolLeftPanel === 'scope' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Search size={12} /> Microscope
                </button>
                <button 
                    onClick={() => setToolLeftPanel('circle')}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2
                    ${toolLeftPanel === 'circle' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Disc size={12} /> Macroscope
                </button>
            </div>

            <div className="flex-1 relative">
                {toolLeftPanel === 'scope' ? (
                    <UnifiedHarmonicScope chord={activeChord || progression[0] || null} scaleNotes={scaleNotes} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Circle of Fifths Context</h3>
                        <CircleOfFifths 
                            currentKey={currentKey} 
                            onKeySelect={setCurrentKey}
                            activeChord={activeChord || progression[0] || null}
                            scaleNotes={scaleNotes}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Right Panel (Linear Analysis) */}
        <div className="flex-1 overflow-hidden">
            <TheoryAnalysis currentKey={currentKey} scaleType={scaleType} progression={progression} />
        </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-[#09090b] text-white overflow-hidden font-sans relative">
        
        {/* Main Content Area */}
        <main className="absolute inset-0 bottom-0 pb-24 md:pb-0 md:pl-20 transition-all duration-500">
            {viewMode === 'toy' && renderToyView()}
            {viewMode === 'game' && renderGameView()}
            {viewMode === 'tool' && renderToolView()}
        </main>

        {/* Navigation Dock */}
        <nav className={`
            fixed z-40 
            md:left-0 md:top-0 md:bottom-0 md:w-20 md:border-r md:border-white/5 md:flex-col 
            bottom-0 left-0 right-0 h-20 md:h-auto border-t border-white/5 md:border-t-0
            bg-[#09090b]/95 backdrop-blur-2xl
            flex items-center justify-center gap-8 md:gap-8
        `}>
            <div className="hidden md:flex flex-col items-center mt-6 mb-auto opacity-50">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-[var(--accent)] rounded-full"></div>
                </div>
            </div>

            {[
                { id: 'toy', icon: Sparkles, label: 'Play' },
                { id: 'game', icon: Layers, label: 'Compose' },
                { id: 'tool', icon: Box, label: 'Export' },
            ].map((item) => {
                const Icon = item.icon;
                const isActive = viewMode === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setViewMode(item.id as ViewMode)}
                        className={`
                            relative group flex flex-col items-center gap-1.5 p-2 transition-all duration-300
                            ${isActive ? 'text-white scale-110' : 'text-slate-600 hover:text-slate-400'}
                        `}
                    >
                        <div className={`
                            p-3 rounded-2xl transition-all duration-300
                            ${isActive ? 'bg-[var(--accent)] text-black shadow-[0_0_20px_-5px_var(--accent)]' : 'bg-transparent'}
                        `}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 absolute left-14 md:left-auto md:top-1/2 md:-translate-y-1/2 md:ml-12 transition-opacity bg-black/80 px-2 py-1 rounded text-white whitespace-nowrap hidden md:block">
                            {item.label}
                        </span>
                    </button>
                );
            })}

            <div className="hidden md:block mt-auto mb-6">
                <button 
                    onClick={() => setShowSettings(true)}
                    className={`group relative flex flex-col items-center gap-1.5 p-2 transition-colors ${showSettings ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                >
                    <div className="p-3 rounded-2xl hover:bg-white/5 transition-all">
                        <Smile size={20} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 absolute left-14 md:left-auto md:top-1/2 md:-translate-y-1/2 md:ml-12 transition-opacity bg-black/80 px-2 py-1 rounded text-white whitespace-nowrap hidden md:block">
                        Mood
                    </span>
                </button>
            </div>
        </nav>

        {/* Mobile Settings Toggle (Absolute Position) */}
        <button 
            onClick={() => setShowSettings(true)}
            className="md:hidden absolute top-4 right-4 z-50 p-3 bg-black/50 backdrop-blur rounded-full text-slate-400 hover:text-white border border-white/10"
        >
            <Smile size={20} />
        </button>

        {/* Settings / Mood Modal Overlay */}
        {showSettings && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg animate-in fade-in duration-200 flex items-center justify-center p-4">
                <div className="bg-[#111113] w-full max-w-2xl h-[80vh] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Use the MoodSelector component here */}
                    <MoodSelector 
                        currentScale={scaleType}
                        currentKey={currentKey}
                        onMoodSelect={handleMoodSelect}
                        onManualScaleSelect={setScaleType}
                        onTempoChange={setBpm}
                    />

                    {/* Quick Key Selector in Footer */}
                    <div className="p-6 bg-[#0c0c0e] border-t border-white/5 flex items-center justify-between gap-8">
                         <div className="flex flex-col shrink-0">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Root Key</span>
                            <span className="text-5xl font-bold text-white tracking-tighter">{currentKey}</span>
                         </div>
                         
                         <div className="grid grid-cols-6 gap-2 w-full max-w-md">
                             {['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'].map(k => (
                                 <button
                                    key={k}
                                    onClick={() => setCurrentKey(k as Note)}
                                    className={`
                                        h-10 text-xs font-bold rounded-md transition-all duration-200 flex items-center justify-center
                                        ${currentKey === k 
                                            ? 'bg-[var(--accent)] text-black shadow-[0_0_20px_-5px_var(--accent)] scale-105 font-extrabold' 
                                            : 'bg-[#18181b] text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20'
                                        }
                                    `}
                                 >
                                     {k}
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default App;
