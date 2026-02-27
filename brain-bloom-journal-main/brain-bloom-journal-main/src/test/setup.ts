import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// matchMedia mock for tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  // define minimal matchMedia for tests
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Prevent service worker registration during tests
Object.defineProperty(window.navigator, 'serviceWorker', {
  value: undefined,
  writable: true,
});