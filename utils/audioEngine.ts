
import { getNoteFrequency, getChordFrequencies } from './musicTheory';
import { Chord, VoicedNote, InstrumentType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private activeTimeouts: number[] = [];
  private isPlaying: boolean = false;
  private currentInstrument: InstrumentType = 'rhodes';

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Signal Chain: Master Gain -> Compressor -> Destination
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      }
    }
  }

  private ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setInstrument(instrument: InstrumentType) {
    this.currentInstrument = instrument;
  }

  public playChord(chordOrNotes: Chord | VoicedNote[], duration: number = 2.0, time: number = 0) {
    if (!this.ctx || !this.masterGain) return;
    this.ensureContext();

    let frequencies: number[] = [];

    if (Array.isArray(chordOrNotes)) {
        frequencies = chordOrNotes.map(vn => getNoteFrequency(vn.note, vn.octave));
    } else {
        frequencies = getChordFrequencies(chordOrNotes);
    }
    
    const startTime = time || this.ctx.currentTime;
    
    frequencies.forEach((freq, index) => {
      const stagger = this.currentInstrument === 'pad' ? 0.03 : 0.015;
      const noteStart = startTime + (index * stagger);
      
      switch (this.currentInstrument) {
          case 'rhodes': this.createElectricPianoVoice(freq, noteStart, duration); break;
          case 'pad': this.createPadVoice(freq, noteStart, duration); break;
          case 'pluck': this.createPluckVoice(freq, noteStart, duration); break;
          case 'synth': this.createSynthVoice(freq, noteStart, duration); break;
          default: this.createElectricPianoVoice(freq, noteStart, duration);
      }
    });
  }

  public playDiscovery(notes: string[], duration: number = 0.2) {
      if (!this.ctx) return;
      this.ensureContext();
      const now = this.ctx.currentTime;
      
      // Play a quick upward arpeggio of the scale to "preview" the vibe
      notes.forEach((note, i) => {
          // Only play first 5 notes to keep it snappy
          if (i > 4) return;
          
          const freq = getNoteFrequency(note, 4);
          const startTime = now + (i * 0.08);
          
          // Use a simple pluck sound for preview regardless of instrument to be clear
          this.createElectricPianoVoice(freq, startTime, duration);
      });
  }

  private applyEnvelope(gainNode: GainNode, startTime: number, duration: number, attack: number, decay: number, sustain: number, release: number = 0.5) {
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(sustain, startTime + attack + decay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration + release);
  }

  private createElectricPianoVoice(freq: number, startTime: number, duration: number) {
      if (!this.ctx || !this.masterGain) return;

      const carrier = this.ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.value = freq;

      const modulator = this.ctx.createOscillator();
      modulator.type = 'sine';
      modulator.frequency.value = freq * 14;

      const modulatorGain = this.ctx.createGain();
      const voiceGain = this.ctx.createGain();
      
      modulator.connect(modulatorGain);
      modulatorGain.connect(carrier.frequency);
      
      carrier.connect(voiceGain);
      voiceGain.connect(this.masterGain);

      // Specific ADSR for Rhodes
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
      voiceGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      modulatorGain.gain.setValueAtTime(0, startTime);
      modulatorGain.gain.setValueAtTime(300, startTime + 0.01);
      modulatorGain.gain.exponentialRampToValueAtTime(1, startTime + 0.5);

      carrier.start(startTime);
      modulator.start(startTime);
      
      carrier.stop(startTime + duration + 0.5);
      modulator.stop(startTime + duration + 0.5);
  }

  private createPadVoice(freq: number, startTime: number, duration: number) {
      if (!this.ctx || !this.masterGain) return;
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = freq;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const voiceGain = this.ctx.createGain();
      
      osc1.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.masterGain);
      
      filter.frequency.setValueAtTime(200, startTime);
      filter.frequency.linearRampToValueAtTime(2000, startTime + (duration * 0.5));
      
      // ADSR for Pad: Slow attack, sustain
      voiceGain.gain.setValueAtTime(0, startTime);
      voiceGain.gain.linearRampToValueAtTime(0.2, startTime + 0.5);
      voiceGain.gain.linearRampToValueAtTime(0, startTime + duration + 0.5);
      
      osc1.start(startTime);
      osc1.stop(startTime + duration + 0.5);
  }

  private createPluckVoice(freq: number, startTime: number, duration: number) {
     if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const voiceGain = this.ctx.createGain();
      osc.connect(voiceGain);
      voiceGain.connect(this.masterGain);
      
      // Pluck: Fast attack, fast decay
      this.applyEnvelope(voiceGain, startTime, 1.0, 0.01, 0.3, 0.001, 0.1);

      osc.start(startTime);
      osc.stop(startTime + 1.5);
  }

  private createSynthVoice(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 5;
      const voiceGain = this.ctx.createGain();
      
      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.masterGain);
      
      filter.frequency.setValueAtTime(400, startTime);
      filter.frequency.linearRampToValueAtTime(1500, startTime + 0.1);
      
      // Synth: Punchy attack
      this.applyEnvelope(voiceGain, startTime, duration, 0.05, 0.2, 0.1, 0.1);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.2);
  }

  public playProgression(chords: Chord[], bpm: number, onStep: (index: number) => void, onComplete: () => void) {
    if (!this.ctx) return;
    this.stop(); 
    this.ensureContext();
    this.isPlaying = true;
    const beatDuration = 60 / bpm;
    const stepDuration = beatDuration * 2; 

    chords.forEach((chord, index) => {
        this.playChord(chord, stepDuration + 0.5, this.ctx!.currentTime + (index * stepDuration));
        const timeoutId = window.setTimeout(() => {
            if (this.isPlaying) onStep(index);
        }, index * stepDuration * 1000);
        this.activeTimeouts.push(timeoutId);
    });

    const endTimeoutId = window.setTimeout(() => {
        this.isPlaying = false;
        onComplete();
    }, chords.length * stepDuration * 1000);
    this.activeTimeouts.push(endTimeoutId);
  }

  public stop() {
    this.isPlaying = false;
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = [];
    if (this.ctx && this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        setTimeout(() => {
             if (this.masterGain && this.ctx) this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        }, 100);
    }
  }
}

export const audioEngine = new AudioEngine();
