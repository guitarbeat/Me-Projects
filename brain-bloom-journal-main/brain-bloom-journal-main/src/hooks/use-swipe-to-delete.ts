import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSwipeToDeleteOptions {
  onDelete: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface UseSwipeToDeleteResult {
  elementRef: React.RefObject<HTMLDivElement>;
  swipeOffset: number;
  isDeleting: boolean;
  isSwiping: boolean;
  deleteProgress: number;
  resetSwipe: () => void;
}

export function useSwipeToDelete({
  onDelete,
  threshold = 100,
  enabled = true,
}: UseSwipeToDeleteOptions): UseSwipeToDeleteResult {
  const elementRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const startX = useRef(0);
  const currentX = useRef(0);
  const isTracking = useRef(false);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setIsSwiping(false);
    setIsDeleting(false);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isDeleting) return;
    
    startX.current = e.touches[0].clientX;
    isTracking.current = true;
    setIsSwiping(true);
  }, [enabled, isDeleting]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTracking.current || !enabled || isDeleting) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      // Apply resistance as user swipes further
      const resistance = 1 + (diff / threshold) * 0.5;
      const offset = Math.min(diff / resistance, threshold * 1.3);
      setSwipeOffset(offset);
      
      // Prevent scroll when swiping
      if (offset > 10) {
        e.preventDefault();
      }
    } else {
      setSwipeOffset(0);
    }
  }, [enabled, isDeleting, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isTracking.current) return;
    
    isTracking.current = false;
    setIsSwiping(false);
    
    if (swipeOffset >= threshold) {
      setIsDeleting(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      // Animate out then delete
      setSwipeOffset(threshold * 2);
      setTimeout(() => {
        onDelete();
        resetSwipe();
      }, 200);
    } else {
      // Spring back
      setSwipeOffset(0);
    }
  }, [swipeOffset, threshold, onDelete, resetSwipe]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  const deleteProgress = Math.min(swipeOffset / threshold, 1);

  return {
    elementRef,
    swipeOffset,
    isDeleting,
    isSwiping,
    deleteProgress,
    resetSwipe,
  };
}
