import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { APIError, handleAPIError, logError, shouldRetry as shouldRetryError } from '@/lib/errors';

// Enhanced Query Cache with global error handling
const queryCache = new QueryCache({
  onError: (error, query) => {
    const apiError = handleAPIError(error, query.queryKey.join('/'), 'GET');
    logError(apiError, {
      context: 'react_query_error',
      queryKey: query.queryKey,
      queryHash: query.queryHash,
    });

    // Don't show toast for background refetches
    if (query.state.data !== undefined) {
      return;
    }

    // Show user-friendly error for failed initial loads
    if (apiError.userMessage && !apiError.userMessage.includes('not found')) {
      // You can integrate with your toast system here
      console.warn('Query failed:', apiError.userMessage);
    }
  },
});

// Enhanced Mutation Cache with global error handling
const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    const apiError = handleAPIError(error, 'mutation', 'POST');
    logError(apiError, {
      context: 'react_query_mutation_error',
      mutationKey: mutation.options.mutationKey,
      variables,
    });

    // Show user-friendly error for mutations
    console.error('Mutation failed:', apiError.userMessage);
  },
});

// Optimized React Query configuration with enhanced error handling
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Optimized caching strategy based on data type
      staleTime: 2 * 60 * 1000, // Reduced to 2 minutes for more fresh data
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection

      // Enhanced retry configuration with circuit breaker
      retry: (failureCount, error: any) => {
        // Prevent infinite retry loops with hard limits
        if (failureCount >= 3) {
          console.warn('Max retry attempts reached, stopping retries');
          return false;
        }

        // Convert to our error system for consistent handling
        const apiError = error instanceof APIError ? error : handleAPIError(error);

        // Circuit breaker: stop retrying if we've seen too many failures recently
        const circuitBreakerKey = `circuit_breaker_${apiError.endpoint || 'unknown'}`;
        const recentFailures = parseInt(sessionStorage.getItem(circuitBreakerKey) || '0');

        if (recentFailures >= 5) {
          console.warn(`Circuit breaker activated for ${apiError.endpoint}, stopping retries`);
          return false;
        }

        // Use our centralized retry logic with additional safety checks
        const shouldRetry = shouldRetryError(apiError, failureCount + 1, { maxAttempts: 3 });

        if (!shouldRetry) {
          // Increment circuit breaker counter
          sessionStorage.setItem(circuitBreakerKey, (recentFailures + 1).toString());
          // Reset circuit breaker after 5 minutes
          setTimeout(() => {
            sessionStorage.removeItem(circuitBreakerKey);
          }, 5 * 60 * 1000);
        }

        return shouldRetry;
      },

      // Optimized retry delay using our error system
      retryDelay: (attemptIndex, error) => {
        const apiError = error instanceof APIError ? error : handleAPIError(error);

        // Use exponential backoff with jitter for retryable errors
        if (apiError.retryable) {
          const baseDelay = 1000;
          const maxDelay = 8000; // Reduced max delay
          const exponentialDelay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);

          // Add jitter to prevent thundering herd
          const jitter = exponentialDelay * 0.1;
          return exponentialDelay + (Math.random() * jitter * 2 - jitter);
        }

        return 1000; // Fixed delay for non-retryable errors (shouldn't happen)
      },

      // Performance optimizations
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode for offline support
      networkMode: 'online',

      // Error handling
      throwOnError: false, // Let error boundaries handle errors
    },
    mutations: {
      // Enhanced mutation retry logic
      retry: (failureCount, error: any) => {
        const apiError = error instanceof APIError ? error : handleAPIError(error);

        // Only retry mutations for specific retryable errors
        if (apiError.retryable && failureCount < 2) {
          return true;
        }

        return false;
      },

      retryDelay: (attemptIndex, error) => {
        const apiError = error instanceof APIError ? error : handleAPIError(error);

        if (apiError.retryable) {
          return Math.min(1000 * Math.pow(1.5, attemptIndex), 5000);
        }

        return 1000;
      },

      // Network mode
      networkMode: 'online',

      // Error handling
      throwOnError: true, // Mutations should throw errors for proper handling
    },
  },
});

