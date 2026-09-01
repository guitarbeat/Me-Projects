import { useMemo } from 'react';

interface FinancialInsight {
  message: string;
  type: 'positive' | 'negative' | 'neutral' | 'milestone';
  emoji?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface UseFinancialInsightsOptions {
  totalInflow: number;
  totalOutflow: number;
  netAmount: number;
  transactionCount: number;
}

/**
 * useFinancialInsights - Generate contextual financial feedback messages
 */
export const useFinancialInsights = ({
  totalInflow,
  totalOutflow,
  netAmount,
  transactionCount,
}: UseFinancialInsightsOptions): FinancialInsight => {
  return useMemo(() => {
    // No transactions
    if (transactionCount === 0) {
      return {
        message: 'Add your first transaction to get started!',
        type: 'neutral',
        emoji: '🌱',
      };
    }

    // Milestone: First 10 transactions
    if (transactionCount === 10) {
      return {
        message: "You've logged 10 transactions! Keep the momentum going.",
        type: 'milestone',
        emoji: '🎯',
      };
    }

    // Strong positive (net > 50% of inflow)
    if (netAmount > 0 && netAmount > totalInflow * 0.5) {
      return {
        message: `Great savings! You're keeping over half your income.`,
        type: 'positive',
        emoji: '🚀',
      };
    }

    // Positive net
    if (netAmount > 0) {
      const ahead = currencyFormatter.format(Math.abs(netAmount));
      return {
        message: `You're ${ahead} ahead. Nice work!`,
        type: 'positive',
        emoji: '✨',
      };
    }

    // Strong negative (net < -30% of outflow)
    if (netAmount < 0 && Math.abs(netAmount) > totalOutflow * 0.3) {
      return {
        message: 'Spending is running high. Time to review expenses?',
        type: 'negative',
        emoji: '📊',
      };
    }

    // Slightly negative
    if (netAmount < 0) {
      const behind = currencyFormatter.format(Math.abs(netAmount));
      return {
        message: `You're ${behind} behind. Small adjustments can help!`,
        type: 'negative',
        emoji: '💡',
      };
    }

    // Perfectly balanced
    return {
      message: 'Your finances are perfectly balanced.',
      type: 'neutral',
      emoji: '⚖️',
    };
  }, [totalInflow, totalOutflow, netAmount, transactionCount]);
};

/**
 * getTransactionFeedback - Get contextual message after adding a transaction
 */
export const getTransactionFeedback = (
  isInflow: boolean,
  amount: number,
  currentNetAmount: number
): string => {
  const formattedAmount = currencyFormatter.format(amount);

  if (isInflow) {
    if (currentNetAmount > 0) {
      return `Nice! ${formattedAmount} added. You're in the green! 💚`;
    }
    return `${formattedAmount} income recorded. Keep going! 📈`;
  }

  // Outflow
  if (currentNetAmount >= 0) {
    return `${formattedAmount} expense logged. Still on track! ✓`;
  }
  return `${formattedAmount} expense noted. Watch the budget! 📊`;
};
