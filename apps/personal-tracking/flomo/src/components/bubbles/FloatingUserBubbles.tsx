import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { FloatingBubble, type FloatingBubbleHandle } from './FloatingBubble';
import {
  BubblePhysics,
  type BubbleState,
  type MouseState,
} from './BubblePhysics';
import type { UserBubbleProfile } from '@/types/user';

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 40 };
    navigator.vibrate(patterns[style]);
  }
};

interface FloatingUserBubblesProps {
  userProfiles?: Array<UserBubbleProfile>;
  onAutofill?: (username: string) => void;
  onBubbleClick?: (userId: string) => void;
}

export const FloatingUserBubbles: React.FC<FloatingUserBubblesProps> = ({
  userProfiles = [],
  onAutofill,
  onBubbleClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Use "bubbles" state only for initial rendering/lifecycle, not for animation frames
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);

  // Mutable refs for animation loop
  const bubblesPhysicsRef = useRef<BubbleState[]>([]);
  const bubbleRefs = useRef<(FloatingBubbleHandle | null)[]>([]);
  const catchZoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // OPTIMIZATION: Use ref for mouse state to avoid re-renders on every mouse move
  const mouseStateRef = useRef<MouseState>({
    x: 0,
    y: 0,
    isActive: false,
  });

  const [isTouchActive, setIsTouchActive] = useState(false);
  const [showHintShimmer, setShowHintShimmer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchTimeoutRef = useRef<NodeJS.Timeout>();
  const hintTimerRef = useRef<NodeJS.Timeout>();

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < 640;
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Use Intersection Observer to pause animations when not visible
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0 } // Trigger when any part becomes visible
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Show hint shimmer after 2.5 seconds of inactivity on first visit
  useEffect(() => {
    if (userProfiles.length === 0) {
      return;
    }

    const hasSeenHint = sessionStorage.getItem('bubbleHintSeen');
    if (hasSeenHint) {
      return;
    }

    hintTimerRef.current = setTimeout(() => {
      setShowHintShimmer(true);
      sessionStorage.setItem('bubbleHintSeen', 'true');

      // Auto-hide after a few cycles
      setTimeout(() => setShowHintShimmer(false), 6000);
    }, 2500);

    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [userProfiles.length]);

  // Initialize container size
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize bubbles
  useEffect(() => {
    if (
      userProfiles &&
      userProfiles.length > 0 &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      const radius = isMobile ? 48 : 65; // Larger for better touch targets
      const initialBubbles: BubbleState[] = userProfiles.map(() => ({
        x: Math.random() * (containerSize.width - 2 * radius) + radius,
        y: Math.random() * (containerSize.height - 2 * radius) + radius,
        vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 2),
        vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 2),
        radius,
        isHovered: false,
        lastMouseDistance: Infinity,
      }));

      setBubbles(initialBubbles);
      // Sync physics ref with new bubbles
      bubblesPhysicsRef.current = initialBubbles.map((b) => ({ ...b }));
      // Reset refs arrays
      bubbleRefs.current = new Array(userProfiles.length).fill(null);
      catchZoneRefs.current = new Array(userProfiles.length).fill(null);
    }
  }, [userProfiles, containerSize, isMobile]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    // Update ref directly to avoid re-renders
    mouseStateRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isActive: true,
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const throttledMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
      clearTimeout(timeoutId);

      // Reset isActive state in ref after inactivity
      timeoutId = setTimeout(
        () => {
          if (mouseStateRef.current) {
            mouseStateRef.current.isActive = false;
          }
        },
        200
      );
    };

    if (typeof document === 'undefined') {
      return () => undefined;
    }

    document.addEventListener('mousemove', throttledMouseMove);
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      clearTimeout(timeoutId);
    };
  }, [handleMouseMove]);

  // Touch detection - slow bubbles when touching screen
  useEffect(() => {
    if (!isMobile || typeof document === 'undefined') {
      return;
    }

    const handleTouchStart = () => {
      setIsTouchActive(true);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };

    const handleTouchEnd = () => {
      // Keep slow for a bit after touch ends to allow tap
      touchTimeoutRef.current = setTimeout(() => {
        setIsTouchActive(false);
      }, 1500);
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [isMobile]);

  // Physics animation loop - Optimized to avoid React re-renders
  useEffect(() => {
    if (bubbles.length === 0 || containerSize.width === 0) {
      return;
    }

    let isAnimating = true;

    const animate = () => {
      if (!isAnimating) {
        return;
      }

      // Stop animation if paused, not visible, or reduced motion is preferred
      if (isPaused || !isVisible || prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(animate);
        lastTimeRef.current = Date.now(); // Keep timer current to avoid jump on resume
        return;
      }

      const now = Date.now();
      const deltaTime = Math.min(now - lastTimeRef.current, 32); // Cap at ~30fps to prevent glitches
      lastTimeRef.current = now;

      // Only update if deltaTime is reasonable (prevents huge jumps)
      if (deltaTime > 8 && deltaTime < 100) {
        // Update physics state in ref
        const currentBubbles = bubblesPhysicsRef.current;
        const nextBubbles = currentBubbles.map((bubble) => {
          const updated = BubblePhysics.updateBubble(
            bubble,
            mouseStateRef.current, // Use ref here
            containerSize,
            currentBubbles,
            deltaTime
          );
          // Slow down bubbles when touch is active
          if (isTouchActive) {
            updated.vx *= 0.15;
            updated.vy *= 0.15;
          }
          return updated;
        });

        bubblesPhysicsRef.current = nextBubbles;

        // Apply updates to DOM via refs
        nextBubbles.forEach((bubble, index) => {
          // Update bubble component
          const bubbleHandle = bubbleRefs.current[index];
          if (bubbleHandle) {
            bubbleHandle.update(bubble);
          }

          // Update catch zone if it exists
          const catchZone = catchZoneRefs.current[index];
          if (catchZone) {
            catchZone.style.left = `${bubble.x - bubble.radius - 20}px`;
            catchZone.style.top = `${bubble.y - bubble.radius - 20}px`;
          }
        });
      }

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isAnimating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    bubbles.length,
    containerSize,
    // mouseState removed from dependency array as we use ref
    isTouchActive,
    isPaused,
    isVisible,
    prefersReducedMotion,
  ]);

  // Cancel hint shimmer when user interacts
  const handleBubbleInteraction = useCallback(() => {
    setShowHintShimmer(false);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }
  }, []);

  // Safety check for userProfiles
  if (
    !userProfiles ||
    !Array.isArray(userProfiles) ||
    userProfiles.length === 0
  ) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 1,
        top: '50%', // Start bubbles from middle of screen to avoid overlapping header/form
      }}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      role="region"
      aria-label="Floating user bubbles"
    >
      {/* Catch zone indicator when touch is active */}
      {isTouchActive && isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          {bubbles.map((bubble, index) => (
            <div
              key={`catch-${index}`}
              ref={(el) => {
                catchZoneRefs.current[index] = el;
              }}
              className="absolute rounded-full border-2 border-primary/20 catch-zone"
              style={{
                left: bubble.x - bubble.radius - 20,
                top: bubble.y - bubble.radius - 20,
                width: (bubble.radius + 20) * 2,
                height: (bubble.radius + 20) * 2,
              }}
            />
          ))}
        </div>
      )}

      {userProfiles.map((profile, index) => {
        if (!profile || !profile.username) {
          return null;
        }

        const bubble = bubbles[index];
        if (!bubble) {
          return null;
        }

        return (
          <div
            key={profile.username}
            className={`pointer-events-auto ${showHintShimmer && index === 0 ? 'bubble-hint-shimmer' : ''}`}
          >
            <FloatingBubble
              ref={(el) => {
                bubbleRefs.current[index] = el;
              }}
              bubble={bubble}
              profile={profile}
              onAutofill={(username) => {
                handleBubbleInteraction();
                triggerHaptic('medium');
                if (onAutofill) {
                  onAutofill(username);
                }
              }}
              onClick={
                onBubbleClick
                  ? () => {
                      handleBubbleInteraction();
                      triggerHaptic('light');
                      onBubbleClick(profile.id);
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
};
