import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useStore } from '../../lib';
import { Chord } from '../../types';
import { cn } from '../ui';
import { Mic2, Type, Music } from 'lucide-react';

interface LyricsBlockProps {
    chord: Chord;
    index: number;
    isActive: boolean;
    isSelected: boolean;
    onClick: (index: number) => void;
    onChangeLyrics: (index: number, lyrics: string) => void;
}
const LyricsBlock = memo(({ chord, index, isActive, isSelected, onClick, onChangeLyrics }: LyricsBlockProps) => {
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
            onClick={() => onClick(index)}
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
});
LyricsBlock.displayName = 'LyricsBlock';

export const SongwritingBoard = () => {
    const { 
        progression, 
        playIndex, 
        selectedChordIndex, 
        playOne, 
        setSelectedChordIndex, 
        handleProgression 
    } = useStore();

    const handleLyricChange = useCallback((index: number, text: string) => {
        // We use functional update to avoid dependency on 'progression' if possible, 
        // but since we need the specific chord at index, dependency on progression is tricky to avoid 
        // without a more granular store selector or reducer. 
        // Assuming handleProgression handles immutability correctly.
        // Actually, better to pass chord object directly to handleProgression if supported, 
        // but assuming we need to read it first.
        // Let's use the stable store state if we can, or just accept the prop dependency.
        // The progression prop changes on every edit, so useCallback dependent on 'progression' 
        // doesn't help much UNLESS handleProgression supports partial updates or we read ref.
        // HOWEVER, LyricsBlock checks 'chord' prop. If other chords didn't change, they are same ref?
        // If progression is [A, B, C] and we update B -> [A, B', C]. A and C are same ref.
        // So simple React.memo works IF callback is stable.
        // But if 'handleLyricChange' depends on 'progression', it changes every render.
        // SOLUTION: Use functional form of setState or store access if possible.
        // But here we can just rely on the fact that we need the index.
        // We can pass the index and text, and inside we can read the *latest* progression 
        // via useStore.getState() if we want to be truly stable, OR rely on the fact 
        // that mostly we care about other props stability.
        
        const currentChord = useStore.getState().progression[index];
        if (currentChord) {
             const updated = { ...currentChord, lyrics: text };
             handleProgression('update', { index, chord: updated });
        }
    }, [handleProgression]);

    const handleSelect = useCallback((index: number) => {
        const c = useStore.getState().progression[index];
        if (c) playOne(c);
        setSelectedChordIndex(index);
    }, [playOne, setSelectedChordIndex]);

    return (
        <div className="w-full h-full bg-[var(--bg-panel)] overflow-y-auto custom-scrollbar p-6 sm:p-12 relative">
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
                                onClick={handleSelect}
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

export const MiniSongwritingBoard = () => {
    const { progression } = useStore();
    const withLyrics = progression.filter(c => c.lyrics && c.lyrics.trim().length > 0).length;
    
    return (
        <div className="flex items-center gap-3 px-4 w-full h-full bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-start justify-center shrink-0 group-hover:border-[var(--accent)] gap-1 p-1.5 opacity-80">
                <div className="w-4/5 h-1 bg-[var(--text-main)] opacity-50 rounded-full" />
                <div className="w-full h-0.5 bg-[var(--text-muted)] opacity-30 rounded-full" />
                <div className="w-3/5 h-0.5 bg-[var(--text-muted)] opacity-30 rounded-full" />
                <div className="w-full h-0.5 bg-[var(--text-muted)] opacity-30 rounded-full" />
                <div className="w-2/5 h-0.5 bg-[var(--text-muted)] opacity-30 rounded-full" />
            </div>
             <div className="flex flex-col">
                 <span className="font-bold text-xs text-[var(--text-main)]">Songwriting</span>
                 <span className="text-[10px] text-[var(--text-muted)]">{withLyrics}/{progression.length} Lyrics</span>
            </div>
        </div>
    );
};