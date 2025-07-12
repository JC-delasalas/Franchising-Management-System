
import { useState, useEffect, useCallback } from 'react';
import { inventoryService, InventoryItem, Order } from '@/services/inventoryService';
import { useDebounce } from './usePerformanceOptimization';

interface UseInventoryDataReturn {
  inventoryItems: InventoryItem[];
  recentOrders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInventoryData = (): UseInventoryDataReturn => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching inventory data...');
      
      // Fetch data in parallel for better performance
      const [itemsResult, ordersResult] = await Promise.allSettled([
        inventoryService.getInventoryItems(),
        inventoryService.getRecentOrders()
      ]);

      if (itemsResult.status === 'fulfilled') {
        setInventoryItems(itemsResult.value);
      } else {
        console.error('Failed to fetch inventory items:', itemsResult.reason);
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
  }, []);

  // Debounced refetch to prevent excessive API calls
  const debouncedFetch = useDebounce(fetchData, 300);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await debouncedFetch();
  }, [debouncedFetch]);

  return {
    inventoryItems,
    recentOrders,
    isLoading,
    error,
    refetch
  };
};
