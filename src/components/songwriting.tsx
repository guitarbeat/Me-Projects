import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Chord } from '../types';
import { cn } from './ui';
import { Mic2, Type, Music } from 'lucide-react';

interface LyricsBlockProps {
    chord: Chord;
    index: number;
    isActive: boolean;
    isSelected: boolean;
    onClick: () => void;
    onChangeLyrics: (index: number, lyrics: string) => void;
}
const LyricsBlock = ({ chord, index, isActive, isSelected, onClick, onChangeLyrics }: LyricsBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [chord.lyrics]);

    const colors: Record<string, string> = {
        'Major': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
        'Minor': 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300',
        'Dominant': 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
        'Diminished': 'bg-stone-500/10 border-stone-500/30 text-stone-700 dark:text-stone-300',
        'Augmented': 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
    };
    
    const theme = colors[chord.quality] || colors['Major'];

    return (
        <div 
            onClick={onClick}
            className={cn(
                "flex flex-col gap-2 p-2 rounded-xl transition-all duration-200 group min-w-[120px] max-w-[200px] flex-1",
                isActive ? "bg-[var(--bg-element)] ring-1 ring-[var(--accent)]" : "hover:bg-[var(--bg-surface)]",
                isSelected && "ring-1 ring-[var(--accent)] bg-[var(--bg-surface)]"
            )}
        >
            {/* Chord Header */}
            <div className={cn("px-3 py-1.5 rounded-lg border text-center cursor-pointer transition-transform active:scale-95", theme)}>
                <div className="font-bold text-sm">{chord.symbol}</div>
                <div className="text-[9px] opacity-60 font-mono uppercase tracking-widest">{chord.romanNumeral}</div>
            </div>

            {/* Lyrics Input */}
            <textarea
                ref={textareaRef}
                value={chord.lyrics || ''}
                onChange={(e) => onChangeLyrics(index, e.target.value)}
                placeholder="..."
                rows={1}
                className="w-full bg-transparent text-center font-serif text-lg leading-tight text-[var(--text-main)] placeholder:text-[var(--border-hover)] resize-none outline-none border-b border-transparent focus:border-[var(--accent)] transition-colors min-h-[32px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            />
            
            <div className="h-0.5 w-full bg-[var(--border)] rounded-full opacity-20 group-hover:opacity-50 transition-opacity" />
        </div>
    );
};

export const SongwritingBoard = () => {
    const { 
        progression, 
        playIndex, 
        selectedChordIndex, 
        playOne, 
        setSelectedChordIndex, 
        handleProgression 
    } = useStore();

    const handleLyricChange = (index: number, text: string) => {
        const chord = progression[index];
        const updated = { ...chord, lyrics: text };
        handleProgression('update', { index, chord: updated });
    };

    return (
        <div className="w-full h-full bg-[var(--bg-main)] overflow-y-auto custom-scrollbar p-6 sm:p-12 relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
                
                {/* Header / Meta */}
                <div className="flex flex-col gap-2 pb-8 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Mic2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Songwriting Sheet</span>
                    </div>
                    <h1 className="text-3xl font-serif text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none bg-transparent" contentEditable suppressContentEditableWarning>
                        Untitled Composition
                    </h1>
                </div>

                {/* Progression Flow */}
                {progression.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[var(--text-dim)] gap-4 border-2 border-dashed border-[var(--border)] rounded-2xl">
                        <Type size={32} className="opacity-50"/>
                        <p className="text-sm">Start by adding chords from the Harmony View or Palette</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4 items-start content-start">
                        {progression.map((chord: Chord, i: number) => (
                            <LyricsBlock 
                                key={i + chord.symbol + chord.interval}
                                index={i}
                                chord={chord}
                                isActive={playIndex === i}
                                isSelected={selectedChordIndex === i}
                                onClick={() => { playOne(chord); setSelectedChordIndex(i); }}
                                onChangeLyrics={handleLyricChange}
                            />
                        ))}
                    </div>
                )}
                
                {/* Footer Tip */}
                <div className="mt-8 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] flex items-start gap-3">
                    <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">
                        <Music size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-[var(--text-main)] mb-1">Songwriting Mode</h4>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                            Use this view to draft lyrics alongside your harmony. 
                            The layout flows naturally like a lead sheet. 
                            Select a chord to see its guitar voicing in the top panel.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};