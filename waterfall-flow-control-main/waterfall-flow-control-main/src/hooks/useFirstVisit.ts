import { useState, useEffect, useCallback } from 'react';

/**
 * useFirstVisit - Track first-time user hints
 *
 * Manages localStorage flags for one-time UI hints and animations.
 */
export const useFirstVisit = (key: string) => {
  const storageKey = `lovable.firstVisit.${key}`;

  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) !== 'false';
  });

  const [hasShownHint, setHasShownHint] = useState(false);

  const markAsSeen = useCallback(() => {
    localStorage.setItem(storageKey, 'false');
    setIsFirstVisit(false);
    setHasShownHint(true);
  }, [storageKey]);

  // Auto-dismiss after 5 seconds on first visit
  useEffect(() => {
    if (!isFirstVisit || hasShownHint) return;

    const timer = setTimeout(() => {
      markAsSeen();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isFirstVisit, hasShownHint, markAsSeen]);

  return {
    isFirstVisit,
    hasShownHint,
    markAsSeen,
  };
};

/**
 * useFirstVisitOnce - Simple one-time check
 */
export const useFirstVisitOnce = (key: string): boolean => {
  const storageKey = `lovable.firstVisit.${key}`;

  const [isFirst] = useState(() => {
    if (typeof window === 'undefined') return false;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      localStorage.setItem(storageKey, 'true');
      return true;
    }
    return false;
  });

  return isFirst;
};
