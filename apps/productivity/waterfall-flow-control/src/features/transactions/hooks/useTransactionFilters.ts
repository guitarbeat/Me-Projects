import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types';

export type SortBy =
  | 'date'
  | 'amount'
  | 'name'
  | 'person'
  | 'inflow'
  | 'outflow'
  | 'balance';
export type SortOrder = 'asc' | 'desc';

/**
 * Hook to manage transaction filtering and sorting
 */
export const useTransactionFilters = (transactions: Transaction[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Debounce search query updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Separate filtering logic to prevent re-filtering when sort changes
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    if (!debouncedQuery) {
      // Create a shallow copy to prevent mutation if sort modifies in-place later
      // Although here we just filter, sort happens in the next memo
      return [...transactions];
    }

    const query = debouncedQuery.toLowerCase();
    return transactions.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.person.toLowerCase().includes(query) ||
        t.date.includes(query)
    );
  }, [transactions, debouncedQuery]);

  const filteredAndSortedTransactions = useMemo(() => {
    // Create a copy to sort safely without mutating filteredTransactions
    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          // Optimize date sorting by using string comparison for ISO dates
          // This is significantly faster than localeCompare
          comparison = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
          break;
        case 'amount': {
          const amountA = a.inflow - a.outflow;
          const amountB = b.inflow - b.outflow;
          comparison = amountA - amountB;
          break;
        }
        case 'inflow':
          comparison = a.inflow - b.inflow;
          break;
        case 'outflow':
          comparison = a.outflow - b.outflow;
          break;
        case 'balance':
          comparison = (a.balance || 0) - (b.balance || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'person':
          comparison = a.person.localeCompare(b.person);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTransactions, sortBy, sortOrder]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    filteredTransactions, // Exposed for useTransactionStats optimization
    filteredAndSortedTransactions,
  };
};
