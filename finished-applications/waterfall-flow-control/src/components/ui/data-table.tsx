import { useState, memo } from 'react';
import { Transaction } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TransactionRow,
  persons,
  formatCurrency,
} from '@/features/transactions';
import type {
  SortBy,
  SortOrder,
} from '@/features/transactions/hooks/useTransactionFilters';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Check, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { toLocalDateString } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export type DataTableVariant = 'default' | 'editable' | 'condensed';

/** Sortable column header with arrow indicators */
const SortableHead = ({
  column,
  label,
  currentSort,
  sortOrder,
  onSort,
  className,
}: {
  column: SortBy;
  label: string;
  currentSort?: SortBy;
  sortOrder?: SortOrder;
  onSort?: (col: SortBy) => void;
  className?: string;
}) => {
  const isActive = currentSort === column;

  return (
    <TableHead
      className={cn(
        className,
        onSort &&
          'cursor-pointer select-none hover:text-foreground transition-colors group'
      )}
    >
      <button
        type="button"
        onClick={() => onSort?.(column)}
        className="inline-flex items-center gap-1 w-full justify-inherit"
        disabled={!onSort}
      >
        {label}
        {onSort && (
          <span
            className={cn(
              'inline-flex transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
            )}
          >
            {isActive ? (
              sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </span>
        )}
      </button>
    </TableHead>
  );
};

interface DataTableProps {
  transactions: Transaction[];
  variant?: DataTableVariant;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onSort?: (column: SortBy) => void;
  onToggle: (id: string, currentEnabled: boolean) => void;
  onDelete: (id: string) => void;
  onAdd?: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate?: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id'>>
  ) => void;
  maxHeight?: string;
}

export const DataTable = memo(
  ({
    transactions = [],
    variant = 'default',
    sortBy,
    sortOrder,
    onSort,
    onToggle,
    onDelete,
    onAdd,
    onUpdate,
    maxHeight = 'max-h-96',
  }: DataTableProps) => {
    const [showAddRow, setShowAddRow] = useState(false);

    // Safety check for undefined transactions
    const safeTransactions = transactions || [];
    const [newTransaction, setNewTransaction] = useState({
      name: '',
      date: toLocalDateString(new Date()),
      person: '',
      inflow: '',
      outflow: '',
    });

    const handleAddTransaction = () => {
      if (!onAdd || !newTransaction.name || !newTransaction.person) return;

      const inflow = parseFloat(newTransaction.inflow) || 0;
      const outflow = parseFloat(newTransaction.outflow) || 0;

      if (inflow === 0 && outflow === 0) return;

      onAdd({
        name: newTransaction.name,
        date: newTransaction.date,
        person: newTransaction.person,
        inflow,
        outflow,
        enabled: true,
      });

      setNewTransaction({
        name: '',
        date: toLocalDateString(new Date()),
        person: '',
        inflow: '',
        outflow: '',
      });
      setShowAddRow(false);
    };

    const handleCancelAdd = () => {
      setNewTransaction({
        name: '',
        date: toLocalDateString(new Date()),
        person: '',
        inflow: '',
        outflow: '',
      });
      setShowAddRow(false);
    };

    const columnCount = variant === 'condensed' ? 6 : 9;

    return (
      <div
        className={`border rounded-xl bg-card overflow-hidden ${maxHeight} overflow-auto`}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10 backdrop-blur-sm">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-12 text-center">✓</TableHead>
              <TableHead className="min-w-[200px]">Transaction</TableHead>
              <SortableHead
                column="date"
                label="Date"
                currentSort={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="w-20 text-center"
              />
              {variant !== 'condensed' && (
                <>
                  <SortableHead
                    column="inflow"
                    label="In"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                    className="w-24 text-right"
                  />
                  <SortableHead
                    column="outflow"
                    label="Out"
                    currentSort={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                    className="w-24 text-right"
                  />
                </>
              )}
              <SortableHead
                column="amount"
                label="Net"
                currentSort={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="w-28 text-right"
              />
              {variant !== 'condensed' && (
                <SortableHead
                  column="balance"
                  label="Balance"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                  className="w-24 text-right"
                />
              )}
              <TableHead className="w-28 text-center">Person</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeTransactions.map(transaction => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                variant={variant}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}

            {/* Add Row (for editable variant) */}
            {variant === 'editable' && showAddRow && (
              <TableRow className="border-b bg-blue-50 dark:bg-blue-900/20">
                <TableCell className="text-center p-2">
                  <div className="w-4 h-4" />
                </TableCell>

                <TableCell className="p-2">
                  <Input
                    value={newTransaction.name}
                    onChange={e =>
                      setNewTransaction(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Transaction name"
                    maxLength={100}
                    className="text-xs h-7"
                  />
                </TableCell>

                <TableCell className="p-2">
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={e =>
                      setNewTransaction(prev => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="text-xs h-7 w-24"
                  />
                </TableCell>

                <TableCell className="p-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTransaction.inflow}
                    onChange={e =>
                      setNewTransaction(prev => ({
                        ...prev,
                        inflow: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="text-xs h-7 w-20"
                  />
                </TableCell>

                <TableCell className="p-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTransaction.outflow}
                    onChange={e =>
                      setNewTransaction(prev => ({
                        ...prev,
                        outflow: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="text-xs h-7 w-20"
                  />
                </TableCell>

                <TableCell className="p-2">
                  <div className="text-xs text-muted-foreground text-right">
                    {(() => {
                      const inflow = parseFloat(newTransaction.inflow) || 0;
                      const outflow = parseFloat(newTransaction.outflow) || 0;
                      const net = inflow - outflow;
                      return net !== 0 ? formatCurrency(Math.abs(net)) : '';
                    })()}
                  </div>
                </TableCell>

                <TableCell className="p-2">
                  <div className="text-xs text-muted-foreground text-right">
                    --
                  </div>
                </TableCell>

                <TableCell className="p-2">
                  <Select
                    value={newTransaction.person}
                    onValueChange={value =>
                      setNewTransaction(prev => ({ ...prev, person: value }))
                    }
                  >
                    <SelectTrigger className="text-xs h-7 w-24">
                      <SelectValue placeholder="Person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map(person => (
                        <SelectItem
                          key={person}
                          value={person}
                          className="text-xs"
                        >
                          {person.split(' ')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell className="p-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddTransaction}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAdd}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Add Button Row */}
            {variant === 'editable' &&
              !showAddRow &&
              safeTransactions.length > 0 && (
                <TableRow className="border-b hover:bg-muted/50">
                  <TableCell colSpan={columnCount} className="text-center py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddRow(true)}
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add transaction
                    </Button>
                  </TableCell>
                </TableRow>
              )}

            {/* Empty State */}
            {safeTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="p-0">
                  <div className="py-8">
                    <EmptyState
                      title={
                        variant === 'editable'
                          ? 'No transactions yet'
                          : 'No data'
                      }
                      description={
                        variant === 'editable'
                          ? 'Add your first transaction to get started'
                          : 'No transactions to display'
                      }
                      icon="empty"
                    />
                    {variant === 'editable' && !showAddRow && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddRow(true)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add your first transaction
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
