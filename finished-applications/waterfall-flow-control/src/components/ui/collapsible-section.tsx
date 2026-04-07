import { useState, useEffect, ReactNode } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Surface,
  SurfaceHeader,
  SurfaceTitle,
  SurfaceContent,
} from './surface';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useMobile';

interface CollapsibleSectionProps {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  /** Badge to show next to title (e.g., count) */
  badge?: string | number;
  /** Subtitle shown when collapsed (e.g., summary value) */
  collapsedSubtitle?: string;
  /** Visual tint based on content type */
  tint?: 'positive' | 'negative' | 'neutral';
}

export const CollapsibleSection = ({
  title,
  storageKey,
  defaultOpen = true,
  children,
  headerAction,
  className,
  badge,
  collapsedSubtitle,
  tint = 'neutral',
}: CollapsibleSectionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(`dashboard.sections.${storageKey}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(`dashboard.sections.${storageKey}`, String(isOpen));
  }, [isOpen, storageKey]);

  const tintClasses = {
    positive: 'hover:bg-primary/5 active:bg-primary/10',
    negative: 'hover:bg-destructive/5 active:bg-destructive/10',
    neutral: 'hover:bg-muted/30 active:bg-muted/50',
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
    >
      <Surface variant="glow" padding="compact">
        <Collapsible.Trigger asChild>
          <SurfaceHeader
            className={cn(
              'cursor-pointer select-none transition-all rounded-t-lg -mx-4 -mt-4 px-4 pt-4 pb-3',
              tintClasses[tint],
              // Mobile: Larger tap target with active scale feedback
              isMobile && 'min-h-[56px] flex items-center active:scale-[0.99]'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <SurfaceTitle className="flex items-center gap-2">
                <ChevronDown
                  className={cn(
                    'text-muted-foreground transition-transform duration-200',
                    // Mobile: Larger chevron
                    isMobile ? 'h-5 w-5' : 'h-4 w-4',
                    isOpen && 'rotate-0',
                    !isOpen && '-rotate-90'
                  )}
                />
                <span className={cn(isMobile && 'text-base')}>{title}</span>
                {/* Badge */}
                {badge !== undefined && (
                  <span
                    className={cn(
                      'ml-1 px-1.5 py-0.5 font-medium rounded-full',
                      isMobile ? 'text-xs' : 'text-[10px]',
                      'bg-muted/50 text-muted-foreground',
                      tint === 'positive' && 'bg-primary/10 text-primary',
                      tint === 'negative' &&
                        'bg-destructive/10 text-destructive'
                    )}
                  >
                    {badge}
                  </span>
                )}
                {/* Collapsed subtitle */}
                {!isOpen && collapsedSubtitle && (
                  <span
                    className={cn(
                      'ml-2 font-normal text-muted-foreground',
                      isMobile ? 'text-sm' : 'text-xs'
                    )}
                  >
                    {collapsedSubtitle}
                  </span>
                )}
              </SurfaceTitle>
              {headerAction && (
                <div onClick={e => e.stopPropagation()}>{headerAction}</div>
              )}
            </div>
          </SurfaceHeader>
        </Collapsible.Trigger>

        <Collapsible.Content
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up',
            // Blur effect during collapse (only when not reduced motion)
            !prefersReducedMotion && 'data-[state=closed]:blur-[2px]'
          )}
        >
          <SurfaceContent className="pt-2">{children}</SurfaceContent>
        </Collapsible.Content>
      </Surface>
    </Collapsible.Root>
  );
};
