import { QueryClient } from '@tanstack/react-query';

// Optimized React Query configuration for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance optimizations
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode for offline support
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Dashboard data
  dashboard: {
    franchisor: (userId: string) => ['dashboard', 'franchisor', userId],
    franchisee: (userId: string) => ['dashboard', 'franchisee', userId],
    analytics: (userId: string, period: string) => ['dashboard', 'analytics', userId, period],
  },
  
  // Orders
  orders: {
    all: ['orders'],
    list: (filters: any) => ['orders', 'list', filters],
    detail: (id: string) => ['orders', 'detail', id],
    pending: (userId: string) => ['orders', 'pending', userId],
    history: (userId: string, page: number) => ['orders', 'history', userId, page],
  },
  
  // Products
  products: {
    all: ['products'],
    catalog: (filters: any) => ['products', 'catalog', filters],
    detail: (id: string) => ['products', 'detail', id],
    inventory: (warehouseId: string) => ['products', 'inventory', warehouseId],
  },
  
  // Franchises
  franchises: {
    all: ['franchises'],
    list: (userId: string) => ['franchises', 'list', userId],
    detail: (id: string) => ['franchises', 'detail', id],
    locations: (franchiseId: string) => ['franchises', 'locations', franchiseId],
  },
  
  // Analytics
  analytics: {
    sales: (locationId: string, period: string) => ['analytics', 'sales', locationId, period],
    performance: (locationId: string) => ['analytics', 'performance', locationId],
    inventory: (warehouseId: string) => ['analytics', 'inventory', warehouseId],
    financial: (organizationId: string, period: string) => ['analytics', 'financial', organizationId, period],
  },
  
  // Notifications
  notifications: {
    list: (userId: string) => ['notifications', 'list', userId],
    unread: (userId: string) => ['notifications', 'unread', userId],
    settings: (userId: string) => ['notifications', 'settings', userId],
  },
  
  // User data
  user: {
    profile: (userId: string) => ['user', 'profile', userId],
    permissions: (userId: string) => ['user', 'permissions', userId],
    preferences: (userId: string) => ['user', 'preferences', userId],
  },
  
  // Suppliers
  suppliers: {
    all: ['suppliers'],
    list: (filters: any) => ['suppliers', 'list', filters],
    detail: (id: string) => ['suppliers', 'detail', id],
  },
  
  // Inventory
  inventory: {
    levels: (warehouseId: string) => ['inventory', 'levels', warehouseId],
    movements: (warehouseId: string, period: string) => ['inventory', 'movements', warehouseId, period],
    alerts: (userId: string) => ['inventory', 'alerts', userId],
  },
};

// Prefetch strategies for common data
export const prefetchStrategies = {
  // Prefetch dashboard data on login
  prefetchDashboard: async (userId: string, role: string) => {
    const promises = [];
    
    if (role === 'franchisor') {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.franchisor(userId),
          staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
        })
      );
    } else if (role === 'franchisee') {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.franchisee(userId),
          staleTime: 2 * 60 * 1000,
        })
      );
    }
    
    // Prefetch common data
    promises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.notifications.unread(userId),
        staleTime: 30 * 1000, // 30 seconds for notifications
      })
    );
    
    await Promise.all(promises);
  },
  
  // Prefetch order-related data
  prefetchOrderData: async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.orders.pending(userId),
        staleTime: 1 * 60 * 1000, // 1 minute for pending orders
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.catalog({}),
        staleTime: 10 * 60 * 1000, // 10 minutes for product catalog
      }),
    ]);
  },
};

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate dashboard data
  invalidateDashboard: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.performance(userId) });
  },
  
  // Invalidate order data
  invalidateOrders: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  },
  
  // Invalidate notifications
  invalidateNotifications: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread(userId) });
  },
};

// Performance monitoring
export const performanceMonitoring = {
  // Track query performance
  trackQueryPerformance: (queryKey: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log slow queries (> 2 seconds)
    if (duration > 2000) {
      console.warn(`Slow query detected: ${queryKey} took ${duration.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics tracking would go here
      // Example: analytics.track('query_performance', { queryKey, duration });
    }
  },

  // Track Core Web Vitals
  trackWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
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
      }).observe({ entryTypes: ['layout-shift'] });
    }
  },
};

export default queryClient;
