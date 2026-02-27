import { memo, useEffect, useState } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const OfflineBanner = memo(() => {
  const { isOffline, wasOffline, clearWasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  // Show "Back online" message briefly when reconnected
  useEffect(() => {
    if (wasOffline && !isOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [wasOffline, isOffline, clearWasOffline]);

  if (isOffline) {
    return (
      <div
        className="fixed top-14 left-0 right-0 z-50 bg-amber-500/95 text-amber-950 text-center py-2 px-4 text-sm font-medium backdrop-blur-sm animate-fade-in"
        role="alert"
        aria-live="polite"
      >
        <WifiOff className="inline w-4 h-4 mr-2 -mt-0.5" />
        You're offline. Changes will sync when reconnected.
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        className="fixed top-14 left-0 right-0 z-50 bg-emerald-500/95 text-emerald-950 text-center py-2 px-4 text-sm font-medium backdrop-blur-sm animate-fade-in"
        role="alert"
        aria-live="polite"
      >
        <Wifi className="inline w-4 h-4 mr-2 -mt-0.5" />
        Back online! Syncing changes...
        <button
          onClick={() => {
            setShowReconnected(false);
            clearWasOffline();
          }}
          className="ml-3 hover:bg-emerald-600/20 rounded p-0.5"
          aria-label="Dismiss"
        >
          <X className="inline w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
});

OfflineBanner.displayName = 'OfflineBanner';
