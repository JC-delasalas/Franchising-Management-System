
import { useState, useCallback } from 'react';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const { 
    maxRetries = 3, 
    retryDelay = 2000,
    onError,
    onMaxRetriesReached 
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((err: Error) => {
    console.error('Error occurred:', err);
    setError(err);
    onError?.(err);
  }, [onError]);

  const retry = useCallback(async (operation: () => Promise<void> | void) => {
    if (retryCount >= maxRetries) {
      onMaxRetriesReached?.(error!);
      return false;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      await operation();
      setError(null);
      setRetryCount(0);
      return true;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Operation failed'));
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, retryDelay, error, handleError, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    error,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    handleError,
    retry,
    reset
  };
};
