import React from 'react';
import { cn } from '../../ui';
import { SplitPaneProps } from './types';

const getCn = () => cn;

/**
 * A reusable card container that implements the "Island" visual style.
 * Handles the outer padding (for the floating effect), border radius, shadow,
 * and hardware acceleration properties.
 */
export const SplitPane = ({ 
    children, 
    className,
    cn: propCn,
    isCollapsed,
    isMini,
    miniOverlay,
    padding,
    radius = 22
}: SplitPaneProps & { radius?: number }) => {
    const cnFn = propCn || getCn();
    
    return (
        <div 
            className={cnFn("h-full w-full overflow-hidden relative", className)}
            style={{ padding: isMini ? 0 : padding }} 
        >
            {/* Full Content - Applied Card Styling Here */}
            <div 
                className={cnFn(
                    "h-full w-full transition-all duration-300 relative overflow-hidden border border-[var(--border)]", 
                    "bg-[var(--bg-panel)]", // Default card background
                    (isCollapsed || isMini) ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
                )}
                style={{ borderRadius: radius }}
            >
                {children}
            </div>

            {/* Mini Content */}
            <div className={cnFn(
                "h-full w-full transition-opacity duration-300 absolute inset-0 flex items-center justify-center top-0 left-0",
                isMini ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                {miniOverlay}
            </div>
        </div>
    );
};
