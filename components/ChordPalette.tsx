
import React from 'react';
import { Chord } from '../types';
import { Plus, Music } from 'lucide-react';
import { Card, Typo, Badge } from './UI';

interface ChordPaletteProps {
    chords: Chord[];
    onChordSelect: (chord: Chord) => void;
    onHover?: (chord: Chord | null) => void;
}

const ChordPalette: React.FC<ChordPaletteProps> = ({ chords, onChordSelect, onHover }) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-[#09090b]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20">
                {chords.map((chord, index) => {
                    const isCenter = chord.romanNumeral.match(/^I$|^i$|^1$/);
                    return (
                        <Card
                            key={index}
                            active={!!isCenter}
                            onClick={() => onChordSelect(chord)}
                            onMouseEnter={() => onHover?.(chord)}
                            onMouseLeave={() => onHover?.(null)}
                            className="aspect-square justify-between group hover:border-[var(--accent)]/50 transition-all"
                        >
                            <div className="flex justify-between items-start w-full">
                                <Badge variant={isCenter ? 'accent' : 'default'} className="opacity-70 group-hover:opacity-100">
                                    {chord.romanNumeral}
                                </Badge>
                                <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 bg-[var(--accent)] rounded-full p-1 text-black">
                                    <Plus size={10} strokeWidth={3}/>
                                </div>
                            </div>

                            <div className="mt-2">
                                <Typo variant="h3" className="leading-none mb-1 text-base">{chord.symbol}</Typo>
                                <Typo variant="mono" className="opacity-50 line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{chord.emotionalDesc}</Typo>
                            </div>
                        </Card>
                    );
                })}
            </div>
            
            {/* Empty State */}
            {chords.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                    <Music size={48} className="text-zinc-600"/>
                    <Typo variant="label">No Chords Available</Typo>
                 </div>
            )}
        </div>
    );
};

export default ChordPalette;
