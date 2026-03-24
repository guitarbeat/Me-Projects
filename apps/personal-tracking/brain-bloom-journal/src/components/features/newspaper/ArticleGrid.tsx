import { memo } from 'react';
import { newsprintTextStyles } from '@/lib';
import { NewsprintCard, NewsprintCardHeader, NewsprintCardTitle, NewsprintCardContent } from '@/components/ui';

interface Article {
  title: string;
  content: string;
}

interface ArticleGridProps {
  articles: Article[];
}

// Memoized to prevent re-renders when parent state changes but articles list remains stable
export const ArticleGrid = memo(({ articles }: ArticleGridProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 mb-12`}>
      {articles.map((article, index) => {
        const isLastInRow = (index + 1) % 3 === 0;
        const isLastRow = index >= articles.length - (articles.length % 3 || 3);
        
        return (
          <NewsprintCard
            key={index}
            variant="column"
            className={`newsprint-texture ${isLastInRow ? '' : 'border-r'} ${isLastRow ? '' : 'border-b'}`}
          >
            <NewsprintCardHeader>
              <span className={`${newsprintTextStyles.metadata} mb-2`}>
                ARTICLE {index + 1}
              </span>
              <NewsprintCardTitle className="text-xl lg:text-2xl">
                {article.title}
              </NewsprintCardTitle>
            </NewsprintCardHeader>
            <NewsprintCardContent>
              <p className={`${newsprintTextStyles.body} text-sm text-justify`}>
                {article.content}
              </p>
            </NewsprintCardContent>
          </NewsprintCard>
        );
      })}
    </div>
  );
});

ArticleGrid.displayName = 'ArticleGrid';
