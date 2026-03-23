import { Brain, Calendar, BookOpen, type LucideIcon } from '@/lib/icons/icon-imports';

/**
 * Centralized type-to-icon and type-to-color mappings
 * Uses semantic newsprint tokens from design system
 */

type EntryType = 'daily' | 'weekly' | 'monthly';

export const typeIcons: Record<EntryType, LucideIcon> = {
  daily: BookOpen,
  weekly: Brain,
  monthly: Calendar,
};

// Using semantic newsprint design tokens
export const typeColors: Record<EntryType, string> = {
  daily: 'bg-newsprint-foreground/10 text-newsprint-foreground border-newsprint-foreground/20',
  weekly: 'bg-newsprint-accent/10 text-newsprint-accent border-newsprint-accent/20',
  monthly: 'bg-newsprint-neutral-200 text-newsprint-foreground border-newsprint-border',
};

export const getTypeIcon = (type: string): LucideIcon => {
  return typeIcons[type as EntryType] ?? BookOpen;
};

export const getTypeColor = (type: string): string => {
  return typeColors[type as EntryType] ?? typeColors.daily;
};
