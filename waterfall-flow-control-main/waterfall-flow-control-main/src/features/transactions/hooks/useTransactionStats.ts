import { useMemo } from 'react';
import type { Transaction } from '@/types';

/**
 * Hook to calculate transaction statistics
 */
export const useTransactionStats = (transactions: Transaction[]) => {
  const { enabledTransactions, totalInflow, totalOutflow } = useMemo(() => {
    // Single pass calculation O(N) instead of O(3N)
    const enabled: Transaction[] = [];
    let inflow = 0;
    let outflow = 0;

    for (const t of transactions) {
      if (t.enabled) {
        enabled.push(t);
        inflow += t.inflow;
        outflow += t.outflow;
      }
    }

    return {
      enabledTransactions: enabled,
      totalInflow: inflow,
      totalOutflow: outflow,
    };
  }, [transactions]);

  const netAmount = totalInflow - totalOutflow;

  return {
    enabledTransactions,
    totalInflow,
    totalOutflow,
    netAmount,
  };
};
