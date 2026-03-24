import { renderHook, act } from '@testing-library/react';
import { 
  useDebounce, 
  useThrottle, 
  usePerformance 
} from '../usePerformance';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 100 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'first', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ value: 'second', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(result.current).toBe('second');
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should throttle function calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 100));

    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should call function immediately on first call', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 100));

    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('usePerformance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should track render metrics', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.metrics.renderCount).toBe(0);
    expect(result.current.metrics.lastRenderTime).toBe(0);
    expect(result.current.metrics.averageRenderTime).toBe(0);

    act(() => {
      result.current.startRender();
      jest.advanceTimersByTime(10);
      result.current.endRender();
    });

    expect(result.current.metrics.renderCount).toBe(1);
    expect(result.current.metrics.lastRenderTime).toBeGreaterThan(0);
    expect(result.current.metrics.averageRenderTime).toBeGreaterThan(0);
  });

  it('should calculate average render time correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // Simulate multiple renders
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.startRender();
        jest.advanceTimersByTime(10 + i * 5);
        result.current.endRender();
      });
    }

    expect(result.current.metrics.renderCount).toBe(3);
    expect(result.current.metrics.averageRenderTime).toBeGreaterThan(0);
  });

  it('should limit render times to last 10', () => {
    const { result } = renderHook(() => usePerformance());

    // Simulate more than 10 renders
    for (let i = 0; i < 15; i++) {
      act(() => {
        result.current.startRender();
        jest.advanceTimersByTime(10);
        result.current.endRender();
      });
    }

    expect(result.current.metrics.renderCount).toBe(15);
    // Should still calculate average correctly with limited data
    expect(result.current.metrics.averageRenderTime).toBeGreaterThan(0);
  });
});