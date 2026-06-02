import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  SplitSettings,
  DEFAULT_SETTINGS,
  SNAP_VALUES,
  MAGNETIC_RANGE,
  Detent,
} from './types';
import { nearestSnapPercent, percentToDetent, playSnapSound } from './utils';

interface UseSplitStateProps {
  defaultDetent: Detent;
  onDetentChange?: (d: Detent) => void;
}

export const useSplitState = ({
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
          const pullStrength =
            magneticStrength * (1 - distance / MAGNETIC_RANGE);
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
        const crossedForward =
          previousValue < snapPoint && currentValue >= snapPoint;
        const crossedBackward =
          previousValue > snapPoint && currentValue <= snapPoint;

        if (
          (crossedForward || crossedBackward) &&
          r.current.lastCrossedSnap !== snapPoint
        ) {
          r.current.lastCrossedSnap = snapPoint;
          const intensity = snapPoint === 50 ? 'medium' : 'light';
          triggerSnapFeedback(intensity);
          return;
        }
      }

      const nearAnySnap = activeSnapPoints.some(
        sp => Math.abs(currentValue - sp) < 5
      );
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
          Math.min(
            95,
            r.current.start + ((e.clientY - r.current.y) / innerHeight) * 100
          )
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
