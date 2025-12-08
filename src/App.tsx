import React, { Suspense } from 'react';
import { useStore, useDerivedData, Chord, useUrlSync } from './lib';
import { ProgressionStrip, cn, ControlPanel, SplitView, ResizableTopPanel, MoodSelector } from './components';
import { Loader2 } from 'lucide-react';

// Lazy load heavy visualization components
const HarmonicSpace = React.lazy(() => import('./tonnetz').then(module => ({ default: module.HarmonicSpace })));

export default function App() {
    // --- APP STATE (Global Store) ---
    const { 
        key, 
        scale, 
        complexity, 
        view,
        setHoveredChord,
        targetMood, 
        progression, handleProgression,
        mood, 
        playOne
    } = useStore();

    // Enable deep linking/URL synchronization
    useUrlSync();

    // --- DERIVED DATA ---
    const { chords, tensionChords } = useDerivedData();

    // Context for visualization
    const contextChord = progression.slice().reverse().find(c => !c.isRest) || null;

    return (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans relative selection:bg-[var(--accent)] selection:text-black transition-colors duration-300">
            
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay" style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, var(--bg-surface) 0%, var(--bg-main) 100%)'
            }}/>

            {/* Top Control Panel */}
            <ResizableTopPanel 
                minHeight={80} 
                maxHeight={140} 
                defaultHeight={88}
                children={<ControlPanel />}
            />

            {/* Main Workspace */}
            <div className="flex-1 relative min-h-0 z-10">
                <SplitView
                    top={
                        <div className="h-full w-full relative bg-[var(--bg-panel)] flex flex-col">
                            <div className="flex-1 flex flex-col h-full min-w-0">
                                <div className="flex-1 min-h-0 relative">
                                    <div className={cn("h-full w-full", view === 'sequencer' ? 'block' : 'hidden')}>
                                        <ProgressionStrip showPalette={true} />
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
                                <MoodSelector />
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}