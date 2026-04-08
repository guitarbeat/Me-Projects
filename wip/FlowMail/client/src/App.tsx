import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/theme-context';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { AppShell } from './components/app-shell';
import Home from './pages/home';
import Journal from './pages/journal';
import Settings from './pages/settings';
import NotFound from './pages/not-found';
import YearGridApp from './features/year-grid/App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

function App() {
  const [view, setView] = useState<'email' | 'year-grid'>('email');

  if (view === 'year-grid') {
    return <YearGridApp />;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppShell>
            <Routes>
              <Route path="/settings" element={<Settings />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/inbox" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
