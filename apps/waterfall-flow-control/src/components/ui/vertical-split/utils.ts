import { Detent } from './types';

// Find nearest snap point percentage from active ones
export const nearestSnapPercent = (n: number, snapPoints: number[]): number => {
  if (snapPoints.length === 0) return 50;
  return snapPoints.reduce(
    (best, sp) => (Math.abs(n - sp) < Math.abs(n - best) ? sp : best),
    snapPoints[0]
  );
};

// Map percentage to detent name for persistence
export const percentToDetent = (pct: number): Detent => {
  if (pct <= 20) return 'top';
  if (pct >= 80) return 'bottom';
  return 'middle';
};

// Snap feedback sound - generates a soft click/tick sound
export const playSnapSound = (
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
) => {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const frequencies = { light: 800, medium: 600, heavy: 400 };
    const durations = { light: 0.03, medium: 0.05, heavy: 0.08 };
    const volumes = { light: 0.08, medium: 0.12, heavy: 0.18 };

    oscillator.frequency.setValueAtTime(
      frequencies[intensity],
      ctx.currentTime
    );
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volumes[intensity], ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durations[intensity]
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durations[intensity]);

    setTimeout(() => ctx.close(), 100);
  } catch {
    // Audio not supported or blocked
  }
};
