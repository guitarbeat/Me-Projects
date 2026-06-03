import { ReactNode, useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo, memo } from 'react';
import { useTheme } from 'next-themes';
import {
  Volume2,
  VolumeX,
  Settings2,
  Lock,
  Unlock,
  Download,
  Upload,
  User,
  Moon,
  Sun,
  Plus,
  BarChart3,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// ==========================================
// Types
// ==========================================

export type Detent = 'top' | 'middle' | 'bottom';

export interface SplitSettings {
  snapPoints: { top: boolean; middle: boolean; bottom: boolean };
  magneticStrength: number;
}

export interface SplitLayoutProps {
  topView: ReactNode;
  bottomView: ReactNode;
  topTitle?: string;
  bottomTitle?: string;
  defaultDetent?: Detent;
  onDetentChange?: (d: Detent) => void;
  className?: string;
  onExport?: () => void;
  onImport?: () => void;
  onProfile?: () => void;
  exportDisabled?: boolean;
  /** Slot for center content (e.g., chart selector) - replaces the drag handle when active */
  centerSlot?: ReactNode;
}

const DEFAULT_SETTINGS: SplitSettings = {
  snapPoints: { top: true, middle: true, bottom: true },
  magneticStrength: 40,
};

const SNAP_VALUES: Record<Detent, number> = {
  top: 8,
  middle: 50,
  bottom: 92,
};

const MAGNETIC_RANGE = 6;

// ==========================================
// Utilities & Custom Hooks
// ==========================================

// Find nearest snap point percentage from active ones
const nearestSnapPercent = (n: number, snapPoints: number[]): number => {
  if (snapPoints.length === 0) return 50;
  return snapPoints.reduce(
    (best, sp) => (Math.abs(n - sp) < Math.abs(n - best) ? sp : best),
    snapPoints[0]
  );
};

// Map percentage to detent name for persistence
const percentToDetent = (pct: number): Detent => {
  if (pct <= 20) return 'top';
  if (pct >= 80) return 'bottom';
  return 'middle';
};

// Snap feedback sound - generates a soft click/tick sound
const playSnapSound = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const frequencies = { light: 800, medium: 600, heavy: 400 };
    const durations = { light: 0.03, medium: 0.05, heavy: 0.08 };
    const volumes = { light: 0.08, medium: 0.12, heavy: 0.18 };

    oscillator.frequency.setValueAtTime(frequencies[intensity], ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volumes[intensity], ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durations[intensity]);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durations[intensity]);

    setTimeout(() => ctx.close(), 100);
  } catch {
    // Audio not supported or blocked
  }
};

// Inlined hook to track prefers-reduced-motion media query
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  return prefersReducedMotion;
};

// ==========================================
// Sub-components
// ==========================================

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

