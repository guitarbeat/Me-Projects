import type { Message } from './types';
import { sanitizeContent } from '@/lib/content-utils';
import { 
  BaseNewspaperGenerator, 
  type HighlightItem, 
  type ArticleItem,
  fillArticleSlots,
  limitArticles 
} from './base-generator';

/**
 * Strategy for generating newspaper content from structured data
 * Uses parsed/structured data from AI analysis
 */
export class StructuredContentGenerator extends BaseNewspaperGenerator {
  private structuredData: any;

  constructor(userMessages: Message[], structuredData: any, weekRange: string) {
    super(userMessages, weekRange);
    this.structuredData = structuredData;
  }

  protected generateHighlights(): HighlightItem[] {
    const highlights: HighlightItem[] = [];
    
    const highlightMappings: Array<{
      key: keyof typeof this.structuredData;
      category: string;
      limit?: number;
    }> = [
      { key: 'accomplishments', category: 'Accomplishments:', limit: 2 },
      { key: 'challenges', category: 'Challenges:', limit: 2 },
      { key: 'emotions', category: 'Emotional State:', limit: 2 },
      { key: 'tomorrow_goals', category: "Tomorrow's Focus:", limit: 2 },
      { key: 'insights', category: 'Key Insights:', limit: 2 },
      { key: 'gratitude', category: 'Gratitude:', limit: 2 }
    ];

    for (const { key, category, limit } of highlightMappings) {
      const items = this.structuredData[key];
      if (Array.isArray(items) && items.length > 0) {
        const description = limit 
          ? items.slice(0, limit).join('; ')
          : items.join('; ');
        highlights.push({ category, description });
      }
    }

    // Add weather if present (non-array field)
    if (this.structuredData.weather) {
      highlights.push({
        category: 'Weather:',
        description: this.structuredData.weather
      });
    }

    return highlights;
  }

  protected generateHeadline(): string {
    if (this.structuredData.overall_mood) {
      const mood = this.structuredData.overall_mood;
      return `Daily Reflection: ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
    }
    
    if (this.structuredData.key_themes?.length > 0) {
      return `Weekly Focus: ${this.structuredData.key_themes[0]}`;
    }
    
    return 'Personal Growth and Daily Insights';
  }

  protected generateArticles(): ArticleItem[] {
    const articles: ArticleItem[] = [];
    
    const articleMappings: Array<{
      key: keyof typeof this.structuredData;
      title: string;
    }> = [
      { key: 'accomplishments', title: 'What I Accomplished' },
      { key: 'challenges', title: 'Challenges Faced' },
      { key: 'tomorrow_goals', title: 'Looking Ahead' },
      { key: 'insights', title: 'Personal Insights' }
    ];

    for (const { key, title } of articleMappings) {
      const items = this.structuredData[key];
      if (Array.isArray(items) && items.length > 0) {
        articles.push({
          title,
          content: items.join('. ') + '.'
        });
      }
    }

    // Fill remaining slots with user messages
    const articlesWithMessages = fillArticleSlots(
      articles,
      this.userMessages.map(msg => ({ ...msg, text: sanitizeContent(msg.text) })),
      6,
      'Reflection'
    );

    return limitArticles(articlesWithMessages, 6);
  }

  protected generateQuote(): string {
    // Priority order for quote selection
    if (this.structuredData.gratitude?.[0]) {
      return this.structuredData.gratitude[0];
    }
    
    if (this.structuredData.insights?.[0]) {
      return this.structuredData.insights[0];
    }
    
    if (this.userMessages[0]?.text) {
      return sanitizeContent(this.userMessages[0].text, 100);
    }
    
    return '';
  }
}
