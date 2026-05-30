import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePeriodTracking } from '@/hooks/usePeriodTracking';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useFloSharing } from '@/hooks/useFloSharing';
import { useSharedCalendar } from '@/hooks/useSharedCalendar';
import { formatLocalDate } from '@/lib/dateUtils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { AccessControlSettings } from '@/components/profile/AccessControlSettings';
import { FloatingUserBubbles } from '@/components/bubbles/FloatingUserBubbles';
import { UserCalendar } from '@/components/calendar/UserCalendar';
import { SharingManager } from '@/components/sharing/SharingManager';
import { SharedCalendarDialog } from '@/components/sharing/SharedCalendarDialog';
import { SharedUsersList } from '@/components/sharing/SharedUsersList';
import { KeyboardShortcutsHelp } from '@/components/feedback/KeyboardShortcutsHelp';
import { CalendarSkeleton } from './CalendarSkeleton';
import { calculatePeriodInsights, getInsightMessage } from '@/lib/periodUtils';
import {
  Eye,
  EyeOff,
  Users,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Moon,
  Sun,
  Lock,
  LockOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Calendar = () => {
  const {
    user,
    signOut,
    loading: authLoading,
    profile,
    loading: profileLoading,
    refreshProfile,
  } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
    floEntries,
    loading: periodLoading,
    toggleFloDay,
    refreshData: refreshPeriods,
  } = usePeriodTracking();
  const { currentDate, navigateMonth, goToToday } = useCalendarNavigation();
  const { sharedWithMe, refresh: refreshSharing } = useFloSharing();
  const {
    sharedCalendar,
    loading: sharedCalendarLoading,
    updateCount,
    fetchSharedCalendar,
    clearSharedCalendar,
    clearUpdateCount,
  } = useSharedCalendar();
  const [showSharedCalendar, setShowSharedCalendar] = useState(false);

  // Onboarding for first-time users
  const { markFirstDayLogged } = useOnboarding();

  // Keyboard shortcuts for power users
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onPrevMonth: () => navigateMonth('prev'),
    onNextMonth: () => navigateMonth('next'),
    onToday: goToToday,
    enabled: true,
  });

  // Period insights
  const insights = calculatePeriodInsights(floEntries, currentDate);
  const insightMessage = getInsightMessage(insights);

  // Privacy state - stored in localStorage only (no DB column yet)
  const [isPrivate, setIsPrivate] = useState<boolean>(() => {
    if (!user) {
      return true;
    }
    try {
      const saved = localStorage.getItem(`privacy_${user.id}`);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Access code state - based on the PIN lock only.
  const hasAccessCode = useMemo(() => {
    if (!profile) {
      return false;
    }
    const profileWithPin = profile as typeof profile & {
      pin_hash?: string | null;
    };
    return !!profileWithPin.pin_hash;
  }, [profile]);

  // Handle privacy toggle - localStorage only
  const handleTogglePrivacy = useCallback(() => {
    if (!user) {
      return;
    }

    const newValue = !isPrivate;
    setIsPrivate(newValue);

    try {
      localStorage.setItem(`privacy_${user.id}`, JSON.stringify(newValue));
    } catch (err) {
      console.error('Error saving privacy setting:', err);
    }
  }, [user, isPrivate]);

  // Scroll to access control section in profile editor
  const [showAccessControlDialog, setShowAccessControlDialog] = useState(false);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshProfile?.(),
      refreshPeriods?.(),
      refreshSharing?.(),
    ]);
  }, [refreshProfile, refreshPeriods, refreshSharing]);

  const { containerRef, isPulling, pullDistance, isRefreshing } =
    usePullToRefresh({
      onRefresh: handleRefresh,
      threshold: 80,
      enabled: true,
    });
  // Convert sharedWithMe to userProfiles format for floating bubbles (with id for lookup)
  const sharedUserProfiles = useMemo(
    () =>
      sharedWithMe.map((u) => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name || undefined,
        avatar_url: u.avatar_url,
      })),
    [sharedWithMe]
  );

  // Handle clicking on a shared user's bubble
  const handleBubbleClick = useCallback(
    async (userId: string) => {
      await fetchSharedCalendar(userId);
      setShowSharedCalendar(true);
    },
    [fetchSharedCalendar]
  );

  const handleCloseSharedCalendar = useCallback(() => {
    setShowSharedCalendar(false);
    clearSharedCalendar();
  }, [clearSharedCalendar]);

  const handleOpenAccessControlDialog = useCallback(() => {
    setShowAccessControlDialog(true);
  }, []);

  const handleCloseAccessControlDialog = useCallback(() => {
    setShowAccessControlDialog(false);
  }, []);

  const handleToggleFloDay = useCallback(
    async (day: number, isCurrentlyFloDay: boolean) => {
      if (!user) {
        return;
      }
      // ⚡ Bolt: Use formatLocalDate to avoid toISOString timezone bugs and object creation overhead
      const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatLocalDate(tempDate);
      await toggleFloDay(dateStr, !isCurrentlyFloDay);

      // Mark first day logged for onboarding
      if (!isCurrentlyFloDay) {
        markFirstDayLogged();
      }
    },
    [user, currentDate, toggleFloDay, markFirstDayLogged]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (authLoading || profileLoading || periodLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-cream/50 via-background to-mint/50 dark:from-gray-900 dark:via-background dark:to-gray-700 relative"
    >
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="pull-refresh-indicator"
          style={{
            top: Math.min(pullDistance - 40, 20),
            opacity: Math.min(pullDistance / 80, 1),
          }}
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 text-primary',
              isRefreshing && 'pull-refresh-spinner'
            )}
          />
        </div>
      )}

      {/* Floating Action Buttons */}
      <button
        onClick={toggleDarkMode}
        className="fab fab-secondary fab-stack-3"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-primary" />
        )}
      </button>

      <button
        onClick={handleTogglePrivacy}
        className={cn(
          'fab fab-stack-2',
          isPrivate ? 'fab-secondary' : 'fab-primary'
        )}
        aria-label={isPrivate ? 'Make profile public' : 'Make profile private'}
      >
        {isPrivate ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={handleOpenAccessControlDialog}
        className={cn(
          'fab fab-stack-1',
          hasAccessCode ? 'fab-primary' : 'fab-secondary'
        )}
        aria-label={hasAccessCode ? 'Access code enabled' : 'Set access code'}
      >
        {hasAccessCode ? (
          <Lock className="w-5 h-5" />
        ) : (
          <LockOpen className="w-5 h-5" />
        )}
      </button>

      {/* Show floating bubbles for users sharing with me */}
      {sharedUserProfiles.length > 0 && (
        <FloatingUserBubbles
          userProfiles={sharedUserProfiles}
          onBubbleClick={handleBubbleClick}
        />
      )}

      {/* Shared Calendar Dialog */}
      <SharedCalendarDialog
        open={showSharedCalendar}
        onOpenChange={handleCloseSharedCalendar}
        calendarData={sharedCalendar}
        loading={sharedCalendarLoading}
        updateCount={updateCount}
        onClearUpdateCount={clearUpdateCount}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />

      {/* Access Control Dialog */}
      {showAccessControlDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseAccessControlDialog}
          />
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 animate-fade-in">
            <AccessControlSettings />
            <button
              onClick={handleCloseAccessControlDialog}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div
        className="relative z-20 w-full smooth-resize animate-calendar-entrance pb-safe"
        style={{ padding: 'var(--container-padding)' }}
      >
        {/* Compact Controls */}
        <div
          className="flex items-center justify-end flex-wrap smooth-resize"
          style={{ gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}
        >
          <SharingManager />
          <ProfileEditor
            currentAvatarUrl={profile?.avatar_url ?? undefined}
            displayName={
              (profile?.display_name ??
                profile?.first_name ??
                profile?.username) ||
              undefined
            }
          />
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
            style={{ fontSize: 'var(--text-sm)', padding: '0.5em 1em' }}
          >
            Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <main
          className="smooth-resize"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          <UserCalendar
            currentDate={currentDate}
            floEntries={floEntries}
            onToggleDay={handleToggleFloDay}
            onNavigate={navigateMonth}
            onJumpToToday={goToToday}
            showTodayButton={true}
          />

          {/* Period Insights Badge */}
          {insightMessage && (
            <div className="flex justify-center animate-fade-in">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-quicksand flex items-center gap-2"
              >
                {insights.streak > 0 ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                {insightMessage}
              </Badge>
            </div>
          )}

          {/* Shared With Me Section */}
          {sharedWithMe.length > 0 && (
            <Card className="surface-floating border-primary/20 animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-quicksand font-semibold text-base sm:text-lg">
                    Shared With You ({sharedWithMe.length})
                  </h3>
                </div>
                <SharedUsersList
                  users={sharedWithMe}
                  onUserClick={handleBubbleClick}
                />
              </div>
            </Card>
          )}

          {/* Visibility Toggle */}
          <Card className="surface-floating border-primary/20 animate-fade-in [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isPrivate ? (
                    <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  ) : (
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  )}
                  <div>
                    <h3 className="font-quicksand font-semibold text-base sm:text-lg">
                      Profile Visibility
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {isPrivate
                        ? 'Your profile is private. Only you can see your calendar.'
                        : 'Your profile is public. Others can see your calendar entries.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleTogglePrivacy}
                  variant={isPrivate ? 'outline' : 'default'}
                  className={
                    isPrivate
                      ? 'border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground'
                      : ''
                  }
                >
                  {isPrivate ? 'Make Public' : 'Make Private'}
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};
