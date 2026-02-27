import { useState, memo } from 'react';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { TransactionForm } from './TransactionForm';
import { EmptyTransactions } from '@/components/ui/empty-state';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';
import { MobileTransactionItem } from './MobileTransactionItem';

interface MobileTransactionListProps {
  transactions: Transaction[];
  onToggle: (id: string, currentEnabled: boolean) => void;
  onDelete: (id: string) => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export const MobileTransactionList = memo(
  ({ transactions, onToggle, onDelete, onAdd }: MobileTransactionListProps) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const isMobile = useIsMobile();

    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
      onAdd(transaction);
      setShowAddForm(false);
    };

    if (transactions.length === 0) {
      return (
        <div className="space-y-4 py-4">
          <EmptyTransactions onAction={() => setShowAddForm(true)} />

          <TransactionForm
            open={showAddForm}
            onOpenChange={setShowAddForm}
            onAdd={handleAddTransaction}
          />
        </div>
      );
    }

    return (
      <div className="space-y-3 py-2">
        <div className="flex justify-between items-center px-1 mb-4">
          <h3 className="text-base font-semibold text-foreground">
            All Transactions
          </h3>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="gap-2 h-9 shadow-md hover:shadow-lg transition-all interactive-scale"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <MobileTransactionItem
              key={transaction.id}
              transaction={transaction}
              index={index}
              isMobile={isMobile}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>

        <TransactionForm
          open={showAddForm}
          onOpenChange={setShowAddForm}
          onAdd={handleAddTransaction}
        />
      </div>
    );
  }
);

MobileTransactionList.displayName = 'MobileTransactionList';
