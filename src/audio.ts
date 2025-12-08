

import * as Tone from 'tone';
import { InstrumentType, Chord } from './types';

export class AudioEngine {
    private polySynth: Tone.PolySynth;
    private instrument: InstrumentType = 'rhodes';
    private _mood = { valence: 0, arousal: 0, tension: 0 };
    
    constructor() {
        // Initialize PolySynth with a default voice
        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 1 }
        }).toDestination();
        
        // Add a reverb and limiter to the chain for better sound
        const reverb = new Tone.Reverb(2).toDestination();
        const limiter = new Tone.Limiter(-10).toDestination();
        this.polySynth.connect(reverb);
        reverb.connect(limiter);
        this.polySynth.volume.value = -8;
    }

    async resume() {
        await Tone.start();
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
    }

    setInstrument(inst: InstrumentType) {
        this.instrument = inst;
        // Simple synth switching logic
        switch (inst) {
            case 'rhodes':
                this.polySynth.set({ oscillator: { type: 'sine' }, envelope: { attack: 0.02, decay: 0.5, sustain: 0.2, release: 2 } });
                break;
            case 'pad':
                this.polySynth.set({ oscillator: { type: 'triangle' }, envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 2 } });
                break;
            case 'pluck':
                this.polySynth.set({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 1 } });
                break;
            case 'synth':
                this.polySynth.set({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 } });
                break;
        }
    }

    setMood(valence: number, arousal: number, tension: number = 0) {
        this._mood = { valence, arousal, tension };
        
        // Map mood to synthesis parameters (Tone.js makes this easy)
        // Tension -> Detune
        this.polySynth.set({ detune: tension * 50 }); // +/- 50 cents
        
        // Arousal -> Envelope modifications
        if (arousal > 0.5) {
            // More aggressive
            this.polySynth.set({ envelope: { attack: 0.01 }});
        }
    }

    setBpm(bpm: number) {
        Tone.Transport.bpm.value = bpm;
    }

    playChord(chord: Chord, duration: number | string = "2n", time?: number) {
        // Voicing Logic: Spread notes
        const notes = chord.notes.map((n, i) => {
            // Simple voicing: Root at 3, others at 4, extensions at 5
            if (i === 0) return n + "3";
            if (i > 3) return n + "5";
            return n + "4";
        });
        
        this.polySynth.triggerAttackRelease(notes, duration, time);
    }

    playProgression(progression: Chord[], bpm: number, onStep: (idx: number)=>void, onComplete: ()=>void) {
        // Stop any previous transport
        Tone.Transport.stop();
        Tone.Transport.cancel();
        
        Tone.Transport.bpm.value = bpm;
        
        let accumulatedTime = 0;
        
        progression.forEach((chord, index) => {
            if (!chord.isRest) {
                // Schedule audio
                Tone.Transport.schedule((time) => {
                    const dur = chord.duration * (60/bpm);
                    this.playChord(chord, dur, time);
                    
                    // UI Callback (wrapped in Draw to ensure sync with animation frame)
                    Tone.Draw.schedule(() => {
                        onStep(index);
                    }, time);
                }, accumulatedTime);
            }
            
            // Advance time
            const beatDur = 60/bpm;
            accumulatedTime += (chord.duration * beatDur);
        });

        // Schedule completion
        Tone.Transport.schedule((time) => {
            Tone.Draw.schedule(() => onComplete(), time);
            Tone.Transport.stop();
        }, accumulatedTime + 0.5);

        Tone.Transport.start();
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.polySynth.releaseAll();
    }
}

export const audioEngine = new AudioEngine();
