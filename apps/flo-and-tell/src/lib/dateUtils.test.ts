import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  adjustMonth,
  formatDate,
  monthNames,
} from './dateUtils';

describe('dateUtils', () => {
  describe('monthNames', () => {
    it('should contain 12 months', () => {
      expect(monthNames).toHaveLength(12);
    });

    it('should start with January and end with December', () => {
      expect(monthNames[0]).toBe('January');
      expect(monthNames[11]).toBe('December');
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for January 2024', () => {
      const date = new Date(2024, 0, 1); // January 2024
      const days = getDaysInMonth(date);

      // January 2024 starts on Monday (1), so we need 1 null for Sunday
      expect(days[0]).toBe(null);
      expect(days[1]).toBe(1);
      expect(days[31]).toBe(31); // Last day of January
      expect(days).toHaveLength(32); // 1 null + 31 days
    });

    it('should return correct days for February 2024 (leap year)', () => {
      const date = new Date(2024, 1, 1); // February 2024
      const days = getDaysInMonth(date);

      // Count non-null days (should be 29 for leap year)
      const nonNullDays = days.filter((day) => day !== null);
      expect(nonNullDays).toHaveLength(29);
      expect(nonNullDays[nonNullDays.length - 1]).toBe(29);
    });

    it('should handle edge cases correctly', () => {
      // Test a month that starts on Sunday (no leading nulls)
      const days = getDaysInMonth(new Date(2024, 8, 1)); // September 2024 starts on Sunday
      expect(days[0]).toBe(1); // No leading null
    });
  });

  describe('adjustMonth', () => {
    it('should go to previous month', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      const prevMonth = adjustMonth(date, 'prev');

      expect(prevMonth.getMonth()).toBe(4); // May
      expect(prevMonth.getFullYear()).toBe(2024);
    });

    it('should go to next month', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      const nextMonth = adjustMonth(date, 'next');

      expect(nextMonth.getMonth()).toBe(6); // July
      expect(nextMonth.getFullYear()).toBe(2024);
    });

    it('should handle year transitions', () => {
      // Test December to January
      const december = new Date(2024, 11, 15); // December 2024
      const nextMonth = adjustMonth(december, 'next');

      expect(nextMonth.getMonth()).toBe(0); // January
      expect(nextMonth.getFullYear()).toBe(2025);

      // Test January to December
      const january = new Date(2024, 0, 15); // January 2024
      const prevMonth = adjustMonth(january, 'prev');

      expect(prevMonth.getMonth()).toBe(11); // December
      expect(prevMonth.getFullYear()).toBe(2023);
    });

    it('should not modify the original date', () => {
      const originalDate = new Date(2024, 5, 15);
      const originalMonth = originalDate.getMonth();

      adjustMonth(originalDate, 'next');

      expect(originalDate.getMonth()).toBe(originalMonth);
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15');
      expect(formatDate('2024-12-25')).toBe('Dec 25');
      expect(formatDate('2024-07-04')).toBe('Jul 4');
    });

    it('should handle single digit days', () => {
      expect(formatDate('2024-03-01')).toBe('Mar 1');
      expect(formatDate('2024-09-09')).toBe('Sep 9');
    });
  });
});
