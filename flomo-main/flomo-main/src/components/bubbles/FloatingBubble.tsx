import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  forwardRef,
} from 'react';
import type { BubbleState } from './BubblePhysics';
import type { UserBubbleProfile } from '@/types/user';

interface FloatingBubbleProps {
  bubble: BubbleState; // Initial state only
  profile: UserBubbleProfile;
  onAutofill: (username: string) => void;
  onClick?: (() => void) | undefined;
  isHighlighted?: boolean;
}

export interface FloatingBubbleHandle {
  update: (bubble: BubbleState) => void;
}

export const FloatingBubble = forwardRef<
  FloatingBubbleHandle,
  FloatingBubbleProps
>(
  (
    {
      bubble: initialBubble,
      profile,
      onAutofill,
      onClick,
      isHighlighted = false,
    },
    ref
  ) => {
    const elementRef = useRef<HTMLButtonElement>(null);

    // Mutable state for imperative updates to avoid re-renders
    // We initialize with props, but these will drift as physics updates
    const stateRef = useRef({
      x: initialBubble.x,
      y: initialBubble.y,
      vx: initialBubble.vx,
      vy: initialBubble.vy,
      isHovered: initialBubble.isHovered,
      radius: initialBubble.radius,
    });

    const [isPoppingOut, setIsPoppingOut] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => setImageLoaded(true), []);
    const handleImageError = useCallback(() => setImageError(true), []);

    const handleClick = () => {
      // Trigger pop animation before action
      setIsPoppingOut(true);
      setTimeout(() => {
        if (onClick) {
          onClick();
        } else {
          onAutofill(profile.username);
        }
      }, 150);
    };

    // Helper to update DOM styles directly
    const updateStyles = useCallback(() => {
      if (!elementRef.current) {
        return;
      }

      const { x, y, vx, vy, isHovered, radius } = stateRef.current;
      const touchPadding = 16;

      // Calculate scale
      const scale = isPoppingOut
        ? 1.3
        : isHovered
          ? 1.15
          : isHighlighted
            ? 1.1
            : 1;

      // Calculate opacity
      const opacity = isPoppingOut ? 0 : isHovered ? 1 : 0.92;

      // Calculate motion blur
      const velocityMagnitude = Math.sqrt(vx * vx + vy * vy);
      const motionBlurX = vx * 2;
      const motionBlurY = vy * 2;
      const showMotionBlur = velocityMagnitude > 0.5;
      const mbOpacity = showMotionBlur
        ? Math.min(velocityMagnitude * 0.3, 0.5)
        : 0;

      // Apply styles via CSS variables and direct properties
      const style = elementRef.current.style;

      // Transform
      style.transform = `translate3d(${x - radius - touchPadding}px, ${y - radius - touchPadding}px, 0) scale(${scale})`;
      style.opacity = String(opacity);

      // CSS Variables for children
      style.setProperty('--mb-x', `${-motionBlurX}px`);
      style.setProperty('--mb-y', `${-motionBlurY}px`);
      style.setProperty('--mb-opacity', String(mbOpacity));

      const glowScale = isHovered || isHighlighted ? '1.25' : '1';
      style.setProperty('--glow-scale', glowScale);

      const overlayOpacity = isHovered || isHighlighted ? '1' : '0';
      style.setProperty('--overlay-opacity', overlayOpacity);
    }, [isPoppingOut, isHighlighted]);

    // Expose update method to parent
    useImperativeHandle(ref, () => ({
      update: (bubble: BubbleState) => {
        stateRef.current = {
          x: bubble.x,
          y: bubble.y,
          vx: bubble.vx,
          vy: bubble.vy,
          isHovered: bubble.isHovered,
          radius: bubble.radius, // radius might not change, but safe to copy
        };
        updateStyles();
      },
    }));

    // Re-apply styles after any React render (e.g. isPoppingOut change)
    useLayoutEffect(() => {
      updateStyles();
    }, [updateStyles]);

    const displayName = profile.display_name || profile.username;
    const touchPadding = 16;
    // Use initial radius for initial size calculation
    // (Assuming radius doesn't change after init)
    const diameter = initialBubble.radius * 2;

    return (
      <button
        ref={elementRef}
        type="button"
        className="absolute pointer-events-auto select-none bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-coral rounded-full"
        style={{
          // Size includes invisible touch padding
          width: `${diameter + touchPadding * 2}px`,
          height: `${diameter + touchPadding * 2}px`,
          padding: `${touchPadding}px`,
          willChange: 'transform, opacity',
          transition: isPoppingOut
            ? 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 150ms ease-out'
            : 'transform 150ms ease-out, opacity 200ms ease',
          // transform and opacity are managed imperatively
        }}
        onClick={handleClick}
        aria-label={`Select ${displayName}`}
      >
        <div className="relative w-full h-full">
          {/* Highlight ring for matched username */}
          {isHighlighted && !isPoppingOut && (
            <div
              className="absolute inset-0 rounded-full ring-4 ring-green-400/60 animate-pulse"
              style={{ margin: '-4px' }}
            />
          )}

          {/* Motion blur shadow - Always rendered, controlled via CSS vars */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-coral/20 via-rose-pink/15 to-lavender/20 blur-md"
            style={{
              transform: `translate(var(--mb-x, 0px), var(--mb-y, 0px))`,
              opacity: `var(--mb-opacity, 0)`,
            }}
          />

          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-full blur-sm ${
              isHighlighted
                ? 'bg-gradient-to-br from-green-400/50 via-green-300/40 to-green-400/50'
                : 'bg-gradient-to-br from-coral/40 via-rose-pink/30 to-lavender/40'
            }`}
            style={{
              transform: `scale(var(--glow-scale, ${isHighlighted ? 1.25 : 1}))`,
              transition: 'transform 0.3s ease',
            }}
          />

          {/* Main bubble */}
          <div
            className={`relative w-full h-full rounded-full overflow-hidden bg-white/90 backdrop-blur-sm border-2 shadow-lg ${
              isHighlighted ? 'border-green-400/70' : 'border-white/50'
            }`}
          >
            {profile.avatar_url && !imageError ? (
              <>
                {/* Placeholder shown while loading */}
                <div
                  className={`absolute inset-0 flex items-center justify-center font-bold text-lg transition-opacity duration-300 ${
                    isHighlighted
                      ? 'bg-gradient-to-br from-green-100 via-green-50 to-green-100 text-green-600'
                      : 'bg-gradient-to-br from-coral/20 via-rose-pink/20 to-lavender/20 text-coral'
                  }`}
                  style={{ opacity: imageLoaded ? 0 : 1 }}
                >
                  {profile.display_name?.[0]?.toUpperCase() ||
                    profile.username[0]?.toUpperCase()}
                </div>
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                  loading="lazy"
                  decoding="async"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </>
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center font-bold text-lg ${
                  isHighlighted
                    ? 'bg-gradient-to-br from-green-100 via-green-50 to-green-100 text-green-600'
                    : 'bg-gradient-to-br from-coral/20 via-rose-pink/20 to-lavender/20 text-coral'
                }`}
              >
                {profile.display_name?.[0]?.toUpperCase() ||
                  profile.username[0]?.toUpperCase()}
              </div>
            )}

            {/* Hover overlay with name tooltip */}
            <div
              className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200"
              style={{
                opacity: `var(--overlay-opacity, ${isHighlighted ? 1 : 0})`,
              }}
            >
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full shadow-sm animate-fade-in ${
                  isHighlighted
                    ? 'text-green-700 bg-green-50/90'
                    : 'text-coral bg-white/90'
                }`}
              >
                {displayName}
              </span>
            </div>
          </div>

          {/* Pop out ring effect */}
          {isPoppingOut && (
            <div className="absolute inset-0 rounded-full border-2 border-coral/50 animate-ping" />
          )}
        </div>
      </button>
    );
  }
);

FloatingBubble.displayName = 'FloatingBubble';
