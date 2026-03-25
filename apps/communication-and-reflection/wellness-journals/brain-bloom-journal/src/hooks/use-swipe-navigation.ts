import { useCallback, useRef } from 'react';
import type { ViewMode } from '@/hooks/features';

const VIEWS: ViewMode[] = ['compose', 'archive'];
const SWIPE_THRESHOLD = 50;

interface SwipeNavigationOptions {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const useSwipeNavigation = ({ currentView, onViewChange }: SwipeNavigationOptions) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const currentIndex = VIEWS.indexOf(currentView);

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0 && currentIndex < VIEWS.length - 1) {
        // Swipe left -> next view
        onViewChange(VIEWS[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right -> previous view
        onViewChange(VIEWS[currentIndex - 1]);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [currentView, onViewChange]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};