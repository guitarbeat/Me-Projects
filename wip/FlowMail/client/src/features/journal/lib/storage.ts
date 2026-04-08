import {
  defaultJournalSettings,
  type JournalEntry,
  type JournalSettings,
  type StoredJournalEntry,
} from '@/features/journal/types';

export const journalStorageKeys = {
  events: 'flowmail:journal:events',
  settings: 'flowmail:journal:settings',
  n8n: 'flowmail:journal:n8n',
  n8nQueue: 'flowmail:journal:n8n-queue',
} as const;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function readJsonStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures so the host app still stays usable offline or in private mode.
  }
}

function serializeEntry(entry: JournalEntry): StoredJournalEntry {
  return {
    ...entry,
    start: entry.start.toISOString(),
    end: entry.end.toISOString(),
  };
}

function deserializeEntry(entry: StoredJournalEntry): JournalEntry | null {
  const start = new Date(entry.start);
  const end = new Date(entry.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return {
    ...entry,
    start,
    end,
  };
}

export function loadJournalSettings(): JournalSettings {
  const storedSettings = readJsonStorage<Partial<JournalSettings>>(journalStorageKeys.settings, {});

  return {
    ...defaultJournalSettings,
    ...storedSettings,
  };
}

export function saveJournalSettings(settings: JournalSettings) {
  writeJsonStorage(journalStorageKeys.settings, settings);
}

export function loadJournalEvents(): JournalEntry[] {
  const storedEntries = readJsonStorage<StoredJournalEntry[]>(journalStorageKeys.events, []);

  return storedEntries
    .map(deserializeEntry)
    .filter((entry): entry is JournalEntry => entry !== null);
}

export function saveJournalEvents(entries: JournalEntry[]) {
  writeJsonStorage(
    journalStorageKeys.events,
    entries.map((entry) => serializeEntry(entry))
  );
}
