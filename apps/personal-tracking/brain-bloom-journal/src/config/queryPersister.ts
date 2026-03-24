import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const CACHE_KEY = 'reflect-query-cache';

/**
 * Creates a localStorage persister for React Query cache
 * This enables offline support by caching query data locally
 */
export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CACHE_KEY,
  throttleTime: 1000, // Throttle writes to localStorage
});

/**
 * Configuration for persistence
 */
export const persistOptions = {
  persister: queryPersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  buster: 'v1', // Change this to invalidate all caches
};
