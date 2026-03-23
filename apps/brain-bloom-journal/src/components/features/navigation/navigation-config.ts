import type { LucideIcon } from '@/lib/icons/icon-imports';
import { MessageSquare, BookOpen } from '@/lib/icons/icon-imports';
import type { ViewMode } from '@/hooks/features';

export type NavigationContext = 'desktop' | 'mobileMenu' | 'mobileNav';

export interface NavigationItem {
  id: ViewMode;
  icon: LucideIcon;
  label: string;
  labelOverrides?: Partial<Record<NavigationContext, string>>;
  iconOverrides?: Partial<Record<NavigationContext, LucideIcon>>;
  showIn?: NavigationContext[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'compose',
    icon: MessageSquare,
    label: 'Compose',
  },
  {
    id: 'archive',
    icon: BookOpen,
    label: 'Archive',
  },
];

export const getNavigationItems = (context: NavigationContext) =>
  NAVIGATION_ITEMS.filter((item) => !item.showIn || item.showIn.includes(context));

export const getNavigationLabel = (item: NavigationItem, context: NavigationContext) =>
  item.labelOverrides?.[context] ?? item.label;

export const getNavigationIcon = (item: NavigationItem, context: NavigationContext) =>
  item.iconOverrides?.[context] ?? item.icon;