/**
 * Resizable Panels Module
 * 
 * A modular, reusable set of components for creating resizable panel layouts
 * with a modern "island" visual style. Designed to work with CSS variables
 * for easy theming across projects.
 * 
 * Dependencies:
 * - react
 * - react-resizable-panels
 * - lucide-react (for icons)
 * - A `cn` utility function for className merging
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Import cn from ui module
import { cn } from './ui';

// Re-export cn utility type for convenience
export type CnFunction = (...classes: (string | undefined | null | false)[]) => string;

// Default cn implementation - simple class name merger
const defaultCn: CnFunction = (...classes) => classes.filter(Boolean).join(' ');

const projectCn: CnFunction = cn || defaultCn;

// Use project cn if available, otherwise use default
const getCn = (): CnFunction => projectCn;

// --- TYPES ---

export interface LayoutMetrics {
    radius: number;
    padding: number;
    gap: number;
}

export interface PanelCardProps {
    children?: React.ReactNode;
    radius: number;
    padding: number;
    gap?: number;
    isCollapsed?: boolean;
    overlay?: React.ReactNode;
    overlayPosition?: 'top' | 'bottom';
    className?: string;
    cn?: CnFunction;
}

export interface HandleButtonProps {
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    direction?: 'up' | 'down';
    onToggle?: () => void;
    className?: string;
    cn?: CnFunction;
}

export interface HandleProps {
    className?: string;
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    direction?: 'up' | 'down';
    onToggle?: () => void;
    cn?: CnFunction;
}



export interface PanelConfig {
    id: string;
    content: React.ReactNode;
    overlay?: React.ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    collapsible?: boolean;
    collapsedSize?: number;
}

export interface PanelStackProps {
    panels: PanelConfig[];
    direction?: 'vertical' | 'horizontal';
    cn?: CnFunction;
}

// --- HOOKS ---

/**
 * Hook to calculate consistent layout metrics (padding, radius, gap)
 * based on container size, ensuring all panels behave responsively.
 */
export function useDynamicLayout(ref: React.RefObject<HTMLElement>): LayoutMetrics {
    const [metrics, setMetrics] = useState<LayoutMetrics>({ radius: 24, padding: 12, gap: 8 });
    
    useEffect(() => {
        const update = () => {
            if (!ref.current) return;
            const w = ref.current.offsetWidth;
            const h = ref.current.offsetHeight;
            const minDim = Math.min(w, h);
            
            // Dynamic scaling logic: Tighter on small screens, spacious on large
            // Adjusted for better "island" separation
            const radius = Math.max(16, Math.min(28, minDim * 0.05));
            const padding = Math.max(8, Math.min(20, minDim * 0.025));
            
            setMetrics({ 
                radius, 
                padding, 
                gap: Math.max(4, padding * 0.5) 
            });
        };

        // Initial update
        update();

        const obs = new ResizeObserver(() => {
            requestAnimationFrame(update);
        });
        
        if (ref.current) {
            obs.observe(ref.current);
        }
        
        return () => obs.disconnect();
    }, [ref]);

    return metrics;
}

// --- COMPONENTS ---

/**
 * A reusable card container that implements the "Island" visual style.
 * Handles the outer padding (for the floating effect), border radius, shadow,
 * and hardware acceleration properties.
 * 
 * All panels use identical padding to ensure equal visual width and consistent appearance.
 */
