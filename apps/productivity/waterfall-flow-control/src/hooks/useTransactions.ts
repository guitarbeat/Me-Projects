import { useState, useEffect, useCallback } from 'react';
import type { Transaction, Chart } from '@/types';
import { createSampleTransactions } from '@/data/sampleTransactions';

const TRANSACTIONS_KEY = 'fin_transactions';
const CHARTS_KEY = 'fin_charts';
const FIRST_VISIT_KEY = 'fin_first_visit_complete';

const generateId = () => crypto.randomUUID();

export const useTransactions = (chartId?: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from localStorage
  const fetchData = useCallback(() => {
    setLoading(true);
    try {
      // Check if first visit - seed sample data
      const firstVisitComplete = localStorage.getItem(FIRST_VISIT_KEY);
      if (!firstVisitComplete) {
        const sampleData = createSampleTransactions();
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(sampleData));
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
      }

      // Load charts
      const storedCharts = localStorage.getItem(CHARTS_KEY);
      const allCharts: Chart[] = storedCharts ? JSON.parse(storedCharts) : [];
      setCharts(allCharts);

      // Load transactions
      const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      const allTransactions: Transaction[] = storedTransactions
        ? JSON.parse(storedTransactions)
        : [];

      // Filter by chartId
      const filtered = chartId
        ? allTransactions.filter(t => t.fin_chart_id === chartId)
        : allTransactions.filter(t => !t.fin_chart_id);

      // Sort by date
      filtered.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      setTransactions(filtered);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [chartId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveTransactions = (allTransactions: Transaction[]) => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
  };

  const saveCharts = (allCharts: Chart[]) => {
    localStorage.setItem(CHARTS_KEY, JSON.stringify(allCharts));
  };

  const getAllTransactions = (): Transaction[] => {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const addTransaction = useCallback(
    async (newTransaction: Omit<Transaction, 'id' | 'balance'>) => {
      const transaction: Transaction = {
        ...newTransaction,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const all = getAllTransactions();
      all.push(transaction);
      saveTransactions(all);

      if (
        chartId
          ? transaction.fin_chart_id === chartId
          : !transaction.fin_chart_id
      ) {
        setTransactions(prev =>
          [...prev, transaction].sort((a, b) =>
            a.date < b.date ? -1 : a.date > b.date ? 1 : 0
          )
        );
      }
    },
    [chartId]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      const all = getAllTransactions();
      const index = all.findIndex(t => t.id === id);
      if (index !== -1) {
        all[index] = {
          ...all[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        saveTransactions(all);
      }

      setTransactions(prev =>
        prev
          .map(t => (t.id === id ? { ...t, ...updates } : t))
          .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      );
    },
    []
  );

  const toggleTransaction = useCallback(
    async (id: string, currentEnabled: boolean) => {
      const all = getAllTransactions();
      const index = all.findIndex(t => t.id === id);
      if (index !== -1) {
        all[index] = {
          ...all[index],
          enabled: !currentEnabled,
          updated_at: new Date().toISOString(),
        };
        saveTransactions(all);
      }

      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, enabled: !currentEnabled } : t))
      );
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const all = getAllTransactions();
    const filtered = all.filter(t => t.id !== id);
    saveTransactions(filtered);

    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const createChart = useCallback(
    async (name: string): Promise<string | null> => {
      const chart: Chart = {
        id: generateId(),
        name,
        created_at: new Date().toISOString(),
      };

      const storedCharts = localStorage.getItem(CHARTS_KEY);
      const allCharts: Chart[] = storedCharts ? JSON.parse(storedCharts) : [];
      allCharts.push(chart);
      saveCharts(allCharts);

      setCharts(prev => [...prev, chart]);
      return chart.id;
    },
    []
  );

  return {
    transactions,
    charts,
    loading,
    error,
    addTransaction,
    updateTransaction,
    toggleTransaction,
    deleteTransaction,
    createChart,
    refetch: fetchData,
  };
};
