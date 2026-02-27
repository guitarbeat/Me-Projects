import { renderHook, act } from '@testing-library/react';
import { useTransactionFilters } from './useTransactionFilters';
import { Transaction } from '@/types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-01-01',
    name: 'Grocery Store',
    inflow: 0,
    outflow: 50,
    person: 'Alice',
    enabled: true,
  },
  {
    id: '2',
    date: '2023-01-02',
    name: 'Salary',
    inflow: 2000,
    outflow: 0,
    person: 'Bob',
    enabled: true,
  },
  {
    id: '3',
    date: '2023-01-03',
    name: 'Coffee Shop',
    inflow: 0,
    outflow: 5,
    person: 'Alice',
    enabled: true,
  },
];

describe('useTransactionFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should filter transactions based on search query with debounce', () => {
    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions)
    );

    // Initial state: all transactions
    expect(result.current.filteredAndSortedTransactions).toHaveLength(3);

    // Update search query
    act(() => {
      result.current.setSearchQuery('Grocery');
    });

    // Verify search query state updates immediately
    expect(result.current.searchQuery).toBe('Grocery');

    // Currently (before optimization), filtering happens immediately.
    // The test expects debouncing, so we assert that filtering has NOT happened yet.
    // This assertion will FAIL with the current implementation.
    expect(result.current.filteredAndSortedTransactions).toHaveLength(3);

    // Fast-forward time by 300ms (debounce delay)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now filtering should have happened
    expect(result.current.filteredAndSortedTransactions).toHaveLength(1);
    expect(result.current.filteredAndSortedTransactions[0].name).toBe(
      'Grocery Store'
    );
  });

  it('should clear debounce timeout on unmount or new input', () => {
    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions)
    );

    act(() => {
      result.current.setSearchQuery('Gro');
    });

    // Verify filtering hasn't happened yet
    expect(result.current.filteredAndSortedTransactions).toHaveLength(3);

    // Update search query again before timeout
    act(() => {
      vi.advanceTimersByTime(100);
      result.current.setSearchQuery('Grocery');
    });

    // Fast-forward another 200ms (total 300ms from start, but only 200ms from last update)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still not be filtered (because timer was reset)
    expect(result.current.filteredAndSortedTransactions).toHaveLength(3);

    // Fast-forward another 100ms (total 300ms from last update)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Now filtering should have happened with the LATEST query
    expect(result.current.filteredAndSortedTransactions).toHaveLength(1);
    expect(result.current.filteredAndSortedTransactions[0].name).toBe(
      'Grocery Store'
    );
  });
});
