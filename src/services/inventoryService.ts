
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  status: 'Good' | 'Low' | 'Critical';
  price: number;
  category: string;
  sku: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  franchiseeId: string;
  franchiseeName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  notes?: string;
}

class InventoryService {
  private readonly ORDERS_KEY = 'inventory_orders';

  // Helper method to store orders in localStorage
  private getStoredOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing stored orders:', error);
      return [];
    }
  }

  private saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      console.log('Fetching inventory items from database...');
      
      // Query inventory with product details and stock levels
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:product_id (
            product_id,
            product_nm,
            unit_price,
            sku,
            product_category:category_id (
              cat_nm
            )
          )
        `);

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      if (!inventory || inventory.length === 0) {
        console.log('No inventory found in database, using fallback data for testing');
        return this.getFallbackInventoryItems();
      }

      console.log(`Fetched ${inventory.length} inventory items from database`);

      return inventory.map(item => {
        const product = item.product;
        const currentStock = item.current_stock || 0;
        const reorderLevel = item.min_stock_level || 10;
        
        let status: 'Good' | 'Low' | 'Critical' = 'Good';
        if (currentStock === 0) {
          status = 'Critical';
        } else if (currentStock <= reorderLevel) {
          status = 'Low';
        }

        return {
          id: product.product_id,
          name: product.product_nm,
          currentStock,
          unit: 'pcs', // Default unit, could be enhanced with product unit field
          reorderLevel,
          status,
          price: Number(product.unit_price),
          category: product.product_category?.cat_nm || 'General',
          sku: product.sku
        };
      });
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      return this.getFallbackInventoryItems();
    }
  }

  private getFallbackInventoryItems(): InventoryItem[] {
    return [
      { 
        id: '1', 
        name: 'Siomai Mix (500pcs)', 
        currentStock: 45, 
        unit: 'pcs', 
        reorderLevel: 20, 
        status: 'Good', 
        price: 2500, 
        category: 'Food',
        sku: 'SM-MIX-500'
      },
      { 
        id: '2', 
        name: 'Sauce Packets (100pcs)', 
        currentStock: 12, 
        unit: 'boxes', 
        reorderLevel: 15, 
        status: 'Low', 
        price: 450, 
        category: 'Condiments',
        sku: 'SC-PKT-100'
      },
      { 
        id: '3', 
        name: 'Disposable Containers (200pcs)', 
        currentStock: 156, 
        unit: 'pcs', 
        reorderLevel: 50, 
        status: 'Good', 
        price: 1200, 
        category: 'Packaging',
        sku: 'DC-CNT-200'
      },
      { 
        id: '4', 
        name: 'Paper Bags (50 bundles)', 
        currentStock: 8, 
        unit: 'bundles', 
        reorderLevel: 10, 
        status: 'Critical', 
        price: 800, 
        category: 'Packaging',
        sku: 'PB-BND-50'
      },
      { 
        id: '5', 
        name: 'Chili Oil (1L)', 
        currentStock: 5, 
        unit: 'bottles', 
        reorderLevel: 8, 
        status: 'Critical', 
        price: 350, 
        category: 'Condiments',
        sku: 'CO-1L'
      },
      { 
        id: '6', 
        name: 'Soy Sauce (500ml)', 
        currentStock: 25, 
        unit: 'bottles', 
        reorderLevel: 12, 
        status: 'Good', 
        price: 180, 
        category: 'Condiments',
        sku: 'SS-500ML'
      },
      { 
        id: '7', 
        name: 'Napkins (1000pcs)', 
        currentStock: 3, 
        unit: 'packs', 
        reorderLevel: 5, 
        status: 'Low', 
        price: 250, 
        category: 'Supplies',
        sku: 'NP-1000'
      },
      { 
        id: '8', 
        name: 'Plastic Spoons (500pcs)', 
        currentStock: 45, 
        unit: 'packs', 
        reorderLevel: 20, 
        status: 'Good', 
        price: 320, 
        category: 'Supplies',
        sku: 'PS-500'
      }
    ];
  }

  async createOrder(items: OrderItem[], notes?: string): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Using demo mode for order creation');
      }

      console.log('Creating inventory order...', { items, notes });

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order: Order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        franchiseeId: user?.id || 'demo-user',
        franchiseeName: user ? `${user.firstName} ${user.lastName}` : 'Demo User',
        items,
        totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString(),
        notes
      };

      // Store the order in localStorage so it can be retrieved
      const existingOrders = this.getStoredOrders();
      existingOrders.unshift(order); // Add to beginning of array (most recent first)
      this.saveOrders(existingOrders);

      console.log('Order created and stored:', order);

      // Simulate API delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 1000));

      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getRecentOrders(): Promise<Order[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Using demo mode for recent orders');
      }

      console.log('Fetching recent orders...');

      // Get stored orders first
      const storedOrders = this.getStoredOrders();
      
      // Default mock orders for initial state
      const defaultOrders: Order[] = [
        {
          id: 'ORD-2024-001',
          franchiseeId: user?.id || 'demo-user',
          franchiseeName: user ? `${user.firstName} ${user.lastName}` : 'Demo User',
          items: [
            { id: '1', name: 'Siomai Mix (500pcs)', quantity: 2, price: 2500, unit: 'pcs' },
            { id: '2', name: 'Sauce Packets (100pcs)', quantity: 5, price: 450, unit: 'boxes' }
          ],
          totalAmount: 7250,
          status: 'delivered',
          orderDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          notes: 'Rush order for weekend promotion'
        },
        {
          id: 'ORD-2024-002',
          franchiseeId: user?.id || 'demo-user',
          franchiseeName: user ? `${user.firstName} ${user.lastName}` : 'Demo User',
          items: [
            { id: '3', name: 'Disposable Containers (200pcs)', quantity: 3, price: 1200, unit: 'pcs' }
          ],
          totalAmount: 3600,
          status: 'shipped',
          orderDate: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'ORD-2024-003',
          franchiseeId: user?.id || 'demo-user',
          franchiseeName: user ? `${user.firstName} ${user.lastName}` : 'Demo User',
          items: [
            { id: '4', name: 'Paper Bags (50 bundles)', quantity: 1, price: 800, unit: 'bundles' },
            { id: '5', name: 'Chili Oil (1L)', quantity: 2, price: 350, unit: 'bottles' }
          ],
          totalAmount: 1500,
          status: 'processing',
          orderDate: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      // Combine stored orders with default orders, stored orders first
      const allOrders = [...storedOrders, ...defaultOrders];
      
      // Remove duplicates by ID and limit to recent orders
      const uniqueOrders = allOrders.reduce((acc, current) => {
        const existing = acc.find(order => order.id === current.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as Order[]);

      // Sort by order date (most recent first) and limit to 10
      const recentOrders = uniqueOrders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 10);

      console.log(`Fetched ${recentOrders.length} recent orders (${storedOrders.length} newly created)`);
      return recentOrders;
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      return [];
    }
  }
}

export const inventoryService = new InventoryService();
