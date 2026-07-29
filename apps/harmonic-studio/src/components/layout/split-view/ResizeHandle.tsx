import React from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '../../ui';
import { HandleProps, HandleButtonProps } from './types';

// Use project cn
const getCn = () => cn;

/**
 * A button component for resizing/collapsing panels.
 * Provides visual feedback and handles drag interactions.
 * Shows a bar by default that transforms to an arrow on hover.
 */
export const HandleButton = ({ 
    vertical = false, 
    isDragging, 
    collapsed, 
    direction: _direction = 'up', 
    onToggle, 
    className,
    cn: propCn,
    leadingAccessories = [],
    trailingAccessories = []
}: HandleButtonProps) => {
    const cnFn = propCn || getCn();
    const isActive = collapsed || isDragging;
    
    // Seamless Handle:
    // Invisible container that spans the gap.
    // Floating semi-transparent pill in the center.
    
    return (
        <div 
            onPointerDown={(e) => e.stopPropagation()} 
            className={cnFn(
                "flex items-center justify-center relative z-50 transition-all duration-300",
                // Base styles: Transparent background to blend with black gap
                "bg-transparent",
                
                // Vertical vs Horizontal dimensions
                vertical 
                    ? "w-6 h-12 rounded-full cursor-col-resize" // Vertical split handle width (gap size)
                    : "h-6 w-full cursor-row-resize", // Horizontal split handle height matches gap (24px)
                
                className
            )}
            onClick={(e) => {
                if (onToggle) {
                    e.stopPropagation();
                    e.preventDefault(); 
                    onToggle();
                }
            }}
        >
            <div className="flex items-center gap-2 justify-between w-full h-full px-4 text-white/50">
                
                {/* Leading Accessories */}
                {!vertical && leadingAccessories.length > 0 && (
                    <div className="flex items-center gap-1 z-20">
                        {leadingAccessories.map(acc => (
                            <button
                                key={acc.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    acc.onClick();
                                }}
                                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                title={acc.label}
                            >
                                <acc.icon size={12} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Center Handle / Pill */}
                {/* This is the visual "Grabber" floating in the void */}
                <div className="flex-1 flex items-center justify-center relative h-full min-w-[24px]">
                    <div className={cnFn(
                        "rounded-full transition-all duration-300 backdrop-blur-sm",
                        "bg-white/20 group-hover:bg-white/40", // Subtle white pill
                        vertical 
                            ? "w-1 h-8" 
                            : "h-1.5 w-14", // 56px x 6px pill (approx)
                        isActive && "bg-white/60"
                    )} />
                </div>

                {/* Trailing Accessories */}
                {!vertical && trailingAccessories.length > 0 && (
                    <div className="flex items-center gap-1 z-20">
                        {trailingAccessories.map(acc => (
                            <button
                                key={acc.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    acc.onClick();
                                }}
                                className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                title={acc.label}
                            >
                                <acc.icon size={12} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Styled handle component for react-resizable-panels.
 * Wraps HandleButton with PanelResizeHandle.
 */
export const Handle = ({ 
    className, 
    vertical = false, 
    isDragging, 
    collapsed, 
    direction = 'up', 
    onToggle,
    cn: propCn,
    leadingAccessories,
    trailingAccessories
}: HandleProps) => {
    const cnFn = propCn || getCn();
    return (
        <PanelResizeHandle className={cnFn("group flex items-center justify-center z-50 outline-none touch-none transition-all focus:outline-none flex-none", vertical ? "w-[24px] h-full cursor-col-resize" : "h-[24px] w-full cursor-row-resize", className)}>
            <HandleButton 
                vertical={vertical}
                isDragging={isDragging}
                collapsed={collapsed}
                direction={direction}
                onToggle={onToggle}
                cn={propCn}
                leadingAccessories={leadingAccessories}
                trailingAccessories={trailingAccessories}
            />
        </PanelResizeHandle>
    );
};
