import { useEffect, useMemo } from 'react';
import { generateChordsForScale, getTensionChords, getMusicalCharacteristics } from './theory';
import { SCALE_DEFS } from './constants';
import { useStore } from './store';
import { Chord } from './types';

// Helper hook to calculate derived musical data from the store
export const useDerivedData = () => {
    const { key, scale, complexity, mood } = useStore();

    const chords = useMemo(() => 
        generateChordsForScale(key, scale, complexity), 
    [key, scale, complexity]);

    const tensionChords = useMemo(() => 
        mood.tension > 0.3 ? getTensionChords(key, scale, mood.tension) : [],
    [key, scale, mood.tension]);

    const analysis = useMemo(() => 
        getMusicalCharacteristics(mood.valence, mood.arousal, mood.tension), 
    [mood.valence, mood.arousal, mood.tension]);

    const scaleMeta = useMemo(() => 
        SCALE_DEFS[scale]?.meta || { desc: '', characteristic: '' }, 
    [scale]);

    return { chords, tensionChords, analysis, scaleMeta };
};

export const useProgression = (timeSig: { num: number, den: number }) => {
    const progression = useStore(state => state.progression);
    const handleProgression = useStore(state => state.handleProgression);
    
    const addRest = () => {
        const rest: Chord = {
            root: 'C',
            quality: 'Major',
            extension: '',
            suffix: '',
            symbol: 'Rest',
            romanNumeral: '',
            notes: [],
            interval: -1,
            duration: timeSig.num,
            isRest: true
        };
        handleProgression('add', { chord: rest, index: progression.length });
    };

    return { progression, handleProgression, addRest };
};

export const usePlayback = (audioEngine: any, progression: any, bpm: number, mood: any) => {
    const isPlaying = useStore(state => state.isPlaying);
    const playIndex = useStore(state => state.playIndex);
    const togglePlay = useStore(state => state.togglePlay);
    const playOne = useStore(state => state.playOne);
    const setBpm = useStore(state => state.setBpm);

    // Sync BPM from local state to store to ensure playback uses correct speed
    useEffect(() => {
        setBpm(bpm);
    }, [bpm, setBpm]);

    return { isPlaying, playIndex, togglePlay, playOne };
};

export const useMood = (audioEngine: any) => {
    const mood = useStore(state => state.mood);
    const setMood = useStore(state => state.setMood);
    
    const updateMood = (v: number, a: number, t?: number) => {
         setMood(v, a, t ?? mood.tension);
    };

    return { mood, updateMood };
};