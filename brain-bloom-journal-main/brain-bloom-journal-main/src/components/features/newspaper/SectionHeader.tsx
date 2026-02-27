import { memo } from 'react';
import { newsprintTextStyles, newsprintSeparatorStyles } from '@/lib';

interface SectionHeaderProps {
  title: string;
}

// Memoized to prevent re-renders when parent state changes but title remains stable
export const SectionHeader = memo(({ title }: SectionHeaderProps) => {
  return (
    <div className="mt-16 mb-8">
      <h2 className={`${newsprintTextStyles.h2} pb-4`}>
        {title}
      </h2>
      <div className={`${newsprintSeparatorStyles.bold}`} />
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';
