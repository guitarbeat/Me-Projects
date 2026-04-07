/**
 * Centralized haptic feedback system
 * Provides contextual vibration patterns for different interactions
 */

type HapticPattern =
  | 'success'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'navigation'
  | 'celebration';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10], // Double tap
  error: [50, 30, 50], // Long-short-long
  selection: 15,
  navigation: 8,
  celebration: [10, 30, 10, 30, 20], // Pattern for achievements
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with a specific pattern
 */
export const haptic = (pattern: HapticPattern = 'light'): void => {
  if (!isHapticSupported()) {
    return;
  }

  try {
    const vibration = patterns[pattern];
    navigator.vibrate(vibration);
  } catch {
    // Silently fail if vibration isn't available
  }
};

/**
 * Convenience methods for common patterns
 */
export const hapticLight = () => haptic('light');
export const hapticMedium = () => haptic('medium');
export const hapticHeavy = () => haptic('heavy');
export const hapticSuccess = () => haptic('success');
export const hapticError = () => haptic('error');
export const hapticSelection = () => haptic('selection');
export const hapticNavigation = () => haptic('navigation');
export const hapticCelebration = () => haptic('celebration');

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = (): void => {
  if (!isHapticSupported()) {
    return;
  }
  try {
    navigator.vibrate(0);
  } catch {
    // Silently fail
  }
};
