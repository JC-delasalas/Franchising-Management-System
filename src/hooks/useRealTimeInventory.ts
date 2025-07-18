import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRealTimeSubscription } from './useRealTimeData';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reorder_point: number;
  max_stock_level: number;
  unit_cost: number;
  last_updated: string;
  products: {
    name: string;
    sku: string;
    category: string;
    description?: string;
  };
}

interface InventoryTransaction {
  id?: string;
  product_id: string;
  location_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
  quantity_change: number;
  unit_cost?: number;
  reference_id?: string;
  notes?: string;
}

interface StockAlert {
  id: string;
  product_name: string;
  quantity: number;
  reorder_point: number;
  status: 'low_stock' | 'out_of_stock' | 'overstock';
  location_name: string;
}

export const useRealTimeInventory = (locationId?: string) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const effectiveLocationId = locationId || user?.metadata?.primary_location_id;

  // Real-time inventory query
  const { data: inventory, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory', effectiveLocationId],
    queryFn: async (): Promise<InventoryItem[]> => {
      if (!effectiveLocationId) throw new Error('Location ID required');

      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            name,
            sku,
            category,
            description
          )
        `)
        .eq('location_id', effectiveLocationId)
        .order('products(name)');

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveLocationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Inventory transactions query
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['inventory-transactions', effectiveLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          products (name, sku)
        `)
        .eq('location_id', effectiveLocationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveLocationId,
    staleTime: 60 * 1000,
  });

  // Stock alerts query
  const { data: stockAlerts } = useQuery({
    queryKey: ['stock-alerts', effectiveLocationId],
    queryFn: async (): Promise<StockAlert[]> => {
      if (!inventory) return [];

      const alerts: StockAlert[] = [];
      
      inventory.forEach(item => {
        if (item.quantity <= 0) {
          alerts.push({
            id: item.id,
            product_name: item.products.name,
            quantity: item.quantity,
            reorder_point: item.reorder_point,
            status: 'out_of_stock',
            location_name: 'Current Location'
          });
        } else if (item.quantity <= item.reorder_point) {
          alerts.push({
            id: item.id,
            product_name: item.products.name,
            quantity: item.quantity,
            reorder_point: item.reorder_point,
            status: 'low_stock',
            location_name: 'Current Location'
          });
        } else if (item.quantity > item.max_stock_level) {
          alerts.push({
            id: item.id,
            product_name: item.products.name,
            quantity: item.quantity,
            reorder_point: item.reorder_point,
            status: 'overstock',
            location_name: 'Current Location'
          });
        }
      });

      return alerts;
    },
    enabled: !!inventory,
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ productId, newStock, notes }: { productId: string; newStock: number; notes?: string }) => {
      const currentItem = inventory?.find(item => item.product_id === productId);
      if (!currentItem) throw new Error('Product not found');

      const quantityChange = newStock - currentItem.quantity;

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('location_id', effectiveLocationId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          location_id: effectiveLocationId,
          transaction_type: 'adjustment',
          quantity_change: quantityChange,
          notes: notes || 'Manual adjustment',
          created_by: user!.id
        });

      if (transactionError) throw transactionError;

      return { productId, newStock, quantityChange };
    },
    onSuccess: (data) => {
      toast({
        title: "Inventory Updated",
        description: `Stock adjusted by ${data.quantityChange > 0 ? '+' : ''}${data.quantityChange} units`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update inventory",
        variant: "destructive",
      });
    }
  });

  // Bulk inventory update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: Array<{ productId: string; newStock: number; notes?: string }>) => {
      const results = [];
      
      for (const update of updates) {
        const currentItem = inventory?.find(item => item.product_id === update.productId);
        if (!currentItem) continue;

        const quantityChange = update.newStock - currentItem.current_stock;

        // Update inventory
        await supabase
          .from('inventory')
          .update({ 
            current_stock: update.newStock,
            last_updated: new Date().toISOString()
          })
          .eq('product_id', update.productId)
          .eq('location_id', effectiveLocationId);

        // Record transaction
        await supabase
          .from('inventory_transactions')
          .insert({
            product_id: update.productId,
            location_id: effectiveLocationId,
            transaction_type: 'adjustment',
            quantity_change: quantityChange,
            notes: update.notes || 'Bulk adjustment',
            created_by: user!.id
          });

        results.push({ ...update, quantityChange });
      }

      return results;
    },
    onSuccess: (results) => {
      toast({
        title: "Bulk Update Complete",
        description: `Updated ${results.length} items successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Update Failed",
        description: error.message || "Failed to update inventory",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription for inventory changes
  const { isConnected: isRealTimeConnected } = useRealTimeSubscription([
    {
      table: 'inventory',
      filter: `location_id=eq.${effectiveLocationId}`,
      callback: (payload) => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        
        if (payload.eventType === 'UPDATE') {
          const { new: newRecord, old: oldRecord } = payload;
          const stockChange = newRecord.current_stock - oldRecord.current_stock;
          
          if (Math.abs(stockChange) > 0) {
            toast({
              title: "Inventory Updated",
              description: `Stock changed by ${stockChange > 0 ? '+' : ''}${stockChange} units`,
              duration: 3000,
            });
          }
        }
      }
    },
    {
      table: 'inventory_transactions',
      filter: `location_id=eq.${effectiveLocationId}`,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      }
    }
  ], { enabled: !!effectiveLocationId });

  // Calculate inventory metrics
  const inventoryMetrics = {
    totalItems: inventory?.length || 0,
    totalValue: inventory?.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0) || 0,
    lowStockCount: stockAlerts?.filter(alert => alert.status === 'low_stock').length || 0,
    outOfStockCount: stockAlerts?.filter(alert => alert.status === 'out_of_stock').length || 0,
    overstockCount: stockAlerts?.filter(alert => alert.status === 'overstock').length || 0,
  };

  return {
    inventory,
    transactions,
    stockAlerts,
    inventoryMetrics,
    isLoading,
    transactionsLoading,
    error,
    isRealTimeConnected,
    updateInventory: updateInventoryMutation.mutate,
    bulkUpdateInventory: bulkUpdateMutation.mutate,
    isUpdating: updateInventoryMutation.isPending || bulkUpdateMutation.isPending,
    refetch
  };
};

// Hook for franchisor to view inventory across all locations
export const useRealTimeFranchisorInventory = () => {
  const { user } = useAuth();

  const { data: allLocationsInventory, isLoading } = useQuery({
    queryKey: ['franchisor-inventory', user?.id],
    queryFn: async () => {
      // Get all locations for this franchisor
      const { data: locations } = await supabase
        .from('franchise_locations')
        .select('id, name, address')
        .eq('franchisor_id', user!.id);

      if (!locations) return [];

      // Get inventory data for all locations
      const locationInventory = await Promise.all(
        locations.map(async (location) => {
          const { data: inventory } = await supabase
            .from('inventory')
            .select(`
              *,
              products (name, sku, category)
            `)
            .eq('location_id', location.id);

          const totalValue = inventory?.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0) || 0;
          const lowStockCount = inventory?.filter(item => item.current_stock <= item.reorder_level).length || 0;
          const outOfStockCount = inventory?.filter(item => item.current_stock <= 0).length || 0;

          return {
            ...location,
            inventory: inventory || [],
            totalValue,
            lowStockCount,
            outOfStockCount,
            totalItems: inventory?.length || 0
          };
        })
      );

      return locationInventory;
    },
    enabled: !!user && user.role === 'franchisor',
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  return {
    allLocationsInventory,
    isLoading,
    totalNetworkValue: allLocationsInventory?.reduce((sum, location) => sum + location.totalValue, 0) || 0,
    totalLowStockAlerts: allLocationsInventory?.reduce((sum, location) => sum + location.lowStockCount, 0) || 0,
    totalOutOfStockAlerts: allLocationsInventory?.reduce((sum, location) => sum + location.outOfStockCount, 0) || 0
  };
};
