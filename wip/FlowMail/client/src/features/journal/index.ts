// Journal Feature - Plug and Play Module
export { default as JournalPage } from '../../pages/journal';
export { loadJournalEvents, saveJournalEvents } from './lib/storage';
export { buildExportData, buildEmotionSummary, buildCsv, downloadTextFile, copyTextToClipboard } from './lib/export';
export type { JournalEntry, JournalEmotion, StoredJournalEntry, JournalSettings, JournalView } from './types';
export { emotionMeta } from './types';

// Feature configuration
export const journalFeature = {
  id: 'journal',
  name: 'Journal',
  version: '1.0.0',
  description: 'Reflection planner with emotion tracking and exports',
  routes: [
    { path: '/journal', component: 'JournalPage' },
  ],
  navigation: [
    { path: '/journal', label: 'Journal', icon: 'NotebookPen', order: 3 },
  ],
  storage: {
    type: 'localStorage',
    key: 'flowmail-journal-events',
  },
  exports: ['json', 'csv', 'markdown'],
  dependencies: ['date-fns'],
};
