import type { Message, NewspaperContent } from './types';
import { generateStructuredContent } from './structured-content-generator';
import { generateAnalyzedContent } from './analyzed-content-generator';
import { getWeekRange } from '@/lib';

export const generateNewspaperContent = (
  userMessages: Message[],
  structuredData?: any
): NewspaperContent => {
  const weekRange = getWeekRange();
  
  if (structuredData) {
    return generateStructuredContent(userMessages, structuredData, weekRange);
  }

  return generateAnalyzedContent(userMessages, weekRange);
};
