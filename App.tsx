
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chord, ScaleType, Note, InstrumentType, generateChordsForScale, audioEngine, getScaleNotes, SPLIT_CONSTANTS, SplitDetent, SplitAccessory } from './lib';
import { Header, ProgressionStrip, GravityStage, TheoryTools, ComplicationDragBar, cn, MoodSelector, PanelWrapper, Typo, AiAssistant, ErrorBoundary } from './components';
import { Gauge, Zap, Activity, Music, Layout, Brain } from 'lucide-react';

export default function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [key, setKey] = useState<Note>('C');
    const [scale, setScale] = useState<ScaleType>(ScaleType.Major);
    const [bpm, setBpm] = useState(100);
    const [timeSig, setTimeSig] = useState({ num: 4, den: 4 });
    const [progression, setProgression] = useState<Chord[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playIndex, setPlayIndex] = useState<number|null>(null);
    const [tab, setTab] = useState('vibe');
    const [inst, setInst] = useState<InstrumentType>('rhodes');
    const [mood, setMood] = useState({ valence: 0.8, arousal: 0.2 }); // Lifted State for AI
    
    // Split View State (Physics Based)
    const [detent, setDetent] = useState<SplitDetent>(SplitDetent.Fraction);
    const [partition, setPartition] = useState(0); // Offset from center
    const [overscroll, setOverscroll] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Handle Window Resize for accurate calculations
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Derived Constants for Calculations
    const containerHeight = containerRef.current?.clientHeight || windowHeight;
    const cardHeight = (containerHeight) / 2 - SPLIT_CONSTANTS.spacing / 2;
    const { lil, lil2, lil3, notches, snapThreshold } = SPLIT_CONSTANTS;
    
    // Limits
    const range = cardHeight - lil; // Max distance from center

    const chords = useMemo(() => 
        generateChordsForScale(key, scale, 'triad').map(c => ({...c, duration: timeSig.num})), 
    [key, scale, timeSig.num]);
    
    const contextChord = progression.slice().reverse().find(c => !c.isRest); 
    const scaleNotes = getScaleNotes(key, scale);

    const play = (c: Chord) => { if (!c.isRest) audioEngine.playChord(c); };

    // Consolidated Progression Handler
    const handleProgression = (action: 'add' | 'remove' | 'clear' | 'reorder' | 'resize' | 'quantize', payload?: any) => {
        switch (action) {
            case 'add':
                let newChords: Chord[] = [];
                let insertIndex = -1;

                // Support both direct Chord/Chord[] payload and { chord, index } payload
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
        else { setIsPlaying(true); audioEngine.playProgression(progression, bpm, setPlayIndex, () => { setIsPlaying(false); setPlayIndex(null); }); }
    };
    
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // --- DRAG LOGIC (Ported from Swift) ---
    const handleDragStart = (e: any) => {
        setIsDragging(true);
    };

    const handleDragMove = useCallback((e: any) => {
        // Prevent default on touch to stop scrolling/pull-to-refresh
        if (e.cancelable && (e.type === 'touchmove' || 'touches' in e)) {
            e.preventDefault();
        }

        let clientY = 0;
        if ('touches' in e && e.touches && e.touches.length > 0) {
            clientY = e.touches[0].clientY;
        } else if ('clientY' in e) {
            clientY = e.clientY;
        } else {
            return; // Invalid event or no touch points
        }
            
        const center = containerHeight / 2;
        const rawOffset = clientY - center;
        
        // Damped overscroll calculation
        if (rawOffset < -range) {
             const extra = -range - rawOffset;
             setPartition(-range - (extra * 0.5)); // 50% resistance
             setOverscroll(extra);
        } else if (rawOffset > range) {
             const extra = rawOffset - range;
             setPartition(range + (extra * 0.5));
             setOverscroll(extra);
        } else {
             setPartition(rawOffset);
             setOverscroll(0);
        }
    }, [containerHeight, range]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setOverscroll(0); 
        
        // Snap Logic
        setPartition(prevPartition => {
            let newPartition = prevPartition;
            let newDetent: SplitDetent = SplitDetent.Fraction;
            
            if (prevPartition < -range + snapThreshold * range) { 
                newPartition = -range; 
                newDetent = SplitDetent.TopMini; 
            } else if (prevPartition > range - snapThreshold * range) { 
                newPartition = range; 
                newDetent = SplitDetent.BottomMini; 
            } else if (Math.abs(prevPartition) < 40) { 
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

    const accessories: { leading: SplitAccessory[], trailing: SplitAccessory[] } = {
        leading: [
            { id: 'vibe', icon: Gauge, action: () => setTab('vibe'), active: tab==='vibe' },
            { id: 'orbit', icon: Zap, action: () => setTab('orbit'), active: tab==='orbit' }
        ],
        trailing: [
            { id: 'theory', icon: Activity, action: () => setTab('theory'), active: tab==='theory' },
            { id: 'ai', icon: Brain, action: () => setTab('ai'), active: tab==='ai' }
        ]
    };

    return (
        <div 
            ref={containerRef} 
            data-theme={theme}
            className="relative h-screen w-full bg-black text-[var(--text-main)] overflow-hidden font-sans select-none touch-none"
        >
            {/* --- TOP VIEW --- */}
            <div 
                className="absolute left-0 right-0 top-0 z-10"
                style={{ height: topHeight + (overscroll < 0 ? Math.abs(overscroll) * 0.2 : 0) }}
            >
                <PanelWrapper 
                    minimise={topMinimise} 
                    overscroll={overscroll} 
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
                            keyNote={key} setKey={setKey} scale={scale} setScale={setScale} bpm={bpm} setBpm={setBpm}
                        />
                        <div className="flex-1 min-h-0">
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
                    </div>
                </PanelWrapper>
            </div>

            {/* --- BOTTOM VIEW --- */}
            <div 
                className="absolute left-0 right-0 bottom-0 z-10"
                style={{ height: bottomHeight + (overscroll > 0 ? overscroll * 0.2 : 0) }}
            >
                <PanelWrapper 
                    minimise={bottomMinimise} 
                    overscroll={overscroll} 
                    isFull={hideTop} 
                    bgColor="var(--bg-panel)" 
                    anchor="bottom"
                    overlay={
                        <div className="flex items-center gap-4 text-white">
                             <Layout size={20} className="text-[var(--accent)]" />
                             <span className="text-sm font-bold capitalize">{tab} Panel</span>
                        </div>
                    }
                >
                    <div className="h-full w-full bg-[var(--bg-panel)] overflow-hidden relative">
                         <div className="h-full w-full">
                            {tab==='vibe' && <MoodSelector theme={theme} currentScale={scale} currentKey={key} onManualScaleSelect={setScale} onTempoChange={setBpm} mood={mood} onMoodChange={(v:number, a:number)=>setMood({valence:v, arousal:a})} />}
                            {tab==='orbit' && <GravityStage currentKey={key} scaleType={scale} chords={chords} onAddChord={(c: Chord) => handleProgression('add', c)} onChordClick={play} contextChord={contextChord || null} />}
                            {tab==='theory' && <TheoryTools currentKey={key} scaleType={scale} chords={chords} progression={progression} onAppendChords={(cs: Chord[]) => handleProgression('add', cs)} onSetKey={setKey} onSetScale={setScale} onChordSelect={(c: Chord) => handleProgression('add', c)} onHover={(c: Chord | null) => c && play(c)} scaleNotes={scaleNotes} />}
                            {tab==='ai' && (
                                <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">AI Assistant is currently unavailable.</div>}>
                                    <AiAssistant mood={mood} currentKey={key} currentScale={scale} progression={progression} onAppendChords={(cs: Chord[]) => handleProgression('add', cs)} />
                                </ErrorBoundary>
                            )}
                        </div>
                    </div>
                </PanelWrapper>
            </div>
            
            {/* --- DRAG PILL --- */}
            <div 
                style={{ top: topHeight + SPLIT_CONSTANTS.spacing/2 }}
                className="absolute left-0 right-0 z-50 transform -translate-y-1/2 pointer-events-none transition-all duration-[50ms]"
            >
                <ComplicationDragBar 
                    leading={accessories.leading}
                    trailing={accessories.trailing}
                    onDragStart={handleDragStart}
                    isDragging={isDragging}
                />
            </div>
        </div>
    );
}
