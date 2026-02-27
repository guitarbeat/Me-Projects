import { lazy, Suspense, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useIsMobile } from '@/hooks/useMobile';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useTransactions } from '@/hooks/useTransactions';
import {
  useTransactionFilters,
  useTransactionStats,
  type SortBy,
  formatCurrency,
} from '@/features/transactions';
import { useCSVImport, exportToCSV } from '@/features/csv-import';
import { ChartSelector } from '@/features/charts';
import { SearchAndSort } from '@/components/dashboard/SearchAndSort';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { MobileTransactionList } from '@/features/transactions';
import { CSVMappingDialog } from '@/features/csv-import';
import { VerticalSplit } from '@/components/ui/vertical-split';
import {
  Loading,
  Center,
  Body,
  Heading,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@/components/ui';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { ChevronDown } from 'lucide-react';

const EditableTransactionTable = lazy(() =>
  import('@/components/ui/data-table').then(m => ({ default: m.DataTable }))
);

/**
 * Dashboard Page - Vertical split layout with draggable handle
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  // Transaction data management
  const {
    transactions,
    charts,
    loading,
    addTransaction,
    updateTransaction,
    toggleTransaction,
    deleteTransaction,
    createChart,
    refetch,
  } = useTransactions(selectedChartId);

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      deleteTransaction(id);

      toast.success('Transaction deleted', {
        description: `${transaction.name} - ${formatCurrency(transaction.inflow - transaction.outflow)}`,
        action: {
          label: 'Undo',
          onClick: () => {
            const {
              id: _,
              balance: __,
              created_at: ___,
              updated_at: ____,
              ...rest
            } = transaction;
            addTransaction(rest);
          },
        },
      });
    },
    [deleteTransaction, transactions, addTransaction]
  );

  const handleCreateChart = useCallback(
    async (name: string) => {
      const chartId = await createChart(name);
      if (chartId) {
        setSelectedChartId(chartId);
      }
    },
    [createChart]
  );

  // Filtering and sorting
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    filteredTransactions,
    filteredAndSortedTransactions,
  } = useTransactionFilters(transactions);

  // Statistics
  // Optimization: use filteredTransactions (not sorted) to avoid re-calculating stats
  // when only sort order changes. Also ensures charts use chronological order.
  const { enabledTransactions, netAmount } =
    useTransactionStats(filteredTransactions);

  // CSV import
  const {
    csvMappingOpen,
    pendingCSVData,
    handleImportCSV,
    handleCSVMappingConfirm,
    handleCSVMappingCancel,
  } = useCSVImport(addTransaction);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success('Transactions refreshed');
  }, [refetch]);

  const { scrollRef, isPulling, isRefreshing, pullDistance, threshold } =
    usePullToRefresh({
      onRefresh: handleRefresh,
      enabled: isMobile,
    });

  const handleSort = useCallback(
    (col: SortBy) => {
      if (col === sortBy) {
        toggleSortOrder();
      } else {
        setSortBy(col);
      }
    },
    [sortBy, toggleSortOrder, setSortBy]
  );

  // CSV export
  const handleExportCSV = useCallback(() => {
    exportToCSV(
      transactions,
      `transactions-${new Date().toISOString().split('T')[0]}.csv`
    );
    toast.success('Transactions exported to CSV');
  }, [transactions]);

  const handleImportClick = useCallback(() => {
    document.getElementById('csv-import')?.click();
  }, []);

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  // Chart selector for the center slot
  const selectedChart = charts.find(c => c.id === selectedChartId);
  const chartSelectorSlot = useMemo(
    () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs font-medium px-2"
          >
            <span className="truncate max-w-[100px]">
              {selectedChart?.name || 'All Charts'}
            </span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="center">
          <ChartSelector
            charts={charts}
            selectedChartId={selectedChartId}
            onSelectChart={setSelectedChartId}
            onCreateChart={handleCreateChart}
          />
        </PopoverContent>
      </Popover>
    ),
    [charts, selectedChart, selectedChartId, handleCreateChart]
  );

  // Determine financial mood for ambient background
  const financialMood =
    netAmount > 0 ? 'positive' : netAmount < 0 ? 'negative' : 'neutral';

  // Top panel: Charts
  const topPanel = useMemo(
    () => (
      <div className="h-full overflow-auto p-4">
        <ChartsSection enabledTransactions={enabledTransactions} />
      </div>
    ),
    [enabledTransactions]
  );

  // Bottom panel: Transactions
  const bottomPanel = useMemo(
    () => (
      <ScrollArea ref={scrollRef} className="h-full">
        {isMobile && (
          <PullToRefreshIndicator
            isPulling={isPulling}
            isRefreshing={isRefreshing}
            pullDistance={pullDistance}
            threshold={threshold}
          />
        )}
        <div className="p-4 space-y-4">
          <SearchAndSort
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onToggleSortOrder={toggleSortOrder}
            resultCount={filteredAndSortedTransactions.length}
          />

          {isMobile ? (
            <MobileTransactionList
              transactions={filteredAndSortedTransactions}
              onAdd={addTransaction}
              onToggle={toggleTransaction}
              onDelete={handleDeleteTransaction}
            />
          ) : (
            <Suspense
              fallback={
                <Loading
                  type="shimmer"
                  className="h-[400px] w-full rounded-lg"
                />
              }
            >
              <EditableTransactionTable
                transactions={filteredAndSortedTransactions}
                variant="editable"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onAdd={addTransaction}
                onUpdate={updateTransaction}
                onToggle={toggleTransaction}
                onDelete={handleDeleteTransaction}
              />
            </Suspense>
          )}
        </div>
      </ScrollArea>
    ),
    [
      scrollRef,
      isMobile,
      isPulling,
      isRefreshing,
      pullDistance,
      threshold,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
      sortOrder,
      toggleSortOrder,
      filteredAndSortedTransactions,
      addTransaction,
      toggleTransaction,
      handleDeleteTransaction,
      updateTransaction,
      handleSort,
    ]
  );

  if (loading) {
    return (
      <Center className="min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loading type="spinner" size="lg" />
          <div
            className="space-y-1 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <Heading level={4}>Loading your dashboard</Heading>
            <Body muted size="sm">
              Fetching transactions...
            </Body>
          </div>
        </div>
      </Center>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <AmbientBackground mood={financialMood} />

      <VerticalSplit
        topView={topPanel}
        bottomView={bottomPanel}
        topTitle="Charts"
        bottomTitle="Transactions"
        defaultDetent="middle"
        onExport={handleExportCSV}
        onImport={handleImportClick}
        onProfile={handleProfileClick}
        exportDisabled={transactions.length === 0}
        centerSlot={chartSelectorSlot}
      />

      <CSVMappingDialog
        open={csvMappingOpen}
        onOpenChange={open => !open && handleCSVMappingCancel()}
        csvData={pendingCSVData || []}
        onConfirm={handleCSVMappingConfirm}
      />

      <input
        id="csv-import"
        type="file"
        accept=".csv"
        onChange={handleImportCSV}
        className="hidden"
      />
    </div>
  );
};

export default Dashboard;
