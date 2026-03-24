import { memo } from 'react';
import { Brain } from '@/lib/icons/icon-imports';
import { NewsprintCard, NewsprintCardHeader, NewsprintCardTitle, NewsprintCardContent } from '@/components/ui';
import { newsprintTextStyles, newsprintLayoutStyles } from '@/lib';

interface EmptyNewspaperStateProps {
  isMobile?: boolean;
}

export const EmptyNewspaperState = memo<EmptyNewspaperStateProps>(({ isMobile = false }) => (
  <div className={`${newsprintLayoutStyles.container} min-h-screen flex items-center justify-center py-16 newsprint-dot-grid`}>
    <div className={`text-center ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
      <div className={`p-4 bg-newsprint-foreground sharp-corners w-fit mx-auto mb-6`}>
        <Brain className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-newsprint-bg`} />
      </div>
      <h2 className={`${newsprintTextStyles.h2} mb-4`}>
        NO NEWSPAPER YET
      </h2>
      <p className={`${newsprintTextStyles.body} mb-6`}>
        Start journaling to create your first newspaper-style retrospective. Share your thoughts, feelings, and experiences in the chat to get started.
      </p>
      <NewsprintCard variant="default">
        <NewsprintCardHeader>
          <NewsprintCardTitle className="text-xl mb-2">
            HOW IT WORKS:
          </NewsprintCardTitle>
        </NewsprintCardHeader>
        <NewsprintCardContent>
          <ul className={`${newsprintTextStyles.body} text-sm space-y-2 text-left`}>
            <li>• Share your thoughts in the chat interface</li>
            <li>• Our AI responds with thoughtful questions</li>
            <li>• Click "Generate Newspaper" to create your retrospective</li>
            <li>• View your journey in a beautiful newspaper format</li>
          </ul>
        </NewsprintCardContent>
      </NewsprintCard>
    </div>
  </div>
));

EmptyNewspaperState.displayName = 'EmptyNewspaperState';
