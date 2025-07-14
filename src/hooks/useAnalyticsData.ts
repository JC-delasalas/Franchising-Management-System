
import { useState, useEffect } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { useToast } from './use-toast';

interface AnalyticsData {
  kpis: any[];
  charts: any[];
  insights: any[];
}

export const useAnalyticsData = (userRole: string) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() < 0.15) { // 15% chance of simulated error
      throw new Error('Analytics service temporarily unavailable');
    }

    const baseData = {
      kpis: [
        { name: 'Revenue', value: '$125,430', change: '+8.2%', trend: 'up' },
        { name: 'Orders', value: '1,234', change: '+12.5%', trend: 'up' },
        { name: 'Customers', value: '856', change: '-2.1%', trend: 'down' },
      ],
      charts: [
        { type: 'revenue', data: Array.from({length: 30}, (_, i) => ({ day: i + 1, value: Math.random() * 1000 })) },
        { type: 'orders', data: Array.from({length: 30}, (_, i) => ({ day: i + 1, value: Math.random() * 50 })) },
      ],
      insights: [
        { type: 'insight', title: 'Peak Sales Hours', description: 'Most sales occur between 2-4 PM' },
        { type: 'recommendation', title: 'Inventory Alert', description: 'Consider restocking popular items' },
      ]
    };

    return userRole === 'franchisor' 
      ? { ...baseData, kpis: [...baseData.kpis, { name: 'Franchisees', value: '45', change: '+3.1%', trend: 'up' }] }
      : baseData;
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
