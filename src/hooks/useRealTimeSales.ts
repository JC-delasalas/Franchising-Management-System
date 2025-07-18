import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRealTimeSubscription } from './useRealTimeData';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

interface SalesMetrics {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  yearSales: number;
  salesGrowth: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  salesByHour: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

interface SalesUpload {
  id?: string;
  location_id: string;
  sale_date: string;
  total_amount: number;
  items_sold: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payment_method: 'cash' | 'card' | 'digital';
  customer_count: number;
  notes?: string;
}

export const useRealTimeSales = (locationId?: string) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const effectiveLocationId = locationId || user?.metadata?.primary_location_id;

  // Real-time sales metrics query
  const { data: salesMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-metrics', effectiveLocationId],
    queryFn: async (): Promise<SalesMetrics> => {
      if (!effectiveLocationId) throw new Error('Location ID required');

      // Get sales data for different time periods
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Fetch sales data
      const [todayResult, weekResult, monthResult, yearResult, previousMonthResult] = await Promise.all([
        supabase
          .from('sales_records')
          .select('total_amount, created_at, items_sold')
          .eq('location_id', effectiveLocationId)
          .gte('sale_date', today.toISOString().split('T')[0]),
        
        supabase
          .from('sales_records')
          .select('total_amount, created_at, items_sold')
          .eq('location_id', effectiveLocationId)
          .gte('sale_date', weekAgo.toISOString().split('T')[0]),
        
        supabase
          .from('sales_records')
          .select('total_amount, created_at, items_sold')
          .eq('location_id', effectiveLocationId)
          .gte('sale_date', monthAgo.toISOString().split('T')[0]),
        
        supabase
          .from('sales_records')
          .select('total_amount, created_at, items_sold')
          .eq('location_id', effectiveLocationId)
          .gte('sale_date', yearAgo.toISOString().split('T')[0]),
        
        supabase
          .from('sales_records')
          .select('total_amount')
          .eq('location_id', effectiveLocationId)
          .gte('sale_date', new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .lt('sale_date', monthAgo.toISOString().split('T')[0])
      ]);

      const todaySales = todayResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const weekSales = weekResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const monthSales = monthResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const yearSales = yearResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const previousMonthSales = previousMonthResult.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 1;

      // Calculate growth
      const salesGrowth = ((monthSales - previousMonthSales) / previousMonthSales) * 100;

      // Calculate order metrics
      const orderCount = monthResult.data?.length || 0;
      const avgOrderValue = orderCount > 0 ? monthSales / orderCount : 0;

      // Calculate top products
      const allItems = monthResult.data?.flatMap(sale => sale.items_sold || []) || [];
      const productSales = allItems.reduce((acc, item) => {
        const key = item.product_id;
        if (!acc[key]) {
          acc[key] = {
            product_id: item.product_id,
            product_name: item.product_name || 'Unknown Product',
            quantity_sold: 0,
            revenue: 0
          };
        }
        acc[key].quantity_sold += item.quantity;
        acc[key].revenue += item.total_price;
        return acc;
      }, {} as Record<string, any>);

      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate sales by hour (today only)
      const salesByHour = Array.from({ length: 24 }, (_, hour) => {
        const hourSales = todayResult.data?.filter(sale => {
          const saleHour = new Date(sale.created_at).getHours();
          return saleHour === hour;
        }) || [];
        
        return {
          hour,
          sales: hourSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          orders: hourSales.length
        };
      });

      // Calculate sales trend (last 30 days)
      const salesTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySales = monthResult.data?.filter(sale => 
          sale.created_at.startsWith(dateStr)
        ) || [];
        
        return {
          date: dateStr,
          sales: daySales.reduce((sum, sale) => sum + sale.total_amount, 0),
          orders: daySales.length
        };
      }).reverse();

      return {
        todaySales,
        weekSales,
        monthSales,
        yearSales,
        salesGrowth: Math.round(salesGrowth * 10) / 10,
        orderCount,
        avgOrderValue,
        topProducts,
        salesByHour,
        salesTrend
      };
    },
    enabled: !!effectiveLocationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Upload sales data mutation
  const uploadSalesMutation = useMutation({
    mutationFn: async (salesData: SalesUpload) => {
      const { data, error } = await supabase
        .from('sales_records')
        .insert({
          franchise_location_id: salesData.location_id || effectiveLocationId,
          sale_date: salesData.sale_date,
          total_amount: salesData.total_amount,
          items_sold: salesData.items_sold,
          payment_method: salesData.payment_method,
          customer_count: salesData.customer_count,
          notes: salesData.notes,
          uploaded_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update inventory levels for sold items
      if (salesData.items_sold && salesData.items_sold.length > 0) {
        const inventoryUpdates = salesData.items_sold.map(item => ({
          product_id: item.product_id,
          location_id: effectiveLocationId,
          quantity_change: -item.quantity,
          change_type: 'sale',
          reference_id: data.id
        }));

        await supabase
          .from('inventory_transactions')
          .insert(inventoryUpdates);
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sales Uploaded",
        description: `Sale of ₱${data.total_amount.toLocaleString()} recorded successfully`,
      });
      
      // Invalidate related queries to trigger dashboard updates
      queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload sales data",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription for sales updates
  const { isConnected: isRealTimeConnected } = useRealTimeSubscription([
    {
      table: 'sales_records',
      filter: `location_id=eq.${effectiveLocationId}`,
      callback: (payload) => {
        // Invalidate sales metrics when new sales are recorded
        queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Sale Recorded",
            description: `₱${payload.new.total_amount.toLocaleString()} sale recorded`,
            duration: 3000,
          });
        }
      }
    }
  ], { enabled: !!effectiveLocationId });

  return {
    salesMetrics,
    isLoading,
    error,
    isRealTimeConnected,
    uploadSales: uploadSalesMutation.mutate,
    isUploading: uploadSalesMutation.isPending,
    refetch
  };
};

// Hook for franchisor to view all sales across locations
export const useRealTimeFranchisorSales = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allLocationsSales, isLoading } = useQuery({
    queryKey: ['franchisor-sales-metrics', user?.id],
    queryFn: async () => {
      // Get all locations for this franchisor
      const { data: locations } = await supabase
        .from('franchise_locations')
        .select('id, name, address')
        .eq('franchisor_id', user!.id);

      if (!locations) return [];

      // Get sales data for all locations
      const locationSales = await Promise.all(
        locations.map(async (location) => {
          const { data: sales } = await supabase
            .from('sales_records')
            .select('total_amount, created_at')
            .eq('location_id', location.id)
            .gte('sale_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

          const totalSales = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
          const orderCount = sales?.length || 0;

          return {
            ...location,
            totalSales,
            orderCount,
            avgOrderValue: orderCount > 0 ? totalSales / orderCount : 0
          };
        })
      );

      return locationSales.sort((a, b) => b.totalSales - a.totalSales);
    },
    enabled: !!user && user.role === 'franchisor',
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  return {
    allLocationsSales,
    isLoading,
    totalNetworkSales: allLocationsSales?.reduce((sum, location) => sum + location.totalSales, 0) || 0,
    totalNetworkOrders: allLocationsSales?.reduce((sum, location) => sum + location.orderCount, 0) || 0
  };
};
