import { Suspense, lazy, useEffect, useState, memo } from 'react';
import { Toaster, SonnerToaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import {
  ErrorBoundary,
  AuthErrorBoundary,
} from '@/components/layout/ErrorBoundary';
import { OfflineBanner, SupabaseHealthCheck } from '@/components/feedback';
import { PinLockOverlay } from '@/components/profile/PinLockOverlay';
import { LegacyPasswordUpgradeDialog } from '@/components/profile/LegacyPasswordUpgradeDialog';
import { LoginPage } from './pages/Login';

// Lazy load heavy components with prefetch
const Calendar = lazy(() =>
  import('@/components/calendar/Calendar').then((m) => ({
    default: m.Calendar,
  }))
);

// Prefetch calendar component when idle
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  (window as Window).requestIdleCallback(() => {
    import('@/components/calendar/Calendar');
  });
}

// Memoized loading fallback
const CalendarLoader = memo(() => (
  <div className="flex-1 flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));
CalendarLoader.displayName = 'CalendarLoader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

/**
 * Main SPA content with cross-fade transitions between auth states
 */
export const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [displayUser, setDisplayUser] = useState<boolean>(!!user);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle smooth transitions between auth states
  useEffect(() => {
    if (loading) {
      return;
    }

    const hasUser = !!user;

    if (hasUser !== displayUser) {
      setIsTransitioning(true);

      // Allow exit animation to complete before switching views
      const timer = setTimeout(
        () => {
          setDisplayUser(hasUser);
          setIsTransitioning(false);
        },
        hasUser ? 600 : 400
      ); // Longer delay for login success celebration

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user, loading, displayUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <img src="/flo.png" alt="Flo" className="w-16 h-16 animate-pulse" />
          <div className="text-foreground/60 font-quicksand text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Determine which view to show
  const showLogin = !displayUser;
  const showCalendar = displayUser;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary focus:font-medium transition-transform"
      >
        Skip to content
      </a>
      <NavigationHeader showTitle={displayUser} />
      <SupabaseHealthCheck />
      <OfflineBanner />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col overflow-hidden relative isolate"
      >
        {/* Login View - Always rendered but hidden when not active */}
        <div
          className={`absolute inset-0 flex flex-col ${
            showLogin ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
          }`}
          style={{
            transition:
              'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: showLogin ? 'scale(1)' : 'scale(0.96)',
          }}
          aria-hidden={!showLogin}
        >
          <LoginPage isExiting={isTransitioning && !!user} />
        </div>

        {/* Calendar View - Rendered when user is logged in */}
        <div
          className={`absolute inset-0 flex flex-col ${
            showCalendar && !isTransitioning
              ? 'z-10 opacity-100'
              : 'z-0 opacity-0 pointer-events-none'
          }`}
          style={{
            transition:
              'opacity 500ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)',
            transform:
              showCalendar && !isTransitioning
                ? 'scale(1) translateY(0)'
                : 'scale(1.02) translateY(-8px)',
          }}
          aria-hidden={!showCalendar}
        >
          {(displayUser || isTransitioning) && (
            <PinLockOverlay>
              <Suspense fallback={<CalendarLoader />}>
                <Calendar />
              </Suspense>
            </PinLockOverlay>
          )}
        </div>
      </main>
      {user && profile && !profile.has_custom_password && (
        <LegacyPasswordUpgradeDialog />
      )}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    // Defer non-critical initialization
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window).requestIdleCallback(async () => {
        if (import.meta.env.PROD) {
          const { registerServiceWorker, initializePWAInstallPrompt } =
            await import('@/lib/pwa');
          registerServiceWorker();
          initializePWAInstallPrompt();
        }
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(async () => {
        if (import.meta.env.PROD) {
          const { registerServiceWorker, initializePWAInstallPrompt } =
            await import('@/lib/pwa');
          registerServiceWorker();
          initializePWAInstallPrompt();
        }
      }, 100);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <AuthErrorBoundary>
              <AuthProvider>
                <Toaster />
                <SonnerToaster />
                <AppContent />
              </AuthProvider>
            </AuthErrorBoundary>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
