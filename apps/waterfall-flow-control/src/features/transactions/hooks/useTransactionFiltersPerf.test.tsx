import { renderHook, act } from '@testing-library/react';
import { useTransactionFilters } from './useTransactionFilters';
import { Transaction } from '@/types';
import { describe, it, expect } from 'vitest';

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
];

describe('useTransactionFilters Performance', () => {
  it('should maintain referential equality of filteredTransactions when sorting changes', () => {
    const { result } = renderHook(() =>
      useTransactionFilters(mockTransactions)
    );

    // Verify initial state
    // @ts-expect-error - Property filteredTransactions does not exist on type yet
    const initialFiltered = result.current.filteredTransactions;
    const initialSorted = result.current.filteredAndSortedTransactions;

    // Change sort order
    act(() => {
      result.current.setSortBy('amount');
    });

    // @ts-expect-error - Property filteredTransactions does not exist on type yet
    const newFiltered = result.current.filteredTransactions;
    const newSorted = result.current.filteredAndSortedTransactions;

    // The key optimization: filteredTransactions should be the EXACT same array instance
    // because sorting should not re-run the filter logic or create a new filter array
    expect(newFiltered).toBe(initialFiltered);

    // But sorted results should definitely be different (different order)
    expect(newSorted).not.toBe(initialSorted);
  });
});
