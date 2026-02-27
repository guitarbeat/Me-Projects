import { memo } from 'react';
import { newsprintTextStyles } from '@/lib';

interface QuoteBoxProps {
  quote: string;
  attribution: string;
}

// Memoized to prevent re-renders when parent state changes but quote data remains stable
export const QuoteBox = memo(({ quote, attribution }: QuoteBoxProps) => {
  return (
    <div className="p-6">
      <blockquote className={`${newsprintTextStyles.body} text-lg lg:text-xl italic mb-3 leading-relaxed`}>
        "{quote}"
      </blockquote>
      {attribution && (
        <div className={`text-right ${newsprintTextStyles.metadata} font-semibold`}>
          — {attribution}
        </div>
      )}
    </div>
  );
});

QuoteBox.displayName = 'QuoteBox';
