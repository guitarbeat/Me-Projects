import * as Tone from 'tone';
import { Chord, InstrumentType } from '../types';

export class AudioEngine {
    private polySynth: Tone.PolySynth;
    private instrument: InstrumentType = 'rhodes';
    private _mood = { valence: 0, arousal: 0, tension: 0 };
    private chorus: Tone.Chorus;

    constructor() {
        // Initialize PolySynth with high polyphony for long release tails
        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 1 },
            maxPolyphony: 6,
        } as any);

        // Professional Signal Chain:
        // Synth -> Chorus (Width) -> Reverb (Space) -> EQ -> Limiter (Safety) -> Master

        this.chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
        const reverb = new Tone.Reverb({ decay: 4, preDelay: 0.01 }).toDestination();
        const eq = new Tone.EQ3(0, -3, 0).toDestination(); // Slight mid scoop for clarity
        const limiter = new Tone.Limiter(-1).toDestination();

        // Connect Chain
        this.polySynth.chain(this.chorus, reverb, eq, limiter);

        this.polySynth.volume.value = -8;

        // Initial Mix Defaults
        reverb.wet.value = 0.3;
        this.chorus.wet.value = 0.3;
    }

    async resume() {
        await Tone.start();
        if (Tone.context.state !== 'running') {
            await Tone.context.resume();
        }
    }

    setInstrument(inst: InstrumentType) {
        this.instrument = inst;

        // Release any hanging notes when switching instruments
        this.polySynth.releaseAll();

        // Advanced Instrument Modeling
        switch (inst) {
            case 'rhodes':
                this.polySynth.set({
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.02, decay: 1.5, sustain: 0.2, release: 2 }
                });
                // Classic wide stereo chorus for keys
                this.chorus.wet.value = 0.6;
                this.chorus.frequency.value = 2;
                break;
            case 'pad':
                this.polySynth.set({
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 1.5, decay: 3, sustain: 0.8, release: 4 }
                });
                // Thick, slow movement for pads
                this.chorus.wet.value = 0.8;
                this.chorus.frequency.value = 1.5;
                break;
            case 'pluck':
                this.polySynth.set({
                    oscillator: { type: 'square' },
                    envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.4 }
                });
                // Tight and clean
                this.chorus.wet.value = 0.2;
                break;
            case 'synth':
                this.polySynth.set({
                    oscillator: { type: 'sawtooth' },
                    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 1 }
                });
                // Moderate width
                this.chorus.wet.value = 0.4;
                break;
        }
    }

    setMood(valence: number, arousal: number, tension: number = 0) {
        this._mood = { valence, arousal, tension };

        // Map mood to synthesis parameters
        // Tension -> Detune (Dissonance)
        this.polySynth.set({ detune: tension * 25 });

        // Arousal -> Brightness/Attack could be mapped here if using FM/AM synth
    }

    setBpm(bpm: number) {
        Tone.Transport.bpm.value = bpm;
    }

    /**
     * INTELLIGENT VOICING SYSTEM
     * Assigns proper octaves to note names (e.g., "C" -> "C4") to ensure
     * chords sound musical and strictly ascending/spread out.
     */
    private getVoicedNotes(notes: string[]): string[] {
        if (!notes || notes.length === 0) return [];

        const voiced: string[] = [];
        // Start Pads lower (3rd octave) for warmth, others in 4th
        let octave = this.instrument === 'pad' ? 3 : 4;

        // Note ordering map to detect when we wrap around the chromatic scale
        const values: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
            'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        let lastVal = -1;

        notes.forEach(note => {
            // Remove any existing octave numbers just in case
            const pitch = note.replace(/\d/g, '');
            const val = values[pitch] || 0;

            // If current note is lower/equal to previous in chromatic order, bump octave
            if (val <= lastVal) {
                octave++;
            }
            lastVal = val;

            voiced.push(`${pitch}${octave}`);
        });

        return voiced;
    }

    playChord(chord: Chord, duration: number | string = "2n", time?: number) {
        if (!chord.notes || chord.notes.length === 0) return;

        const voicedNotes = this.getVoicedNotes(chord.notes);

        // --- STRUMMING LOGIC ---
        // Simulates a guitar pick sweeping across strings or rolling chords on piano.
        const isStrummed = this.instrument === 'pluck' || this.instrument === 'rhodes';

        // Calculate strum speed based on arousal (Faster songs = tighter strums)
        // Range: ~30ms to ~60ms total strum time
        const strumSpeed = 0.03 + (Math.max(0, 0.5 - this._mood.arousal * 0.2) * 0.05);

        voicedNotes.forEach((note, i) => {
            // Apply delay to each subsequent note in the chord
            const offset = isStrummed ? i * strumSpeed : 0;

            // Humanize velocity: Arousal adds energy, random factor adds realism
            let velocity = 0.5 + (Math.random() * 0.1) + (this._mood.arousal * 0.2);
            velocity = Math.min(1, Math.max(0.2, velocity)); // Clamp

            this.polySynth.triggerAttackRelease(
                note,
                duration,
                (time || Tone.now()) + offset,
                velocity
            );
        });
    }

    playProgression(progression: Chord[], bpm: number, onStep: (idx: number) => void, onComplete: () => void) {
        // Reset Transport
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.bpm.value = bpm;

        let t = 0;

        progression.forEach((chord, index) => {
            const beatDuration = 60 / bpm;
            const chordDuration = chord.duration * beatDuration;

            if (!chord.isRest) {
                Tone.Transport.schedule((time) => {
                    // Sync UI
                    Tone.Draw.schedule(() => onStep(index), time);
                    // Play Audio
                    this.playChord(chord, chordDuration, time);
                }, t);
            } else {
                // Even for rests, we schedule the UI update
                Tone.Transport.schedule((time) => {
                    Tone.Draw.schedule(() => onStep(index), time);
                }, t);
            }

            t += chordDuration;
        });

        // Schedule finish
        Tone.Transport.schedule((time) => {
            Tone.Draw.schedule(() => onComplete(), time);
            Tone.Transport.stop();
        }, t + 0.5); // Small buffer

        Tone.Transport.start();
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.polySynth.releaseAll();
    }
}

export const audioEngine = new AudioEngine();
