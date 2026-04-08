import { useEffect, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWeekend,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock3, NotebookPen, Plus, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { JournalEventDialog } from '@/features/journal/components/journal-event-dialog';
import { JournalExportMenu } from '@/features/journal/components/journal-export-menu';
import { buildEmotionSummary } from '@/features/journal/lib/export';
import {
  loadJournalEvents,
  loadJournalSettings,
  saveJournalEvents,
  saveJournalSettings,
} from '@/features/journal/lib/storage';
import {
  emotionMeta,
  isJournalEmotion,
  journalEmotions,
  journalViews,
  type JournalEmotion,
  type JournalEntry,
  type JournalView,
} from '@/features/journal/types';
import { cn } from '@/lib/utils';

function getWindowBounds(anchorDate: Date, view: JournalView) {
  if (view === 'day') {
    return {
      start: startOfDay(anchorDate),
      end: endOfDay(anchorDate),
    };
  }

  if (view === 'month') {
    return {
      start: startOfMonth(anchorDate),
      end: endOfMonth(anchorDate),
    };
  }

  return {
    start: startOfWeek(anchorDate),
    end: endOfWeek(anchorDate),
  };
}

function getWindowLabel(anchorDate: Date, view: JournalView) {
  if (view === 'day') {
    return format(anchorDate, 'EEEE, MMM d');
  }

  if (view === 'month') {
    return format(anchorDate, 'MMMM yyyy');
  }

  const start = startOfWeek(anchorDate);
  const end = endOfWeek(anchorDate);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
}

function shiftWindow(anchorDate: Date, view: JournalView, direction: -1 | 1) {
  if (view === 'day') {
    return addDays(anchorDate, direction);
  }

  if (view === 'month') {
    return addMonths(anchorDate, direction);
  }

  return addWeeks(anchorDate, direction);
}

function formatEntryTime(entry: JournalEntry, timeFormat24h: boolean) {
  if (entry.allDay) {
    return 'All day';
  }

  const timePattern = timeFormat24h ? 'HH:mm' : 'h:mm a';
  return `${format(entry.start, timePattern)} - ${format(entry.end, timePattern)}`;
}

export default function JournalPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEvents());
  const [settings, setSettings] = useState(() => loadJournalSettings());
  const [view, setView] = useState<JournalView>(() => loadJournalSettings().defaultView);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [emotionFilter, setEmotionFilter] = useState<JournalEmotion | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    saveJournalEvents(entries);
  }, [entries]);

  useEffect(() => {
    saveJournalSettings({
      ...settings,
      defaultView: view,
    });
  }, [settings, view]);

  const sortedEntries = [...entries].sort((left, right) => left.start.getTime() - right.start.getTime());
  const windowBounds = getWindowBounds(selectedDate, view);

  const visibleEntries = sortedEntries.filter((entry) => {
    const isInsideWindow = isWithinInterval(entry.start, windowBounds);
    const matchesWeekendPreference = settings.showWeekends || !isWeekend(entry.start);
    const matchesEmotion = emotionFilter === 'all' || entry.emotion === emotionFilter;

    return isInsideWindow && matchesWeekendPreference && matchesEmotion;
  });

  const windowDays = eachDayOfInterval(windowBounds).filter(
    (day) => settings.showWeekends || !isWeekend(day) || view === 'day'
  );

  const groupedEntries = windowDays
    .map((day) => ({
      day,
      entries: visibleEntries.filter((entry) => isSameDay(entry.start, day)),
    }))
    .filter((group) => view !== 'month' || group.entries.length > 0);

  const todayCount = sortedEntries.filter((entry) => isSameDay(entry.start, new Date())).length;
  const upcomingEntry = sortedEntries.find((entry) => entry.start.getTime() >= Date.now()) ?? null;
  const recentNotes = sortedEntries.filter((entry) => entry.notes).slice(-3).reverse();
  const emotionCounts = journalEmotions.map((emotion) => ({
    emotion,
    count: sortedEntries.filter((entry) => entry.emotion === emotion).length,
  }));
  const summary = buildEmotionSummary(sortedEntries);
  const dominantEmotion =
    summary.mostCommonEmotion && isJournalEmotion(summary.mostCommonEmotion)
      ? emotionMeta[summary.mostCommonEmotion].label
      : 'None yet';

  const handleSaveEntry = (nextEntry: JournalEntry) => {
    const wasEditing = Boolean(editingEntry);

    setEntries((currentEntries) => {
      const existingIndex = currentEntries.findIndex((entry) => entry.id === nextEntry.id);

      if (existingIndex >= 0) {
        const nextEntries = [...currentEntries];
        nextEntries[existingIndex] = nextEntry;
        return nextEntries.sort((left, right) => left.start.getTime() - right.start.getTime());
      }

      return [...currentEntries, nextEntry].sort(
        (left, right) => left.start.getTime() - right.start.getTime()
      );
    });

    setDialogOpen(false);
    setEditingEntry(null);

    if (settings.notifications) {
      toast({
        title: wasEditing ? 'Journal block updated' : 'Journal block added',
        description: 'The shared workspace saved your reflection block locally.',
      });
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
    setDialogOpen(false);
    setEditingEntry(null);

    toast({
      title: 'Journal block removed',
      description: 'The entry was removed from the merged journal surface.',
    });
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
        <motion.section
          className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-[var(--app-panel-border)] pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="app-kicker">Journal</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Reflection planner</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
                  Reflection now lives inside FlowMail, so action and follow-up can stay in the
                  same daily loop.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditingEntry(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add block
                </Button>
                <JournalExportMenu entries={sortedEntries} />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setSelectedDate((current) => shiftWindow(current, view, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="rounded-full border border-[var(--app-panel-border)] bg-white/70 px-4 py-2 text-sm font-medium dark:bg-white/5">
                  {getWindowLabel(selectedDate, view)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setSelectedDate((current) => shiftWindow(current, view, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {journalViews.map((journalView) => (
                  <button
                    key={journalView}
                    type="button"
                    onClick={() => setView(journalView)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors',
                      view === journalView
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-[var(--app-panel-border)] bg-white/60 text-[var(--app-text-secondary)] hover:text-[var(--app-text)] dark:bg-white/5'
                    )}
                  >
                    {journalView}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="app-shell-panel-soft px-4 py-4">
              <p className="app-stat-label">Total blocks</p>
              <p className="mt-2 text-2xl font-semibold">{sortedEntries.length}</p>
            </div>
            <div className="app-shell-panel-soft px-4 py-4">
              <p className="app-stat-label">Today</p>
              <p className="mt-2 text-2xl font-semibold">{todayCount}</p>
            </div>
            <div className="app-shell-panel-soft px-4 py-4">
              <p className="app-stat-label">In view</p>
              <p className="mt-2 text-2xl font-semibold">{visibleEntries.length}</p>
            </div>
            <div className="app-shell-panel-soft px-4 py-4">
              <p className="app-stat-label">Dominant energy</p>
              <p className="mt-2 text-2xl font-semibold">{dominantEmotion}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {groupedEntries.length > 0 ? (
              groupedEntries.map((group) => (
                <div key={group.day.toISOString()} className="app-shell-panel-soft px-4 py-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--app-text)]">
                        {format(group.day, 'EEEE, MMM d')}
                      </h3>
                      <p className="text-sm text-[var(--app-text-secondary)]">
                        {group.entries.length === 0
                          ? 'No blocks scheduled'
                          : `${group.entries.length} block${group.entries.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>

                  {group.entries.length > 0 ? (
                    <div className="space-y-3">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-[var(--app-panel-border)] bg-white/75 px-4 py-4 dark:bg-white/5"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em]',
                                    emotionMeta[entry.emotion].badgeClass
                                  )}
                                >
                                  {emotionMeta[entry.emotion].marker} {emotionMeta[entry.emotion].label}
                                </span>
                                <span className="text-sm text-[var(--app-text-secondary)]">
                                  {formatEntryTime(entry, settings.timeFormat24h)}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-base font-semibold text-[var(--app-text)]">
                                  {entry.title}
                                </h4>
                                {entry.notes ? (
                                  <p className="mt-1 text-sm leading-6 text-[var(--app-text-secondary)]">
                                    {entry.notes}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDate(entry.start);
                                setEditingEntry(entry);
                                setDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--app-panel-border)] px-4 py-8 text-sm text-[var(--app-text-secondary)]">
                      Nothing is scheduled here yet. Add a block when you want to capture a reset,
                      follow-up, or check-in.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="app-shell-panel-soft px-4 py-10 text-center">
                <NotebookPen className="mx-auto h-10 w-10 text-[var(--app-text-secondary)]" />
                <h3 className="mt-4 text-lg font-semibold text-[var(--app-text)]">
                  No blocks in this window
                </h3>
                <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                  Try a different view, clear the energy filter, or add your next reflection block.
                </p>
              </div>
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
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--app-text)]">Working defaults</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">
                  Journal defaults stay local to the merged FlowMail workspace.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Energy filter</Label>
                <Select
                  value={emotionFilter}
                  onValueChange={(value) => {
                    if (value === 'all' || isJournalEmotion(value)) {
                      setEmotionFilter(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Show all energy labels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All energy labels</SelectItem>
                    {journalEmotions.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotionMeta[emotion].marker} {emotionMeta[emotion].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-3 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">Show weekends</p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      Keep Saturday and Sunday visible in planning windows.
                    </p>
                  </div>
                  <Switch
                    checked={settings.showWeekends}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, showWeekends: checked }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-3 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">24-hour time</p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      Use military time across journal blocks and exports.
                    </p>
                  </div>
                  <Switch
                    checked={settings.timeFormat24h}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, timeFormat24h: checked }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-3 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">Toast confirmations</p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      Confirm adds and edits with quick local notifications.
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, notifications: checked }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="default-duration">Default block length</Label>
                <Input
                  id="default-duration"
                  min={15}
                  step={15}
                  type="number"
                  value={settings.defaultEventDuration}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      defaultEventDuration: Math.max(15, Number(event.target.value) || 15),
                    }))
                  }
                />
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
              <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--app-text)]">Mood mix</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">
                  A quick read on the tone of the journal backlog.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {emotionCounts.map(({ emotion, count }) => {
                const width =
                  sortedEntries.length === 0
                    ? 0
                    : Math.max((count / sortedEntries.length) * 100, count > 0 ? 12 : 0);

                return (
                  <div key={emotion} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--app-text)]">
                        {emotionMeta[emotion].marker} {emotionMeta[emotion].label}
                      </span>
                      <span className="text-sm text-[var(--app-text-secondary)]">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/5 dark:bg-white/10">
                      <div
                        className={cn('h-2 rounded-full transition-all', emotionMeta[emotion].barClass)}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            className="app-shell-panel px-5 py-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-600 dark:text-violet-300">
                <NotebookPen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--app-text)]">Recent notes</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">
                  What you are carrying forward from the journal right now.
                </p>
              </div>
            </div>

            {upcomingEntry ? (
              <div className="mb-4 rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-4 dark:bg-white/5">
                <p className="app-stat-label">Next block</p>
                <p className="mt-2 text-base font-semibold text-[var(--app-text)]">
                  {upcomingEntry.title}
                </p>
                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                  {format(upcomingEntry.start, 'EEE, MMM d')} at{' '}
                  {formatEntryTime(upcomingEntry, settings.timeFormat24h)}
                </p>
              </div>
            ) : null}

            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-[var(--app-panel-border)] bg-white/70 px-4 py-4 dark:bg-white/5"
                  >
                    <p className="text-sm font-medium text-[var(--app-text)]">{entry.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--app-text-secondary)]">
                      {format(entry.start, 'MMM d')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                      {entry.notes}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--app-panel-border)] px-4 py-8 text-sm text-[var(--app-text-secondary)]">
                Notes from journal blocks will surface here once you start capturing them.
              </div>
            )}
          </motion.section>
        </div>
      </div>

      <JournalEventDialog
        entry={editingEntry}
        open={dialogOpen}
        selectedDate={selectedDate}
        settings={settings}
        onDelete={handleDeleteEntry}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingEntry(null);
          }
        }}
        onSave={handleSaveEntry}
      />
    </>
  );
}
