import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense, lazy } from 'react';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Persist React Query cache to localStorage only in the browser
if (typeof window !== 'undefined') {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });
  persistQueryClient({ queryClient, persister, maxAge: 24 * 60 * 60 * 1000 });
}

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/profile"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

/**
 * * App Root
 * --------------------------------------------------
 * Wraps the application in all global providers and boundaries.
 */
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"
                    aria-label="Loading spinner"
                  />
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                </div>
              </div>
            }
          >
            <main>
              <AnimatedRoutes />
            </main>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
