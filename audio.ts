
import { InstrumentType, Chord } from './types';

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private instrument: InstrumentType = 'rhodes';
    
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private currentChordIndex: number = 0;
    private timerID: number | null = null;
    private _progression: Chord[] = [];
    private _bpm: number = 120;
    
    private _valence: number = 0;
    private _arousal: number = 0;
    private _tension: number = 0;

    private _onStep: ((idx: number) => void) | null = null;
    private _onComplete: (() => void) | null = null;

    constructor() {}

    resume() {
        if (!this.ctx) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private init() {
        if (typeof window !== 'undefined') {
            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtor) {
                this.ctx = new AudioCtor();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.4;
                this.masterGain.connect(this.ctx.destination);
            }
        }
    }

    setInstrument(inst: InstrumentType) {
        this.instrument = inst;
    }

    setMood(valence: number, arousal: number, tension: number = 0) {
        this._valence = valence;
        this._arousal = arousal;
        this._tension = tension;
    }

    private noteToFreq(note: string, octave: number = 4): number {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const map: {[key:string]: string} = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };
        const norm = map[note] || note;
        const idx = notes.indexOf(norm);
        if (idx === -1) return 261.63; 
        
        const absSemitones = (octave * 12 + idx) - (4 * 12 + 9);
        return 440 * Math.pow(2, absSemitones / 12);
    }

    playChord(chord: Chord, duration: number = 2.0, when?: number) {
        if (!this.ctx) this.init();
        const ctx = this.ctx!;
        if (!ctx || !this.masterGain) return;
        
        if (ctx.state === 'suspended') ctx.resume();

        const startTime = when || ctx.currentTime;
        const notes = chord.notes;
        
        // Better Voicing Logic for Clarity:
        // Root: Octave 3
        // 3rd, 5th, 7th: Octave 4
        // 9th, 11th: Octave 5 (to avoid muddiness)
        const frequencies = notes.map((n, i) => {
            let octave = 4;
            if (i === 0) octave = 3; // Root
            else if (i > 3) octave = 5; // Extensions (9th, 11th)
            return this.noteToFreq(n, octave);
        });
        
        const baseGain = 0.35 + (this._arousal * 0.25);
        const volume = Math.max(0.1, Math.min(0.8, baseGain)) / (frequencies.length || 1);
        
        const isStaccato = this._arousal > 0.2;
        const attack = isStaccato ? 0.01 : 0.05 + (Math.abs(this._valence) * 0.05);
        const release = isStaccato ? 0.1 : duration * 0.2; 
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = this.instrument === 'pad' ? 'triangle' : this.instrument === 'synth' ? 'sawtooth' : 'sine';
            const detune = (Math.random() - 0.5) * this._tension * 50;
            osc.frequency.value = freq;
            osc.detune.value = detune;

            osc.connect(gain);
            gain.connect(this.masterGain!);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + attack);
            gain.gain.setTargetAtTime(0, startTime + duration - release, release / 3);

            osc.start(startTime);
            osc.stop(startTime + duration + release);
        });
    }

    playProgression(progression: Chord[], bpm: number, onStep: (idx: number)=>void, onComplete: ()=>void) {
        this.stop(); 
        
        if (progression.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        this.resume();

        this.isPlaying = true;
        this._progression = progression;
        this._bpm = bpm;
        this._onStep = onStep;
        this._onComplete = onComplete;
        this.currentChordIndex = 0;
        
        const ctx = this.ctx!;
        this.nextNoteTime = ctx.currentTime + 0.1;
        this.scheduler();
    }

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        
        const lookahead = 25.0; 
        const scheduleAheadTime = 0.1; 

        while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime && this.currentChordIndex < this._progression.length) {
            this.scheduleChord(this.currentChordIndex, this.nextNoteTime);
            const secondsPerBeat = 60.0 / this._bpm;
            this.nextNoteTime += secondsPerBeat * this._progression[this.currentChordIndex].duration;
            this.currentChordIndex++;
        }
        
        if (this.currentChordIndex >= this._progression.length) {
            if (this.ctx.currentTime > this.nextNoteTime + 0.5) {
                this.isPlaying = false;
                if (this._onComplete) this._onComplete();
                return;
            }
        }

        this.timerID = window.setTimeout(() => this.scheduler(), lookahead);
    }

    private scheduleChord(index: number, time: number) {
        if (this._onStep && this.ctx) {
             const delay = (time - this.ctx.currentTime) * 1000;
             setTimeout(() => {
                 if(this.isPlaying) this._onStep!(index);
             }, Math.max(0, delay));
        }
        
        const chord = this._progression[index];
        if(!chord.isRest) {
            const secondsPerBeat = 60.0 / this._bpm;
            const duration = secondsPerBeat * chord.duration;
            this.playChord(chord, duration, time);
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) clearTimeout(this.timerID);
        
        if(this.masterGain && this.ctx) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
            setTimeout(() => {
                if(this.masterGain && this.ctx) {
                    this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime); 
                }
            }, 150);
        }
    }
}

export const audioEngine = new AudioEngine();
