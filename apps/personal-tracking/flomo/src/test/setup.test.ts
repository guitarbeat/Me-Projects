import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should be working correctly', () => {
    expect(true).toBe(true);
  });

  it('should have window.matchMedia mocked', () => {
    expect(window.matchMedia).toBeDefined();
    const mediaQuery = window.matchMedia('(min-width: 600px)');
    expect(mediaQuery.matches).toBe(false);
  });
});
