import React, { useRef, useState, useCallback } from 'react';
import { Panel, PanelGroup, ImperativePanelHandle } from 'react-resizable-panels';
import { cn } from '../../ui';
import { SplitViewProps, LayoutMetrics, SplitPaneConfig, CnFunction } from './types';
import { LAYOUT_METRICS } from './constants';
import { SplitPane } from './SplitPane';
import { Handle } from './ResizeHandle';

const getCn = () => cn;

export function useDynamicLayout(_ref: React.RefObject<HTMLElement>): LayoutMetrics {
    // Current requirement is fixed metrics.
    // We return the constant metrics directly to avoid unnecessary effects/renders.
    return LAYOUT_METRICS;
}

// --- INTERNAL ITEM WRAPPER ---
const SplitViewItem = ({ 
    panel,
    radius,
    padding,
    gap,
    isCollapsed,
    cnFn
}: { 
    panel: SplitPaneConfig, 
    radius: number,
    padding: number,
    gap: number,
    isCollapsed: boolean,
    cnFn: CnFunction
}) => {
    // Determine if we are in "Mini" state
    // If collapsedSize > 0 and isCollapsed is true, we show the mini overlay
    const isMini = isCollapsed && (panel.collapsedSize || 0) > 0;

    return (
        <SplitPane
            radius={radius}
            padding={padding}
            gap={gap}
            isCollapsed={isCollapsed && !isMini} 
            isMini={isMini}
            miniOverlay={panel.miniOverlay}
            overlay={panel.overlay}
            overlayPosition="bottom"
            cn={cnFn}
        >
            {panel.content}
        </SplitPane>
    );
};

// --- MAIN COMPONENT ---

export const SplitView = ({ panels, direction = 'vertical', cn: propCn }: SplitViewProps) => {
    const cnFn = propCn || getCn();
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
        // Find panel and call handler if exists
        const panel = panels.find(p => p.id === panelId);
        panel?.onCollapseChange?.(true);
    }, [panels]);

    const handleExpand = useCallback((panelId: string) => {
        setCollapsedStates(prev => {
            const next = new Map(prev);
            next.set(panelId, false);
            return next;
        });
        // Find panel and call handler if exists
        const panel = panels.find(p => p.id === panelId);
        panel?.onCollapseChange?.(false);
    }, [panels]);

    // Sync external isCollapsed prop with internal state/imperative handles
    React.useEffect(() => {
        panels.forEach(panel => {
            if (panel.isCollapsed !== undefined) {
                const currentCollapsed = collapsedStates.get(panel.id);
                // Only act if there is a mismatch to avoid loops/redundancy
                if (panel.isCollapsed !== currentCollapsed) {
                    const ref = panelRefs.current.get(panel.id);
                    if (ref) {
                        if (panel.isCollapsed) {
                            ref.collapse();
                        } else {
                            ref.expand();
                        }
                    }
                }
            }
        });
    }, [panels, collapsedStates]);

    if (panels.length === 0) return null;

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
                        <SplitViewItem
                            panel={panel}
                            radius={radius}
                            padding={padding}
                            gap={gap}
                            isCollapsed={isCollapsed}
                            cnFn={cnFn}
                        />
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
                                <SplitViewItem 
                                    panel={panel}
                                    radius={radius}
                                    padding={padding}
                                    gap={gap}
                                    isCollapsed={isCollapsed}
                                    cnFn={cnFn}
                                />
                            </Panel>

                            {!isLast && (
                                <Handle
                                    onToggle={() => {
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
                                    leadingAccessories={panels[index].leadingAccessories}
                                    trailingAccessories={panels[index].trailingAccessories}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </PanelGroup>
        </div>
    );
};
