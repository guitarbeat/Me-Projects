
import React, { useState, useEffect, useRef } from 'react';
import { Chord, ScaleType, Note, InstrumentType } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { getScaleNotes } from '../utils/musicTheory';
import ProgressionStrip from './ProgressionStrip';
import GravityStage from './GravityStage';
import ControlBar from './ControlBar';
import CircleOfFifths from './CircleOfFifths';
import TheoryPanel from './TheoryPanel';
import MoodSelector from './MoodSelector';
import AiAssistant from './AiAssistant';
import Controls from './Controls';
import { UnifiedHarmonicScope } from './Visualizers';
import { Activity, Disc, Zap, ChevronUp, Gauge, Brain, Sliders, GripHorizontal } from 'lucide-react';
import { cn, TabItem } from './UI';

interface ComposeViewProps {
    currentKey: Note;
    scaleType: ScaleType;
    displayedChords: Chord[];
    progression: Chord[];
    setProgression: React.Dispatch<React.SetStateAction<Chord[]>>;
    onPlayChord: (chord: Chord) => void;
    bpm: number;
    onSetKey: (key: Note) => void;
    onSetScale: (scale: ScaleType) => void;
    onSetBpm: (bpm: number) => void;
    onOpenSettings: () => void;
}

type StudioTab = 'vibe' | 'orbit' | 'circle' | 'theory' | 'ai' | 'sound';

