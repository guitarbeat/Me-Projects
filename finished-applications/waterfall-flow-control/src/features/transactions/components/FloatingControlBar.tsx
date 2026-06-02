import { ReactNode, useState, useRef, useEffect } from 'react';
import { Download, Upload, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/useMobile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

interface FloatingControlBarProps {
  onExport?: () => void;
  onImport?: () => void;
  onProfile?: () => void;
  exportDisabled?: boolean;
  centerSlot?: ReactNode;
}

interface ControlButtonProps {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  isMobile?: boolean;
}

const ControlButton = ({
  icon,
  label,
  shortcut,
  onClick,
  disabled,
  isMobile,
}: ControlButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-full transition-colors duration-150',
            'hover:bg-foreground/8',
            disabled && 'opacity-40 cursor-not-allowed',
            isMobile ? 'h-10 w-10 p-0' : 'h-7 w-7 p-0'
          )}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {icon}
        </Button>
      </motion.div>
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs flex items-center gap-1.5">
      {label}
      {shortcut && !isMobile && (
        <kbd className="px-1 py-0.5 text-[9px] font-mono bg-muted rounded text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </TooltipContent>
  </Tooltip>
);

const GripPill = ({ expanded }: { expanded: boolean }) => (
  <motion.div
    className="flex items-center justify-center"
    animate={{ opacity: expanded ? 0.35 : 0.7 }}
    transition={{ duration: 0.15 }}
  >
    <motion.div
      className="rounded-full bg-foreground/25"
      animate={{
        width: expanded ? 20 : 28,
        height: 3,
      }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    />
  </motion.div>
);

export const FloatingControlBar = ({
  onExport,
  onImport,
  onProfile,
  exportDisabled = false,
  centerSlot,
}: FloatingControlBarProps) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { isFirstVisit, markAsSeen } = useFirstVisit('controlBar');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to collapse on mobile
  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, isExpanded]);

  // Desktop: hover behavior with delay
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  // Mobile: tap to toggle
  const handleTap = () => {
    if (isMobile) {
      setIsExpanded(prev => !prev);
      if (isFirstVisit) markAsSeen();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 30 };

  return (
    <motion.div
      ref={barRef}
      role="toolbar"
      aria-label="Dashboard controls"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      layout
      transition={springTransition}
      className={cn(
        'fixed z-50',
        'flex flex-col items-center justify-center',
        'border shadow-lg',
        'pb-safe',
        isMobile ? 'bottom-2 left-6 right-6' : 'bottom-3',
        isExpanded
          ? cn(
              'bg-background/85 backdrop-blur-xl border-border/40 rounded-xl py-2 px-3',
              !isMobile && 'left-1/2 -translate-x-1/2'
            )
          : cn(
              'bg-background/50 backdrop-blur-md border-border/20 rounded-full py-1.5 px-3 cursor-pointer',
              'left-1/2 -translate-x-1/2',
              'hover:bg-background/70 hover:border-border/40 hover:shadow-lg'
            )
      )}
    >
      {/* Grip pill — always visible */}
      <GripPill expanded={isExpanded} />

      {/* First-visit hint */}
      <AnimatePresence>
        {!isExpanded && isFirstVisit && isMobile && !prefersReducedMotion && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-[10px] text-muted-foreground mt-0.5"
          >
            Tap to expand
          </motion.span>
        )}
      </AnimatePresence>

      {/* Expanded controls */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
            }
            className="w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {isMobile ? (
              <div className="flex flex-col gap-2 pt-0.5">
                {centerSlot && (
                  <div className="w-full flex justify-center">{centerSlot}</div>
                )}
                <div className="flex items-center justify-around">
                  {onProfile && (
                    <ControlButton
                      icon={<User className="h-5 w-5" />}
                      label="Profile"
                      onClick={onProfile}
                      isMobile
                    />
                  )}
                  {onImport && (
                    <ControlButton
                      icon={<Upload className="h-5 w-5" />}
                      label="Import CSV"
                      onClick={onImport}
                      isMobile
                    />
                  )}
                  {onExport && (
                    <ControlButton
                      icon={<Download className="h-5 w-5" />}
                      label="Export CSV"
                      onClick={onExport}
                      disabled={exportDisabled}
                      isMobile
                    />
                  )}
                  <div className="relative">
                    <ControlButton
                      icon={
                        theme === 'dark' ? (
                          <Sun className="h-5 w-5" />
                        ) : (
                          <Moon className="h-5 w-5" />
                        )
                      }
                      label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      onClick={() => {
                        if (!prefersReducedMotion) {
                          setShowRipple(true);
                          setTimeout(() => setShowRipple(false), 600);
                        }
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                      }}
                      isMobile
                    />
                    {showRipple && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <motion.div
                          className="w-10 h-10 rounded-full bg-primary/30"
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 pt-0.5"
                style={{ minWidth: 280 }}
              >
                {/* Left: Profile */}
                <div className="flex items-center gap-1">
                  {onProfile && (
                    <ControlButton
                      icon={<User className="h-4 w-4" />}
                      label="Profile"
                      onClick={onProfile}
                    />
                  )}
                </div>

                {/* Center: Chart selector */}
                <div className="flex-1 flex justify-center">{centerSlot}</div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                  {onImport && (
                    <ControlButton
                      icon={<Upload className="h-4 w-4" />}
                      label="Import CSV"
                      shortcut="⌘I"
                      onClick={onImport}
                    />
                  )}
                  {onExport && (
                    <ControlButton
                      icon={<Download className="h-4 w-4" />}
                      label="Export CSV"
                      shortcut="⌘E"
                      onClick={onExport}
                      disabled={exportDisabled}
                    />
                  )}
                  <div className="relative">
                    <ControlButton
                      icon={
                        theme === 'dark' ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )
                      }
                      label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      shortcut="⌘D"
                      onClick={() => {
                        if (!prefersReducedMotion) {
                          setShowRipple(true);
                          setTimeout(() => setShowRipple(false), 600);
                        }
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                      }}
                    />
                    {showRipple && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-primary/30"
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
