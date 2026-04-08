// {{FEATURE_NAME}} Feature - Plug and Play Module

// Export pages
export { default as {{FEATURE_NAME_PASCAL}}Page } from './pages/FeaturePage';

// Export components (add as you create them)
// export { MyComponent } from './components/MyComponent';

// Export utilities (add as you create them)
// export { myUtility } from './lib/utils';

// Export types
export type { {{FEATURE_NAME_PASCAL}}Config, {{FEATURE_NAME_PASCAL}}Data } from './types';

// Feature configuration
export const {{FEATURE_NAME_CAMEL}}Feature = {
  id: '{{FEATURE_ID}}',
  name: '{{FEATURE_NAME}}',
  version: '1.0.0',
  description: 'Description of {{FEATURE_NAME}} feature',
  routes: [
    { path: '/{{FEATURE_ID}}', component: '{{FEATURE_NAME_PASCAL}}Page' },
  ],
  navigation: [
    { path: '/{{FEATURE_ID}}', label: '{{FEATURE_NAME}}', icon: 'Box', order: 10 },
  ],
  dependencies: [],
};
