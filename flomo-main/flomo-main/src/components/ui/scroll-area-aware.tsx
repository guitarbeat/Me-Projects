import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaAwareProps {
  children: React.ReactNode;
  className?: string;
  showTopFade?: boolean;
  showBottomFade?: boolean;
  fadeSize?: 'sm' | 'md' | 'lg';
  onScrollStateChange?: (state: {
    isScrolled: boolean;
    isAtBottom: boolean;
  }) => void;
}

export const ScrollAreaAware: React.FC<ScrollAreaAwareProps> = ({
  children,
  className,
  showTopFade = true,
  showBottomFade = true,
  fadeSize = 'md',
  onScrollStateChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    isAtBottom: true,
    canScroll: false,
  });

  const fadeSizeMap = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
  };

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight;
    const isScrolled = scrollTop > 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    setScrollState((prev) => {
      if (
        prev.isScrolled !== isScrolled ||
        prev.isAtBottom !== isAtBottom ||
        prev.canScroll !== canScroll
      ) {
        const newState = { isScrolled, isAtBottom, canScroll };
        onScrollStateChange?.({ isScrolled, isAtBottom });
        return newState;
      }
      return prev;
    });
  }, [onScrollStateChange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    // Initial check
    checkScroll();

    // Observe for content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    // Also observe children for dynamic content
    Array.from(el.children).forEach((child) => resizeObserver.observe(child));

    return () => resizeObserver.disconnect();
  }, [checkScroll]);

  return (
    <div className="relative">
      {/* Top fade gradient */}
      {showTopFade && scrollState.canScroll && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200',
            fadeSizeMap[fadeSize],
            'bg-gradient-to-b from-background to-transparent',
            scrollState.isScrolled ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn('overflow-y-auto', className)}
      >
        {children}
      </div>

      {/* Bottom fade gradient */}
      {showBottomFade && scrollState.canScroll && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200',
            fadeSizeMap[fadeSize],
            'bg-gradient-to-t from-background to-transparent',
            scrollState.isAtBottom ? 'opacity-0' : 'opacity-100'
          )}
        />
      )}
    </div>
  );
};
