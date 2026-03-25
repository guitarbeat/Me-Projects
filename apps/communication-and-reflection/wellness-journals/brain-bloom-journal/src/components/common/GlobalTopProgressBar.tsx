import { memo, useEffect, useRef, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';

export const GlobalTopProgressBar = memo(() => {
  const isFetching = useIsFetching();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isFetching > 0) {
      setVisible(true);
      setProgress(10);

      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10;
          return Math.min(prev + increment, 90);
        });
      }, 200);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgress(100);
      const timeout = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => window.clearTimeout(timeout);
    }
  }, [isFetching]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Loading page content"
    >
      <div
        className="h-full bg-newsprint-foreground transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

GlobalTopProgressBar.displayName = 'GlobalTopProgressBar';