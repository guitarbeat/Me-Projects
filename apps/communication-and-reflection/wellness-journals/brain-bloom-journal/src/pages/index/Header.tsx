import { memo } from 'react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui';
import { Brain, Command as CommandIcon } from '@/lib/icons/icon-imports';
import { ThemeToggle } from '@/components/features/theme';
import { OnlineStatusBadge } from '@/components/common';
import { useOnlineStatus } from '@/hooks';
import { newsprintTextStyles } from '@/lib';
import type { ViewMode } from '@/hooks/features/index';
import {
  getNavigationIcon,
  getNavigationItems,
  getNavigationLabel,
} from '@/components/features/navigation/navigation-config';

interface HeaderProps {
  isMobile: boolean;
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenCommandPalette: () => void;
}

const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'short', 
  month: 'short', 
  day: 'numeric' 
}).toUpperCase();

export const Header = memo<HeaderProps>(({ 
  isMobile,
  viewMode,
  onViewChange,
  onOpenCommandPalette,
}) => {
  const isOnline = useOnlineStatus();
  const desktopNavItems = getNavigationItems('desktop');

  return (
    <header className={`sticky top-0 z-30 bg-newsprint-bg ${isMobile ? 'safe-top' : ''}`}>
      <div className="h-0.5 bg-newsprint-foreground" />
      
      <div className={`${isMobile ? 'container-mobile' : 'container mx-auto px-6'}`}>
        {/* Compact Masthead */}
        <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'py-3'} border-b border-newsprint-border`}>
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-newsprint-foreground sharp-corners">
              <Brain className="h-4 w-4 text-newsprint-bg" />
            </div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-newsprint-serif font-black tracking-tight uppercase`}>
              Tampana
            </h1>
            <span className={`${newsprintTextStyles.metadata} text-xs hidden sm:inline`}>
              {currentDate}
            </span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <OnlineStatusBadge isOnline={isOnline} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="newsprint-ghost"
                  size={isMobile ? "icon" : "sm"}
                  onClick={onOpenCommandPalette}
                  className={isMobile ? "h-8 w-8" : "text-xs font-newsprint-mono"}
                  aria-label="Open command palette"
                >
                  {isMobile ? (
                    <CommandIcon className="h-4 w-4" />
                  ) : (
                    "⌘K"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Command Palette <span className="text-muted-foreground ml-1">⌘K</span></p>
              </TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Navigation - Desktop Only */}
        {!isMobile && (
          <div className="flex items-center gap-0 py-1.5">
            {desktopNavItems.map((item) => {
              const Icon = getNavigationIcon(item, 'desktop');
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-newsprint-sans transition-colors ${
                    isActive 
                      ? 'bg-newsprint-foreground text-newsprint-bg' 
                      : 'text-newsprint-foreground hover:bg-newsprint-neutral-100'
                  } sharp-corners`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {getNavigationLabel(item, 'desktop')}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="h-px bg-newsprint-border" />
    </header>
  );
});

Header.displayName = 'Header';
