import { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, TooltipProvider } from '@/components/ui';
import { LoadingSpinner, GlobalTopProgressBar } from '@/components/common';

// Lazy load pages
const Index = lazy(() => import('../../pages/Index'));
const NotFound = lazy(() => import('../../pages/NotFound'));

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <TooltipProvider>
      <GlobalTopProgressBar />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  );
};
