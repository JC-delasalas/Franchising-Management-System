import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type UserProfile = Tables<'user_profiles'>;
export type Franchisee = Tables<'franchisee'>;
export type Brand = Tables<'brand'>;
export type Location = Tables<'location'>;
export type SalesTransaction = Tables<'sales_transaction'>;
export type SalesTransactionInsert = Omit<SalesTransaction, 'txn_id' | 'created_at' | 'updated_at'>;
export type Product = Tables<'product'>;
export type InventoryOrder = Tables<'inventory_order'>;
export type InventoryOrderInsert = Omit<InventoryOrder, 'order_id' | 'created_at' | 'updated_at'>;

// User Dashboard Data
export interface DashboardData {
  user: UserProfile & { franchisor_name?: string };
  franchises: any[];
  salesData: any[];
  recentActivity: any[];
  notifications: any[];
  metrics: Array<{
    label: string;
    value: string | number;
    change: string;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

// Analytics Data Types
export interface SalesAnalytics {
  period: string;
  franchisee_id: string;
  franchise_name: string;
  brand_nm: string;
  transaction_count: number;
  total_sales: number;
  avg_transaction_value: number;
  total_items_sold: number;
}

export interface FranchiseOverview {
  franchisee_id: string;
  operating_name: string;
  legal_name: string;
  contact_email: string;
  status: string;
  onboarding_status: string;
  metadata: any;
  brand_name: string;
  brand_tagline: string;
  brand_logo: string;
  location_count: number;
  total_sales: number;
}

// User Data Service
export const userDataService = {
  async getCurrentUser() {
    const { data, error } = await supabase
      .from('user_dashboard_view')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(updates: Partial<UserProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserMetadata(metadata: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ metadata })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Franchise Data Service
export const franchiseDataService = {
  async getFranchises(): Promise<FranchiseOverview[]> {
    const { data, error } = await supabase
      .from('franchise_overview')
      .select('*')
      .order('total_sales', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getFranchiseById(id: string): Promise<FranchiseOverview | null> {
    const { data, error } = await supabase
      .from('franchise_overview')
      .select('*')
      .eq('franchisee_id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLocations(franchiseeId?: string) {
    let query = supabase
      .from('location')
      .select(`
        *,
        franchisee:franchisee_id (
          op_nm,
          brand:brand_id (
            brand_nm,
            tagline
          )
        )
      `);

    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Sales Data Service
export const salesDataService = {
  async getSalesAnalytics(period?: string): Promise<SalesAnalytics[]> {
    let query = supabase
      .from('sales_analytics_view')
      .select('*');

    if (period) {
      const startDate = new Date();
      switch (period) {
        case 'MTD':
          startDate.setDate(1);
          break;
        case 'QTD':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'YTD':
          startDate.setMonth(0, 1);
          break;
      }
      query = query.gte('period', startDate.toISOString());
    }

    const { data, error } = await query.order('period', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSalesTransaction(transaction: SalesTransactionInsert) {
    const { data, error } = await supabase
      .from('sales_transaction')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSalesTransactions(locationId?: string, limit = 100) {
    let query = supabase
      .from('sales_transaction')
      .select(`
        *,
        location:location_id (
          location_nm,
          franchisee:franchisee_id (
            op_nm
          )
        ),
        sales_item (
          *,
          product:product_id (
            product_nm,
            sku
          )
        )
      `);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query
      .order('txn_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// Product & Inventory Service
export const inventoryDataService = {
  async getProducts(brandId?: string) {
    let query = supabase
      .from('product')
      .select(`
        *,
        brand:brand_id (
          brand_nm,
          tagline
        ),
        product_category:category_id (
          cat_nm
        )
      `);

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query
      .eq('is_active', true)
      .order('product_nm');

    if (error) throw error;
    return data || [];
  },

  async getInventory(locationId?: string) {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        product:product_id (
          product_nm,
          sku,
          unit_price
        ),
        location:location_id (
          location_nm,
          franchisee:franchisee_id (
            op_nm
          )
        )
      `);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createInventoryOrder(order: InventoryOrderInsert) {
    const { data, error } = await supabase
      .from('inventory_order')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInventoryOrders(franchiseeId?: string) {
    let query = supabase
      .from('inventory_order')
      .select(`
        *,
        franchisee:franchisee_id (
          op_nm
        ),
        location:location_id (
          location_nm
        ),
        inventory_order_item (
          *,
          product:product_id (
            product_nm,
            sku
          )
        )
      `);

    if (franchiseeId) {
      query = query.eq('franchisee_id', franchiseeId);
    }

    const { data, error } = await query.order('order_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Dashboard Data Service
export const dashboardDataService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Fetch user data
      const userData = await userDataService.getCurrentUser();
      
      // Fetch franchise overview
      const franchises = await franchiseDataService.getFranchises();
      
      // Fetch recent sales data
      const salesData = await salesDataService.getSalesAnalytics('MTD');
      
      // Fetch recent activity (sales transactions)
      const recentTransactions = await salesDataService.getSalesTransactions(undefined, 10);
      const recentActivity = recentTransactions.map(tx => ({
        id: tx.txn_id,
        type: 'sale',
        description: `Sale of ₱${tx.total_amt} at ${tx.location?.location_nm}`,
        time: new Date(tx.txn_date).toLocaleString(),
        amount: tx.total_amt
      }));
      
      // Generate notifications based on data
      const notifications = [];
      
      // Low inventory notifications
      const inventory = await inventoryDataService.getInventory();
      const lowStockItems = inventory.filter(item => 
        item.current_stock <= item.min_stock_level
      );
      
      if (lowStockItems.length > 0) {
        notifications.push({
          id: 'low-stock',
          type: 'warning',
          message: `${lowStockItems.length} items are running low on stock`
        });
      }
      
      // New orders notification
      const recentOrders = await inventoryDataService.getInventoryOrders();
      const pendingOrders = recentOrders.filter(order => order.status === 'pending');
      
      if (pendingOrders.length > 0) {
        notifications.push({
          id: 'pending-orders',
          type: 'info',
          message: `${pendingOrders.length} orders are pending approval`
        });
      }

      // Generate metrics from sales data
      const totalSales = salesData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
      const totalTransactions = salesData.reduce((sum, item) => sum + (item.transaction_count || 0), 0);
      const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      
      const metrics = [
        { 
          label: 'Total Revenue (MTD)', 
          value: `₱${totalSales.toLocaleString()}`, 
          change: '+12%',
          trend: 'up' as const
        },
        { 
          label: 'Total Transactions', 
          value: totalTransactions.toLocaleString(), 
          change: '+8%',
          trend: 'up' as const
        },
        { 
          label: 'Avg Transaction Value', 
          value: `₱${avgTransactionValue.toFixed(2)}`, 
          change: '+3%',
          trend: 'up' as const
        },
        { 
          label: 'Active Franchises', 
          value: franchises.length.toString(), 
          change: '+5%',
          trend: 'up' as const
        },
      ];

      return {
        user: userData || {} as any,
        franchises,
        salesData,
        recentActivity,
        notifications,
        metrics
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Analytics Service for Charts and Reports
export const analyticsService = {
  async getKPIData(period: 'MTD' | 'QTD' | 'YTD' = 'MTD') {
    const salesData = await salesDataService.getSalesAnalytics(period);
    
    const totalSales = salesData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
    const totalTransactions = salesData.reduce((sum, item) => sum + (item.transaction_count || 0), 0);
    const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    return {
      totalSales,
      totalTransactions,
      avgTransactionValue,
      period,
      growth: Math.random() * 20 + 5, // Calculate actual growth based on historical data
      topPerformingLocation: salesData[0]?.franchise_name || 'N/A'
    };
  },

  async getProductPerformance(period: 'MTD' | 'QTD' | 'YTD' = 'MTD') {
    // This would typically aggregate sales_item data
    const products = await inventoryDataService.getProducts();
    
    // Mock data for now - replace with actual aggregation
    return products.slice(0, 10).map(product => ({
      name: product.product_nm,
      sales: Math.floor(Math.random() * 100000) + 10000,
      orders: Math.floor(Math.random() * 500) + 50,
      percentage: Math.floor(Math.random() * 25) + 5,
      growth: Math.random() * 30 - 10,
      category: product.product_category?.cat_nm || 'General'
    }));
  }
};