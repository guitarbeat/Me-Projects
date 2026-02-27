import { memo } from 'react';
import { newsprintTextStyles, newsprintSeparatorStyles } from '@/lib';
import { NewsprintCard, NewsprintCardHeader, NewsprintCardTitle, NewsprintCardContent } from '@/components/ui/newsprint-card';
import type { SidebarHighlightsProps } from './types';

export const SidebarHighlights = memo<SidebarHighlightsProps>(({ highlights }) => {
  return (
    <NewsprintCard variant="default" className="newsprint-texture">
      <NewsprintCardHeader>
        <NewsprintCardTitle className="text-xl mb-4">
          THIS WEEK'S HIGHLIGHTS
        </NewsprintCardTitle>
        <div className={newsprintSeparatorStyles.default} />
      </NewsprintCardHeader>
      <NewsprintCardContent>
        <div className="space-y-4">
          {highlights.map((highlight, index) => (
            <div 
              key={index} 
              className={`pb-4 border-b border-newsprint-border last:border-b-0`}
            >
              <span className={`${newsprintTextStyles.label} font-semibold`}>
                {highlight.category}
              </span>{" "}
              <span className={newsprintTextStyles.body + " text-sm"}>
                {highlight.description}
              </span>
            </div>
          ))}
        </div>
      </NewsprintCardContent>
    </NewsprintCard>
  );
});

SidebarHighlights.displayName = 'SidebarHighlights';
