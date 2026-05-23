import React from 'react';

// Re-export cn utility type for convenience
export type CnFunction = (...classes: (string | undefined | null | false)[]) => string;

export interface LayoutMetrics {
    radius: number;
    padding: number;
    gap: number;
}

export interface SplitAccessory {
    id: string;
    icon: React.ElementType;
    label: string;
    color?: string;
    onClick: () => void;
}

// Detent types for snap-to positions (iOS-inspired)
export type SplitDetent =
    | { type: 'full'; panel: 'top' | 'bottom' }
    | { type: 'mini'; panel: 'top' | 'bottom' }
    | { type: 'fraction'; value: number };

export function detentToSize(detent: SplitDetent, miniSize: number = 10): number {
    switch (detent.type) {
        case 'full':
            return detent.panel === 'top' ? 100 : 0;
        case 'mini':
            return detent.panel === 'top' ? (100 - miniSize) : miniSize;
        case 'fraction':
            return detent.value * 100;
    }
}

export interface SplitPaneProps {
    children?: React.ReactNode;
    radius: number;
    padding: number;
    gap?: number;
    isCollapsed?: boolean;
    overlay?: React.ReactNode;
    overlayPosition?: 'top' | 'bottom';
    className?: string;
    cn?: CnFunction;
    isMini?: boolean;
    miniOverlay?: React.ReactNode;
}

export interface HandleButtonProps {
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    direction?: 'up' | 'down';
    onToggle?: () => void;
    className?: string;
    cn?: CnFunction;
    leadingAccessories?: SplitAccessory[];
    trailingAccessories?: SplitAccessory[];
}

export interface HandleProps {
    className?: string;
    vertical?: boolean;
    isDragging?: boolean;
    collapsed?: boolean;
    direction?: 'up' | 'down';
    onToggle?: () => void;
    cn?: CnFunction;
    leadingAccessories?: SplitAccessory[];
    trailingAccessories?: SplitAccessory[];
}

export interface SplitPaneConfig {
    id: string;
    content: React.ReactNode;
    overlay?: React.ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    collapsible?: boolean;
    collapsedSize?: number;
    isCollapsed?: boolean; // Controlled collapse state
    onCollapseChange?: (collapsed: boolean) => void; // Callback for controlled state sync
    miniDetentSize?: number;
    miniOverlay?: React.ReactNode;
    miniThreshold?: number;
    leadingAccessories?: SplitAccessory[];
    trailingAccessories?: SplitAccessory[];
    // Detent configuration
    detents?: SplitDetent[];  // Available snap points
    defaultDetent?: SplitDetent;  // Initial detent
    snapThreshold?: number;  // Distance threshold for snapping (default: 5)
}

export interface SplitViewProps {
    panels: SplitPaneConfig[];
    direction?: 'vertical' | 'horizontal';
    cn?: CnFunction;
}
