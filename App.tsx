
import React, { Suspense } from 'react';
import { useStore, useDerivedData, ScaleType, InstrumentType, Chord, Note, ChordComplexity } from './lib';
import { ProgressionStrip, cn, ControlPanel, SplitView, ResizableTopPanel, MoodSelector } from './components';
import { Loader2 } from 'lucide-react';

// Lazy load heavy visualization components
const HarmonicSpace = React.lazy(() => import('./tonnetz').then(module => ({ default: module.HarmonicSpace })));

export default function App() {
    // --- APP STATE (Global Store) ---
    const { 
        key, setKey, 
        scale, setScale, 
        complexity, setComplexity, 
        isScaleLocked, toggleScaleLock,
        bpm, setBpm, 
        timeSig, setTimeSig, 
        instrument, setInstrument, 
        showPath, togglePath, 
        view, setView,
        hoveredChord, setHoveredChord,
        targetMood, setTargetMood,
        progression, handleProgression,
        mood, setMood,
        playIndex, togglePlay, playOne, isPlaying
    } = useStore();

    // --- DERIVED DATA ---
    const { chords, tensionChords, analysis, scaleMeta } = useDerivedData();

    // Context for visualization
    const contextChord = progression.slice().reverse().find(c => !c.isRest) || null;

    // --- HANDLERS ---
    const addRest = () => {
        const rest: Chord = {
            root: 'C', quality: 'Major', extension: '', suffix: '', symbol: 'Rest',
            romanNumeral: '', notes: [], interval: -1, duration: timeSig.num, isRest: true
        };
        handleProgression('add', { chord: rest, index: progression.length });
    };

    const handleScaleSelect = (s: ScaleType) => {
        if (!isScaleLocked) setScale(s);
    };

    const handleDropChord = (c: Chord, index: number) => {
        playOne(c);
        handleProgression('add', { chord: c, index });
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#09090b] text-[var(--text-main)] overflow-hidden font-sans relative selection:bg-[var(--accent)] selection:text-black">
            
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, #1c1917 0%, #000000 100%)'
            }}/>

            {/* Top Control Panel */}
            <ResizableTopPanel 
                minHeight={84} 
                maxHeight={220} 
                defaultHeight={140}
                children={
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
                        toggleScaleLock={toggleScaleLock}
                        showPath={showPath}
                        togglePath={togglePath}
                        instrument={instrument}
                        setInstrument={setInstrument}
                        view={view}
                        setView={setView}
                        progressionCount={progression.length}
                        scaleMeta={scaleMeta}
                        analysis={analysis}
                        availableChords={chords}
                    />
                }
            />

            {/* Main Workspace */}
            <div className="flex-1 relative min-h-0 z-10">
                <SplitView
                    top={
                        <div className="h-full w-full relative bg-[var(--bg-panel)] flex flex-col">
                            <div className="flex-1 flex flex-col h-full min-w-0">
                                <div className="flex-1 min-h-0 relative">
                                    <div className={cn("h-full w-full", view === 'sequencer' ? 'block' : 'hidden')}>
                                        <ProgressionStrip 
                                            progression={progression} 
                                            onRemove={(i: number) => handleProgression('remove', i)} 
                                            onDropChord={handleDropChord} 
                                            availableChords={chords}
                                            onReorder={(from: number, to: number) => handleProgression('reorder', { from, to })}
                                            onResize={(index: number, duration: number) => handleProgression('resize', { index, duration })}
                                            timeSignature={timeSig}
                                            activeIndex={playIndex}
                                            currentKey={key}
                                            scaleType={scale}
                                            showPalette={false}
                                        />
                                    </div>

                                    <div className={cn("h-full w-full", view === 'harmony' ? 'block' : 'hidden')}>
                                        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" size={16} /></div>}>
                                            <HarmonicSpace 
                                                currentKey={key} 
                                                scaleType={scale} 
                                                chords={chords} 
                                                tensionChords={tensionChords}
                                                onAddChord={(c: Chord) => handleProgression('add', c)} 
                                                onChordClick={playOne} 
                                                contextChord={contextChord} 
                                                mood={mood}
                                                complexity={complexity}
                                                targetMood={targetMood}
                                                onHoverChord={setHoveredChord}
                                            />
                                        </Suspense>
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
                                    onMoodChange={(v, a, t) => setMood(v, a, t)} 
                                    bpm={bpm}
                                    isScaleLocked={isScaleLocked}
                                    progression={progression}
                                    activeIndex={playIndex}
                                    showPath={showPath}
                                    hoveredChord={hoveredChord}
                                    onPreviewMood={setTargetMood}
                                    instrument={instrument}
                                />
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
