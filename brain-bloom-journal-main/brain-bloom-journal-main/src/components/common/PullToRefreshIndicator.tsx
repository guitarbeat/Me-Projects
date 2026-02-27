import { memo } from 'react';
import { RefreshCw } from '@/lib/icons/icon-imports';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator = memo<PullToRefreshIndicatorProps>(({
  pullDistance,
  isRefreshing,
  threshold = 80,
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.5 + progress * 0.5;
  const rotation = progress * 180;

  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: pullDistance }}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          "bg-muted w-10 h-10 shadow-sm border border-border/50"
        )}
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
});

PullToRefreshIndicator.displayName = 'PullToRefreshIndicator';
