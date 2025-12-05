

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chord, ScaleType, Note, InstrumentType, generateChordsForScale, audioEngine, getScaleNotes, SPLIT_CONSTANTS, SplitDetent, SplitAccessory } from './lib';
import { Header, ProgressionStrip, HarmonicSpace, ComplicationDragBar, cn, MoodSelector, PanelWrapper, Typo } from './components';
import { Gauge, Zap, Activity, Music, Layout, Wrench } from 'lucide-react';

export default function App() {
    // --- APP STATE ---
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [key, setKey] = useState<Note>('C');
    const [scale, setScale] = useState<ScaleType>(ScaleType.Major);
    const [isScaleLocked, setIsScaleLocked] = useState(false);
    const [bpm, setBpm] = useState(100);
    const [timeSig, setTimeSig] = useState({ num: 4, den: 4 });
    const [progression, setProgression] = useState<Chord[]>([]);
    
    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [playIndex, setPlayIndex] = useState<number|null>(null);
    const [inst, setInst] = useState<InstrumentType>('rhodes');
    
    // UI State
    const [topView, setTopView] = useState<string>('sequencer');
    // Mood State: Valence (X), Arousal (Y), Tension (Z - Scroll)
    const [mood, setMood] = useState({ valence: 0.8, arousal: 0.2, tension: 0.0 }); 
    
    // --- SPLIT VIEW STATE ---
    const [detent, setDetent] = useState<SplitDetent>(SplitDetent.Fraction);
    const [partition, setPartition] = useState(0); 
    const [isDragging, setIsDragging] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerHeight = containerRef.current?.clientHeight || windowHeight;
    const cardHeight = (containerHeight) / 2 - SPLIT_CONSTANTS.spacing / 2;
    const { lil, lil3, snapThreshold } = SPLIT_CONSTANTS;
    
    const range = cardHeight - lil; 

    // --- DATA GENERATION ---
    const chords = useMemo(() => 
        generateChordsForScale(key, scale, 'triad').map(c => ({...c, duration: timeSig.num})), 
    [key, scale, timeSig.num]);
    
    const contextChord = progression.slice().reverse().find(c => !c.isRest); 
    const scaleNotes = getScaleNotes(key, scale);

    // --- ACTIONS ---
    const play = (c: Chord) => { if (!c.isRest) audioEngine.playChord(c); };
    
    const updateMood = (v: number, a: number, t?: number) => {
        // Preserve tension if not provided (e.g., from XY pad)
        const newTension = t !== undefined ? t : mood.tension;
        setMood({ valence: v, arousal: a, tension: newTension });
        audioEngine.setMood(v, a, newTension);
    };

    const handleScaleSelect = (s: ScaleType) => {
        if (!isScaleLocked) {
            setScale(s);
        }
    };

    const handleProgression = (action: 'add' | 'remove' | 'clear' | 'reorder' | 'resize' | 'quantize', payload?: any) => {
        switch (action) {
            case 'add':
                let newChords: Chord[] = [];
                let insertIndex = -1;

                if (payload && typeof payload === 'object' && ('chord' in payload || 'chords' in payload) && 'index' in payload) {
                     const c = payload.chord || payload.chords;
                     newChords = Array.isArray(c) ? c : [c];
                     insertIndex = payload.index;
                } else {
                     newChords = Array.isArray(payload) ? payload : [payload];
                }

                const processedChords = newChords.map(c => ({...c, duration: timeSig.num})); 
                
                setProgression(prev => {
                    if (insertIndex !== -1 && insertIndex <= prev.length) {
                        const clone = [...prev];
                        clone.splice(insertIndex, 0, ...processedChords);
                        return clone;
                    }
                    return [...prev, ...processedChords];
                });
                
                if (processedChords[0] && !processedChords[0].isRest) play(processedChords[0]);
                break;
            case 'remove':
                if (typeof payload === 'number') setProgression(prev => prev.filter((_, i) => i !== payload));
                break;
            case 'clear':
                setProgression([]);
                break;
            case 'reorder':
                if (payload && typeof payload.from === 'number' && typeof payload.to === 'number') {
                    setProgression(prev => {
                        const clone = [...prev];
                        const [moved] = clone.splice(payload.from, 1);
                        clone.splice(payload.to, 0, moved);
                        return clone;
                    });
                }
                break;
            case 'resize':
                if (payload && typeof payload.index === 'number' && typeof payload.duration === 'number') {
                    setProgression(prev => {
                        const clone = [...prev];
                        clone[payload.index] = { ...clone[payload.index], duration: payload.duration };
                        return clone;
                    });
                }
                break;
            case 'quantize':
                setProgression(prev => {
                    const grid = 0.25;
                    let t = 0;
                    return prev.map(c => {
                        const start = t;
                        const end = start + c.duration;
                        const qStart = Math.round(start / grid) * grid;
                        const qEnd = Math.round(end / grid) * grid;
                        t = end;
                        let dur = parseFloat((qEnd - qStart).toFixed(2));
                        if (dur < grid) dur = grid;
                        return { ...c, duration: dur };
                    });
                });
                break;
        }
    };

    const toggle = () => {
        if(isPlaying) { audioEngine.stop(); setIsPlaying(false); setPlayIndex(null); }
        else { 
            audioEngine.setMood(mood.valence, mood.arousal, mood.tension);
            setIsPlaying(true); 
            audioEngine.playProgression(progression, bpm, setPlayIndex, () => { setIsPlaying(false); setPlayIndex(null); }); 
        }
    };
    
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
    };

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (e.cancelable && (e.type === 'touchmove' || 'touches' in e)) {
            e.preventDefault();
        }

        let clientY = 0;
        if ('touches' in e && (e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) {
            clientY = (e as TouchEvent).touches[0].clientY;
        } else if ('clientY' in e) {
            clientY = (e as MouseEvent).clientY;
        } else {
            return;
        }
            
        const center = containerHeight / 2;
        const rawOffset = clientY - center;
        
        setPartition(Math.max(-range, Math.min(range, rawOffset)));
    }, [containerHeight, range]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        
        setPartition(prevPartition => {
            let newPartition = prevPartition;
            let newDetent: SplitDetent = SplitDetent.Fraction;
            
            if (prevPartition < -range + snapThreshold * range) { 
                newPartition = -range; 
                newDetent = SplitDetent.TopMini; 
            } 
            else if (prevPartition > range - snapThreshold * range) { 
                newPartition = range; 
                newDetent = SplitDetent.BottomMini; 
            } 
            else if (Math.abs(prevPartition) < 40) { 
                newPartition = 0; 
            }
            setDetent(newDetent);
            return newPartition;
        });
        
    }, [range, snapThreshold]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    const topHeight = cardHeight + partition;
    const topMinimise = Math.max(0, Math.min(1, (lil3 - topHeight) / lil)); 
    const bottomHeight = containerHeight - topHeight - SPLIT_CONSTANTS.spacing;
    const bottomMinimise = Math.max(0, Math.min(1, (lil3 - bottomHeight) / lil));
    const hideTop = detent === SplitDetent.BottomFull; 
    const hideBottom = detent === SplitDetent.TopFull;

    return (
        <div 
            ref={containerRef} 
            data-theme={theme}
            className="relative h-screen w-full bg-black text-[var(--text-main)] overflow-hidden font-sans select-none touch-none"
        >
            {/* --- TOP VIEW (Sequencer / Harmony) --- */}
            <div 
                className="absolute left-0 right-0 top-0 z-10"
                style={{ height: topHeight }}
            >
                <PanelWrapper 
                    minimise={topMinimise} 
                    isFull={hideBottom} 
                    bgColor="var(--bg-panel)" 
                    anchor="top"
                    overlay={
                        <div className="flex items-center gap-4 text-white">
                            <Music size={20} className="text-[var(--accent)]" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">{key} {scale}</span>
                                <span className="text-xs opacity-70">{bpm} BPM • {timeSig.num}/{timeSig.den}</span>
                            </div>
                        </div>
                    }
                >
                    <div className="h-full flex flex-col relative bg-[var(--bg-panel)]">
                        <Header 
                            isPlaying={isPlaying} togglePlay={toggle} theme={theme} toggleTheme={toggleTheme} 
                            instrument={inst} setInstrument={(i: InstrumentType) => { setInst(i); audioEngine.setInstrument(i); }}
                            keyNote={key} scale={scale} bpm={bpm}
                            view={topView} setView={setTopView}
                            progressionCount={progression.length}
                        />
                        <div className="flex-1 min-h-0 relative">
                            {/* Persistent Views (display:none when inactive) to preserve state */}
                            
                            {/* 1. Sequencer View */}
                            <div className={cn("h-full w-full", topView === 'sequencer' ? 'block' : 'hidden')}>
                                <ProgressionStrip 
                                    progression={progression} 
                                    onRemove={(i) => handleProgression('remove', i)} 
                                    onDropChord={(c, index) => handleProgression('add', { chord: c, index })} 
                                    draggingChord={null} 
                                    availableChords={chords}
                                    onReorder={(from, to) => handleProgression('reorder', { from, to })}
                                    onResize={(index, duration) => handleProgression('resize', { index, duration })}
                                    onClear={() => handleProgression('clear')}
                                    onQuantize={() => handleProgression('quantize')}
                                    timeSignature={timeSig}
                                    onSetTimeSignature={setTimeSig}
                                    activeIndex={playIndex}
                                />
                            </div>

                            {/* 2. Harmony View */}
                            <div className={cn("h-full w-full", topView === 'harmony' ? 'block' : 'hidden')}>
                                <HarmonicSpace 
                                    currentKey={key} 
                                    scaleType={scale} 
                                    chords={chords} 
                                    onAddChord={(c: Chord) => handleProgression('add', c)} 
                                    onChordClick={play} 
                                    contextChord={contextChord || null} 
                                    mood={mood}
                                />
                            </div>
                        </div>
                    </div>
                </PanelWrapper>
            </div>

            {/* --- BOTTOM VIEW (Vibe Selector Only) --- */}
            <div 
                className="absolute left-0 right-0 bottom-0 z-10"
                style={{ height: bottomHeight }}
            >
                <PanelWrapper 
                    minimise={bottomMinimise} 
                    isFull={hideTop} 
                    bgColor="var(--bg-panel)" 
                    anchor="bottom"
                    overlay={
                        <div className="flex items-center justify-center gap-4 text-white w-full">
                             <Layout size={20} className="text-[var(--accent)]" />
                             <span className="text-sm font-bold capitalize">Vibe Selector</span>
                        </div>
                    }
                >
                    <div className="h-full w-full bg-[var(--bg-panel)] overflow-hidden relative">
                         <div className="h-full w-full">
                            <MoodSelector 
                                theme={theme} 
                                currentScale={scale} 
                                currentKey={key} 
                                onManualScaleSelect={handleScaleSelect}
                                onKeyChange={setKey} 
                                onTempoChange={setBpm} 
                                mood={mood} 
                                onMoodChange={updateMood} 
                                bpm={bpm}
                                isScaleLocked={isScaleLocked}
                                toggleScaleLock={() => setIsScaleLocked(!isScaleLocked)}
                                progression={progression}
                                activeIndex={playIndex}
                            />
                        </div>
                    </div>
                </PanelWrapper>
            </div>
            
            <div 
                style={{ top: topHeight + SPLIT_CONSTANTS.spacing/2 }}
                className="absolute left-0 right-0 z-50 transform -translate-y-1/2 pointer-events-none transition-all duration-[50ms]"
            >
                <ComplicationDragBar 
                    onDragStart={handleDragStart}
                    isDragging={isDragging}
                />
            </div>
        </div>
    );
}