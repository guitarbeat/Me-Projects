import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/contexts/theme-context';
import Home from '@/pages/home';
import Journal from '@/pages/journal';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/settings">
        <AppShell>
          <Settings />
        </AppShell>
      </Route>
      <Route path="/journal">
        <AppShell>
          <Journal />
        </AppShell>
      </Route>
      <Route path="/inbox">
        <AppShell>
          <Home />
        </AppShell>
      </Route>
      <Route path="/">
        <AppShell>
          <Home />
        </AppShell>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
