import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * The debounced value will only update after the specified delay has passed without the value changing.
 * A hook that debounces a value by a specified delay.
 * Useful for preventing expensive operations (like API calls or state syncing)
 * from running on every keystroke or rapid update.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
