import { useState, useCallback } from 'react';
import { importCSVFile, parseCSVWithMapping } from '../utils/csvUtils';
import { toast } from 'sonner';
import type { Transaction } from '@/types';
import type { FieldMapping, ImportOptions } from '../types';

/**
 * Hook to manage CSV import workflow
 */
export const useCSVImport = (
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'balance'>
  ) => Promise<void>
) => {
  const [csvMappingOpen, setCsvMappingOpen] = useState(false);
  const [pendingCSVData, setPendingCSVData] = useState<string[][] | null>(null);

  const handleImportCSV = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const csvData = await importCSVFile(file);

        if (csvData.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        setPendingCSVData(csvData);
        setCsvMappingOpen(true);
        event.target.value = '';
      } catch (error) {
        console.error('CSV import error:', error);
        toast.error('Failed to read CSV file. Please check the file format.');
      }
    },
    []
  );

  const handleCSVMappingConfirm = useCallback(
    async (mapping: FieldMapping, options: ImportOptions) => {
      if (!pendingCSVData) return;

      try {
        const importedTransactions = parseCSVWithMapping(
          pendingCSVData,
          mapping,
          options
        );

        if (importedTransactions.length === 0) {
          toast.error('No valid transactions found in CSV');
          return;
        }

        let successCount = 0;
        for (const transaction of importedTransactions) {
          try {
            await addTransaction(transaction);
            successCount++;
          } catch (error) {
            console.error('Failed to import transaction:', transaction, error);
          }
        }

        toast.success(
          `Successfully imported ${successCount} of ${importedTransactions.length} transactions`
        );

        setCsvMappingOpen(false);
        setPendingCSVData(null);
      } catch (error) {
        console.error('CSV import error:', error);
        toast.error('Failed to import transactions. Please check the mapping.');
      }
    },
    [pendingCSVData, addTransaction]
  );

  const handleCSVMappingCancel = useCallback(() => {
    setCsvMappingOpen(false);
    setPendingCSVData(null);
  }, []);

  return {
    csvMappingOpen,
    pendingCSVData,
    handleImportCSV,
    handleCSVMappingConfirm,
    handleCSVMappingCancel,
  };
};
