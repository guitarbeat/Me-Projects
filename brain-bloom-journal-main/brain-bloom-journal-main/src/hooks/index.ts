// Barrel exports for hooks

// Local hooks
export { useDebounce } from './use-debounce';
export { useIsMobile } from './use-mobile';
export { useOnlineStatus } from './use-online-status';

// App-specific common hooks
export { useShareActions } from './common/use-share-actions';

// Error handling
export { useErrorHandler } from './error/use-error-handler';

// React Query hooks
export * from './queries';

// Feature-specific hooks
export * from './features';

// Utility hooks
export { usePWAInstall } from './use-pwa-install';
export { useToast, toast } from './use-toast';
export { useWeeklyDigest } from './use-weekly-digest';
