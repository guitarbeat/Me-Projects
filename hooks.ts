
import { useState, useCallback, useRef, useMemo } from 'react';
import { Chord, Note, ScaleType, InstrumentType, AudioEngine } from './lib';

// --- PROGRESSION HOOK ---

export const useProgression = (timeSig: { num: number, den: number }) => {
    const [progression, setProgression] = useState<Chord[]>([]);

    const handleProgression = useCallback((action: 'add' | 'remove' | 'clear' | 'reorder' | 'resize' | 'quantize', payload?: any) => {
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
    }, [timeSig.num]);

    const addRest = useCallback(() => {
        const restChord: Chord = {
            root: '', quality: 'Major', extension: '', suffix: '', symbol: 'REST',
            romanNumeral: '', notes: [], interval: -1, duration: timeSig.num, isRest: true
        };
        handleProgression('add', restChord);
    }, [handleProgression, timeSig.num]);

    return { progression, setProgression, handleProgression, addRest };
};

// --- PLAYBACK HOOK ---

export const usePlayback = (audioEngine: AudioEngine, progression: Chord[], bpm: number, mood: {valence: number, arousal: number, tension: number}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playIndex, setPlayIndex] = useState<number|null>(null);

    const playOne = useCallback((c: Chord) => {
        audioEngine.resume();
        if (!c.isRest) audioEngine.playChord(c);
    }, [audioEngine]);

    const togglePlay = useCallback(() => {
        audioEngine.resume();
        if(isPlaying) { 
            audioEngine.stop(); 
            setIsPlaying(false); 
            setPlayIndex(null); 
        } else { 
            audioEngine.setMood(mood.valence, mood.arousal, mood.tension);
            setIsPlaying(true); 
            audioEngine.playProgression(progression, bpm, setPlayIndex, () => { 
                setIsPlaying(false); 
                setPlayIndex(null); 
            }); 
        }
    }, [isPlaying, audioEngine, progression, bpm, mood]);

    return { isPlaying, playIndex, togglePlay, playOne };
};

// --- MOOD HOOK ---

export const useMood = (audioEngine: AudioEngine) => {
    const [mood, setMood] = useState({ valence: 0.8, arousal: 0.2, tension: 0.0 });

    const updateMood = useCallback((v: number, a: number, t?: number) => {
        const newTension = t !== undefined ? t : mood.tension;
        setMood({ valence: v, arousal: a, tension: newTension });
        audioEngine.setMood(v, a, newTension);
    }, [mood.tension, audioEngine]);

    return { mood, updateMood };
};
