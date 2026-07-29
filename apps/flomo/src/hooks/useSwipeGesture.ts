import { useRef, useCallback, useEffect } from 'react';
import { hapticNavigation } from '@/lib/haptics';

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * Hook for detecting horizontal swipe gestures
 * Returns a ref to attach to the swipeable element
 */
export const useSwipeGesture = ({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeConfig) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const swipeState = useRef<SwipeState | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) {
        return;
      }

      const touch = e.touches[0];
      swipeState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !swipeState.current) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;
      const deltaTime = Date.now() - swipeState.current.startTime;

      // Only trigger if horizontal movement is greater than vertical
      // and meets the threshold, with reasonable time limit
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > threshold &&
        deltaTime < 500
      ) {
        hapticNavigation();

        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      swipeState.current = null;
    },
    [enabled, threshold, onSwipeLeft, onSwipeRight]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) {
      return;
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);

  return elementRef;
};
