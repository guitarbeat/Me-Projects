// Year Grid Feature - Plug and Play Module
export { default as YearGridApp } from './App';

// Feature configuration
export const yearGridFeature = {
  id: 'year-grid',
  name: 'Year Grid',
  version: '1.0.0',
  description: 'Visual year/day/week grid generator with customization',
  standalone: true, // Can run independently
  routes: [], // Accessed via toggle, not routing
  navigation: [], // Accessed via header button
  capabilities: [
    'day-view',
    'week-view',
    'month-view',
    'export-png',
    'theme-presets',
    'shareable-links',
  ],
  dependencies: ['html2canvas'],
};
