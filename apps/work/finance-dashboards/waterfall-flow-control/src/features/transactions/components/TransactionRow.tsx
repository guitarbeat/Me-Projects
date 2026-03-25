import { useState, memo } from 'react';
import { Transaction } from '@/types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  persons,
  personBadgeColors,
} from '../utils/transactionUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
  variant?: 'default' | 'editable' | 'condensed';
  onToggle: (id: string, currentEnabled: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate?: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id'>>
  ) => void;
}

export const TransactionRow = memo(
  ({
    transaction,
    variant = 'default',
    onToggle,
    onDelete,
    onUpdate,
  }: TransactionRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      name: transaction.name,
      date: transaction.date,
      person: transaction.person,
      inflow: transaction.inflow.toString(),
      outflow: transaction.outflow.toString(),
    });

    const handleSave = () => {
      if (!onUpdate || !editData.name || !editData.person) return;

      const inflow = parseFloat(editData.inflow) || 0;
      const outflow = parseFloat(editData.outflow) || 0;

      if (inflow === 0 && outflow === 0) return;

      onUpdate(transaction.id, {
        name: editData.name,
        date: editData.date,
        person: editData.person,
        inflow,
        outflow,
      });

      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        name: transaction.name,
        date: transaction.date,
        person: transaction.person,
        inflow: transaction.inflow.toString(),
        outflow: transaction.outflow.toString(),
      });
      setIsEditing(false);
    };

    // Editing mode
    if (isEditing) {
      return (
        <TableRow className="border-b bg-blue-50 dark:bg-blue-900/20">
          <TableCell className="text-center p-2">
            <Checkbox
              checked={transaction.enabled}
              onCheckedChange={() =>
                onToggle(transaction.id, transaction.enabled)
              }
              aria-label={`Toggle ${transaction.name}`}
            />
          </TableCell>

          <TableCell className="p-2">
            <Input
              value={editData.name}
              onChange={e =>
                setEditData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Transaction name"
              aria-label="Transaction name"
              maxLength={100}
              className="text-xs h-7"
            />
          </TableCell>

          <TableCell className="p-2">
            <Input
              type="date"
              value={editData.date}
              onChange={e =>
                setEditData(prev => ({ ...prev, date: e.target.value }))
              }
              aria-label="Transaction date"
              className="text-xs h-7 w-24"
            />
          </TableCell>

          {variant !== 'condensed' && (
            <>
              <TableCell className="p-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editData.inflow}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, inflow: e.target.value }))
                  }
                  placeholder="0.00"
                  aria-label="Inflow amount"
                  className="text-xs h-7 w-20"
                />
              </TableCell>

              <TableCell className="p-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editData.outflow}
                  onChange={e =>
                    setEditData(prev => ({ ...prev, outflow: e.target.value }))
                  }
                  placeholder="0.00"
                  aria-label="Outflow amount"
                  className="text-xs h-7 w-20"
                />
              </TableCell>
            </>
          )}

          <TableCell className="p-2 text-right">
            <div className="text-xs text-muted-foreground">
              {(() => {
                const inflow = parseFloat(editData.inflow) || 0;
                const outflow = parseFloat(editData.outflow) || 0;
                const net = inflow - outflow;
                return net !== 0 ? formatCurrency(Math.abs(net)) : '';
              })()}
            </div>
          </TableCell>

          {variant !== 'condensed' && (
            <TableCell className="p-2 text-right text-xs text-muted-foreground">
              --
            </TableCell>
          )}

          <TableCell className="p-2">
            <Select
              value={editData.person}
              onValueChange={value =>
                setEditData(prev => ({ ...prev, person: value }))
              }
            >
              <SelectTrigger
                className="text-xs h-7 w-24"
                aria-label="Select person"
              >
                <SelectValue placeholder="Person" />
              </SelectTrigger>
              <SelectContent>
                {persons.map(person => (
                  <SelectItem key={person} value={person} className="text-xs">
                    {person.split(' ')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>

          <TableCell className="p-2">
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-6 w-6 p-0"
                    aria-label="Save changes"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted h-6 w-6 p-0"
                    aria-label="Cancel editing"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel editing</TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // Display mode
    const netAmount = transaction.inflow - transaction.outflow;
    const isPositive = netAmount > 0;

    return (
      <TableRow
        className={cn(
          'border-b hover:bg-muted/30 transition-colors even:bg-muted/15',
          !transaction.enabled && 'opacity-40'
        )}
      >
        {/* Checkbox */}
        <TableCell className="text-center p-3">
          <Checkbox
            checked={transaction.enabled}
            onCheckedChange={() =>
              onToggle(transaction.id, transaction.enabled)
            }
            aria-label={`Toggle ${transaction.name}`}
            className={cn(
              'h-5 w-5 rounded-full border-2',
              transaction.enabled
                ? 'border-amber-500 bg-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500'
                : 'border-muted-foreground/30'
            )}
          />
        </TableCell>

        {/* Transaction Name */}
        <TableCell className="p-3">
          <div
            className="font-medium text-foreground truncate max-w-[240px]"
            title={transaction.name}
          >
            {transaction.name}
          </div>
        </TableCell>

        {/* Date */}
        <TableCell className="text-center text-muted-foreground p-3">
          {formatDate(transaction.date)}
        </TableCell>

        {/* Inflow */}
        {variant !== 'condensed' && (
          <>
            <TableCell className="text-right font-mono p-3">
              <span className="text-primary font-medium">
                {transaction.inflow > 0
                  ? formatCurrency(transaction.inflow)
                  : ''}
              </span>
            </TableCell>

            {/* Outflow */}
            <TableCell className="text-right font-mono p-3">
              <span className="text-destructive font-medium">
                {transaction.outflow > 0
                  ? formatCurrency(transaction.outflow)
                  : ''}
              </span>
            </TableCell>
          </>
        )}

        {/* Net Amount with Sparkline Icon */}
        <TableCell className="text-right p-3">
          <div
            className={cn(
              'flex items-center justify-end gap-1.5 font-mono font-semibold',
              isPositive ? 'text-primary' : 'text-destructive'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 flex-shrink-0" />
            )}
            <span>
              {isPositive ? '+' : '-'}
              {formatCurrency(Math.abs(netAmount))}
            </span>
          </div>
        </TableCell>

        {/* Balance */}
        {variant !== 'condensed' && (
          <TableCell className="text-right font-mono font-semibold text-foreground p-3">
            {formatCurrency(transaction.balance || 0)}
          </TableCell>
        )}

        {/* Person Badge */}
        <TableCell className="text-center p-3">
          <Badge
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold border-0',
              personBadgeColors[transaction.person] ||
                'bg-muted text-muted-foreground'
            )}
          >
            {transaction.person.split(' ')[0]}
          </Badge>
        </TableCell>
        {/* Actions */}
        <TableCell className="p-3">
          <div className="flex items-center justify-end gap-2">
            {variant === 'editable' && onUpdate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-8 w-8 p-0"
                    aria-label={`Edit ${transaction.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  aria-label={`Delete ${transaction.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);
