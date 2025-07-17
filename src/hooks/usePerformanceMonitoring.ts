import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface QueryPerformance {
  queryKey: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
  });

  const [queryPerformance, setQueryPerformance] = useState<QueryPerformance[]>([]);
  const [componentPerformance, setComponentPerformance] = useState<ComponentPerformance[]>([]);
  const observersRef = useRef<PerformanceObserver[]>([]);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const observers: PerformanceObserver[] = [];

    // Monitor Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          setMetrics(prev => ({
            ...prev,
            largestContentfulPaint: lastEntry.startTime
          }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: entry.processingStart - entry.startTime
          }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      observers.push(fidObserver);
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setMetrics(prev => ({
              ...prev,
              cumulativeLayoutShift: clsValue
            }));
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }

    // Monitor First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({
              ...prev,
              firstContentfulPaint: entry.startTime
            }));
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      observers.push(fcpObserver);
    } catch (error) {
      console.warn('FCP monitoring not supported:', error);
    }

    // Monitor page load time
    const updatePageLoadTime = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          timeToInteractive: navigation.domInteractive - navigation.fetchStart
        }));
      }
    };

    if (document.readyState === 'complete') {
      updatePageLoadTime();
    } else {
      window.addEventListener('load', updatePageLoadTime);
    }

    observersRef.current = observers;

    return () => {
      observers.forEach(observer => observer.disconnect());
      window.removeEventListener('load', updatePageLoadTime);
    };
  }, []);

  // Track query performance
  const trackQuery = useCallback((queryKey: string, startTime: number, success: boolean = true) => {
    const duration = performance.now() - startTime;
    const queryMetric: QueryPerformance = {
      queryKey,
      duration,
      timestamp: Date.now(),
      success
    };

    setQueryPerformance(prev => [...prev.slice(-99), queryMetric]); // Keep last 100 queries

    // Log slow queries
    if (duration > 2000) {
      console.warn(`Slow query detected: ${queryKey} took ${duration.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics tracking would go here
      // Example: analytics.track('query_performance', queryMetric);
    }

    return duration;
  }, []);

  // Track component render performance
  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    const componentMetric: ComponentPerformance = {
      componentName,
      renderTime,
      timestamp: Date.now()
    };

    setComponentPerformance(prev => [...prev.slice(-49), componentMetric]); // Keep last 50 renders

    // Log slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const recentQueries = queryPerformance.slice(-10);
    const avgQueryTime = recentQueries.length > 0 
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length 
      : 0;

    const recentRenders = componentPerformance.slice(-10);
    const avgRenderTime = recentRenders.length > 0
      ? recentRenders.reduce((sum, r) => sum + r.renderTime, 0) / recentRenders.length
      : 0;

    const slowQueries = queryPerformance.filter(q => q.duration > 1000).length;
    const failedQueries = queryPerformance.filter(q => !q.success).length;

    return {
      coreWebVitals: {
        lcp: metrics.largestContentfulPaint,
        fid: metrics.firstInputDelay,
        cls: metrics.cumulativeLayoutShift,
        fcp: metrics.firstContentfulPaint,
        tti: metrics.timeToInteractive,
        pageLoad: metrics.pageLoadTime
      },
      queryMetrics: {
        averageQueryTime: avgQueryTime,
        slowQueriesCount: slowQueries,
        failedQueriesCount: failedQueries,
        totalQueries: queryPerformance.length
      },
      renderMetrics: {
        averageRenderTime: avgRenderTime,
        totalRenders: componentPerformance.length
      },
      performance: {
        isGood: metrics.largestContentfulPaint < 2500 && 
                metrics.firstInputDelay < 100 && 
                metrics.cumulativeLayoutShift < 0.1,
        score: calculatePerformanceScore()
      }
    };
  }, [metrics, queryPerformance, componentPerformance]);

  // Calculate performance score (0-100)
  const calculatePerformanceScore = useCallback(() => {
    let score = 100;

    // LCP scoring (0-40 points)
    if (metrics.largestContentfulPaint > 4000) score -= 40;
    else if (metrics.largestContentfulPaint > 2500) score -= 20;

    // FID scoring (0-30 points)
    if (metrics.firstInputDelay > 300) score -= 30;
    else if (metrics.firstInputDelay > 100) score -= 15;

    // CLS scoring (0-30 points)
    if (metrics.cumulativeLayoutShift > 0.25) score -= 30;
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 15;

    return Math.max(0, score);
  }, [metrics]);

  // Export performance data
  const exportPerformanceData = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      queryPerformance,
      componentPerformance,
      summary: getPerformanceSummary()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, queryPerformance, componentPerformance, getPerformanceSummary]);

  // Clear performance data
  const clearPerformanceData = useCallback(() => {
    setQueryPerformance([]);
    setComponentPerformance([]);
  }, []);

  return {
    metrics,
    queryPerformance,
    componentPerformance,
    trackQuery,
    trackComponentRender,
    getPerformanceSummary,
    exportPerformanceData,
    clearPerformanceData,
    performanceScore: calculatePerformanceScore()
  };
};

// HOC for tracking component render performance
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { trackComponentRender } = usePerformanceMonitoring();
    const renderStartTime = useRef<number>(0);

    useEffect(() => {
      renderStartTime.current = performance.now();
    });

    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      trackComponentRender(componentName, renderTime);
    });

    return <WrappedComponent {...props} ref={ref} />;
  });
};

export default usePerformanceMonitoring;
