
/**
 * Component Barrel File
 * 
 * Aggregates exports from modular component files to maintain a clean import interface
 * while enforcing separation of concerns and eliminating code duplication.
 */

export * from './ui';
export * from './layout/ControlPanel';
export { default as ControlPanel } from './layout/ControlPanel';

export * from './tools/Sequencer';
export * from './tools/MoodSelector';

export * from './tools/SongwritingBoard';
export * from './tools/HarmonicMap';
export * from './overlays/SettingsPopover';
export * from './overlays/ProjectLibrary';
export * from './tools/ChordEditor';