const ComposeView: React.FC<ComposeViewProps> = ({
    currentKey, scaleType, displayedChords, progression, setProgression,
    onPlayChord, bpm, onSetKey, onSetScale, onSetBpm, onOpenSettings
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
    const [draggingChord, setDraggingChord] = useState<Chord | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>('vibe');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [instrument, setInstrument] = useState<InstrumentType>('rhodes');
    
    // Resizable Panel State
    const [panelHeight, setPanelHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400);
    const [isDragging, setIsDragging] = useState(false);
    const heightRef = useRef(panelHeight);

    const contextChord = progression.length > 0 ? progression[progression.length - 1] : null;
    const scaleNotes = getScaleNotes(currentKey, scaleType);

    useEffect(() => { heightRef.current = panelHeight; }, [panelHeight]);

    const addChord = (c: Chord) => { setProgression(p => [...p, c]); onPlayChord(c); };
    const appendChords = (cs: Chord[]) => { setProgression(p => [...p, ...cs]); if (cs[0]) onPlayChord(cs[0]); };
    const removeChord = (idx: number) => setProgression(p => p.filter((_, i) => i !== idx));
    
    const togglePlay = () => {
        if (isPlaying) {
            audioEngine.stop();
            setIsPlaying(false);
            setPlaybackIndex(null);
        } else {
            if (!progression.length) return;
            setIsPlaying(true);
            audioEngine.playProgression(progression, bpm, setPlaybackIndex, () => { setIsPlaying(false); setPlaybackIndex(null); });
        }
    };

    useEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
            if (e.code === 'Backspace' && progression.length && !isPlaying) removeChord(progression.length-1);
        };
        window.addEventListener('keydown', keyHandler);
        return () => window.removeEventListener('keydown', keyHandler);
    }, [isPlaying, progression]);

    // Drag Logic
    const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            const newHeight = window.innerHeight - clientY;
            const max = window.innerHeight - 80; // Keep ControlBar + Buffer visible
            const min = 0; 
            
            setPanelHeight(Math.min(Math.max(newHeight, min), max));
        };

        const handleUp = () => {
            setIsDragging(false);
            if (heightRef.current < 100) {
                 setIsPanelOpen(false);
                 setPanelHeight(400); // Reset for next open
            }
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };
    }, [isDragging]);

    const tabs: TabItem[] = [
        { id: 'vibe', label: 'Vibe', icon: Gauge },
        { id: 'orbit', label: 'Orbit', icon: Zap },
        { id: 'theory', label: 'Theory', icon: Activity },
        { id: 'circle', label: 'Scope', icon: Disc },
        { id: 'ai', label: 'Assistant', icon: Brain },
        { id: 'sound', label: 'Sound', icon: Sliders },
    ];

    return (
        <div className="flex flex-col h-full bg-[#0c0c0e] font-sans text-zinc-200">
            <ControlBar 
                isPlaying={isPlaying} onPlay={togglePlay} onStop={togglePlay}
                canPlay={progression.length > 0} bpm={bpm}
                currentKey={currentKey} scaleType={scaleType}
                isPaletteOpen={isPanelOpen} onTogglePalette={() => setIsPanelOpen(!isPanelOpen)}
                onOpenSettings={onOpenSettings}
            />
            
            {/* Top Region: Timeline */}
            <div className="flex-1 relative overflow-hidden bg-[#0c0c0e] flex flex-col min-h-0 border-b border-white/5">
                <ProgressionStrip 
                    progression={progression} onRemove={removeChord} onClear={() => setProgression([])}
                    isPlaying={isPlaying} activeIndex={playbackIndex}
                    onDropChord={addChord} draggingChord={draggingChord}
                    onLoadTemplate={appendChords} availableChords={displayedChords}
                />
                {!isPanelOpen && (
                    <button 
                        onClick={() => setIsPanelOpen(true)}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[var(--accent)] opacity-50 hover:opacity-100 transition-opacity p-3 bg-[#09090b] rounded-full border border-white/10 shadow-xl hover:scale-110"
                    >
                        <ChevronUp size={24} />
                    </button>
                )}
            </div>
            
            {/* Bottom Region: Tools */}
            <div 
                style={{ height: isPanelOpen ? panelHeight : 0 }}
                className={cn(
                    "flex-none relative bg-[#09090b] flex flex-col z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10",
                    isDragging ? "transition-none select-none" : "transition-[height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    !isPanelOpen && "overflow-hidden"
                )}
            >
                {/* Drag Handle */}
                <div 
                    className="w-full h-8 absolute -top-4 left-0 right-0 z-50 cursor-row-resize flex items-center justify-center group hover:bg-white/5 transition-colors"
                    onMouseDown={startResizing}
                    onTouchStart={startResizing}
                    style={{ touchAction: 'none' }}
                >
                    <div className="w-20 h-1.5 bg-zinc-700/50 rounded-full group-hover:bg-[var(--accent)] group-hover:w-24 transition-all duration-300 backdrop-blur-sm shadow-sm flex items-center justify-center">
                        <GripHorizontal size={10} className="text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Clean Tab Bar */}
                <div className="flex items-end px-4 border-b border-white/5 bg-[#0c0c0e] pt-2 overflow-x-auto scrollbar-hide">
                    {tabs.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setActiveTab(t.id as StudioTab)} 
                            className={cn(
                                "px-4 py-3 min-w-fit whitespace-nowrap text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 rounded-t-lg transition-all border-t border-x border-transparent relative top-[1px] outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090b]",
                                activeTab === t.id 
                                    ? "text-white bg-[#09090b] border-white/5 border-b-[#09090b]" 
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#121214]"
                            )}
                        >
                            {t.icon && <t.icon size={14} className={cn("transition-colors", activeTab === t.id ? "text-[var(--accent)]" : "opacity-50")} />} 
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative overflow-hidden bg-[#09090b]">
                    {activeTab === 'vibe' && (
                        <MoodSelector 
                            currentScale={scaleType} currentKey={currentKey} 
                            onMoodSelect={() => {}} onManualScaleSelect={onSetScale} onTempoChange={onSetBpm} 
                        />
                    )}
                    {activeTab === 'orbit' && (
                        <GravityStage 
                            currentKey={currentKey} scaleType={scaleType} chords={displayedChords}
                            onAddChord={addChord} onInspectChord={() => {}} 
                            onDragStart={setDraggingChord} triggerMode="drag" contextChord={contextChord} onChordClick={(c: Chord) => onPlayChord(c)}
                        />
                    )}
                    {activeTab === 'theory' && (
                        <TheoryPanel 
                            currentKey={currentKey} scaleType={scaleType} progression={progression} 
                            onAppendChords={appendChords} onSetKey={onSetKey} chords={displayedChords} onChordSelect={addChord} onHover={(c) => c && onPlayChord(c)}
                        />
                    )}
                    {activeTab === 'circle' && (
                         <div className="h-full flex flex-col lg:flex-row overflow-hidden">
                            <div className="flex-none lg:flex-1 flex items-center justify-center p-4 bg-[#0c0c0e] border-b lg:border-b-0 lg:border-r border-white/5">
                                <CircleOfFifths currentKey={currentKey} onKeySelect={onSetKey} activeChord={contextChord} />
                            </div>
                            <div className="flex-1 lg:w-[450px] lg:flex-none bg-[#09090b]">
                                <UnifiedHarmonicScope chord={contextChord || displayedChords[0]} scaleNotes={scaleNotes} />
                            </div>
                         </div>
                    )}
                    {activeTab === 'ai' && (
                        <AiAssistant 
                            currentKey={currentKey} scaleType={scaleType} progression={progression}
                            onAppendChords={appendChords} onSetKey={onSetKey}
                        />
                    )}
                    {activeTab === 'sound' && (
                        <Controls currentInstrument={instrument} onSetInstrument={setInstrument} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComposeView;
