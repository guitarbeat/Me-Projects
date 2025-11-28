
import React, { useState, useEffect } from 'react';
import { Chord, ScaleType, Note } from '../types';
import TheoryAnalysis from './TheoryAnalysis';
import JazzGuide from './JazzGuide';
import ChordPalette from './ChordPalette';
import ScaleMatcher from './ScaleMatcher';
import { Activity, BookOpen, Grid, Ruler } from 'lucide-react';
import { Tabs } from './UI';
import { buildChord } from '../utils/musicTheory';

interface TheoryPanelProps {
    currentKey: Note;
    scaleType: ScaleType;
    progression: Chord[];
    onAppendChords: (chords: Chord[]) => void;
    onSetKey: (key: Note) => void;
    chords: Chord[];
    onChordSelect: (chord: Chord) => void;
    onHover: (chord: Chord | null) => void;
}

const TheoryPanel: React.FC<TheoryPanelProps> = (props) => {
    const [view, setView] = useState('palette');
    // Track the last interacted chord to feed into the Matcher
    const [activeContextChord, setActiveContextChord] = useState<Chord | null>(null);

    // Default to the first chord of the scale or the tonic if nothing interacted
    useEffect(() => {
        if (!activeContextChord && props.chords.length > 0) {
            setActiveContextChord(props.chords[0]);
        }
    }, [props.chords, activeContextChord]);

    const handleChordSelect = (c: Chord) => {
        setActiveContextChord(c);
        props.onChordSelect(c);
    };

    const handleHover = (c: Chord | null) => {
        if (c) setActiveContextChord(c);
        props.onHover(c);
    };

    return (
        <div className="flex flex-col h-full bg-[#0c0c0e]">
            <Tabs 
                items={[
                    { id: 'palette', label: 'Chords', icon: Grid },
                    { id: 'guide', label: 'Structure', icon: BookOpen },
                    { id: 'matcher', label: 'Matcher', icon: Ruler },
                    { id: 'report', label: 'Analysis', icon: Activity }
                ]}
                active={view}
                onChange={setView}
            />

            <div className="flex-1 overflow-hidden relative">
                {view === 'palette' && (
                    <ChordPalette 
                        chords={props.chords}
                        onChordSelect={handleChordSelect}
                        onHover={handleHover}
                    />
                )}
                {view === 'report' && (
                    <TheoryAnalysis 
                        currentKey={props.currentKey} 
                        scaleType={props.scaleType} 
                        progression={props.progression} 
                    />
                )}
                {view === 'guide' && (
                    <JazzGuide 
                        currentKey={props.currentKey} 
                        progression={props.progression}
                        onAppendChords={props.onAppendChords} 
                        onSetKey={props.onSetKey} 
                    />
                )}
                {view === 'matcher' && activeContextChord && (
                    <ScaleMatcher activeChord={activeContextChord} />
                )}
            </div>
        </div>
    );
};

export default TheoryPanel;
