import type { Message, NewspaperContent } from './types';
import { findLongestMessage } from '@/lib/content-utils';

/**
 * Base class for newspaper content generation
 * Implements Template Method pattern with Strategy pattern
 */
export abstract class BaseNewspaperGenerator {
  protected userMessages: Message[];
  protected weekRange: string;

  constructor(userMessages: Message[], weekRange: string) {
    this.userMessages = userMessages;
    this.weekRange = weekRange;
  }

  /**
   * Template method - defines the overall algorithm
   */
  generate(): NewspaperContent {
    return {
      weekRange: this.weekRange,
      highlights: this.generateHighlights(),
      mainHeadline: this.generateHeadline(),
      longestMessage: this.findLongestMessage(),
      articles: this.generateArticles(),
      quote: this.generateQuote()
    };
  }

  /**
   * Common implementation - finds longest message
   */
  protected findLongestMessage(): Message {
    return findLongestMessage(this.userMessages);
  }

  /**
   * Strategy methods - must be implemented by subclasses
   */
  protected abstract generateHighlights(): Array<{ category: string; description: string }>;
  protected abstract generateHeadline(): string;
  protected abstract generateArticles(): Array<{ title: string; content: string }>;
  protected abstract generateQuote(): string;
}

/**
 * Interface for highlight generation
 */
export interface HighlightItem {
  category: string;
  description: string;
}

/**
 * Interface for article generation
 */
export interface ArticleItem {
  title: string;
  content: string;
}

/**
 * Utility function to ensure articles don't exceed maximum
 */
export const limitArticles = (articles: ArticleItem[], max: number = 6): ArticleItem[] => {
  return articles.slice(0, max);
};

/**
 * Utility function to fill remaining article slots with messages
 */
export const fillArticleSlots = (
  existingArticles: ArticleItem[],
  messages: Message[],
  maxTotal: number = 6,
  titlePrefix: string = 'Reflection'
): ArticleItem[] => {
  const remainingSlots = maxTotal - existingArticles.length;
  
  if (remainingSlots <= 0) {
    return existingArticles;
  }

  const fillerArticles = messages.slice(0, remainingSlots).map((message, index) => ({
    title: `${titlePrefix} ${index + 1}`,
    content: message.text
  }));

  return [...existingArticles, ...fillerArticles];
};
