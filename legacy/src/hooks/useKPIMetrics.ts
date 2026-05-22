import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

interface FranchiseeKPIs {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  salesChange: number;
  orderCount: number;
  avgOrderValue: number;
  inventoryValue: number;
  lowStockItems: number;
}

interface FranchisorKPIs {
  totalRevenue: number;
  totalOrders: number;
  activeLocations: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export const useFranchiseeKPIs = (locationId?: string) => {
  const { user, role } = useAuth();
  
  const effectiveLocationId = locationId || user?.metadata?.primary_location_id;

  return useQuery<FranchiseeKPIs>({
    queryKey: ['kpi-metrics', 'franchisee', effectiveLocationId],
    queryFn: async (): Promise<FranchiseeKPIs> => {
      if (!effectiveLocationId) {
        throw new Error('Location ID required for franchisee KPIs');
      }

      try {
        // Call the database function
        const { data, error } = await supabase.rpc('calculate_franchisee_kpis', {
          p_location_id: effectiveLocationId
        });

        if (error) {
          console.error('KPI calculation error:', error);
          // Return fallback data instead of throwing
          return {
            todaySales: 0,
            weekSales: 0,
            monthSales: 0,
            salesChange: 0,
            orderCount: 0,
            avgOrderValue: 0,
            inventoryValue: 0,
            lowStockItems: 0,
          };
        }

        return data || {
          todaySales: 0,
          weekSales: 0,
          monthSales: 0,
          salesChange: 0,
          orderCount: 0,
          avgOrderValue: 0,
          inventoryValue: 0,
          lowStockItems: 0,
        };
      } catch (error) {
        console.error('Error fetching franchisee KPIs:', error);
        // Return fallback data on error
        return {
          todaySales: 0,
          weekSales: 0,
          monthSales: 0,
          salesChange: 0,
          orderCount: 0,
          avgOrderValue: 0,
          inventoryValue: 0,
          lowStockItems: 0,
        };
      }
    },
    enabled: !!effectiveLocationId && role === 'franchisee',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useFranchisorKPIs = () => {
  const { user, role } = useAuth();

  return useQuery<FranchisorKPIs>({
    queryKey: ['kpi-metrics', 'franchisor', user?.id],
    queryFn: async (): Promise<FranchisorKPIs> => {
      if (!user?.id) {
        throw new Error('User ID required for franchisor KPIs');
      }

      try {
        // Call the database function
        const { data, error } = await supabase.rpc('calculate_franchisor_kpis', {
          p_franchisor_id: user.id
        });

        if (error) {
          console.error('Franchisor KPI calculation error:', error);
          // Return fallback data instead of throwing
          return {
            totalRevenue: 0,
            totalOrders: 0,
            activeLocations: 0,
            averageOrderValue: 0,
            revenueGrowth: 0,
            orderGrowth: 0,
          };
        }

        return data || {
          totalRevenue: 0,
          totalOrders: 0,
          activeLocations: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          orderGrowth: 0,
        };
      } catch (error) {
        console.error('Error fetching franchisor KPIs:', error);
        // Return fallback data on error
        return {
          totalRevenue: 0,
          totalOrders: 0,
          activeLocations: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          orderGrowth: 0,
        };
      }
    },
    enabled: !!user?.id && role === 'franchisor',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Combined hook for dashboard usage
export const useKPIMetrics = (locationId?: string) => {
  const { role } = useAuth();
  
  const franchiseeKPIs = useFranchiseeKPIs(locationId);
  const franchisorKPIs = useFranchisorKPIs();

  if (role === 'franchisee') {
    return {
      data: franchiseeKPIs.data,
      isLoading: franchiseeKPIs.isLoading,
      error: franchiseeKPIs.error,
      refetch: franchiseeKPIs.refetch,
      type: 'franchisee' as const,
    };
  } else if (role === 'franchisor') {
    return {
      data: franchisorKPIs.data,
      isLoading: franchisorKPIs.isLoading,
      error: franchisorKPIs.error,
      refetch: franchisorKPIs.refetch,
      type: 'franchisor' as const,
    };
  }

  return {
    data: null,
    isLoading: false,
    error: null,
    refetch: () => {},
    type: 'unknown' as const,
  };
};
