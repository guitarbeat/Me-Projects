import { useCallback, useMemo } from 'react';

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Shared hook for share and print actions
 * Consolidates duplicate share/print logic across components
 */
export const useShareActions = (options?: ShareOptions) => {
  const canShare = useMemo(() => typeof navigator !== 'undefined' && !!navigator.share, []);

  const handleShare = useCallback(async () => {
    if (!canShare) return;
    
    try {
      await navigator.share({
        title: options?.title || 'My Reflection',
        text: options?.text || 'Check out my journal reflection',
        url: options?.url || window.location.href,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  }, [canShare, options?.title, options?.text, options?.url]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handleShare, handlePrint, canShare };
};
