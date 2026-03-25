import type { JournalEntry } from '@/features/journal/types';

export function buildExportData(entries: JournalEntry[]) {
  return {
    exportDate: new Date().toISOString(),
    totalEvents: entries.length,
    events: entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      notes: entry.notes,
      start: entry.start.toISOString(),
      end: entry.end.toISOString(),
      emotion: entry.emotion,
      emoji: entry.emoji,
      durationMinutes: Math.round((entry.end.getTime() - entry.start.getTime()) / (1000 * 60)),
    })),
  };
}

export function buildEmotionSummary(entries: JournalEntry[]) {
  const emotionCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    return counts;
  }, {});

  const totalEvents = entries.length;

  return {
    exportDate: new Date().toISOString(),
    totalEvents,
    emotionBreakdown: Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      }))
      .sort((left, right) => right.count - left.count),
    mostCommonEmotion:
      totalEvents > 0
        ? Object.entries(emotionCounts).reduce((current, candidate) =>
            emotionCounts[current[0]] >= emotionCounts[candidate[0]] ? current : candidate
          )[0]
        : null,
    dateRange: {
      earliest:
        totalEvents > 0
          ? new Date(Math.min(...entries.map((entry) => entry.start.getTime()))).toISOString()
          : null,
      latest:
        totalEvents > 0
          ? new Date(Math.max(...entries.map((entry) => entry.end.getTime()))).toISOString()
          : null,
    },
  };
}

export function buildCsv(entries: JournalEntry[]) {
  const headers = [
    'ID',
    'Title',
    'Notes',
    'Start',
    'End',
    'Emotion',
    'Marker',
    'Duration (minutes)',
  ];

  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = entries.map((entry) =>
    [
      entry.id,
      escapeCell(entry.title),
      escapeCell(entry.notes),
      entry.start.toISOString(),
      entry.end.toISOString(),
      entry.emotion,
      entry.emoji,
      Math.round((entry.end.getTime() - entry.start.getTime()) / (1000 * 60)).toString(),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export async function copyTextToClipboard(content: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard access is unavailable in this browser.');
  }

  await navigator.clipboard.writeText(content);
}
