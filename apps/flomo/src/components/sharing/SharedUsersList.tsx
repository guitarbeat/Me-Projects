import { useState, useMemo, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollAreaAware } from '@/components/ui/scroll-area-aware';
import {
  Search,
  Calendar,
  Heart,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticSelection } from '@/lib/haptics';
import type { SharedUser } from '@/types/sharing';

interface SharedUsersListProps {
  users: SharedUser[];
  onUserClick: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
  className?: string;
}

export const SharedUsersList = ({
  users,
  onUserClick,
  onRemoveUser,
  className,
}: SharedUsersListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [swipingUserId, setSwipingUserId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeThreshold = 80;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        (user.display_name?.toLowerCase().includes(query) ?? false)
    );
  }, [users, searchQuery]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, userId: string) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setSwipingUserId(userId);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !swipingUserId) {
        return;
      }

      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);

      // Only swipe if horizontal movement > vertical
      if (deltaY > 30) {
        touchStartRef.current = null;
        setSwipeOffset(0);
        setSwipingUserId(null);
        return;
      }

      // Limit swipe distance with resistance
      const maxSwipe = 120;
      const resistance = 0.5;
      let offset = deltaX;

      if (Math.abs(offset) > swipeThreshold) {
        offset =
          swipeThreshold + (Math.abs(offset) - swipeThreshold) * resistance;
        offset *= Math.sign(deltaX);
      }

      offset = Math.max(-maxSwipe, Math.min(maxSwipe, offset));
      setSwipeOffset(offset);
    },
    [swipingUserId]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swipingUserId) {
      return;
    }

    if (swipeOffset < -swipeThreshold && onRemoveUser) {
      // Swipe left - remove
      hapticSelection();
      onRemoveUser(swipingUserId);
    } else if (swipeOffset > swipeThreshold) {
      // Swipe right - open calendar
      hapticSelection();
      onUserClick(swipingUserId);
    }

    setSwipeOffset(0);
    setSwipingUserId(null);
    touchStartRef.current = null;
  }, [swipingUserId, swipeOffset, onRemoveUser, onUserClick]);

  if (users.length === 0) {
    return (
      <div className={cn('text-center py-8 px-4', className)}>
        <div className="relative inline-block mb-4">
          <Users className="w-12 h-12 text-primary/30 mx-auto animate-float" />
          <Heart className="w-5 h-5 text-pink-400/60 absolute -top-1 -right-1 animate-heartbeat" />
        </div>
        <p className="text-base font-medium text-foreground/80 mb-2 animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          Your circle awaits 💜
        </p>
        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          When someone shares their calendar with you, they'll appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {users.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search shared calendars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Swipe hint for first-time users */}
      {users.length > 0 && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <ChevronLeft className="w-3 h-3 swipe-hint-left" />
          <span>Swipe to remove or view</span>
          <ChevronRight className="w-3 h-3 swipe-hint-right" />
        </p>
      )}

      <ScrollAreaAware
        className="max-h-64"
        fadeSize="sm"
        showTopFade={users.length > 3}
        showBottomFade={users.length > 3}
      >
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No one matching "{searchQuery}" 🔍
              </p>
            </div>
          ) : (
            filteredUsers.map((user, index) => {
              const isBeingSwiped = swipingUserId === user.id;
              const showLeftAction = isBeingSwiped && swipeOffset < -20;
              const showRightAction = isBeingSwiped && swipeOffset > 20;

              return (
                <div
                  key={user.id}
                  className="relative overflow-hidden rounded-lg stagger-item"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Swipe action backgrounds */}
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 w-20 flex items-center justify-center bg-destructive/90 text-destructive-foreground transition-opacity duration-150',
                      showLeftAction ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div
                    className={cn(
                      'absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-primary/90 text-primary-foreground transition-opacity duration-150',
                      showRightAction ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>

                  {/* Main card content */}
                  <button
                    onClick={() => onUserClick(user.id)}
                    onTouchStart={(e) => handleTouchStart(e, user.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors text-left group min-h-[56px] touch-manipulation relative'
                    )}
                    style={{
                      transform: isBeingSwiped
                        ? `translateX(${swipeOffset}px)`
                        : 'translateX(0)',
                      transition: isBeingSwiped
                        ? 'none'
                        : 'transform 0.2s ease-out',
                    }}
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                      {user.avatar_url ? (
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.display_name || user.username}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(user.display_name ||
                            user.username)[0]?.toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.display_name || user.username}
                      </p>
                      {user.display_name &&
                        user.display_name !== user.username && (
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        )}
                    </div>
                    <Calendar className="w-4 h-4 text-primary/60 flex-shrink-0 group-hover:text-primary transition-colors" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ScrollAreaAware>
    </div>
  );
};
