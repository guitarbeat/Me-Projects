import { memo, ReactNode } from 'react';
import { NewsprintCard, NewsprintCardContent } from '@/components/ui/newsprint-card';
import type { LucideIcon } from '@/lib/icons/icon-imports';
import { cn } from '@/lib/utils';
import { newsprintTextStyles } from '@/lib';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'inline';
}

const sizeClasses = {
  sm: {
    padding: 'p-6',
    icon: 'h-10 w-10',
    title: 'text-base',
    description: 'text-xs',
  },
  md: {
    padding: 'p-8',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    padding: 'p-12',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
  },
};

/**
 * Reusable empty state component for displaying "no data" messages
 * Uses newsprint design system for consistent styling
 */
export const EmptyState = memo<EmptyStateProps>(({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
  variant = 'card',
}) => {
  const sizes = sizeClasses[size];

  const content = (
    <div className={cn(sizes.padding, 'text-center')}>
      {Icon && (
        <Icon className={cn(sizes.icon, 'mx-auto mb-4 opacity-30 text-newsprint-neutral-500')} />
      )}
      <h3 className={cn(sizes.title, 'font-newsprint-serif font-bold text-newsprint-foreground mb-2 uppercase tracking-wide')}>
        {title}
      </h3>
      {description && (
        <p className={cn(sizes.description, newsprintTextStyles.body, 'max-w-md mx-auto mb-4 text-newsprint-neutral-500')}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('animate-fade-in', className)}>
        {content}
      </div>
    );
  }

  return (
    <NewsprintCard variant="default" className={cn('newsprint-texture animate-fade-in', className)}>
      <NewsprintCardContent className="p-0">
        {content}
      </NewsprintCardContent>
    </NewsprintCard>
  );
});

EmptyState.displayName = 'EmptyState';
