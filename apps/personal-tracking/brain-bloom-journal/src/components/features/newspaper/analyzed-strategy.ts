import type { Message } from './types';
import { sanitizeContent } from '@/lib/content-utils';
import { 
  BaseNewspaperGenerator, 
  type HighlightItem, 
  type ArticleItem,
  limitArticles 
} from './base-generator';

/**
 * Strategy for generating newspaper content from text analysis
 * Analyzes raw message text to extract insights
 */
export class AnalyzedContentGenerator extends BaseNewspaperGenerator {
  private allText: string;

  constructor(userMessages: Message[], weekRange: string) {
    super(userMessages, weekRange);
    this.allText = userMessages.map(msg => msg.text).join(' ').toLowerCase();
  }

  protected generateHighlights(): HighlightItem[] {
    const highlights: HighlightItem[] = [];
    
    const keywordMappings: Array<{
      keywords: string[];
      category: string;
      description: string;
    }> = [
      {
        keywords: ['work', 'job', 'project'],
        category: 'Accomplishment:',
        description: 'Made significant progress on work projects'
      },
      {
        keywords: ['friend', 'family', 'social'],
        category: 'Social:',
        description: 'Connected with important people in my life'
      },
      {
        keywords: ['exercise', 'workout', 'health'],
        category: 'Health:',
        description: 'Maintained focus on physical wellbeing'
      },
      {
        keywords: ['learn', 'study', 'read'],
        category: 'Learning:',
        description: 'Engaged in personal development activities'
      },
      {
        keywords: ['feel', 'think', 'reflect'],
        category: 'Personal:',
        description: 'Took time for self-reflection and growth'
      }
    ];

    for (const { keywords, category, description } of keywordMappings) {
      if (keywords.some(keyword => this.allText.includes(keyword))) {
        highlights.push({ category, description });
      }
    }

    // Fallback highlights if none were found
    if (highlights.length === 0) {
      highlights.push(
        { 
          category: 'Reflection:', 
          description: 'Engaged in meaningful self-reflection' 
        },
        { 
          category: 'Awareness:', 
          description: 'Developed greater self-awareness through journaling' 
        }
      );
    }

    return highlights;
  }

  protected generateHeadline(): string {
    const headlineMappings: Array<{
      keywords: string[];
      headline: string;
    }> = [
      {
        keywords: ['work'],
        headline: 'Significant Professional Developments This Week'
      },
      {
        keywords: ['feel', 'emotion'],
        headline: 'Personal Growth and Emotional Insights'
      },
      {
        keywords: ['goal', 'plan'],
        headline: 'Progress Toward Important Goals'
      }
    ];

    for (const { keywords, headline } of headlineMappings) {
      if (keywords.some(keyword => this.allText.includes(keyword))) {
        return headline;
      }
    }

    return 'Weekly Reflections and Personal Insights';
  }

  protected generateArticles(): ArticleItem[] {
    const themes = [
      'Daily Observations',
      'Mindful Moments',
      'Personal Insights',
      'Weekly Highlights',
      'Reflective Thoughts',
      'Life Updates'
    ];

    const articles = this.userMessages.slice(0, 6).map((message, index) => ({
      title: themes[index] || `Reflection #${index + 1}`,
      content: sanitizeContent(message.text)
    }));

    return limitArticles(articles, 6);
  }

  protected generateQuote(): string {
    // Find a thoughtful message based on keywords
    const thoughtfulKeywords = ['feel', 'think', 'realize'];
    
    const thoughtfulMessage = this.userMessages.find(msg =>
      thoughtfulKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))
    ) || this.userMessages[0];

    if (!thoughtfulMessage) {
      return '';
    }

    return sanitizeContent(thoughtfulMessage.text, 100);
  }
}
