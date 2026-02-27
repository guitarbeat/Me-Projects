import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('p-4', true && 'bg-red-500')).toBe('p-4 bg-red-500');
      expect(cn('p-4', false && 'bg-red-500')).toBe('p-4');
    });

    it('should handle Tailwind merge conflicts', () => {
      // When conflicting classes are provided, Tailwind merge should resolve them
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should handle arrays and objects', () => {
      expect(cn(['p-4', 'bg-red-500'])).toBe('p-4 bg-red-500');
      expect(cn({ 'p-4': true, 'bg-red-500': false })).toBe('p-4');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn(null, undefined)).toBe('');
    });

    it('should handle mixed input types', () => {
      expect(
        cn(
          'base-class',
          ['array-class'],
          { 'object-class': true, 'hidden-class': false },
          'string-class'
        )
      ).toBe('base-class array-class object-class string-class');
    });
  });
});
