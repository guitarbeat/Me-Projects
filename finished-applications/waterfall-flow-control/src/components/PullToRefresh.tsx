import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  threshold: number;
}

export const PullToRefreshIndicator = ({
  isPulling,
  isRefreshing,
  pullDistance,
  threshold,
}: PullToRefreshIndicatorProps) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const scale = 0.5 + progress * 0.5;
  const isReady = pullDistance >= threshold;

  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.6, 70)}px)`,
      }}
    >
      <div
        className={cn(
          'flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-xl backdrop-blur-md',
          'transition-all duration-300 ease-out',
          'border',
          isRefreshing
            ? 'bg-primary text-primary-foreground border-primary/50 glow-primary'
            : isReady
              ? 'bg-primary/90 text-primary-foreground border-primary/40'
              : 'bg-card/95 text-muted-foreground border-border/50'
        )}
        style={{
          transform: `scale(${isRefreshing ? 1 : scale})`,
          opacity: isRefreshing ? 1 : Math.max(0.3, progress),
        }}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">Refreshing...</span>
          </>
        ) : isReady ? (
          <>
            <div className="relative">
              <RefreshCw
                className="h-5 w-5 transition-transform"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <div className="absolute inset-0 animate-ping opacity-50">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
            <span className="text-sm font-semibold">Release to refresh</span>
          </>
        ) : (
          <>
            <RefreshCw
              className="h-5 w-5 transition-transform"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <span className="text-sm font-medium">Pull to refresh</span>
          </>
        )}
      </div>

      {/* Progress ring */}
      {!isRefreshing && (
        <svg
          className="absolute -z-10"
          width="80"
          height="80"
          style={{
            opacity: progress * 0.3,
            transform: `scale(${scale})`,
          }}
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${progress * 220} 220`}
            strokeLinecap="round"
            className="text-primary"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
      )}
    </div>
  );
};
