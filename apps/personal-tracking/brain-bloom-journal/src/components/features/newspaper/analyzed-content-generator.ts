import type { Message, NewspaperContent } from './types';
import { AnalyzedContentGenerator } from './analyzed-strategy';

/**
 * Generates newspaper content from text analysis
 * Uses Strategy pattern with AnalyzedContentGenerator
 */
export const generateAnalyzedContent = (
  userMessages: Message[],
  weekRange: string
): NewspaperContent => {
  const generator = new AnalyzedContentGenerator(userMessages, weekRange);
  return generator.generate();
};
