
import { useState, useEffect, useCallback } from 'react';
import { inventoryDataService } from '@/services/dataService';
import { inventoryService } from '@/services/inventoryService';
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
      
      // Use the inventory service to get properly formatted data
      const [inventoryItemsResult, ordersResult] = await Promise.allSettled([
        inventoryService.getInventoryItems(), // This returns properly formatted data
        inventoryService.getRecentOrders()
      ]);

      if (inventoryItemsResult.status === 'fulfilled') {
        const items = inventoryItemsResult.value;
        console.log(`Fetched ${items.length} inventory items`);
        setInventoryItems(items);
        setProducts(items); // Also set as products for compatibility
        
        // Filter low stock items
        const lowStock = items.filter(item => 
          item.status === 'Low' || item.status === 'Critical'
        );
        setLowStockItems(lowStock);
      } else {
        console.error('Failed to fetch inventory items:', inventoryItemsResult.reason);
        setInventoryItems([]);
        setProducts([]);
        setLowStockItems([]);
      }

      if (ordersResult.status === 'fulfilled') {
        setRecentOrders(ordersResult.value);
      } else {
        console.error('Failed to fetch recent orders:', ordersResult.reason);
        setRecentOrders([]);
      }

      console.log('Inventory data fetched successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory data';
      console.error('Error fetching inventory data:', err);
      setError(errorMessage);
      setInventoryItems([]);
      setProducts([]);
      setLowStockItems([]);
      setRecentOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

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
