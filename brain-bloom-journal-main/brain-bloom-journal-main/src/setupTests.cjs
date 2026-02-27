require('@testing-library/jest-dom');
const { cleanup } = require('@testing-library/react');

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
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

Object.defineProperty(window.navigator, 'serviceWorker', {
  value: undefined,
  writable: true,
});
