
import { useState, useEffect } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { useToast } from './use-toast';
import { dashboardDataService, DashboardData } from '@/services/dataService';

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
    return await dashboardDataService.getDashboardData();
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
