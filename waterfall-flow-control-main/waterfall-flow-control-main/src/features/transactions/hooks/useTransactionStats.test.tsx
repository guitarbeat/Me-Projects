import { renderHook } from '@testing-library/react';
import { useTransactionStats } from './useTransactionStats';
import { Transaction } from '@/types';
import { describe, it, expect } from 'vitest';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-01-01',
    name: 'Salary',
    inflow: 5000,
    outflow: 0,
    person: 'Alice',
    enabled: true,
  },
  {
    id: '2',
    date: '2023-01-02',
    name: 'Rent',
    inflow: 0,
    outflow: 1500,
    person: 'Alice',
    enabled: true,
  },
  {
    id: '3',
    date: '2023-01-03',
    name: 'Groceries',
    inflow: 0,
    outflow: 200,
    person: 'Alice',
    enabled: true,
  },
  {
    id: '4',
    date: '2023-01-04',
    name: 'Hidden Expense',
    inflow: 0,
    outflow: 100,
    person: 'Alice',
    enabled: false,
  },
];

describe('useTransactionStats', () => {
  it('should calculate stats correctly for enabled transactions', () => {
    const { result } = renderHook(() => useTransactionStats(mockTransactions));

    // Enabled transactions: Salary (5000), Rent (1500), Groceries (200)
    // Disabled: Hidden Expense (100)

    expect(result.current.enabledTransactions).toHaveLength(3);

    // Inflow: 5000
    expect(result.current.totalInflow).toBe(5000);

    // Outflow: 1500 + 200 = 1700
    expect(result.current.totalOutflow).toBe(1700);

    // Net: 5000 - 1700 = 3300
    expect(result.current.netAmount).toBe(3300);
  });

  it('should handle empty transactions array', () => {
    const { result } = renderHook(() => useTransactionStats([]));

    expect(result.current.enabledTransactions).toHaveLength(0);
    expect(result.current.totalInflow).toBe(0);
    expect(result.current.totalOutflow).toBe(0);
    expect(result.current.netAmount).toBe(0);
  });

  it('should handle all disabled transactions', () => {
    const disabledTransactions = mockTransactions.map(t => ({
      ...t,
      enabled: false,
    }));
    const { result } = renderHook(() =>
      useTransactionStats(disabledTransactions)
    );

    expect(result.current.enabledTransactions).toHaveLength(0);
    expect(result.current.totalInflow).toBe(0);
    expect(result.current.totalOutflow).toBe(0);
    expect(result.current.netAmount).toBe(0);
  });
});
