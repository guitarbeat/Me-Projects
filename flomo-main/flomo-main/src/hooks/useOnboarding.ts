import { useState, useEffect, useCallback } from 'react';

type OnboardingStep = 'calendar-tap' | 'sharing' | 'profile' | 'complete';

const STORAGE_KEY = 'flo_onboarding_completed';

interface OnboardingState {
  currentStep: OnboardingStep;
  hasLoggedFirstDay: boolean;
}

/**
 * Hook for managing first-time user onboarding
 * Shows subtle tooltips for key features
 */
export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'calendar-tap',
    hasLoggedFirstDay: false,
  });
  const [isComplete, setIsComplete] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.complete) {
          setIsComplete(true);
        } else {
          setState(parsed);
        }
      }
    } catch {
      // Start fresh if parsing fails
    }
  }, []);

  // Save state changes
  const saveState = useCallback(
    (newState: Partial<OnboardingState>) => {
      const updated = { ...state, ...newState };
      setState(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Silently fail
      }
    },
    [state]
  );

  // Mark first day logged
  const markFirstDayLogged = useCallback(() => {
    if (!state.hasLoggedFirstDay) {
      saveState({ hasLoggedFirstDay: true, currentStep: 'sharing' });
    }
  }, [state.hasLoggedFirstDay, saveState]);

  // Advance to next step
  const advanceStep = useCallback(() => {
    const steps: OnboardingStep[] = [
      'calendar-tap',
      'sharing',
      'profile',
      'complete',
    ];
    const currentIndex = steps.indexOf(state.currentStep);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      saveState({ currentStep: nextStep });

      if (nextStep === 'complete') {
        setIsComplete(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ complete: true }));
      }
    }
  }, [state.currentStep, saveState]);

  // Dismiss all onboarding
  const dismissOnboarding = useCallback(() => {
    setIsComplete(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ complete: true }));
  }, []);

  // Check if a specific tip should be shown
  const shouldShowTip = useCallback(
    (step: OnboardingStep): boolean => {
      if (isComplete) {
        return false;
      }
      return state.currentStep === step;
    },
    [isComplete, state.currentStep]
  );

  return {
    currentStep: state.currentStep,
    isComplete,
    hasLoggedFirstDay: state.hasLoggedFirstDay,
    shouldShowTip,
    markFirstDayLogged,
    advanceStep,
    dismissOnboarding,
  };
};
