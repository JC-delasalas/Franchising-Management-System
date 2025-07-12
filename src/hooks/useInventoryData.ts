
import { useState, useEffect, useCallback } from 'react';
import { inventoryDataService } from '@/services/dataService';
import { useDebounce } from './usePerformanceOptimization';

interface UseInventoryDataReturn {
  inventoryItems: any[];
  recentOrders: any[];
  products: any[];
  lowStockItems: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
}

export const useInventoryData = (locationId?: string): UseInventoryDataReturn => {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching inventory data...');
      
      // Fetch data in parallel for better performance
      const [productsResult, inventoryResult, ordersResult] = await Promise.allSettled([
        inventoryDataService.getProducts(),
        inventoryDataService.getInventory(locationId),
        inventoryDataService.getInventoryOrders()
      ]);

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value);
      } else {
        console.error('Failed to fetch products:', productsResult.reason);
      }

      if (inventoryResult.status === 'fulfilled') {
        const inventory = inventoryResult.value;
        setInventoryItems(inventory);
        
        // Filter low stock items
        const lowStock = inventory.filter(item => 
          item.current_stock <= item.min_stock_level
        );
        setLowStockItems(lowStock);
      } else {
        console.error('Failed to fetch inventory items:', inventoryResult.reason);
      }

      if (ordersResult.status === 'fulfilled') {
        setRecentOrders(ordersResult.value);
      } else {
        console.error('Failed to fetch recent orders:', ordersResult.reason);
      }

      console.log('Inventory data fetched successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory data';
      console.error('Error fetching inventory data:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [locationId]);

  // Debounced refetch to prevent excessive API calls
  const debouncedFetch = useDebounce(fetchData, 300);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await debouncedFetch();
  }, [debouncedFetch]);

  const createOrder = useCallback(async (orderData: any) => {
    try {
      await inventoryDataService.createInventoryOrder(orderData);
      // Refresh data after creating order
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      console.error('Error creating order:', err);
      throw new Error(errorMessage);
    }
  }, [fetchData]);

  return {
    inventoryItems,
    recentOrders,
    products,
    lowStockItems,
    isLoading,
    error,
    refetch,
    createOrder
  };
};
