/**
 * Bubble Physics Types
 */

export interface BubbleState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isHovered: boolean;
}

export interface MouseState {
  x: number;
  y: number;
  isActive: boolean;
}
