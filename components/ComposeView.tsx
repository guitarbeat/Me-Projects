
import React, { useState } from 'react';
import { Chord, ScaleType, Note } from '../types';
import { audioEngine } from '../utils/audioEngine';
import ProgressionStrip from './ProgressionStrip';
import GravityStage from './GravityStage';
import ControlBar from './ControlBar';
import JazzGuide from './JazzGuide';
import { Wand2, MousePointer2, ChevronUp } from 'lucide-react';

interface ComposeViewProps {
    currentKey: Note;
    scaleType: ScaleType;
    displayedChords: Chord[];
    progression: Chord[];
    setProgression: React.Dispatch<React.SetStateAction<Chord[]>>;
    onPlayChord: (chord: Chord) => void;
    bpm: number;
    onSetKey: (key: Note) => void;
    onOpenSettings: () => void;
}

type PickerMode = 'orbit' | 'guide';

const ComposeView: React.FC<ComposeViewProps> = ({
    currentKey,
    scaleType,
    displayedChords,
    progression,
    setProgression,
    onPlayChord,
    bpm,
    onSetKey,
    onOpenSettings
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
    const [draggingChord, setDraggingChord] = useState<Chord | null>(null);
    const [pickerMode, setPickerMode] = useState<PickerMode>('orbit');
    const [isPaletteOpen, setIsPaletteOpen] = useState(true);

    // Handlers
    const handleAddChord = (chord: Chord) => {
        setProgression((prev) => [...prev, chord]);
        onPlayChord(chord);
    };

    const handleAppendChords = (chords: Chord[]) => {
        setProgression((prev) => [...prev, ...chords]);
        if (chords.length > 0) onPlayChord(chords[0]);
    };

    const handleRemoveChord = (index: number) => {
        setProgression((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (progression.length === 0) return;
        setIsPlaying(true);
        audioEngine.playProgression(progression, bpm, setPlaybackIndex, () => {
            setIsPlaying(false);
            setPlaybackIndex(null);
        });
    };

    const handleStop = () => {
        audioEngine.stop();
        setIsPlaying(false);
        setPlaybackIndex(null);
    };

    const handleShare = () => {
        if (progression.length === 0) return;
        
        const text = `Harmonic Studio Sketch\nKey: ${currentKey} ${scaleType} | ${bpm} BPM\n\nProgression:\n${progression.map((c, i) => `| ${c.symbol} (${c.romanNumeral}) `).join('')}|`;
        
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#111113] animate-in fade-in duration-300">
            {/* Top Bar */}
            <ControlBar 
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onStop={handleStop}
                canPlay={progression.length > 0}
                bpm={bpm}
                currentKey={currentKey}
                scaleType={scaleType}
                isPaletteOpen={isPaletteOpen}
                onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
                onOpenSettings={onOpenSettings}
                onShare={handleShare}
            />
            
            {/* Timeline Area (The Canvas) */}
            <div className="flex-1 relative overflow-hidden bg-[#0c0c0e]">
                <ProgressionStrip 
                    progression={progression}
                    onRemove={handleRemoveChord}
                    onClear={() => setProgression([])}
                    isPlaying={isPlaying}
                    activeIndex={playbackIndex}
                    onDropChord={handleAddChord}
                    draggingChord={draggingChord}
                />
            </div>
            
            {/* Bottom Panel Container */}
            <div className={`flex-none border-t border-white/10 relative bg-[#09090b] transition-all duration-500 ease-in-out flex flex-col ${isPaletteOpen ? 'h-[360px]' : 'h-0 border-none'}`}>
                
                {/* Tab/Handle (Always Visible when open, or floating when closed? Actually tabs are part of content, handle toggle via Bar) */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center transition-opacity duration-300 ${isPaletteOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex bg-[#09090b] border border-white/10 border-b-0 rounded-t-lg overflow-hidden shadow-lg">
                        <button
                            onClick={() => setPickerMode('orbit')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase flex items-center gap-2 transition-colors ${pickerMode === 'orbit' ? 'text-white bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <MousePointer2 size={12} />
                            Manual
                        </button>
                        <div className="w-px bg-white/10"></div>
                        <button
                            onClick={() => setPickerMode('guide')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase flex items-center gap-2 transition-colors ${pickerMode === 'guide' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Wand2 size={12} />
                            Generator
                        </button>
                    </div>
                </div>

                {/* Collapsed Indicator */}
                {!isPaletteOpen && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none text-[var(--accent)] opacity-50">
                        <ChevronUp size={24} />
                    </div>
                )}

                {/* Panel Content */}
                <div className={`flex-1 relative overflow-hidden transition-opacity duration-300 ${isPaletteOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {pickerMode === 'orbit' ? (
                        <>
                            <GravityStage 
                                currentKey={currentKey}
                                scaleType={scaleType}
                                chords={displayedChords}
                                onAddChord={handleAddChord}
                                onInspectChord={() => {}} 
                                onDragStart={(chord) => setDraggingChord(chord)}
                                onDragEnd={() => setDraggingChord(null)}
                                triggerMode="drag"
                            />
                            {/* Hint Overlay */}
                            <div className="absolute top-4 left-4 pointer-events-none bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/5">
                                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wide">
                                    Drag spheres to timeline
                                </p>
                            </div>
                        </>
                    ) : (
                        <JazzGuide 
                            currentKey={currentKey}
                            scaleType={scaleType}
                            progression={progression}
                            onAppendChords={handleAppendChords}
                            onSetKey={onSetKey}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComposeView;
