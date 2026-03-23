import React from 'react';
import { Shield, EyeOff, Eye, Lock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityStatus {
  isPrivate: boolean;
  hasAccessCode: boolean; // Unified: true if either PIN or password is set
}

interface SecurityOverviewProps {
  status: SecurityStatus;
  onScrollTo?: (section: 'privacy' | 'access-control') => void;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({
  status,
  onScrollTo,
}) => {
  const { isPrivate, hasAccessCode } = status;
  const activeCount = [isPrivate, hasAccessCode].filter(Boolean).length;

  const protectionLevel =
    activeCount === 0
      ? { label: 'Basic', color: 'text-muted-foreground', bg: 'bg-muted/50' }
      : activeCount === 1
        ? {
            label: 'Good',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
          }
        : {
            label: 'Strong',
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/30',
          };

  const indicators = [
    {
      key: 'privacy',
      label: 'Private',
      icon: isPrivate ? EyeOff : Eye,
      active: isPrivate,
      onClick: () => onScrollTo?.('privacy'),
    },
    {
      key: 'access-control',
      label: 'Access Code',
      icon: Lock,
      active: hasAccessCode,
      onClick: () => onScrollTo?.('access-control'),
    },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-[var(--space-sm)] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="font-semibold text-sm sm:text-base">
            Security Status
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
            protectionLevel.bg,
            protectionLevel.color
          )}
        >
          {activeCount > 0 ? (
            <Check className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          {protectionLevel.label}
        </div>
      </div>

      {/* Status Grid - 2 columns for 2 features */}
      <div className="grid grid-cols-2 gap-2">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <button
              key={indicator.key}
              type="button"
              onClick={indicator.onClick}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                'min-h-[clamp(70px,14vw,90px)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'hover:scale-[1.02] active:scale-[0.98]',
                indicator.active
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : 'bg-muted/30 border-border/50 hover:border-border'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full transition-colors',
                  indicator.active
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : 'bg-muted/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    indicator.active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium leading-tight text-center',
                  indicator.active
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-muted-foreground'
                )}
              >
                {indicator.label}
              </span>
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  indicator.active ? 'bg-green-500' : 'bg-muted-foreground/30'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
        {activeCount === 0 && 'Enable features above to protect your account'}
        {activeCount === 1 && '1 of 2 security features active'}
        {activeCount === 2 && 'All security features enabled'}
      </p>
    </div>
  );
};
