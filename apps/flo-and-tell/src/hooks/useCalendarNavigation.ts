import { useState, useCallback } from 'react';
import { adjustMonth } from '@/lib/dateUtils';

/**
 * Custom hook for calendar month navigation
 */
export const useCalendarNavigation = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => adjustMonth(prev, direction));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  return {
    currentDate,
    navigateMonth,
    goToToday,
    goToDate,
  };
};
