import type { Message, NewspaperContent } from './types';
import { StructuredContentGenerator } from './structured-strategy';

/**
 * Generates newspaper content from structured data
 * Uses Strategy pattern with StructuredContentGenerator
 */
export const generateStructuredContent = (
  userMessages: Message[],
  structuredData: any,
  weekRange: string
): NewspaperContent => {
  const generator = new StructuredContentGenerator(userMessages, structuredData, weekRange);
  return generator.generate();
};