// Enhanced query keys with type safety and configuration
export const queryKeys = {
  // Dashboard data - frequently updated, shorter cache
  dashboard: {
    franchisor: (userId: string) => ['dashboard', 'franchisor', userId] as const,
    franchisee: (userId: string) => ['dashboard', 'franchisee', userId] as const,
    analytics: (userId: string, period: string) => ['dashboard', 'analytics', userId, period] as const,
  },

  // Orders - real-time data, shorter cache
  orders: {
    all: ['orders'] as const,
    list: (filters: any) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    pending: (userId: string) => ['orders', 'pending', userId] as const,
    history: (userId: string, page: number) => ['orders', 'history', userId, page] as const,
    approvals: (userId: string) => ['orders', 'approvals', userId] as const,
  },

  // Products - relatively static, longer cache
  products: {
    all: ['products'] as const,
    catalog: (filters: any) => ['products', 'catalog', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    inventory: (warehouseId: string) => ['products', 'inventory', warehouseId] as const,
    categories: ['products', 'categories'] as const,
  },

  // Cart - real-time data, short cache
  cart: {
    summary: ['cart-summary'] as const,
    items: ['cart-items'] as const,
    count: ['cart-count'] as const,
    validation: ['cart-validation'] as const,
    itemForProduct: (productId: string) => ['cart-item', productId] as const,
  },

  // Franchises - semi-static data
  franchises: {
    all: ['franchises'] as const,
    list: (userId: string) => ['franchises', 'list', userId] as const,
    detail: (id: string) => ['franchises', 'detail', id] as const,
    locations: (franchiseId: string) => ['franchises', 'locations', franchiseId] as const,
  },

  // Analytics - computed data, medium cache
  analytics: {
    sales: (locationId: string, period: string) => ['analytics', 'sales', locationId, period] as const,
    performance: (locationId: string) => ['analytics', 'performance', locationId] as const,
    inventory: (warehouseId: string) => ['analytics', 'inventory', warehouseId] as const,
    financial: (organizationId: string, period: string) => ['analytics', 'financial', organizationId, period] as const,
  },

  // Notifications - real-time data, very short cache
  notifications: {
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unread: (userId: string) => ['notifications', 'unread', userId] as const,
    settings: (userId: string) => ['notifications', 'settings', userId] as const,
  },

  // User data - semi-static, medium cache
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    permissions: (userId: string) => ['user', 'permissions', userId] as const,
    preferences: (userId: string) => ['user', 'preferences', userId] as const,
  },

  // Suppliers - relatively static
  suppliers: {
    all: ['suppliers'] as const,
    list: (filters: any) => ['suppliers', 'list', filters] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
  },

  // Inventory - frequently changing, short cache (updated for unified system)
  inventory: {
    unified: (locationId: string) => ['inventory', 'unified', locationId] as const,
    summary: (locationId?: string) => ['inventory', 'summary', locationId] as const,
    network: () => ['inventory', 'network'] as const,
    movements: (locationId: string, period: string) => ['inventory', 'movements', locationId, period] as const,
    alerts: (userId: string) => ['inventory', 'alerts', userId] as const,
    // Legacy key for backward compatibility
    levels: (warehouseId: string) => ['inventory', 'unified', warehouseId] as const,
  },
};

// Query-specific configurations for optimal performance
export const queryConfigs = {
  // Real-time data - short cache, frequent updates
  realTime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  },

  // Dashboard data - medium cache
  dashboard: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refresh when user returns
  },

  // Static data - long cache
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  },

  // User data - medium cache with auth dependency
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  },

  // Analytics - computed data, medium-long cache
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
  },

  // Notifications - very short cache
  notifications: {
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  },
};

// Enhanced prefetch strategies with error handling and performance optimization
export const prefetchStrategies = {
  // Prefetch dashboard data on login with role-specific optimization
  prefetchDashboard: async (userId: string, role: string) => {
    const startTime = performance.now();

    try {
      const promises = [];

      if (role === 'franchisor') {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.franchisor(userId),
            ...queryConfigs.dashboard,
          })
        );

        // Prefetch franchisor-specific data
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.analytics.financial(userId, 'current_month'),
            ...queryConfigs.analytics,
          })
        );
      } else if (role === 'franchisee') {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.franchisee(userId),
            ...queryConfigs.dashboard,
          })
        );

        // Prefetch franchisee-specific data
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.orders.pending(userId),
            ...queryConfigs.realTime,
          })
        );
      }

      // Prefetch common data for all roles
      promises.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.notifications.unread(userId),
          ...queryConfigs.notifications,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.user.profile(userId),
          ...queryConfigs.user,
        })
      );

      await Promise.all(promises);

      performanceMonitoring.trackQueryPerformance('prefetch_dashboard', startTime);
    } catch (error) {
      logError(error as Error, {
        context: 'prefetch_dashboard',
        userId,
        role
      });
    }
  },

  // Prefetch order-related data with intelligent caching
  prefetchOrderData: async (userId: string, role: string) => {
    const startTime = performance.now();

    try {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: queryKeys.orders.pending(userId),
          ...queryConfigs.realTime,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.catalog({}),
          ...queryConfigs.static,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.products.categories,
          ...queryConfigs.static,
        }),
      ];

      // Role-specific prefetching
      if (role === 'franchisor') {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.orders.approvals(userId),
            ...queryConfigs.realTime,
          })
        );
      }

      await Promise.all(promises);

      performanceMonitoring.trackQueryPerformance('prefetch_order_data', startTime);
    } catch (error) {
      logError(error as Error, {
        context: 'prefetch_order_data',
        userId,
        role
      });
    }
  },

  // Prefetch analytics data for performance dashboards
  prefetchAnalytics: async (userId: string, locationId?: string) => {
    const startTime = performance.now();

    try {
      const promises = [];

      if (locationId) {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.analytics.performance(locationId),
            ...queryConfigs.analytics,
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.analytics.sales(locationId, 'current_month'),
            ...queryConfigs.analytics,
          })
        );
      }

      await Promise.all(promises);

      performanceMonitoring.trackQueryPerformance('prefetch_analytics', startTime);
    } catch (error) {
      logError(error as Error, {
        context: 'prefetch_analytics',
        userId,
        locationId
      });
    }
  },

  // Smart prefetching based on user behavior patterns
  smartPrefetch: async (userId: string, role: string, currentRoute: string) => {
    const startTime = performance.now();

    try {
      // Route-based prefetching
      switch (currentRoute) {
        case '/dashboard':
          await prefetchStrategies.prefetchDashboard(userId, role);
          break;

        case '/orders':
          await prefetchStrategies.prefetchOrderData(userId, role);
          break;

        case '/analytics':
          await prefetchStrategies.prefetchAnalytics(userId);
          break;

        default:
          // Prefetch minimal common data
          await queryClient.prefetchQuery({
            queryKey: queryKeys.notifications.unread(userId),
            ...queryConfigs.notifications,
          });
      }

      performanceMonitoring.trackQueryPerformance('smart_prefetch', startTime);
    } catch (error) {
      logError(error as Error, {
        context: 'smart_prefetch',
        userId,
        role,
        currentRoute
      });
    }
  },
};

