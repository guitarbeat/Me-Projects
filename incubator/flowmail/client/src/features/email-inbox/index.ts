// Email Inbox Feature - Plug and Play Module
export { default as InboxPage } from './pages/InboxPage';
export { default as LaterPage } from './pages/LaterPage';
export { CardStack } from './components/CardStack';
export { EmailListView } from './components/EmailListView';
export { EmailFilters } from './components/EmailFilters';
export { BulkActions } from './components/BulkActions';
export { EmailCard } from './components/EmailCard';
export type { EmailFilterOptions } from './components/EmailFilters';

// Feature configuration
export const emailInboxFeature = {
  id: 'email-inbox',
  name: 'Email Inbox',
  version: '1.0.0',
  description: 'Email triage with swipe interface and list view',
  routes: [
    { path: '/', component: 'InboxPage', exact: true },
    { path: '/inbox', component: 'InboxPage' },
    { path: '/later', component: 'LaterPage' },
  ],
  navigation: [
    { path: '/inbox', label: 'Inbox', icon: 'Inbox', order: 1 },
    { path: '/later', label: 'Later', icon: 'Clock', order: 2 },
  ],
  api: {
    endpoints: [
      '/api/emails',
      '/api/emails/status/:status',
      '/api/emails/:id',
      '/api/stats',
    ],
  },
  dependencies: ['@tanstack/react-query', 'framer-motion'],
};