const ControlButton = ({
  icon,
  label,
  onClick,
  active,
  disabled,
  className,
}: ControlButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className={cn(
          'p-1 rounded transition-colors hover:bg-foreground/8',
          active && 'text-amber-500',
          disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

interface LeftControlsProps {
  locked: boolean;
  toggleLock: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  settings: SplitSettings;
  updateSettings: (updates: Partial<SplitSettings>) => void;
  enabledSnapCount: number;
  feedbackEnabled: boolean;
  toggleFeedback: () => void;
  prefersReducedMotion: boolean;
  visible: boolean;
}

const LeftControls = ({
  locked,
  toggleLock,
  settingsOpen,
  setSettingsOpen,
  settings,
  updateSettings,
  enabledSnapCount,
  feedbackEnabled,
  toggleFeedback,
  prefersReducedMotion,
  visible,
}: LeftControlsProps) => (
  <div
    className={cn(
      'absolute left-1.5 flex items-center gap-px transition-opacity duration-150',
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    )}
  >
    <ControlButton
      icon={locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
      label={locked ? 'Unlock' : 'Lock'}
      onClick={toggleLock}
      active={locked}
    />

    <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1 rounded transition-colors hover:bg-foreground/8"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          aria-label="Split settings"
        >
          <Settings2 className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 z-[100]" align="start" side="bottom">
        <div className="space-y-2.5">
          <div className="space-y-1">
            <h4 className="font-medium text-[11px]">Snap Points</h4>
            <div className="space-y-0.5">
              {(['top', 'middle', 'bottom'] as const).map(key => {
                const isDisabled = settings.snapPoints[key] && enabledSnapCount <= 1;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`snap-${key}`}
                      checked={settings.snapPoints[key]}
                      disabled={isDisabled}
                      onCheckedChange={checked =>
                        updateSettings({
                          snapPoints: {
                            ...settings.snapPoints,
                            [key]: !!checked,
                          },
                        })
                      }
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={`snap-${key}`}
                      className={cn(
                        'text-[11px] capitalize',
                        isDisabled && 'text-muted-foreground'
                      )}
                    >
                      {key} ({SNAP_VALUES[key]}%)
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Magnetic</Label>
              <span className="text-[9px] text-muted-foreground">{settings.magneticStrength}%</span>
            </div>
            <Slider
              value={[settings.magneticStrength]}
              onValueChange={([value]) => updateSettings({ magneticStrength: value })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>

    {!prefersReducedMotion && (
      <ControlButton
        icon={feedbackEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        label={feedbackEnabled ? 'Sound on' : 'Sound off'}
        onClick={toggleFeedback}
        className={!feedbackEnabled ? 'opacity-40' : undefined}
      />
    )}
  </div>
);

interface RightControlsProps {
  onExport?: () => void;
  onImport?: () => void;
  onProfile?: () => void;
  exportDisabled?: boolean;
  visible: boolean;
}

const RightControls = ({
  onExport,
  onImport,
  onProfile,
  exportDisabled,
  visible,
}: RightControlsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'absolute right-1.5 flex items-center gap-px transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {onExport && (
        <ControlButton
          icon={<Download className="h-3 w-3" />}
          label="Export"
          onClick={onExport}
          disabled={exportDisabled}
        />
      )}

      {onImport && (
        <ControlButton
          icon={<Upload className="h-3 w-3" />}
          label="Import"
          onClick={onImport}
        />
      )}

      {onProfile && (
        <ControlButton
          icon={<User className="h-3 w-3" />}
          label="Profile"
          onClick={onProfile}
        />
      )}

      <ControlButton
        icon={theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
        label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  );
};

interface DragHandleProps {
  drag: boolean;
  active: boolean;
  locked: boolean;
}

const DragHandle = ({ drag, active, locked }: DragHandleProps) => (
  <div
    className={cn(
      'transition-all duration-150',
      drag ? 'scale-x-110' : 'scale-100',
      locked && 'opacity-40'
    )}
  >
    <div
      className={cn(
        'rounded-full transition-all duration-200',
        drag
          ? 'w-7 h-[3px] bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]'
          : active
            ? 'w-6 h-[3px] bg-foreground/30'
            : 'w-5 h-[2.5px] bg-foreground/20',
        locked && 'bg-amber-500/60'
      )}
    />
  </div>
);

interface SnapIndicatorsProps {
  visible: boolean;
  activeSnapPoints: number[];
  currentTop: number;
}

const SnapIndicators = ({
  visible,
  activeSnapPoints,
  currentTop,
}: SnapIndicatorsProps) => {
  if (!visible) return null;

  const nearestSnap = nearestSnapPercent(currentTop, activeSnapPoints);

  return (
    <>
      {activeSnapPoints.map(snapPoint => {
        const isNearest = snapPoint === nearestSnap;
        const distance = Math.abs(currentTop - snapPoint);
        const isClose = distance < 8;

        return (
          <div
            key={snapPoint}
            className={cn(
              'absolute left-0 right-0 z-50 pointer-events-none transition-opacity duration-100',
              isClose ? 'opacity-100' : 'opacity-40'
            )}
            style={{ top: `${snapPoint}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  'absolute left-4 right-4 h-px transition-all duration-100',
                  isNearest && isClose
                    ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    : 'bg-foreground/20'
                )}
              />
              <div
                className={cn(
                  'relative px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-100',
                  isNearest && isClose
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {snapPoint === 50 ? '50%' : snapPoint === 8 ? 'Top' : 'Bottom'}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ==========================================
// State Hook
// ==========================================

interface UseSplitStateProps {
  defaultDetent: Detent;
  onDetentChange?: (d: Detent) => void;
}

const useSplitState = ({
  defaultDetent,
  onDetentChange,
}: UseSplitStateProps) => {
  const [top, setTop] = useState(SNAP_VALUES[defaultDetent]);
  const [drag, setDrag] = useState(false);
  const [hov, setHov] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedbackEnabled, setFeedbackEnabled] = useState(
    () => localStorage.getItem('vs.feedback') !== 'off'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SplitSettings>(() => {
    try {
      const saved = localStorage.getItem('vs.settings');
      return saved
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const prefersReducedMotion = useReducedMotion();
  const r = useRef({
    start: SNAP_VALUES[defaultDetent],
    y: 0,
    v: 0,
    t: 0,
    ing: false,
    last: SNAP_VALUES[defaultDetent],
    lastCrossedSnap: -1,
  });

  // Sync lock state from localStorage before first paint
  useLayoutEffect(() => {
    const savedLocked = localStorage.getItem('vs.locked') === 'true';
    if (savedLocked) setLocked(true);
  }, []);

  // Load saved detent
  useEffect(() => {
    const s = localStorage.getItem('vs.d') as Detent | null;
    if (s && s in SNAP_VALUES) setTop(SNAP_VALUES[s]);
  }, []);

  // Compute active snap points from settings
  const activeSnapPoints = useMemo(() => {
    const points: number[] = [];
    if (settings.snapPoints.top) points.push(8);
    if (settings.snapPoints.middle) points.push(50);
    if (settings.snapPoints.bottom) points.push(92);
    return points.length > 0 ? points : [50];
  }, [settings.snapPoints]);

  // Count enabled snap points to prevent disabling last one
  const enabledSnapCount = useMemo(
    () =>
      [
        settings.snapPoints.top,
        settings.snapPoints.middle,
        settings.snapPoints.bottom,
      ].filter(Boolean).length,
    [settings.snapPoints]
  );

  // Magnetic strength from settings (0-100 → 0-1)
  const magneticStrength = settings.magneticStrength / 100;

  // Apply magnetic effect
  const applyMagnetic = useCallback(
    (rawValue: number): number => {
      for (const snapPoint of activeSnapPoints) {
        const distance = Math.abs(rawValue - snapPoint);
        if (distance < MAGNETIC_RANGE && distance > 0.5) {
          const pullStrength = magneticStrength * (1 - distance / MAGNETIC_RANGE);
          const direction = snapPoint > rawValue ? 1 : -1;
          return rawValue + direction * distance * pullStrength;
        }
      }
      return rawValue;
    },
    [activeSnapPoints, magneticStrength]
  );

  // Persist settings
  const updateSettings = useCallback((updates: Partial<SplitSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('vs.settings', JSON.stringify(next));
      return next;
    });
  }, []);

  // Toggle lock
  const toggleLock = useCallback(() => {
    setLocked(prev => {
      const next = !prev;
      localStorage.setItem('vs.locked', String(next));
      return next;
    });
  }, []);

  // Toggle feedback
  const toggleFeedback = useCallback(() => {
    setFeedbackEnabled(prev => {
      const next = !prev;
      localStorage.setItem('vs.feedback', next ? 'on' : 'off');
      return next;
    });
  }, []);

  // Provide haptic + sound when crossing a snap point
  const triggerSnapFeedback = useCallback(
    (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (!feedbackEnabled || prefersReducedMotion) return;

      const hapticDurations = { light: 8, medium: 15, heavy: 25 };
      navigator.vibrate?.(hapticDurations[intensity]);
      playSnapSound(intensity);
    },
    [feedbackEnabled, prefersReducedMotion]
  );

  // Snap to a percentage value directly
  const snapToPercent = useCallback(
    (pct: number) => {
      if (locked) return;
      triggerSnapFeedback('heavy');
      setTop(pct);
      r.current.last = pct;
      const detent = percentToDetent(pct);
      localStorage.setItem('vs.d', detent);
      onDetentChange?.(detent);
    },
    [onDetentChange, triggerSnapFeedback, locked]
  );

  // Check if we've crossed a snap point and trigger feedback
  const checkSnapCrossing = useCallback(
    (currentValue: number, previousValue: number) => {
      for (const snapPoint of activeSnapPoints) {
        const crossedForward = previousValue < snapPoint && currentValue >= snapPoint;
        const crossedBackward = previousValue > snapPoint && currentValue <= snapPoint;

        if ((crossedForward || crossedBackward) && r.current.lastCrossedSnap !== snapPoint) {
          r.current.lastCrossedSnap = snapPoint;
          const intensity = snapPoint === 50 ? 'medium' : 'light';
          triggerSnapFeedback(intensity);
          return;
        }
      }

      const nearAnySnap = activeSnapPoints.some(sp => Math.abs(currentValue - sp) < 5);
      if (!nearAnySnap) {
        r.current.lastCrossedSnap = -1;
      }
    },
    [triggerSnapFeedback, activeSnapPoints]
  );

  // Pointer event handler
  const onPointer = useCallback(
    (e: React.PointerEvent) => {
      if (locked) return;

      setSettingsOpen(false);

      const el = e.currentTarget as HTMLElement,
        { type } = e;

      if (type === 'pointerdown') {
        e.preventDefault();
        Object.assign(r.current, {
          ing: true,
          y: e.clientY,
          start: r.current.last,
          v: 0,
          t: Date.now(),
          lastCrossedSnap: -1,
        });
        setDrag(true);
        triggerSnapFeedback('light');
        el.setPointerCapture(e.pointerId);
      } else if (type === 'pointermove' && r.current.ing) {
        const dt = Date.now() - r.current.t;
        if (dt > 0) r.current.v = (e.clientY - r.current.y) / dt;
        r.current.t = Date.now();

        const rawValue = Math.max(
          5,
          Math.min(95, r.current.start + ((e.clientY - r.current.y) / innerHeight) * 100)
        );
        const magneticValue = applyMagnetic(rawValue);

        checkSnapCrossing(magneticValue, r.current.last);

        r.current.last = magneticValue;
        setTop(magneticValue);
      } else if (r.current.ing) {
        r.current.ing = false;
        setDrag(false);
        el.releasePointerCapture(e.pointerId);

        const finalTop = r.current.last;
        const targetPercent =
          Math.abs(r.current.v) > 0.5
            ? r.current.v < 0
              ? activeSnapPoints.includes(8)
                ? 8
                : nearestSnapPercent(8, activeSnapPoints)
              : activeSnapPoints.includes(92)
                ? 92
                : nearestSnapPercent(92, activeSnapPoints)
            : nearestSnapPercent(finalTop, activeSnapPoints);
        snapToPercent(targetPercent);
      }
    },
    [
      snapToPercent,
      triggerSnapFeedback,
      checkSnapCrossing,
      locked,
      applyMagnetic,
      activeSnapPoints,
    ]
  );

  return {
    top,
    drag,
    hov,
    setHov,
    locked,
    feedbackEnabled,
    settingsOpen,
    setSettingsOpen,
    settings,
    prefersReducedMotion,
    activeSnapPoints,
    enabledSnapCount,
    updateSettings,
    toggleLock,
    toggleFeedback,
    snapToPercent,
    onPointer,
  };
};

// ==========================================
// Main Component
// ==========================================

export const SplitLayout = memo(
  ({
    topView,
    bottomView,
    topTitle,
    bottomTitle,
    defaultDetent = 'middle',
    onDetentChange,
    className,
    onExport,
    onImport,
    onProfile,
    exportDisabled = false,
    centerSlot,
  }: SplitLayoutProps) => {
    const {
      top,
      drag,
      hov,
      setHov,
      locked,
      feedbackEnabled,
      settingsOpen,
      setSettingsOpen,
      settings,
      prefersReducedMotion,
      activeSnapPoints,
      enabledSnapCount,
      updateSettings,
      toggleLock,
      toggleFeedback,
      snapToPercent,
      onPointer,
    } = useSplitState({ defaultDetent, onDetentChange });

    const active = drag || hov;
    const topMinimized = top < 15;
    const bottomMinimized = 100 - top < 15;
    const hasActions = onExport || onImport || onProfile || centerSlot;

    const Panel = ({
      height,
      minimized,
      rounded,
      title,
      children,
    }: {
      height: string;
      minimized: boolean;
      rounded: string;
      title: string;
      children: ReactNode;
    }) => (
      <div
        className={cn('overflow-hidden', !drag && 'transition-[height] duration-300')}
        style={{ height }}
      >
        <div
          className={cn('relative h-full', minimized && 'cursor-pointer')}
          onClick={minimized && !locked ? () => snapToPercent(50) : undefined}
        >
          {minimized && (
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center bg-muted/70 backdrop-blur-sm ${rounded}`}
            >
              <div className="px-4 py-2 bg-background/80 rounded-full shadow-sm border border-border/50 text-sm">
                {title}
              </div>
            </div>
          )}
          <div className={cn('h-full w-full', minimized && 'scale-95 opacity-50 blur-[1px]')}>
            {children}
          </div>
        </div>
      </div>
    );

    return (
      <div
        className={cn(
          'flex flex-col h-full w-full overflow-hidden bg-background relative',
          className
        )}
      >
        <SnapIndicators visible={drag} activeSnapPoints={activeSnapPoints} currentTop={top} />

        <Panel
          height={`${top}%`}
          minimized={topMinimized}
          rounded="rounded-b-2xl"
          title={topTitle || 'Tap to expand'}
        >
          {topView}
        </Panel>

        {/* Drag Bar */}
        <div
          className="relative z-10"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
        >
          <div
            className={cn(
              'relative flex items-center justify-center border-y touch-none select-none transition-all duration-200',
              active && hasActions ? 'py-2.5' : 'py-1.5',
              locked
                ? 'border-amber-500/20 bg-amber-500/5'
                : active
                  ? 'border-border/40 bg-muted/40'
                  : 'border-border/20 bg-transparent',
              locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
            )}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerUp={onPointer}
            onPointerCancel={onPointer}
            onKeyDown={e => {
              if (locked) return;
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nudge = (e.key === 'ArrowUp' ? -1 : 1) * (e.shiftKey ? 30 : 10);
                const newPercent = nearestSnapPercent(top + nudge, activeSnapPoints);
                snapToPercent(newPercent);
              }
            }}
            tabIndex={locked ? -1 : 0}
            role="separator"
            aria-label={locked ? 'Resize panels (locked)' : 'Resize panels'}
            aria-valuenow={Math.round(top)}
          >
            <LeftControls
              locked={locked}
              toggleLock={toggleLock}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              settings={settings}
              updateSettings={updateSettings}
              enabledSnapCount={enabledSnapCount}
              feedbackEnabled={feedbackEnabled}
              toggleFeedback={toggleFeedback}
              prefersReducedMotion={prefersReducedMotion}
              visible={active}
            />

            {/* Center: either custom slot or drag handle */}
            {active && centerSlot ? (
              <span onPointerDown={e => e.stopPropagation()}>{centerSlot}</span>
            ) : (
              <DragHandle drag={drag} active={active} locked={locked} />
            )}

            <RightControls
              onExport={onExport}
              onImport={onImport}
              onProfile={onProfile}
              exportDisabled={exportDisabled}
              visible={active}
            />
          </div>
        </div>

        <Panel
          height={`${100 - top}%`}
          minimized={bottomMinimized}
          rounded="rounded-t-2xl"
          title={bottomTitle || 'Tap to expand'}
        >
          {bottomView}
        </Panel>
      </div>
    );
  }
);

SplitLayout.displayName = 'SplitLayout';
