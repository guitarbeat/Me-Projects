import React from 'react';
import { cn } from './UI';
import { HarmonicSpace as TonnetzWrapper } from './HarmonicMap';
import { ProgressionStrip as SequencerView, ChordPalette } from './Sequencer';
import { MoodSelector } from './MoodSelector';
import { Maximize2, X } from 'lucide-react';

export type PanelId = 'map' | 'sequencer' | 'palette' | 'mood';

interface UnifiedPanelProps {
    id: PanelId;
    title?: string;
    className?: string;
    onClose?: () => void;
    onMaximize?: () => void;
}

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({ 
    id, title, className, onClose, onMaximize 
}) => {
    
    // Determine title if not provided
    const getTitle = () => {
        if (title) return title;
        switch(id) {
            case 'map': return 'Harmonic Map';
            case 'sequencer': return 'Sequencer';
            case 'palette': return 'Chord Palette';
            case 'mood': return 'Mood Selector';
            default: return 'Panel';
        }
    };

    // Render content based on ID
    const renderContent = () => {
        switch(id) {
            case 'map': return <TonnetzWrapper />;
            case 'sequencer': return <SequencerView />;
            case 'palette': return <ChordPalette />;
            case 'mood': return <MoodSelector />;
            default: return null;
        }
    };

    return (
        <div className={cn("flex flex-col h-full w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden", className)}>
            {/* Standard Header */}
            <div className="h-8 flex items-center justify-between px-3 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {getTitle()}
                </span>
                <div className="flex items-center gap-1">
                    {onMaximize && (
                        <button onClick={onMaximize} className="p-1 hover:bg-[var(--bg-element)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)]">
                            <Maximize2 size={12} />
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-1 hover:bg-[var(--bg-element)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)]">
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Content */}
            <div className="flex-1 relative overflow-hidden min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};
