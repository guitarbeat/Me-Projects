import { useState, useCallback } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
}

interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * Unified loading state hook to consolidate duplicate loading patterns.
 * Provides consistent loading, error handling, and async operation wrapping.
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const [state, setState] = useState<LoadingState>({
    loading: options.initialLoading ?? true,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading,
      error: loading ? null : prev.error,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  /**
   * Wraps an async operation with loading state management.
   * Automatically sets loading to true before, and false after (success or error).
   */
  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      errorMessage = 'An error occurred'
    ): Promise<T | null> => {
      setState({ loading: true, error: null });
      try {
        const result = await operation();
        setState({ loading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        setState({ loading: false, error: message });
        console.error(errorMessage, err);
        return null;
      }
    },
    []
  );

  return {
    loading: state.loading,
    error: state.error,
    setLoading,
    setError,
    reset,
    withLoading,
  };
};

/**
 * Combines multiple loading states into one.
 * Returns true if ANY of the provided loading states is true.
 */
export const useCombinedLoading = (...loadingStates: boolean[]): boolean => {
  return loadingStates.some(Boolean);
};
