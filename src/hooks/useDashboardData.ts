
import { useState, useEffect } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { useToast } from './use-toast';

interface DashboardData {
  metrics: any[];
  recentActivity: any[];
  notifications: any[];
}

export const useDashboardData = () => {
  const { toast } = useToast();
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
  } = useAsyncOperation<DashboardData>({
    maxRetries: 3,
    onSuccess: () => {
      setLastUpdated(new Date());
      toast({
        title: "Dashboard Updated",
        description: "Latest data loaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Loading Dashboard",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const loadDashboardData = async (): Promise<DashboardData> => {
    // Simulate API call with potential failure
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < 0.1) { // 10% chance of simulated error
      throw new Error('Network error loading dashboard data');
    }

    return {
      metrics: [
        { label: 'Total Revenue', value: '$45,231', change: '+12%' },
        { label: 'Active Users', value: '2,345', change: '+5%' },
        { label: 'Conversion Rate', value: '3.24%', change: '-2%' },
      ],
      recentActivity: [
        { id: 1, type: 'sale', description: 'New sale completed', time: '2 minutes ago' },
        { id: 2, type: 'user', description: 'New user registered', time: '15 minutes ago' },
      ],
      notifications: [
        { id: 1, type: 'info', message: 'System maintenance scheduled' },
        { id: 2, type: 'warning', message: 'Low inventory alert' },
      ]
    };
  };

  const refresh = () => {
    execute(loadDashboardData);
  };

  const retryLoad = () => {
    retry(loadDashboardData);
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    data,
    isLoading,
    error,
    retryCount,
    canRetry,
    lastUpdated,
    refresh,
    retry: retryLoad,
    reset
  };
};
