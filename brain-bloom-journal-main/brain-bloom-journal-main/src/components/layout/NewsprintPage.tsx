import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { newsprintLayoutStyles } from '@/lib';

interface NewsprintPageProps {
  children: ReactNode;
  className?: string;
  /** Use container wrapper with standard padding */
  container?: boolean;
  /** Additional container class overrides */
  containerClassName?: string;
}

/**
 * Reusable newsprint-styled page wrapper
 * Provides consistent background, texture, and typography base
 */
export const NewsprintPage = memo<NewsprintPageProps>(({
  children,
  className,
  container = true,
  containerClassName,
}) => {
  return (
    <div 
      className={cn(
        'min-h-screen bg-newsprint-bg newsprint-dot-grid font-newsprint-sans',
        className
      )}
    >
      {container ? (
        <div className={cn(newsprintLayoutStyles.container, 'py-4 md:py-8', containerClassName)}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
});

NewsprintPage.displayName = 'NewsprintPage';
