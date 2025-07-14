
import { useState, useEffect } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { useToast } from './use-toast';
import { analyticsService, salesDataService } from '@/services/dataService';

interface AnalyticsData {
  kpis: Array<{
    name: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  charts: Array<{
    type: string;
    data: any[];
  }>;
  insights: Array<{
    type: 'insight' | 'recommendation' | 'alert';
    title: string;
    description: string;
  }>;
}

export const useAnalyticsData = (userRole: string) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('MTD');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    isLoading,
    data,
    error,
    retryCount,
    canRetry,
    execute,
    retry,
    reset
  } = useAsyncOperation<AnalyticsData>({
    maxRetries: 3,
    onSuccess: () => {
      setLastUpdated(new Date());
      console.log('Analytics data loaded successfully');
    },
    onError: (error) => {
      console.error('Analytics loading error:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    }
  });

  const loadAnalyticsData = async (): Promise<AnalyticsData> => {
    console.log(`Loading analytics for ${userRole} with timeRange: ${timeRange}`);

    try {
      // Import the new real-time analytics service
      const { RealTimeAnalyticsService } = await import('@/services/analytics/realTimeAnalytics');

      // Calculate date range based on timeRange
      const now = new Date();
      let dateFrom: string;

      switch (timeRange) {
        case 'MTD':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          break;
        case 'QTD':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          dateFrom = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
          break;
        case 'YTD':
          dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          break;
        default:
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const dateTo = now.toISOString().split('T')[0];

      // Get real-time metrics from hybrid OLTP/OLAP system
      const realTimeMetrics = await RealTimeAnalyticsService.getRealTimeMetrics({
        dateFrom,
        dateTo
      });

      // Transform data for charts
      const charts = [
        {
          type: 'sales',
          data: realTimeMetrics.topPerformingLocations.map(location => ({
            name: location.locationName,
            value: location.sales,
            transactions: location.transactions
          }))
        },
        {
          type: 'trend',
          data: realTimeMetrics.salesTrend.map(trend => ({
            name: trend.date,
            value: trend.sales,
            transactions: trend.transactions
          }))
        }
      ];

      // Generate insights based on real-time data
      const insights = [
        {
          type: 'insight' as const,
          title: 'Top Performing Location',
          description: realTimeMetrics.topPerformingLocations.length > 0
            ? `${realTimeMetrics.topPerformingLocations[0].locationName} is leading with $${realTimeMetrics.topPerformingLocations[0].sales.toFixed(2)} in sales`
            : 'No location data available'
        },
        {
          type: 'recommendation' as const,
          title: 'Real-time Performance',
          description: `System updated at ${new Date(realTimeMetrics.lastUpdated).toLocaleTimeString()}`
        }
      ];

      // Create KPIs array from real-time metrics
      const kpis = [
        {
          name: 'Revenue',
          value: `₱${realTimeMetrics.totalSales.toLocaleString()}`,
          change: '+0.0%', // Will be calculated from historical data
          trend: 'up' as const
        },
        {
          name: 'Transactions',
          value: realTimeMetrics.totalTransactions.toLocaleString(),
          change: '+0.0%',
          trend: 'up' as const
        },
        {
          name: 'Avg Order Value',
          value: `₱${realTimeMetrics.averageOrderValue.toFixed(2)}`,
          change: '+0.0%',
          trend: 'up' as const
        }
      ];

      // Add franchisor-specific KPIs
      if (userRole === 'franchisor') {
        kpis.push({
          name: 'Active Locations',
          value: realTimeMetrics.topPerformingLocations.length.toString(),
          change: '+0.0%',
          trend: 'up' as const
        });
      }

      return { kpis, charts, insights };
    } catch (error) {
      console.error('Error in loadAnalyticsData:', error);
      throw error;
    }
  };

  const refresh = () => {
    execute(loadAnalyticsData);
  };

  const retryLoad = () => {
    retry(loadAnalyticsData);
  };

  const updateTimeRange = (newRange: string) => {
    setTimeRange(newRange);
    refresh();
  };

  useEffect(() => {
    refresh();
  }, [timeRange]);

  return {
    data,
    isLoading,
    error,
    retryCount,
    canRetry,
    lastUpdated,
    timeRange,
    refresh,
    retry: retryLoad,
    reset,
    updateTimeRange
  };
};