// Enhanced cache invalidation with smart dependency management
export const cacheInvalidation = {
  // Invalidate dashboard data with related dependencies
  invalidateDashboard: (userId: string, role?: string) => {
    const startTime = performance.now();

    try {
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Invalidate related analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      // Role-specific invalidations
      if (role === 'franchisor') {
        queryClient.invalidateQueries({ queryKey: ['franchises'] });
      }

      performanceMonitoring.trackQueryPerformance('invalidate_dashboard', startTime);
    } catch (error) {
      logError(error as Error, { context: 'invalidate_dashboard', userId, role });
    }
  },

  // Invalidate order data with cascade effects
  invalidateOrders: (userId?: string) => {
    const startTime = performance.now();

    try {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate related data that depends on orders
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'sales'] });

      // Invalidate dashboard if it shows order data
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.franchisee(userId)
        });
      }

      performanceMonitoring.trackQueryPerformance('invalidate_orders', startTime);
    } catch (error) {
      logError(error as Error, { context: 'invalidate_orders', userId });
    }
  },

  // Invalidate notifications with real-time updates
  invalidateNotifications: (userId: string) => {
    const startTime = performance.now();

    try {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Force refetch of unread count for immediate UI update
      queryClient.refetchQueries({
        queryKey: queryKeys.notifications.unread(userId),
        type: 'active'
      });

      performanceMonitoring.trackQueryPerformance('invalidate_notifications', startTime);
    } catch (error) {
      logError(error as Error, { context: 'invalidate_notifications', userId });
    }
  },

  // Invalidate user data and related caches
  invalidateUserData: (userId: string) => {
    const startTime = performance.now();

    try {
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Invalidate data that depends on user permissions/role
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      performanceMonitoring.trackQueryPerformance('invalidate_user_data', startTime);
    } catch (error) {
      logError(error as Error, { context: 'invalidate_user_data', userId });
    }
  },

  // Smart invalidation based on mutation type
  smartInvalidate: (mutationType: string, data: any, userId: string) => {
    const startTime = performance.now();

    try {
      switch (mutationType) {
        case 'order_created':
          cacheInvalidation.invalidateOrders(userId);
          cacheInvalidation.invalidateNotifications(userId);
          break;

        case 'order_approved':
          cacheInvalidation.invalidateOrders(userId);
          cacheInvalidation.invalidateDashboard(userId);
          break;

        case 'inventory_updated':
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['products', 'inventory'] });
          break;

        case 'profile_updated':
          cacheInvalidation.invalidateUserData(userId);
          break;

        default:
          // Generic invalidation for unknown mutations
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }

      performanceMonitoring.trackQueryPerformance('smart_invalidate', startTime);
    } catch (error) {
      logError(error as Error, {
        context: 'smart_invalidate',
        mutationType,
        userId
      });
    }
  },
};

