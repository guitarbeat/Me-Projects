import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface NavigationHeaderProps {
  title?: string;
  showTitle?: boolean;
  children?: React.ReactNode;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title = 'Flo & Tell',
  showTitle = false,
  children,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b transition-shadow duration-200 pt-safe',
        isScrolled
          ? 'border-border/50 shadow-sm shadow-foreground/5'
          : 'border-transparent shadow-none'
      )}
    >
      <div
        className="w-full h-14 flex items-center justify-between min-h-[56px] smooth-resize"
        style={{
          paddingInline: 'var(--header-padding)',
          gap: 'var(--space-sm)',
        }}
      >
        {/* Left side - Logo, Title, or children */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/flo.png"
            alt="Flo & Tell"
            className="w-8 h-8 shrink-0 transition-transform duration-200 hover:scale-110 hover:rotate-3"
          />
          {showTitle && (
            <h1 className="text-lg font-comfortaa font-semibold gradient-text truncate">
              {title}
            </h1>
          )}
          {children}
        </div>

        {/* Right side - Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-pressed={isDarkMode}
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="shrink-0 icon-interactive hover:bg-accent/50"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>
    </header>
  );
};
