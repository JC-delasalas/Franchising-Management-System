/**
 * React Query Optimization Test Runner
 * 
 * Comprehensive testing for React Query configuration and performance
 */

import { queryClient, queryKeys, queryConfigs, performanceMonitoring, cacheInvalidation } from '@/lib/queryClient';
import { APIError } from '@/lib/errors';

export interface ReactQueryTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
  error?: string;
  details?: any;
}

export class ReactQueryTestRunner {
  private results: ReactQueryTestResult[] = [];

  private async runTest(name: string, testFn: () => Promise<void>): Promise<ReactQueryTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: ReactQueryTestResult = {
        name,
        status: 'passed',
        message: 'Test passed successfully',
        duration
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: ReactQueryTestResult = {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        error: errorMessage
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testQueryKeyConsistency(): Promise<ReactQueryTestResult> {
    return this.runTest('Query Key Consistency', async () => {
      // Test that query keys are properly typed and consistent
      const testUserId = 'test-user-123';
      
      // Test dashboard keys
      const franchiseeKey = queryKeys.dashboard.franchisee(testUserId);
      const franchisorKey = queryKeys.dashboard.franchisor(testUserId);
      
      if (!Array.isArray(franchiseeKey) || franchiseeKey.length < 3) {
        throw new Error('Dashboard franchisee key structure invalid');
      }
      
      if (!Array.isArray(franchisorKey) || franchisorKey.length < 3) {
        throw new Error('Dashboard franchisor key structure invalid');
      }
      
      // Test order keys
      const orderKeys = [
        queryKeys.orders.all,
        queryKeys.orders.detail('test-order'),
        queryKeys.orders.pending(testUserId),
      ];
      
      orderKeys.forEach((key, index) => {
        if (!Array.isArray(key)) {
          throw new Error(`Order key ${index} is not an array`);
        }
      });
      
      // Test that keys are properly namespaced
      if (franchiseeKey[0] !== 'dashboard') {
        throw new Error('Dashboard key not properly namespaced');
      }
      
      if (queryKeys.orders.all[0] !== 'orders') {
        throw new Error('Orders key not properly namespaced');
      }
    });
  }

  async testQueryConfigurations(): Promise<ReactQueryTestResult> {
    return this.runTest('Query Configurations', async () => {
      // Test that query configurations have appropriate values
      const configs = [
        queryConfigs.realTime,
        queryConfigs.dashboard,
        queryConfigs.static,
        queryConfigs.user,
        queryConfigs.analytics,
        queryConfigs.notifications,
      ];
      
      configs.forEach((config, index) => {
        if (!config.staleTime || config.staleTime < 0) {
          throw new Error(`Config ${index} has invalid staleTime`);
        }
        
        if (!config.gcTime || config.gcTime < config.staleTime) {
          throw new Error(`Config ${index} has invalid gcTime`);
        }
      });
      
      // Test that real-time data has shorter cache than static data
      if (queryConfigs.realTime.staleTime >= queryConfigs.static.staleTime) {
        throw new Error('Real-time data should have shorter cache than static data');
      }
      
      // Test that notifications have very short cache
      if (queryConfigs.notifications.staleTime > 30000) {
        throw new Error('Notifications should have very short cache (≤30s)');
      }
    });
  }

  async testRetryLogic(): Promise<ReactQueryTestResult> {
    return this.runTest('Retry Logic Integration', async () => {
      // Test that retry logic properly integrates with our error system
      const retryableError = new APIError('Network error', 'NETWORK_ERROR', undefined, undefined, true);
      const nonRetryableError = new APIError('Not found', 'RESOURCE_NOT_FOUND', 404, undefined, false);
      
      // Get the default query options
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as Function;
      
      if (!retryFn) {
        throw new Error('Retry function not configured');
      }
      
      // Test retryable error
      const shouldRetryRetryable = retryFn(1, retryableError);
      if (!shouldRetryRetryable) {
        throw new Error('Should retry retryable errors');
      }
      
      // Test non-retryable error
      const shouldRetryNonRetryable = retryFn(1, nonRetryableError);
      if (shouldRetryNonRetryable) {
        throw new Error('Should not retry non-retryable errors');
      }
      
      // Test max attempts
      const shouldRetryMaxAttempts = retryFn(5, retryableError);
      if (shouldRetryMaxAttempts) {
        throw new Error('Should not retry after max attempts');
      }
    });
  }

  async testCacheInvalidation(): Promise<ReactQueryTestResult> {
    return this.runTest('Cache Invalidation', async () => {
      const testUserId = 'test-user-123';
      
      // Test that invalidation functions exist and are callable
      const invalidationFunctions = [
        () => cacheInvalidation.invalidateDashboard(testUserId),
        () => cacheInvalidation.invalidateOrders(testUserId),
        () => cacheInvalidation.invalidateNotifications(testUserId),
        () => cacheInvalidation.invalidateUserData(testUserId),
        () => cacheInvalidation.smartInvalidate('order_created', {}, testUserId),
      ];
      
      // Test that all functions execute without throwing
      for (const fn of invalidationFunctions) {
        try {
          await fn();
        } catch (error) {
          throw new Error(`Invalidation function failed: ${error}`);
        }
      }
    });
  }

  async testPerformanceMonitoring(): Promise<ReactQueryTestResult> {
    return this.runTest('Performance Monitoring', async () => {
      // Reset metrics for clean test
      performanceMonitoring.resetMetrics();
      
      // Test performance tracking
      const startTime = performance.now();
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      
      performanceMonitoring.trackQueryPerformance('test_query', startTime, true);
      
      // Test cache performance tracking
      performanceMonitoring.trackCachePerformance('test_query', true);
      performanceMonitoring.trackCachePerformance('test_query', false);
      
      // Get performance summary
      const summary = performanceMonitoring.getPerformanceSummary();
      
      if (!summary.queries['test_query']) {
        throw new Error('Performance tracking not working');
      }
      
      if (summary.queries['test_query'].totalCalls !== 1) {
        throw new Error('Query call count incorrect');
      }
      
      if (summary.queries['test_query'].cacheHitRate !== 50) {
        throw new Error('Cache hit rate calculation incorrect');
      }
      
      if (summary.overall.totalQueries !== 1) {
        throw new Error('Overall metrics calculation incorrect');
      }
    });
  }

  async testErrorHandling(): Promise<ReactQueryTestResult> {
    return this.runTest('Error Handling Integration', async () => {
      // Test that query cache error handler exists
      const queryCache = queryClient.getQueryCache();
      
      // Create a mock query with error
      const mockQuery = {
        queryKey: ['test', 'error'],
        queryHash: 'test_error_hash',
        state: { data: undefined },
      };
      
      // Test that error handler doesn't throw
      try {
        const errorHandler = (queryCache as any).config?.onError;
        if (errorHandler) {
          errorHandler(new Error('Test error'), mockQuery);
        }
      } catch (error) {
        throw new Error(`Error handler threw: ${error}`);
      }
      
      // Test mutation cache error handler
      const mutationCache = queryClient.getMutationCache();
      
      try {
        const mutationErrorHandler = (mutationCache as any).config?.onError;
        if (mutationErrorHandler) {
          const mockMutation = {
            options: { mutationKey: ['test', 'mutation'] },
          };
          mutationErrorHandler(new Error('Test mutation error'), {}, {}, mockMutation);
        }
      } catch (error) {
        throw new Error(`Mutation error handler threw: ${error}`);
      }
    });
  }

  async testQueryClientConfiguration(): Promise<ReactQueryTestResult> {
    return this.runTest('Query Client Configuration', async () => {
      const defaultOptions = queryClient.getDefaultOptions();
      
      // Test query defaults
      if (!defaultOptions.queries) {
        throw new Error('Query defaults not configured');
      }
      
      if (defaultOptions.queries.staleTime !== 2 * 60 * 1000) {
        throw new Error('Default stale time not set correctly');
      }
      
      if (defaultOptions.queries.gcTime !== 10 * 60 * 1000) {
        throw new Error('Default gc time not set correctly');
      }
      
      if (defaultOptions.queries.refetchOnWindowFocus !== false) {
        throw new Error('Refetch on window focus should be disabled by default');
      }
      
      // Test mutation defaults
      if (!defaultOptions.mutations) {
        throw new Error('Mutation defaults not configured');
      }
      
      if (defaultOptions.mutations.throwOnError !== true) {
        throw new Error('Mutations should throw on error');
      }
    });
  }

  async testMemoryManagement(): Promise<ReactQueryTestResult> {
    return this.runTest('Memory Management', async () => {
      // Test that query client properly manages memory
      const initialCacheSize = queryClient.getQueryCache().getAll().length;
      
      // Add some test queries
      await queryClient.prefetchQuery({
        queryKey: ['test', 'memory', '1'],
        queryFn: () => Promise.resolve('data1'),
        staleTime: 100,
        gcTime: 200,
      });
      
      await queryClient.prefetchQuery({
        queryKey: ['test', 'memory', '2'],
        queryFn: () => Promise.resolve('data2'),
        staleTime: 100,
        gcTime: 200,
      });
      
      const afterPrefetchSize = queryClient.getQueryCache().getAll().length;
      
      if (afterPrefetchSize <= initialCacheSize) {
        throw new Error('Queries not added to cache');
      }
      
      // Wait for garbage collection
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force garbage collection
      queryClient.getQueryCache().clear();
      
      const afterClearSize = queryClient.getQueryCache().getAll().length;
      
      if (afterClearSize >= afterPrefetchSize) {
        throw new Error('Cache not properly cleared');
      }
    });
  }

  async runAllReactQueryTests(): Promise<ReactQueryTestResult[]> {
    this.results = [];
    
    console.log('⚡ Starting React Query Optimization Tests...');
    
    // Run tests in sequence to avoid conflicts
    await this.testQueryKeyConsistency();
    await this.testQueryConfigurations();
    await this.testRetryLogic();
    await this.testCacheInvalidation();
    await this.testPerformanceMonitoring();
    await this.testErrorHandling();
    await this.testQueryClientConfiguration();
    await this.testMemoryManagement();
    
    return this.results;
  }

  getResults(): ReactQueryTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    
    return {
      total,
      passed,
      failed,
      skipped,
      successRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
    };
  }
}

// Export a default instance for easy use
export const reactQueryTestRunner = new ReactQueryTestRunner();
