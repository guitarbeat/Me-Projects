import { memo } from 'react';
import { newsprintTextStyles } from '@/lib';
import { EditionMetadata } from './primitives/EditionMetadata';

interface NewspaperHeaderProps {
  title: string;
  tagline: string;
  weekRange: string;
  volumeIssue: string;
}

// Memoized to prevent re-renders when parent state (like editing) changes but header data remains stable
export const NewspaperHeader = memo(({ title, tagline, weekRange, volumeIssue }: NewspaperHeaderProps) => {
  // Parse volumeIssue string like "Volume 1, Issue 42" to extract volume and issue
  const volumeMatch = volumeIssue.match(/Volume\s+(\d+)/i);
  const issueMatch = volumeIssue.match(/Issue\s+(\d+)/i);
  const volume = volumeMatch ? volumeMatch[1] : undefined;
  const issue = issueMatch ? issueMatch[1] : undefined;

  return (
    <header className={`text-center mb-12 pb-8 border-b-4 border-newsprint-foreground`}>
      <h1 className={`${newsprintTextStyles.h1} mb-4`}>
        {title}
      </h1>
      <p className={`font-newsprint-body text-lg md:text-xl italic text-newsprint-neutral-500 mb-6`}>
        {tagline}
      </p>
      <div className={`flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto mb-6`}>
        <span className={`${newsprintTextStyles.metadata} mb-2 md:mb-0`}>{weekRange}</span>
        {volume && issue && (
          <EditionMetadata
            volume={volume}
            issue={issue}
            className="mb-2 md:mb-0"
          />
        )}
        {!volume && !issue && (
          <span className={`${newsprintTextStyles.metadata} bg-newsprint-foreground text-newsprint-bg sharp-corners px-2 py-1`}>
            {volumeIssue}
          </span>
        )}
      </div>
    </header>
  );
});

NewspaperHeader.displayName = 'NewspaperHeader';
