import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/theme-context';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { AppShell } from './components/app-shell';
import { InboxPage, LaterPage } from './features/email-inbox';
import { JournalPage } from './features/journal';
import Settings from './pages/settings';
import NotFound from './pages/not-found';
import { YearGridApp } from './features/year-grid';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

function App() {
  const [view, setView] = useState<'email' | 'year-grid'>('email');

  const toggleYearGrid = () => {
    setView((prev) => (prev === 'email' ? 'year-grid' : 'email'));
  };

  if (view === 'year-grid') {
    return <YearGridApp />;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppShell onToggleYearGrid={toggleYearGrid}>
            <Routes>
              <Route path="/settings" element={<Settings />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/later" element={<LaterPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/" element={<InboxPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
