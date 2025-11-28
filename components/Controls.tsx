
import React from 'react';
import { InstrumentType } from '../types';
import { Piano, Waves, Zap, Mic2 } from 'lucide-react';
import { Typo, Card, cn } from './UI';
import { audioEngine } from '../utils/audioEngine';

interface ControlsProps {
    currentInstrument: InstrumentType;
    onSetInstrument: (inst: InstrumentType) => void;
}

const Instruments: { id: InstrumentType; label: string; icon: any; desc: string }[] = [
    { id: 'rhodes', label: 'Electric Keys', icon: Piano, desc: 'Warm, bell-like tones' },
    { id: 'pad', label: 'Ethereal Pad', icon: Waves, desc: 'Sustained atmospheric wash' },
    { id: 'pluck', label: 'Glass Pluck', icon: Zap, desc: 'Short, sharp, percussive' },
    { id: 'synth', label: 'Analog Synth', icon: Mic2, desc: 'Rich harmonics' },
];

const Controls: React.FC<ControlsProps> = ({ currentInstrument, onSetInstrument }) => {
    const handleSet = (i: InstrumentType) => {
        onSetInstrument(i);
        audioEngine.setInstrument(i);
        audioEngine.playDiscovery(['C4', 'E4', 'G4'], 0.5);
    };

    return (
        <div className="h-full p-6 bg-zinc-950 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2">
                    <Typo variant="h2">Sound Engine</Typo>
                    <Typo variant="body" className="opacity-60">Select your sonic texture</Typo>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Instruments.map((inst) => (
                        <Card
                            key={inst.id}
                            onClick={() => handleSet(inst.id)}
                            active={currentInstrument === inst.id}
                            className="flex-row items-center gap-4 p-5 hover:scale-[1.01]"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                                currentInstrument === inst.id ? "bg-[var(--accent)] text-black" : "bg-white/5 text-zinc-400"
                            )}>
                                <inst.icon size={20} />
                            </div>
                            <div>
                                <div className={cn("font-bold text-sm", currentInstrument === inst.id ? "text-[var(--accent)]" : "text-white")}>
                                    {inst.label}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{inst.desc}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Controls;
