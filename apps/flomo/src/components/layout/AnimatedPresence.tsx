import React, { useEffect, useState, useRef } from 'react';

interface AnimatedPresenceProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
  exitClassName?: string;
  enterClassName?: string;
}

/**
 * Smooth animated presence wrapper for cross-fade transitions
 * Handles enter/exit animations with proper cleanup
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
  children,
  show,
  duration = 400,
  className = '',
  enterClassName = 'animate-presence-enter',
  exitClassName = 'animate-presence-exit',
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationClass, setAnimationClass] = useState(
    show ? enterClassName : ''
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (show) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      requestAnimationFrame(() => {
        setAnimationClass(enterClassName);
      });
    } else {
      setAnimationClass(exitClassName);
      timeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, duration, enterClassName, exitClassName]);

  if (!shouldRender) {
    return null;
  }

  return <div className={`${className} ${animationClass}`}>{children}</div>;
};

interface CrossFadeProps {
  showFirst: boolean;
  first: React.ReactNode;
  second: React.ReactNode;
  duration?: number;
  className?: string;
}

/**
 * Cross-fade between two views with overlapping animations
 */
export const CrossFade: React.FC<CrossFadeProps> = ({
  showFirst,
  first,
  second,
  duration = 500,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <AnimatedPresence
        show={showFirst}
        duration={duration}
        className="absolute inset-0"
        enterClassName="animate-view-enter"
        exitClassName="animate-view-exit"
      >
        {first}
      </AnimatedPresence>
      <AnimatedPresence
        show={!showFirst}
        duration={duration}
        className="absolute inset-0"
        enterClassName="animate-view-enter"
        exitClassName="animate-view-exit"
      >
        {second}
      </AnimatedPresence>
    </div>
  );
};
