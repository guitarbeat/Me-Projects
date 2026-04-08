export const journalViews = ['day', 'week', 'month'] as const;

export type JournalView = (typeof journalViews)[number];

export const journalEmotions = [
  'focused',
  'calm',
  'energized',
  'reflective',
  'stretched',
] as const;

export type JournalEmotion = (typeof journalEmotions)[number];

export interface JournalEntry {
  id: string;
  title: string;
  notes: string;
  emotion: JournalEmotion;
  emoji: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface StoredJournalEntry {
  id: string;
  title: string;
  notes: string;
  emotion: JournalEmotion;
  emoji: string;
  start: string;
  end: string;
  allDay: boolean;
}

export interface JournalSettings {
  defaultView: JournalView;
  showWeekends: boolean;
  timeFormat24h: boolean;
  notifications: boolean;
  defaultEventDuration: number;
}

export const defaultJournalSettings: JournalSettings = {
  defaultView: 'week',
  showWeekends: true,
  timeFormat24h: false,
  notifications: true,
  defaultEventDuration: 45,
};

export const emotionMeta: Record<
  JournalEmotion,
  { label: string; marker: string; badgeClass: string; barClass: string }
> = {
  focused: {
    label: 'Focused',
    marker: '>>',
    badgeClass:
      'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200',
    barClass: 'bg-sky-500',
  },
  calm: {
    label: 'Calm',
    marker: '~~',
    badgeClass:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200',
    barClass: 'bg-emerald-500',
  },
  energized: {
    label: 'Energized',
    marker: '!!',
    badgeClass:
      'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
    barClass: 'bg-amber-500',
  },
  reflective: {
    label: 'Reflective',
    marker: '..',
    badgeClass:
      'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200',
    barClass: 'bg-violet-500',
  },
  stretched: {
    label: 'Stretched',
    marker: '//',
    badgeClass:
      'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200',
    barClass: 'bg-rose-500',
  },
};

export function isJournalView(value: string): value is JournalView {
  return journalViews.includes(value as JournalView);
}

export function isJournalEmotion(value: string): value is JournalEmotion {
  return journalEmotions.includes(value as JournalEmotion);
}