// Enhanced performance monitoring with detailed metrics
export const performanceMonitoring = {
  // Performance metrics storage
  metrics: {
    queryTimes: new Map<string, number[]>(),
    errorRates: new Map<string, { total: number; errors: number }>(),
    cacheHitRates: new Map<string, { hits: number; misses: number }>(),
  },

  // Track query performance with detailed analytics
  trackQueryPerformance: (queryKey: string, startTime: number, success: boolean = true) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Store performance data
    if (!performanceMonitoring.metrics.queryTimes.has(queryKey)) {
      performanceMonitoring.metrics.queryTimes.set(queryKey, []);
    }
    performanceMonitoring.metrics.queryTimes.get(queryKey)!.push(duration);

    // Track error rates
    if (!performanceMonitoring.metrics.errorRates.has(queryKey)) {
      performanceMonitoring.metrics.errorRates.set(queryKey, { total: 0, errors: 0 });
    }
    const errorStats = performanceMonitoring.metrics.errorRates.get(queryKey)!;
    errorStats.total++;
    if (!success) errorStats.errors++;

    // Log slow queries (> 1.5 seconds, reduced threshold)
    if (duration > 1500) {
      console.warn(`Slow query detected: ${queryKey} took ${duration.toFixed(2)}ms`);

      // Log additional context for slow queries
      logError(new Error(`Slow query: ${queryKey}`), {
        context: 'slow_query',
        duration,
        queryKey,
        timestamp: new Date().toISOString(),
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics tracking would go here
      // Example: analytics.track('query_performance', { queryKey, duration, success });
    }
  },

  // Track cache performance
  trackCachePerformance: (queryKey: string, isHit: boolean) => {
    if (!performanceMonitoring.metrics.cacheHitRates.has(queryKey)) {
      performanceMonitoring.metrics.cacheHitRates.set(queryKey, { hits: 0, misses: 0 });
    }

    const cacheStats = performanceMonitoring.metrics.cacheHitRates.get(queryKey)!;
    if (isHit) {
      cacheStats.hits++;
    } else {
      cacheStats.misses++;
    }
  },

  // Get performance summary
  getPerformanceSummary: () => {
    const summary = {
      queries: {} as Record<string, any>,
      overall: {
        totalQueries: 0,
        averageTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
      },
    };

    // Calculate query-specific metrics
    for (const [queryKey, times] of performanceMonitoring.metrics.queryTimes) {
      const errorStats = performanceMonitoring.metrics.errorRates.get(queryKey);
      const cacheStats = performanceMonitoring.metrics.cacheHitRates.get(queryKey);

      summary.queries[queryKey] = {
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        totalCalls: times.length,
        errorRate: errorStats ? (errorStats.errors / errorStats.total) * 100 : 0,
        cacheHitRate: cacheStats ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 : 0,
      };
    }

    // Calculate overall metrics
    const allTimes = Array.from(performanceMonitoring.metrics.queryTimes.values()).flat();
    const allErrors = Array.from(performanceMonitoring.metrics.errorRates.values());
    const allCache = Array.from(performanceMonitoring.metrics.cacheHitRates.values());

    summary.overall.totalQueries = allTimes.length;
    summary.overall.averageTime = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0;

    const totalCalls = allErrors.reduce((sum, stat) => sum + stat.total, 0);
    const totalErrors = allErrors.reduce((sum, stat) => sum + stat.errors, 0);
    summary.overall.errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

    const totalCacheRequests = allCache.reduce((sum, stat) => sum + stat.hits + stat.misses, 0);
    const totalCacheHits = allCache.reduce((sum, stat) => sum + stat.hits, 0);
    summary.overall.cacheHitRate = totalCacheRequests > 0 ? (totalCacheHits / totalCacheRequests) * 100 : 0;

    return summary;
  },

  // Track Core Web Vitals with enhanced reporting
  trackWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;

        console.log('LCP:', lcp);

        if (lcp > 2500) {
          console.warn('Poor LCP detected:', lcp);
        }

        // Log to error system for tracking
        logError(new Error('LCP Measurement'), {
          context: 'web_vitals',
          metric: 'LCP',
          value: lcp,
          rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor',
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = entry.processingStart - entry.startTime;
          console.log('FID:', fid);

          if (fid > 100) {
            console.warn('Poor FID detected:', fid);
          }

          logError(new Error('FID Measurement'), {
            context: 'web_vitals',
            metric: 'FID',
            value: fid,
            rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        console.log('CLS:', clsValue);

        if (clsValue > 0.1) {
          console.warn('Poor CLS detected:', clsValue);
        }

        logError(new Error('CLS Measurement'), {
          context: 'web_vitals',
          metric: 'CLS',
          value: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  },

  // Reset metrics (useful for testing)
  resetMetrics: () => {
    performanceMonitoring.metrics.queryTimes.clear();
    performanceMonitoring.metrics.errorRates.clear();
    performanceMonitoring.metrics.cacheHitRates.clear();
  },
};

export default queryClient;
