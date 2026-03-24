import { memo, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  personColorsWithDarkMode,
  formatCurrency,
  formatDate,
} from '../utils/transactionUtils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MobileTransactionItemProps {
  transaction: Transaction;
  index: number;
  isMobile: boolean;
  onToggle: (id: string, currentEnabled: boolean) => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export const MobileTransactionItem = memo(
  ({
    transaction,
    index,
    isMobile,
    onToggle,
    onDelete,
  }: MobileTransactionItemProps) => {
    const netAmount = transaction.inflow - transaction.outflow;
    const isPositive = netAmount > 0;
    const prefersReducedMotion = useReducedMotion();
    const [isDragging, setIsDragging] = useState(false);

    // Motion values for swipe gesture
    const x = useMotionValue(0);
    const background = useTransform(
      x,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [
        'hsl(0 84% 60% / 0.2)', // Red for delete (left swipe)
        'transparent',
        transaction.enabled ? 'hsl(0 0% 50% / 0.2)' : 'hsl(142 76% 36% / 0.2)', // Green/gray for toggle (right swipe)
      ]
    );

    const leftIconOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
    const rightIconOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);

    const handleDragEnd = (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      setIsDragging(false);

      if (info.offset.x < -SWIPE_THRESHOLD) {
        // Swipe left: Delete
        onDelete(transaction.id);
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        // Swipe right: Toggle
        onToggle(transaction.id, transaction.enabled);
      }
    };

    const cardContent = (
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={transaction.enabled}
            onCheckedChange={() =>
              onToggle(transaction.id, transaction.enabled)
            }
            className="mt-1 h-5 w-5 rounded-md"
            aria-label={`Toggle ${transaction.name}`}
          />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
                {transaction.name}
              </h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 flex-shrink-0 rounded-lg -mt-0.5"
                    aria-label={`Delete ${transaction.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete transaction</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {formatDate(transaction.date)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-semibold',
                    personColorsWithDarkMode[transaction.person] ||
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {transaction.person.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2 text-sm">
                {transaction.inflow > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-primary tabular-nums">
                      {formatCurrency(transaction.inflow)}
                    </span>
                  </div>
                )}
                {transaction.outflow > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="font-bold text-destructive tabular-nums">
                      {formatCurrency(transaction.outflow)}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  'flex items-center gap-1.5 font-bold text-base px-3 py-1.5 rounded-lg',
                  isPositive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-destructive/15 text-destructive border border-destructive/20'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="tabular-nums">
                  {formatCurrency(Math.abs(netAmount))}
                </span>
              </div>
            </div>

            {transaction.balance !== undefined && (
              <div className="text-right text-xs font-medium text-muted-foreground pt-2 border-t border-border/30">
                Balance:{' '}
                <span className="font-mono tabular-nums">
                  {formatCurrency(transaction.balance)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    );

    // Mobile with swipe gestures
    if (isMobile && !prefersReducedMotion) {
      return (
        <div className="relative overflow-hidden rounded-lg">
          {/* Background action indicators */}
          <motion.div
            className="absolute inset-0 flex items-center justify-between px-6 rounded-lg"
            style={{ backgroundColor: background }}
          >
            {/* Left side: Delete icon */}
            <motion.div
              className="flex items-center gap-2 text-destructive"
              style={{ opacity: leftIconOpacity }}
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-sm font-medium">Delete</span>
            </motion.div>

            {/* Right side: Toggle icon */}
            <motion.div
              className="flex items-center gap-2"
              style={{
                opacity: rightIconOpacity,
                color: transaction.enabled
                  ? 'hsl(var(--muted-foreground))'
                  : 'hsl(142 76% 36%)',
              }}
            >
              <span className="text-sm font-medium">
                {transaction.enabled ? 'Disable' : 'Enable'}
              </span>
              {transaction.enabled ? (
                <X className="h-5 w-5" />
              ) : (
                <Check className="h-5 w-5" />
              )}
            </motion.div>
          </motion.div>

          {/* Draggable card */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x }}
            whileTap={{ cursor: 'grabbing' }}
          >
            <Card
              className={cn(
                'overflow-hidden relative',
                !transaction.enabled && 'opacity-50',
                isDragging && 'shadow-lg'
              )}
            >
              {cardContent}
            </Card>
          </motion.div>
        </div>
      );
    }

    // Desktop or reduced motion: No swipe gestures
    return (
      <Card
        className={cn(
          'overflow-hidden',
          !isMobile &&
            'animate-fade-up hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md',
          !transaction.enabled && 'opacity-50'
        )}
        style={
          !isMobile
            ? { animationDelay: `${Math.min(index * 50, 300)}ms` }
            : undefined
        }
      >
        {cardContent}
      </Card>
    );
  }
);

MobileTransactionItem.displayName = 'MobileTransactionItem';
