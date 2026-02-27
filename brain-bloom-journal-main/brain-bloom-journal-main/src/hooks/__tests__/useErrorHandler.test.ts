import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { ErrorType, ErrorSeverity } from '../../types/errors';

// Mock the error handler
jest.mock('../../utils/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
    createError: jest.fn(),
    withRetry: jest.fn(),
  },
}));

describe('useErrorHandler', () => {
  const mockErrorHandler = require('../../utils/errorHandler').errorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create error handler with component name', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ component: 'TestComponent' })
    );

    expect(result.current).toHaveProperty('handleError');
    expect(result.current).toHaveProperty('handleAsyncError');
    expect(result.current).toHaveProperty('createError');
    expect(result.current).toHaveProperty('withRetry');
  });

  it('should handle errors with correct context', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ component: 'TestComponent' })
    );

    const error = new Error('Test error');
    const context = { action: 'testAction' };

    act(() => {
      result.current.handleError(error, context);
    });

    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
      component: 'TestComponent',
      action: 'testAction',
    });
  });

  it('should handle async errors with fallback', async () => {
    const { result } = renderHook(() => 
      useErrorHandler({ component: 'TestComponent' })
    );

    const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
    const fallback = 'fallback value';

    let asyncResult;
    await act(async () => {
      asyncResult = await result.current.handleAsyncError(asyncFn, fallback);
    });

    expect(asyncResult).toBe(fallback);
    expect(mockErrorHandler.handleError).toHaveBeenCalled();
  });

  it('should create errors with component context', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ component: 'TestComponent' })
    );

    const mockError = {
      type: ErrorType.NETWORK,
      message: 'Network error',
      severity: ErrorSeverity.HIGH,
    };

    mockErrorHandler.createError.mockReturnValue(mockError);

    act(() => {
      result.current.createError(
        ErrorType.NETWORK,
        'Network error',
        ErrorSeverity.HIGH
      );
    });

    expect(mockErrorHandler.createError).toHaveBeenCalledWith(
      ErrorType.NETWORK,
      'Network error',
      ErrorSeverity.HIGH,
      { context: 'TestComponent' }
    );
  });

  it('should use withRetry with correct context', async () => {
    const { result } = renderHook(() => 
      useErrorHandler({ component: 'TestComponent' })
    );

    const mockFn = jest.fn().mockResolvedValue('success');
    const options = { maxAttempts: 3, delay: 1000 };

    await act(async () => {
      await result.current.withRetry(mockFn, options);
    });

    expect(mockErrorHandler.withRetry).toHaveBeenCalledWith(
      mockFn,
      options,
      { component: 'TestComponent' }
    );
  });

  it('should use default context when provided', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ 
        component: 'TestComponent',
        defaultContext: { userId: '123' }
      })
    );

    const error = new Error('Test error');

    act(() => {
      result.current.handleError(error);
    });

    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
      component: 'TestComponent',
      userId: '123',
    });
  });

  it('should merge context with default context', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ 
        component: 'TestComponent',
        defaultContext: { userId: '123' }
      })
    );

    const error = new Error('Test error');
    const context = { action: 'testAction' };

    act(() => {
      result.current.handleError(error, context);
    });

    expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error, {
      component: 'TestComponent',
      userId: '123',
      action: 'testAction',
    });
  });
});