import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Archive, CalendarDays, Clock3, Inbox, NotebookPen, LayoutGrid, List } from 'lucide-react';
import { useLocation } from 'wouter';
import { type Email, type Stats } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { CardStack } from '@/components/card-stack';
import { EmailListView } from '@/features/email-inbox/components/EmailListView';
import { EmailFilters, type EmailFilterOptions } from '@/features/email-inbox/components/EmailFilters';
import { BulkActions } from '@/features/email-inbox/components/BulkActions';
import { loadJournalEvents } from '@/features/journal/lib/storage';
import { emotionMeta } from '@/features/journal/types';

export default function InboxPage() {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filters, setFilters] = useState<EmailFilterOptions>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: emails = [], isLoading: emailsLoading } = useQuery<Email[]>({
    queryKey: ['/api/emails/status/inbox'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  // Filter emails based on active filters
  const filteredEmails = useMemo(() => {
    if (!emails.length) return [];
    
    return emails.filter((email) => {
      if (filters.sender && !email.sender.toLowerCase().includes(filters.sender.toLowerCase()) &&
          !email.senderEmail.toLowerCase().includes(filters.sender.toLowerCase())) {
        return false;
      }
      if (filters.subject && !email.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
        return false;
      }
      if (filters.priority && email.priority.toLowerCase() !== filters.priority.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [emails, filters]);

  const journalEntries = loadJournalEvents().sort(
    (left, right) => left.start.getTime() - right.start.getTime()
  );
  const nextJournalEntry =
    journalEntries.find((entry) => entry.start.getTime() >= Date.now()) ??
    journalEntries[journalEntries.length - 1];

  if (emailsLoading || statsLoading) {
    return (
      <div className="app-shell-panel flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <motion.section
        className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 border-b border-[var(--app-panel-border)] pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="app-kicker">Inbox</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {filteredEmails.length} email{filteredEmails.length === 1 ? '' : 's'} ready for triage
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
                Swipe through the queue, then keep any emotional or strategic follow-up in the
                merged journal route.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="app-shell-panel-soft px-4 py-3">
                <p className="app-stat-label">Processed today</p>
                <p className="mt-1 text-xl font-semibold">{stats?.processedToday || 0}</p>
              </div>
              <div className="app-shell-panel-soft px-4 py-3">
                <p className="app-stat-label">For later</p>
                <p className="mt-1 text-xl font-semibold">{stats?.forLater || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <EmailFilters onFilterChange={setFilters} activeFilters={filters} />
          
          <div className="flex items-center gap-2 rounded-lg border border-[var(--app-panel-border)] p-1">
            <Button
              size="sm"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="mb-4">
            <BulkActions
              emails={filteredEmails}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        )}

        <div className={viewMode === 'cards' ? 'mx-auto w-full max-w-md' : ''}>
          {viewMode === 'cards' ? (
            <CardStack emails={filteredEmails} />
          ) : (
            <EmailListView
              emails={filteredEmails}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>
      </motion.section>

      <div className="grid gap-6">
        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">Queue snapshot</h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                High-level status for the inbox workflow.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-sm text-[var(--app-text)]">Inbox queue</span>
              </div>
              <span className="text-lg font-semibold">{emails.length}</span>
            </div>
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Clock3 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-[var(--app-text)]">Saved for later</span>
              </div>
              <span className="text-lg font-semibold">{stats?.forLater || 0}</span>
            </div>
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 text-rose-500" />
                <span className="text-sm text-[var(--app-text)]">Archived</span>
              </div>
              <span className="text-lg font-semibold">{stats?.archived || 0}</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-600 dark:text-violet-300">
              <NotebookPen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">Journal bridge</h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Reflection context now sits inside the same frontend shell.
              </p>
            </div>
          </div>

          {nextJournalEntry ? (
            <div className="app-shell-panel-soft space-y-3 px-4 py-4">
              <div>
                <p className="app-stat-label">Next or latest block</p>
                <p className="mt-2 text-base font-semibold text-[var(--app-text)]">
                  {nextJournalEntry.title}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${emotionMeta[nextJournalEntry.emotion].badgeClass}`}
                >
                  {emotionMeta[nextJournalEntry.emotion].marker}{' '}
                  {emotionMeta[nextJournalEntry.emotion].label}
                </span>
                <span className="text-sm text-[var(--app-text-secondary)]">
                  {journalEntries.length} journal block{journalEntries.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
                {nextJournalEntry.notes ||
                  'No note attached yet. Add one in the journal to keep follow-up context visible.'}
              </p>
            </div>
          ) : (
            <div className="app-shell-panel-soft px-4 py-4 text-sm leading-6 text-[var(--app-text-secondary)]">
              No journal blocks yet. Start one when an inbox thread needs a reflection pass,
              decompression block, or deliberate follow-up slot.
            </div>
          )}

          <Button className="mt-4 w-full" onClick={() => navigate('/journal')}>
            Open journal
          </Button>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <h3 className="text-base font-semibold text-[var(--app-text)]">Shortcuts</h3>
          <div className="mt-4 space-y-3">
            <div className="app-shell-panel-soft px-4 py-3 text-sm text-[var(--app-text-secondary)]">
              <strong>Cards:</strong> Swipe left/right or use arrow keys. Press A/D for quick actions.
            </div>
            <div className="app-shell-panel-soft px-4 py-3 text-sm text-[var(--app-text-secondary)]">
              <strong>List:</strong> Select multiple emails for bulk actions.
            </div>
            <div className="app-shell-panel-soft px-4 py-3 text-sm text-[var(--app-text-secondary)]">
              <strong>Undo:</strong> Press Ctrl/Cmd+Z to undo the last action.
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
