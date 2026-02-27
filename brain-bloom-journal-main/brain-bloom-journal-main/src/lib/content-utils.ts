import type { Message } from '@/types';

/**
 * Shared content utility functions for newspaper generators
 * Consolidates common text processing operations
 */

/**
 * Sanitizes content by removing potentially unsafe characters
 * and optionally truncating to a maximum length
 */
export const sanitizeContent = (text: string, maxLength?: number): string => {
  const sanitized = text.replace(/[<>]/g, '');
  
  if (maxLength && sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + "...";
  }
  
  if (sanitized.length > 150) {
    return sanitized.substring(0, 150) + "...";
  }
  
  return sanitized;
};

/**
 * Finds the longest message in an array of messages
 * Useful for determining the most substantial entry
 */
export const findLongestMessage = <T extends Message>(messages: T[]): T => {
  return messages.reduce((prev, current) => 
    current.text.length > prev.text.length ? current : prev
  );
};
