import { memo } from 'react';

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  className?: string;
}

export const OnlineStatusBadge = memo<OnlineStatusBadgeProps>(({ isOnline, className = '' }) => {
  if (isOnline) return null;

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs bg-red-500/10 border-red-500/20 text-red-600 ${className}`}>
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      Offline
    </div>
  );
});

OnlineStatusBadge.displayName = 'OnlineStatusBadge';