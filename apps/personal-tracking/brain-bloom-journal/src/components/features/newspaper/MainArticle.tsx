import { memo } from 'react';
import { newsprintTextStyles } from '@/lib';
import { DropCap } from './primitives/DropCap';
import { NewsprintCard, NewsprintCardHeader, NewsprintCardContent } from '@/components/ui';

interface MainArticleProps {
  headline: string;
  byline: string;
  date: string;
  content: string;
  imageCaption: string;
  additionalContent: string;
}

// Memoized to prevent re-renders when parent state changes but article content remains stable
export const MainArticle = memo(({
  headline, 
  byline, 
  date, 
  content, 
  imageCaption, 
  additionalContent 
}: MainArticleProps) => {
  const firstLetter = content.charAt(0);
  const restOfContent = content.slice(1);

  return (
    <NewsprintCard variant="article" className="hard-shadow-hover">
      <NewsprintCardHeader>
        <h2 className={`${newsprintTextStyles.h2} mb-4`}>
          {headline}
        </h2>
        <div className={`${newsprintTextStyles.metadata} mb-6`}>
          {byline} | {date}
        </div>
      </NewsprintCardHeader>
      <NewsprintCardContent>
        <p className={`${newsprintTextStyles.bodyJustified} mb-6`}>
          <DropCap letter={firstLetter} />
          {restOfContent}
        </p>
        <div className={`bg-newsprint-neutral-200 border border-newsprint-border sharp-corners h-48 flex items-center justify-center mb-6 newsprint-halftone`}>
          <span className={`${newsprintTextStyles.caption} italic`}>
            {imageCaption}
          </span>
        </div>
        <p className={`${newsprintTextStyles.bodyJustified}`}>
          {additionalContent}
        </p>
      </NewsprintCardContent>
    </NewsprintCard>
  );
});

MainArticle.displayName = 'MainArticle';
