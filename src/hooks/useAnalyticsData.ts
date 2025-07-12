
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
      const period = timeRange as 'MTD' | 'QTD' | 'YTD';
      
      // Get KPI data from the service
      const kpiData = await analyticsService.getKPIData(period);
      const salesAnalytics = await salesDataService.getSalesAnalytics(period);
      const productPerformance = await analyticsService.getProductPerformance(period);

      // Transform data for charts
      const charts = [
        {
          type: 'sales',
          data: salesAnalytics.map(item => ({
            name: item.franchise_name,
            value: item.total_sales,
            transactions: item.transaction_count
          }))
        },
        {
          type: 'products',
          data: productPerformance.slice(0, 5).map(item => ({
            name: item.name,
            value: item.sales,
            category: item.category
          }))
        }
      ];

      // Generate insights based on data
      const insights = [
        {
          type: 'insight' as const,
          title: 'Top Performing Location',
          description: `${kpiData.topPerformingLocation} is leading with strong performance`
        },
        {
          type: 'recommendation' as const,
          title: 'Growth Opportunity',
          description: `Overall growth of ${kpiData.growth.toFixed(1)}% indicates healthy expansion`
        }
      ];

      // Create KPIs array
      const kpis = [
        {
          name: 'Revenue',
          value: `₱${kpiData.totalSales.toLocaleString()}`,
          change: `+${kpiData.growth.toFixed(1)}%`,
          trend: 'up' as const
        },
        {
          name: 'Transactions',
          value: kpiData.totalTransactions.toLocaleString(),
          change: '+12.5%',
          trend: 'up' as const
        },
        {
          name: 'Avg Order Value',
          value: `₱${kpiData.avgTransactionValue.toFixed(2)}`,
          change: '+3.2%',
          trend: 'up' as const
        }
      ];

      // Add franchisor-specific KPIs
      if (userRole === 'franchisor') {
        kpis.push({
          name: 'Active Franchisees',
          value: salesAnalytics.length.toString(),
          change: '+5.1%',
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
