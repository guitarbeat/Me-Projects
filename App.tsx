
import React, { useState, useMemo } from 'react';
import { ScaleType, Note, InstrumentType, generateChordsForScale, audioEngine, useProgression, usePlayback, useMood, Chord, ChordComplexity, getTensionChords, getMusicalCharacteristics, SCALE_DEFS } from './lib';
import { ProgressionStrip, HarmonicSpace, cn, MoodSelector, ControlPanel, SplitView, ResizableTopPanel } from './components';
import { Music, Layout } from 'lucide-react';

export default function App() {
    // --- APP STATE ---
    const [key, setKey] = useState<Note>('C');
    const [scale, setScale] = useState<ScaleType>(ScaleType.Major);
    const [complexity, setComplexity] = useState<ChordComplexity>('triad');
    const [isScaleLocked, setIsScaleLocked] = useState(false);
    const [bpm, setBpm] = useState(100);
    const [timeSig, setTimeSig] = useState({ num: 4, den: 4 });
    const [inst, setInst] = useState<InstrumentType>('rhodes');
    const [showPath, setShowPath] = useState(false);
    
    // UI State
    const [topView, setTopView] = useState<string>('sequencer');

    // --- HOOKS ---
    const { progression, handleProgression, addRest } = useProgression(timeSig);
    const { mood, updateMood } = useMood(audioEngine);
    const { isPlaying, playIndex, togglePlay, playOne } = usePlayback(audioEngine, progression, bpm, mood);

    // --- DATA GENERATION ---
    const chords = useMemo(() => 
        generateChordsForScale(key, scale, complexity).map(c => ({...c, duration: timeSig.num})), 
    [key, scale, complexity, timeSig.num]);

    // Generate specific tension chords (substitutions) based on the current key and high tension values
    const tensionChords = useMemo(() => 
        mood.tension > 0.3 ? getTensionChords(key, scale, mood.tension) : [],
    [key, scale, mood.tension]);
    
    const contextChord = progression.slice().reverse().find(c => !c.isRest); 

    // Calculate Analysis Data
    const char = useMemo(() => getMusicalCharacteristics(mood.valence, mood.arousal, mood.tension), [mood.valence, mood.arousal, mood.tension]);
    const scaleMeta = useMemo(() => SCALE_DEFS[scale]?.meta || { desc: '', characteristic: '' }, [scale]);

    // --- HANDLERS ---
    const handleInstrumentChange = (i: InstrumentType) => { setInst(i); audioEngine.setInstrument(i); };

    const handleScaleSelect = (s: ScaleType) => {
        if (!isScaleLocked) setScale(s);
    };

    const handleDropChord = (c: Chord, index: number) => {
        playOne(c);
        handleProgression('add', { chord: c, index });
    };

    return (
        <div className="flex flex-col h-screen w-full bg-black text-[var(--text-main)] overflow-hidden font-sans">
            
            {/* Consolidated Top Control Panel */}
            <ResizableTopPanel minHeight={120} maxHeight={240} defaultHeight={140}>
                <ControlPanel 
                    isPlaying={isPlaying} 
                    togglePlay={togglePlay} 
                    timeSig={timeSig} 
                    setTimeSig={setTimeSig}
                    complexity={complexity}
                    setComplexity={setComplexity}
                    onRest={addRest}
                    onSnap={() => handleProgression('quantize')}
                    onClear={() => handleProgression('clear')}
                    currentKey={key}
                    setKey={setKey}
                    scale={scale}
                    setScale={handleScaleSelect}
                    isScaleLocked={isScaleLocked}
                    toggleScaleLock={() => setIsScaleLocked(!isScaleLocked)}
                    showPath={showPath}
                    togglePath={() => setShowPath(!showPath)}
                    // Unified Props
                    instrument={inst}
                    setInstrument={handleInstrumentChange}
                    view={topView}
                    setView={setTopView}
                    progressionCount={progression.length}
                    // Metadata
                    scaleMeta={scaleMeta}
                    analysis={char}
                />
            </ResizableTopPanel>

            {/* Main Workspace (Split View) */}
            <div className="flex-1 relative min-h-0">
                <SplitView
                    topOverlay={
                        <div className="flex items-center gap-4 text-white">
                            <Music size={20} className="text-[var(--accent)]" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">{key} {scale}</span>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs opacity-70">{bpm} BPM</span>
                                     <span className="text-[8px] opacity-50 px-1 py-0.5 border border-white/20 rounded uppercase">{complexity}</span>
                                </div>
                            </div>
                        </div>
                    }
                    bottomOverlay={
                        <div className="flex items-center justify-center gap-4 text-white w-full">
                                <Layout size={20} className="text-[var(--accent)]" />
                                <span className="text-sm font-bold capitalize">Vibe Selector</span>
                        </div>
                    }
                    top={
                        <div className="h-full w-full relative bg-[var(--bg-panel)] flex flex-col">
                            <div className="flex-1 flex flex-col h-full min-w-0">
                                <div className="flex-1 min-h-0 relative">
                                    <div className={cn("h-full w-full", topView === 'sequencer' ? 'block' : 'hidden')}>
                                        <ProgressionStrip 
                                            progression={progression} 
                                            onRemove={(i: number) => handleProgression('remove', i)} 
                                            onDropChord={handleDropChord} 
                                            availableChords={chords}
                                            onReorder={(from: number, to: number) => handleProgression('reorder', { from, to })}
                                            onResize={(index: number, duration: number) => handleProgression('resize', { index, duration })}
                                            timeSignature={timeSig}
                                            activeIndex={playIndex}
                                        />
                                    </div>

                                    <div className={cn("h-full w-full", topView === 'harmony' ? 'block' : 'hidden')}>
                                        <HarmonicSpace 
                                            currentKey={key} 
                                            scaleType={scale} 
                                            chords={chords} 
                                            tensionChords={tensionChords}
                                            onAddChord={(c: Chord) => handleProgression('add', c)} 
                                            onChordClick={playOne} 
                                            contextChord={contextChord || null} 
                                            mood={mood}
                                            complexity={complexity}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    bottom={
                        <div className="h-full w-full bg-[var(--bg-panel)] overflow-hidden relative">
                            <div className="h-full w-full">
                                <MoodSelector 
                                    theme="dark"
                                    currentScale={scale} 
                                    onManualScaleSelect={handleScaleSelect}
                                    onTempoChange={setBpm} 
                                    mood={mood} 
                                    onMoodChange={updateMood} 
                                    bpm={bpm}
                                    isScaleLocked={isScaleLocked}
                                    progression={progression}
                                    activeIndex={playIndex}
                                    showPath={showPath}
                                />
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