export const PanelCard = ({ 
    children, 
    radius, 
    padding, 
    gap: _gap = 0, 
    isCollapsed = false, 
    overlay, 
    overlayPosition = 'bottom',
    className,
    cn
}: PanelCardProps) => {
    const cnFn = cn || getCn();
    
    const cardStyle: React.CSSProperties = {
        borderRadius: `${radius}px`,
        boxShadow: '0 0 0 1px #1a1a1a, 0 4px 20px -5px rgba(0,0,0,0.3)',
        backgroundColor: '#000000', // Fixed pure black - not affected by theme
        transform: 'translate3d(0,0,0)',
        isolation: 'isolate',
        transition: 'border-radius 0.2s',
    };

    // All panels use identical padding for equal visual width and consistent appearance
    // This ensures all panels look the same regardless of their position in the stack
    // The gap between panels is controlled by verticalMargin
    // 
    // SPACING OPTIONS (change the value below to test):
    // Option B: Remove margins (panels touch, handle sits between) - verticalMargin = 0
    // Option C: Reduced margins (tighter spacing) - verticalMargin = gap / 4
    // Original: Full spacing - verticalMargin = gap / 2
    // const verticalMargin = isCollapsed ? 0 : 0; // Option B: No margins (panels touch)
    const verticalMargin = isCollapsed ? 0 : 0; // Option C: Reduced margins

    return (
        <div className="absolute inset-0 transition-all duration-300" 
             style={{ 
                 paddingLeft: padding,
                 paddingRight: padding,
                 paddingTop: padding, 
                 paddingBottom: padding,
                 marginTop: verticalMargin,
                 marginBottom: verticalMargin
             }}>
            <div className={cnFn("h-full w-full bg-[#000000] overflow-hidden relative group max-w-screen-2xl mx-auto", className)} style={cardStyle}>
                <div className={cnFn("h-full w-full transition-opacity duration-300", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
                    {children}
                </div>
                {overlay && (
                     <div className={cnFn(
                         "absolute left-1/2 -translate-x-1/2 pointer-events-none z-20 w-auto max-w-[90%] flex justify-center",
                         overlayPosition === 'bottom' ? "bottom-6 animate-in slide-in-from-bottom-2" : "top-6 animate-in slide-in-from-top-2"
                     )}>
                        <div className="bg-[rgba(0,0,0,0.9)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)] p-2 rounded-full shadow-2xl fade-in duration-500">
                            {overlay}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * A button component for resizing/collapsing panels.
 * Provides visual feedback and handles drag interactions.
 * Shows a bar by default that transforms to an arrow on hover.
 */
export const HandleButton = ({ 
    vertical = false, 
    isDragging, 
    collapsed, 
    direction = 'up', 
    onToggle, 
    className,
    cn
}: HandleButtonProps) => {
    const cnFn = cn || getCn();
    const isActive = collapsed || isDragging;
    
    return (
        <div 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { 
                if (onToggle) {
                    e.stopPropagation();
                    e.preventDefault(); 
                    onToggle();
                }
            }}
            className={cnFn(
                "rounded-sm transition-all duration-300 flex items-center justify-center relative overflow-hidden cursor-pointer",
                "group-hover:bg-[#1a1a1a] group-hover:border-[#dc2626] group-hover:scale-105",
                "active:scale-95",
                vertical 
                    ? "w-1.5 h-12 group-hover:h-16" 
                    : "h-0.5 w-16 group-hover:w-24 group-hover:h-5",
                // Active/collapsed state styling
                isActive && !vertical && "w-24 h-5 bg-[#dc2626] border border-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30",
                isActive && vertical && "w-6 h-28 bg-[#dc2626] border border-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30",
                // Default state - subtle bar (black with subtle border)
                !isActive && !vertical && "bg-[#000000] border border-[#1a1a1a] backdrop-blur-md shadow-sm",
                !isActive && vertical && "bg-[#000000] border border-[#1a1a1a] backdrop-blur-md shadow-sm",
                className
            )}
        >
            {/* Default Bar - visible when not active and not hovering */}
            {!isActive && (
                <div className={cnFn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    !vertical && "opacity-100 group-hover:opacity-0",
                    vertical && "opacity-100 group-hover:opacity-0"
                )}>
                    {!vertical ? (
                        <div className="h-0.5 w-12 bg-[rgba(255,255,255,0.3)] rounded-full" />
                    ) : (
                        <div className="w-0.5 h-12 bg-[rgba(255,255,255,0.3)] rounded-full" />
                    )}
                </div>
            )}

            {/* Arrow Icon - visible on hover or when active/collapsed */}
            {!vertical && onToggle && (
                <div className={cnFn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10", 
                    isActive 
                        ? "opacity-100" 
                        : "opacity-0 group-hover:opacity-100"
                )}>
                    {(() => {
                        // Determine arrow direction based on collapse state and handle position
                        // Top panel handle (direction="up"): 
                        //   - Not collapsed: show UP arrow (ChevronUp) to collapse upward
                        //   - Collapsed: show DOWN arrow (ChevronDown) to expand downward
                        // Handles between panels (direction="down"):
                        //   - Panel below not collapsed: show DOWN arrow (ChevronDown) to collapse downward
                        //   - Panel below collapsed: show UP arrow (ChevronUp) to expand upward
                        
                        if (direction === 'up') {
                            // Top panel handle
                            if (collapsed) {
                                // Top panel is collapsed → show down arrow to expand downward
                                return <ChevronDown size={14} strokeWidth={2.5} className="text-white" />;
                            } else {
                                // Top panel is not collapsed → show up arrow to collapse upward
                                return <ChevronUp size={14} strokeWidth={2.5} className="text-white" />;
                            }
                        } else {
                            // Handle between panels (direction="down" or undefined defaults to "down")
                            if (collapsed) {
                                // Panel below is collapsed → show up arrow to expand upward
                                return <ChevronUp size={14} strokeWidth={2.5} className="text-white" />;
                            } else {
                                // Panel below is not collapsed → show down arrow to collapse downward
                                return <ChevronDown size={14} strokeWidth={2.5} className="text-white" />;
                            }
                        }
                    })()}
                </div>
            )}

            {/* Vertical handle arrow */}
            {vertical && onToggle && (
                <div className={cnFn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10", 
                    isActive 
                        ? "opacity-100" 
                        : "opacity-0 group-hover:opacity-100"
                )}>
                    {(() => {
                        // For vertical handles, when collapsed show expand arrow
                        // Default is right, so collapsed shows left (ChevronLeft when rotated)
                        if (collapsed) {
                            // Collapsed: show left arrow (to expand right)
                            return <ChevronDown size={14} strokeWidth={2.5} className="rotate-[-90deg] text-white" />;
                        } else {
                            // Not collapsed: show right arrow (to collapse left)
                            return <ChevronDown size={14} strokeWidth={2.5} className="rotate-90 text-white" />;
                        }
                    })()}
                </div>
            )}
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
    cn
}: HandleProps) => {
    const cnFn = cn || getCn();
    return (
        <PanelResizeHandle className={cnFn("group flex items-center justify-center z-50 outline-none touch-none transition-all focus:outline-none", vertical ? "w-5 h-full cursor-col-resize -mx-2.5" : "h-3 w-full cursor-row-resize -my-1.5", className)}>
            <HandleButton 
                vertical={vertical}
                isDragging={isDragging}
                collapsed={collapsed}
                direction={direction}
                onToggle={onToggle}
                cn={cn}
            />
        </PanelResizeHandle>
    );
};

// --- RESIZE DRAG HOOK ---

/**
 * Hook for handling drag interactions to resize panels.
 * Manages mouse events and state for dragging.
 */
export function useResizeDrag(
    height: number,
    setHeight: (h: number) => void,
    minHeight: number,
    maxHeight: number,
    isCollapsed: boolean,
    setIsCollapsed: (c: boolean) => void,
    collapsedHeight: number,
    lastHeight: number,
    setLastHeight: (h: number) => void
) {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const delta = e.clientY - startY.current;
            const absoluteMax = Math.min(maxHeight, window.innerHeight * 0.7);
            const newHeight = Math.max(minHeight, Math.min(absoluteMax, startHeight.current + delta));
            
            setHeight(newHeight);
            
            if (isCollapsed && Math.abs(delta) > 5) {
                setIsCollapsed(false);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                if (height < minHeight) {
                    setHeight(minHeight);
                    setIsCollapsed(false); 
                } else {
                    setLastHeight(height);
                }
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minHeight, maxHeight, isCollapsed, height, setHeight, setIsCollapsed, setLastHeight]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        startY.current = e.clientY;
        startHeight.current = isCollapsed ? collapsedHeight : height;
        if (isCollapsed) {
             setIsCollapsed(false);
             setHeight(lastHeight);
        }
    };

    return { isDragging, handleMouseDown };
}



// --- FLEXIBLE PANEL STACK ---

/**
 * A flexible panel stack component that supports any number of panels.
 * Simply provide an array of panel configurations to create your layout.
 * 
 * @example
 * ```tsx
 * <PanelStack
 *   panels={[
 *     { id: 'top', content: <TopPanel />, defaultSize: 30, minSize: 20 },
 *     { id: 'middle', content: <MiddlePanel />, defaultSize: 50, minSize: 30 },
 *     { id: 'bottom', content: <BottomPanel />, defaultSize: 20, minSize: 15, collapsible: true }
 *   ]}
 * />
 * ```
 */
export const PanelStack = ({ panels, direction = 'vertical', cn }: PanelStackProps) => {
    const cnFn = cn || getCn();
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRefs = useRef<Map<string, ImperativePanelHandle>>(new Map());
    
    // Initialize collapsed states
    const [collapsedStates, setCollapsedStates] = useState<Map<string, boolean>>(() => {
        const initialStates = new Map<string, boolean>();
        panels.forEach(panel => {
            if (panel.collapsible) {
                initialStates.set(panel.id, false);
            }
        });
        return initialStates;
    });

    const { radius, padding, gap } = useDynamicLayout(containerRef);

    const togglePanel = useCallback((panelId: string) => {
        const panel = panelRefs.current.get(panelId);
        if (panel) {
            const isCollapsed = collapsedStates.get(panelId) || false;
            if (isCollapsed) {
                panel.expand();
            } else {
                panel.collapse();
            }
        }
    }, [collapsedStates]);

    const handleCollapse = useCallback((panelId: string) => {
        setCollapsedStates(prev => {
            const next = new Map(prev);
            next.set(panelId, true);
            return next;
        });
    }, []);

    const handleExpand = useCallback((panelId: string) => {
        setCollapsedStates(prev => {
            const next = new Map(prev);
            next.set(panelId, false);
            return next;
        });
    }, []);

    if (panels.length === 0) {
        return null;
    }

    // Single panel - no handles needed
    if (panels.length === 1) {
        const panel = panels[0];
        const isCollapsed = collapsedStates.get(panel.id) || false;
        return (
            <div ref={containerRef} className="h-full w-full overflow-hidden relative">
                <PanelGroup direction={direction} className="relative z-10">
                    <Panel 
                        ref={(ref) => {
                            if (ref) panelRefs.current.set(panel.id, ref);
                        }}
                        defaultSize={panel.defaultSize ?? 100}
                        minSize={panel.minSize ?? 0}
                        maxSize={panel.maxSize ?? 100}
                        collapsible={panel.collapsible}
                        collapsedSize={panel.collapsedSize ?? 0}
                        onCollapse={() => handleCollapse(panel.id)}
                        onExpand={() => handleExpand(panel.id)}
                        className="relative transition-all duration-300"
                    >
                        <PanelCard
                            radius={radius}
                            padding={padding}
                            gap={gap}
                            isCollapsed={isCollapsed}
                            overlay={panel.overlay}
                            overlayPosition="bottom"
                            cn={cnFn}
                        >
                            {panel.content}
                        </PanelCard>
                    </Panel>
                </PanelGroup>
            </div>
        );
    }

    // Multiple panels with handles
    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden relative">
            <PanelGroup direction={direction} className="relative z-10">
                {panels.map((panel, index) => {
                    const isCollapsed = collapsedStates.get(panel.id) || false;
                    const isLast = index === panels.length - 1;
                    // All panels use consistent overlay positioning - 'bottom' for all to maintain visual consistency
                    // The overlay position only affects where the overlay appears, not the panel padding
                    const overlayPosition = 'bottom';

                    return (
                        <React.Fragment key={panel.id}>
                            <Panel
                                ref={(ref) => {
                                    if (ref) panelRefs.current.set(panel.id, ref);
                                }}
                                defaultSize={panel.defaultSize ?? (100 / panels.length)}
                                minSize={panel.minSize ?? (panel.collapsible ? 0 : 10)}
                                maxSize={panel.maxSize ?? 100}
                                collapsible={panel.collapsible}
                                collapsedSize={panel.collapsedSize ?? 0}
                                onCollapse={() => handleCollapse(panel.id)}
                                onExpand={() => handleExpand(panel.id)}
                                className="relative transition-all duration-300"
                            >
                                <PanelCard
                                    radius={radius}
                                    padding={padding}
                                    gap={gap}
                                    isCollapsed={isCollapsed}
                                    overlay={panel.overlay}
                                    overlayPosition={overlayPosition}
                                    cn={cnFn}
                                >
                                    {panel.content}
                                </PanelCard>
                            </Panel>

                            {!isLast && (
                                <Handle
                                    onToggle={() => {
                                        // First handle (index 0) toggles the panel above it (control panel)
                                        // Other handles toggle the panel below them
                                        if (index === 0) {
                                            togglePanel(panels[index].id);
                                        } else {
                                            togglePanel(panels[index + 1].id);
                                        }
                                    }}
                                    collapsed={index === 0 
                                        ? (collapsedStates.get(panels[index].id) || false)
                                        : (collapsedStates.get(panels[index + 1].id) || false)
                                    }
                                    direction={index === 0 ? 'up' : (direction === 'vertical' ? 'down' : undefined)}
                                    vertical={direction === 'horizontal'}
                                    cn={cnFn}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </PanelGroup>
        </div>
    );
};

