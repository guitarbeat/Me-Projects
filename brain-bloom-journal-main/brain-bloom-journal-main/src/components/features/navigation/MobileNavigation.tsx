import { memo } from 'react';
import type { ViewMode } from '@/hooks/features';
import {
  getNavigationIcon,
  getNavigationItems,
  getNavigationLabel,
} from './navigation-config';

interface MobileNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const MobileNavigation = memo<MobileNavigationProps>(({
  currentView,
  onViewChange,
  className = ''
}) => {
  const navItems = getNavigationItems('mobileNav');

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-newsprint-bg border-t-2 border-newsprint-foreground flex justify-around py-2 px-4 z-40 ${className}`}>
      {navItems.map((item) => {
        const Icon = getNavigationIcon(item, 'mobileNav');
        const label = getNavigationLabel(item, 'mobileNav');
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors duration-200 ${
              isActive 
                ? 'bg-newsprint-foreground text-newsprint-bg' 
                : 'text-newsprint-foreground hover:bg-newsprint-neutral-100'
            } sharp-corners`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-newsprint-sans uppercase tracking-wider mt-1">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
});

MobileNavigation.displayName = 'MobileNavigation';