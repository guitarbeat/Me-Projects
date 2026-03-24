/**
 * Centralized type definitions for retrospectives
 * Single source of truth for the entire application
 */

/**
 * Message in a retrospective conversation
 */
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * Retrospective entry from the database
 */
export interface Retrospective {
  id: string;
  title: string;
  content: RetrospectiveContent | null;
  retrospective_date: string;
  retrospective_type: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Content structure stored in a retrospective
 */
export interface RetrospectiveContent {
  messages: Message[];
  structuredData?: StructuredRetrospectiveData;
  last_edited?: string;
}

/**
 * AI-analyzed structured data for a retrospective
 */
export interface StructuredRetrospectiveData {
  summary?: string;
  themes?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  keyInsights?: string[];
  actionItems?: string[];
}

/**
 * Generated newspaper content from retrospective messages
 */
export interface NewspaperContent {
  weekRange: string;
  highlights: Array<{ category: string; description: string }>;
  mainHeadline: string;
  longestMessage: Message;
  articles: Array<{ title: string; content: string }>;
  quote: string;
}

/**
 * Props for NewspaperRetrospective component
 */
export interface NewspaperRetrospectiveProps {
  messages: Message[];
  structuredData?: StructuredRetrospectiveData;
  className?: string;
  isMobile?: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  onSaveEdit?: (updatedMessages: Message[]) => Promise<void>;
}

/**
 * Select item for retrospectives dropdown
 */
export interface RetrospectiveSelectItem {
  id: string;
  title: string;
}
