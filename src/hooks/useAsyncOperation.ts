
import { useState, useCallback } from 'react';
import { useErrorRecovery } from './useErrorRecovery';

interface AsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export const useAsyncOperation = <T = any>(options: AsyncOperationOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  
  const { error, retryCount, isRetrying, canRetry, handleError, retry, reset } = useErrorRecovery({
    maxRetries: options.maxRetries,
    onError: options.onError
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setData(null);
    reset();

    try {
      const result = await operation();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Operation failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, reset, options]);

  const retryOperation = useCallback((operation: () => Promise<T>) => {
    return retry(() => execute(operation));
  }, [retry, execute]);

  return {
    isLoading: isLoading || isRetrying,
    data,
    error,
    retryCount,
    canRetry,
    execute,
    retry: retryOperation,
    reset
  };
};
