// Newspaper feature module - barrel exports
// Unified module for all newspaper-related components

// Main presentation components
export { NewspaperRetrospective } from './NewspaperRetrospective';
export { NewspaperHeader } from './NewspaperHeader';
export { NewspaperActions } from './NewspaperActions';
export { MainArticle } from './MainArticle';
export { ArticleGrid } from './ArticleGrid';
export { QuoteBox } from './QuoteBox';
export { SectionHeader } from './SectionHeader';
export { EmptyNewspaperState } from './EmptyNewspaperState';

// Design primitives
export { DropCap } from './primitives/DropCap';
export { EditionMetadata } from './primitives/EditionMetadata';
export { BreakingNewsTicker, generateTickerItems } from './primitives/BreakingNewsTicker';
export { SidebarHighlights } from './primitives/SidebarHighlights';

// Content generation
export { generateNewspaperContent } from './content-generator';

// Utilities
export { getWeekRange } from '@/lib';

// Types
export type { Message, NewspaperContent, NewspaperRetrospectiveProps } from './types';
export type { Highlight, SidebarHighlightsProps } from './primitives/types';
