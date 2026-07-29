import React from 'react';
import { Check, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface CatAvatarPickerProps {
  catAvatars: string[];
  selectedAvatar: string;
  isLoadingCats: boolean;
  onSelect: (avatarUrl: string) => void;
  onRefresh: () => Promise<void>;
}

export const CatAvatarPicker: React.FC<CatAvatarPickerProps> = ({
  catAvatars,
  selectedAvatar,
  isLoadingCats,
  onSelect,
  onRefresh,
}) => {
  const { containerRef, isPulling, pullDistance, isRefreshing, progress } =
    usePullToRefresh({
      onRefresh,
      threshold: 80,
      enabled: true,
    });

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base">Cat Avatars</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void onRefresh();
            }}
            disabled={isRefreshing || isLoadingCats}
            className="h-10 w-10 sm:h-7 sm:w-7 p-0 hover:rotate-180 transition-transform duration-500 min-h-[44px] sm:min-h-0"
            aria-label="Refresh cat avatars"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing || isLoadingCats ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Tap to select • Pull down to refresh
        </CardDescription>
      </CardHeader>
      <CardContent
        ref={containerRef}
        className="p-4 sm:p-6 pt-0 relative max-h-[400px] overflow-y-auto"
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullDistance, 80)}px)`
            : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {(isPulling || isRefreshing) && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 z-10">
            <div className="flex items-center gap-2 text-sm text-primary font-quicksand">
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <ChevronDown
                    className="w-4 h-4 transition-transform"
                    style={{
                      transform:
                        progress >= 100 ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                  <span>
                    {progress >= 100 ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {isLoadingCats
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full aspect-square bg-muted rounded-full animate-pulse"
                />
              ))
            : catAvatars.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(avatar)}
                  className={`relative rounded-full overflow-hidden border-2 sm:border-2 border-3 transition-all duration-300 active:scale-95 sm:hover:scale-110 group touch-manipulation min-h-[60px] sm:min-h-0 ${selectedAvatar === avatar ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-border active:border-primary/50 sm:hover:border-primary/50'}`}
                  aria-label={`Select cat avatar ${i + 1}`}
                  aria-pressed={selectedAvatar === avatar}
                >
                  <img
                    src={avatar}
                    alt=""
                    className="w-full h-full object-cover aspect-square transition-all duration-300 group-hover:brightness-110"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face';
                    }}
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-primary rounded-full p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};
