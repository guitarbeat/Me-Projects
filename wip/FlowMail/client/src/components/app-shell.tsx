import { motion } from 'framer-motion';
import { Inbox, Moon, NotebookPen, Settings2, Sun, Clock, CalendarDays } from 'lucide-react';
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
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/inbox',
    icon: Inbox,
    label: 'Inbox',
  },
  {
    href: '/later',
    icon: Clock,
    label: 'Later',
  },
  {
    href: '/journal',
    icon: NotebookPen,
    label: 'Journal',
  },
  {
    href: '/activity',
    icon: CalendarDays,
    label: 'Activity',
  },
  {
    href: '/settings',
    icon: Settings2,
    label: 'Settings',
  },
] as const;

const sectionMeta: Record<string, AppShellSection> = {
  '/': {
    title: 'Dashboard',
    description:
      'Your unified workspace overview. See what needs attention across your inbox, journal, and activity.',
    highlights: [
      { label: 'Status', value: 'All systems active' },
      { label: 'Focus', value: 'Prioritized tasks' },
      { label: 'Workspace', value: 'Everything App' },
    ],
  },
  '/inbox': {
    title: 'Inbox triage',
    description:
      'Clear the queue quickly, then carry the follow-up context into the journal without changing products.',
    highlights: [
      { label: 'Workspace', value: 'Email center' },
      { label: 'Flow', value: 'Swipe, sort, reflect' },
      { label: 'Theme', value: 'Shared shell' },
    ],
  },
  '/later': {
    title: 'Saved for later',
    description:
      'Review emails that need more time or attention. Move them back to inbox or archive when ready.',
    highlights: [
      { label: 'Status', value: 'Pending review' },
      { label: 'Actions', value: 'Restore or archive' },
      { label: 'Priority', value: 'Focused attention' },
    ],
  },
  '/journal': {
    title: 'Reflection planner',
    description:
      'Capture energy, recovery, and follow-up blocks in the same calm workspace that handles the inbox.',
    highlights: [
      { label: 'Source', value: 'Integrated journal tools' },
      { label: 'Exports', value: 'JSON, CSV, summaries' },
      { label: 'Storage', value: 'Host-local persistence' },
    ],
  },
  '/activity': {
    title: 'Flow & Progress',
    description:
      'Monitor your email triage habits and consistency. Visualize your productivity across days, weeks, and months.',
    highlights: [
      { label: 'Visualization', value: 'Interactive grid' },
      { label: 'Data Source', value: 'Local activity logs' },
      { label: 'Type', value: 'Growth tracking' },
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
  if (location === '/') return '/';
  if (location.startsWith('/journal')) return '/journal';
  if (location.startsWith('/activity')) return '/activity';
  if (location.startsWith('/settings')) return '/settings';
  if (location.startsWith('/later')) return '/later';
  if (location.startsWith('/inbox')) return '/inbox';
  return '/inbox';
}

export function AppShell({ children }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const activePath = getActivePath(location);
  const meta = sectionMeta[activePath];

  // Global shortcut for search (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
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
                  <p className="app-kicker">FlowMail workspace</p>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {meta.title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)] sm:text-base">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-3 rounded-full border-[var(--app-panel-border)] bg-white/70 px-4 dark:bg-white/5 text-[var(--app-text-secondary)] hover:text-[var(--app-text)] text-xs transition-all w-48 justify-between"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5" />
                        Search everything...
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-[var(--app-background)] px-1.5 font-mono text-[10px] font-medium opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full border-[var(--app-panel-border)] bg-white/70 dark:bg-white/5 sm:hidden"
                    onClick={() => setIsSearchOpen(true)}
                  >
                     <Search className="h-4 w-4" />
                  </Button>

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
