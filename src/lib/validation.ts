
import { CHROMATIC_SHARPS, CHROMATIC_FLATS, SCALE_DEFS } from './constants';
import { ScaleType, InstrumentType, Note } from '../types';

export const isValidKey = (key: string): key is Note => {
    return CHROMATIC_SHARPS.includes(key) || CHROMATIC_FLATS.includes(key);
};

export const isValidScale = (scale: string): scale is ScaleType => {
    // SCALE_DEFS keys are ScaleType values
    return Object.keys(SCALE_DEFS).includes(scale);
};

export const isValidBpm = (bpm: number): boolean => {
    return !isNaN(bpm) && bpm >= 20 && bpm <= 300;
};

const VALID_INSTRUMENTS: InstrumentType[] = ['rhodes', 'pad', 'pluck', 'synth'];

export const isValidInstrument = (inst: string): inst is InstrumentType => {
    return VALID_INSTRUMENTS.includes(inst as InstrumentType);
};
