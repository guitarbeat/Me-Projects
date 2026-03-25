import { motion } from 'framer-motion';
import { Inbox, Moon, NotebookPen, Settings2, Sun } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

type AppShellSection = {
  description: string;
  highlights: Array<{ label: string; value: string }>;
  title: string;
};

const navigationItems = [
  {
    href: '/inbox',
    icon: Inbox,
    label: 'Inbox',
  },
  {
    href: '/journal',
    icon: NotebookPen,
    label: 'Journal',
  },
  {
    href: '/settings',
    icon: Settings2,
    label: 'Settings',
  },
] as const;

const sectionMeta: Record<string, AppShellSection> = {
  '/inbox': {
    title: 'Inbox triage',
    description:
      'Clear the queue quickly, then carry the follow-up context into the journal without changing products.',
    highlights: [
      { label: 'Workspace', value: 'Merged host app' },
      { label: 'Flow', value: 'Swipe, sort, reflect' },
      { label: 'Theme', value: 'Shared shell' },
    ],
  },
  '/journal': {
    title: 'Reflection planner',
    description:
      'Capture energy, recovery, and follow-up blocks in the same calm workspace that handles the inbox.',
    highlights: [
      { label: 'Source', value: 'Brain Bloom feature set' },
      { label: 'Exports', value: 'JSON, CSV, summaries' },
      { label: 'Storage', value: 'Host-local persistence' },
    ],
  },
  '/settings': {
    title: 'Workspace settings',
    description:
      'Keep email connections, demo data, and the merged workflow defaults aligned in one place.',
    highlights: [
      { label: 'Inbox', value: 'Email connection' },
      { label: 'Journal', value: 'Shared defaults' },
      { label: 'Host', value: 'One frontend shell' },
    ],
  },
};

function getActivePath(location: string) {
  if (location.startsWith('/journal')) {
    return '/journal';
  }

  if (location.startsWith('/settings')) {
    return '/settings';
  }

  return '/inbox';
}

export function AppShell({ children }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const activePath = getActivePath(location);
  const meta = sectionMeta[activePath];

  return (
    <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <motion.header
          className="app-shell-panel mb-6 overflow-hidden px-5 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:items-start">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="app-kicker">SwipeInbox workspace</p>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {meta.title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)] sm:text-base">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full border-[var(--app-panel-border)] bg-white/70 dark:bg-white/5"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              <nav className="flex flex-wrap gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.href;

                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-[var(--app-panel-border)] bg-white/60 text-[var(--app-text-secondary)] hover:text-[var(--app-text)] dark:bg-white/5'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="app-shell-panel-soft grid gap-3 px-4 py-4">
              <p className="app-kicker">Shared UI</p>
              {meta.highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-3 dark:bg-white/5"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-text-secondary)]">
                    {highlight.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--app-text)]">
                    {highlight.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
