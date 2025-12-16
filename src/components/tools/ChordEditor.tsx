import React from 'react';
import { PenTool, Minus, Plus } from 'lucide-react';
import { Chord, CHROMATIC_SHARPS, buildChord } from '../../lib';
import { GuitarChordDiagram } from '../ui/GuitarChord';

interface ChordEditorProps {
    selectedChord: Chord;
    selectedChordIndex: number | null;
    progression: Chord[];
    handleProgression: (action: 'add' | 'remove' | 'update' | 'clear' | 'reorder' | 'resize' | 'quantize', payload?: unknown) => void;
    onClose: () => void;
}

    import { Button, IconButton } from '../ui';
    //... imports

    export const ChordEditor: React.FC<ChordEditorProps> = ({ 
        selectedChord, 
        selectedChordIndex, 
        progression: _progression,
        handleProgression,
        onClose 
    }) => {

        const handleChordUpdate = (updates: Partial<Chord>) => {
            if (!selectedChord || selectedChordIndex === null) return;
            
            const newRoot = updates.root || selectedChord.root;
            const newQuality = updates.quality || selectedChord.quality;
            const newExt = updates.extension !== undefined ? updates.extension : selectedChord.extension;
            
            const newChord = buildChord(newRoot, newQuality, newExt, selectedChord.duration);
            if (selectedChord.lyrics) newChord.lyrics = selectedChord.lyrics;
            
            handleProgression('update', { index: selectedChordIndex, chord: newChord });
        };

        return (
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex flex-col overflow-hidden">
                 <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center px-4 justify-between shrink-0 z-30">
                    <div className="flex items-center gap-2">
                        <PenTool size={16} className="text-[var(--accent)]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">Edit Chord</span>
                    </div>
                    <Button onClick={onClose} size="sm" variant="secondary" className="rounded-full px-4">Done</Button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                         <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                            
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="chord-root" className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Root</label>
                                    <select id="chord-root" value={selectedChord.root} onChange={(e) => handleChordUpdate({ root: e.target.value })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-main)]"><option value="">-</option>{CHROMATIC_SHARPS.map(n => <option key={n} value={n}>{n}</option>)}</select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="chord-quality" className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Quality</label>
                                    <select id="chord-quality" value={selectedChord.quality} onChange={(e) => handleChordUpdate({ quality: e.target.value as Chord['quality'] })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-main)]">{['major', 'minor', 'dim', 'aug'].map(q => <option key={q} value={q}>{q}</option>)}</select>
                                </div>
                                <div className="flex flex-col gap-1">
                                     <label htmlFor="chord-extension" className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Extension</label>
                                     <select id="chord-extension" value={selectedChord.extension || ''} onChange={(e) => handleChordUpdate({ extension: e.target.value || undefined })} className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-main)]"><option value="">None</option>{['7', 'maj7', 'sus2', 'sus4', 'add9', '9', '11', '13'].map(x => <option key={x} value={x}>{x}</option>)}</select>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                 <div className="flex flex-col gap-1">
                                    <label htmlFor="chord-duration" className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Duration</label>
                                    <div className="flex items-center gap-2">
                                        <IconButton aria-label="Decrease duration" onClick={() => handleChordUpdate({ duration: Math.max(0.25, selectedChord.duration - 0.25) })} icon={Minus} />
                                        <input id="chord-duration" type="number" value={selectedChord.duration} onChange={(e) => handleChordUpdate({ duration: parseFloat(e.target.value) || 1 })} className="flex-1 bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-center text-[var(--text-main)]" />
                                        <IconButton aria-label="Increase duration" onClick={() => handleChordUpdate({ duration: selectedChord.duration + 0.25 })} icon={Plus} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                     <label htmlFor="chord-lyrics" className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Lyrics</label>
                                     <input id="chord-lyrics" type="text" value={selectedChord.lyrics || ''} onChange={(e) => handleChordUpdate({ lyrics: e.target.value })} placeholder="Lyrics..." className="bg-[var(--bg-element)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)]" />
                                </div>
                            </div>
                         </div>
                         <div className="mt-8 max-w-2xl mx-auto border-t border-[var(--border)] pt-8">
                             <h4 className="text-[10px] uppercase font-bold text-[var(--text-dim)] mb-4">Voicing</h4>
                             <GuitarChordDiagram chord={selectedChord} />
                         </div>
                    </div>
                </div>
            </div>
        );
    };


