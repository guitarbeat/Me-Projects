

/**
 * Component Barrel File
 * 
 * Aggregates exports from modular component files to maintain a clean import interface
 * while enforcing separation of concerns and eliminating code duplication.
 */

export * from './UI';
export * from './ControlPanel';
export { default as ControlPanel } from './ControlPanel';
export * from './ResizablePanels';
export * from './Sequencer';
export * from './MoodSelector';
export * from './GuitarChord';
export * from './SongwritingBoard';