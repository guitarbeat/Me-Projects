import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
  enabled = true,
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = (
    intensity: 'light' | 'medium' | 'heavy' = 'medium'
  ) => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const element = scrollRef.current;
    if (!element) return;

    let touchStartY = 0;
    let currentPull = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the scroll
      if (element.scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - startY.current;

      if (distance > 0 && element.scrollTop === 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        // Apply resistance curve
        currentPull = Math.min(distance * 0.5, maxPullDistance);
        setPullDistance(currentPull);

        // Haptic feedback at threshold
        if (currentPull >= threshold && currentPull < threshold + 5) {
          triggerHaptic('light');
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        triggerHaptic('heavy');

        try {
          await onRefresh();
          triggerHaptic('medium');
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      currentPull = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    enabled,
    isPulling,
    isRefreshing,
    pullDistance,
    threshold,
    maxPullDistance,
    onRefresh,
  ]);

  return {
    scrollRef,
    isPulling,
    isRefreshing,
    pullDistance,
    threshold,
  };
};
