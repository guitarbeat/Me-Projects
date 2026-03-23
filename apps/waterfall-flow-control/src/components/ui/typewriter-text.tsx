import * as React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

/**
 * TypewriterText - Animated text that types out character by character
 * Respects prefers-reduced-motion
 */
export const TypewriterText = ({
  text,
  className,
  speed = 50,
  delay = 0,
  onComplete,
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, prefersReducedMotion, onComplete]);

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      {!isComplete && !prefersReducedMotion && (
        <span className="inline-block w-0.5 h-[1em] bg-current animate-blink ml-0.5 align-middle" />
      )}
    </span>
  );
};
