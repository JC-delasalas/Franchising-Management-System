import { supabase } from './supabase';

// Database optimization utilities and query builders
export class DatabaseOptimizer {
  // Optimized query builder with proper indexing hints
  static buildOptimizedQuery(table: string, options: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
    joins?: Array<{ table: string; on: string; type?: 'inner' | 'left' | 'right' }>;
  }) {
    let query = supabase.from(table);
    
    // Select specific columns to reduce payload
    if (options.select) {
      query = query.select(options.select);
    }
    
    // Apply filters with proper indexing
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? false 
      });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    return query;
  }
  
  // Batch query executor for multiple related queries
  static async executeBatchQueries(queries: Array<() => Promise<any>>) {
    const startTime = performance.now();
    
    try {
      const results = await Promise.all(queries.map(query => query()));
      const endTime = performance.now();
      
      // Log performance metrics
      console.log(`Batch query executed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return results;
    } catch (error) {
      console.error('Batch query failed:', error);
      throw error;
    }
  }
  
  // Optimized dashboard data fetcher
  static async getDashboardData(userId: string, role: string) {
    const queries = [];
    
    if (role === 'franchisor') {
      // Franchisor dashboard queries
      queries.push(
        // Recent orders with minimal data
        () => this.buildOptimizedQuery('orders', {
          select: 'id, order_number, status, total_amount, created_at, franchise_location:franchise_locations(name)',
          filters: { created_by: userId },
          orderBy: { column: 'created_at', ascending: false },
          limit: 10
        }).then(({ data }) => data),
        
        // Pending approvals count
        () => supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Pending')
          .then(({ count }) => count),
        
        // Revenue summary
        () => supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'Completed')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .then(({ data }) => data?.reduce((sum, order) => sum + order.total_amount, 0) || 0)
      );
    } else if (role === 'franchisee') {
      // Franchisee dashboard queries
      queries.push(
        // Recent orders
        () => this.buildOptimizedQuery('orders', {
          select: 'id, order_number, status, total_amount, created_at',
          filters: { created_by: userId },
          orderBy: { column: 'created_at', ascending: false },
          limit: 5
        }).then(({ data }) => data),
        
        // Inventory alerts using unified inventory view
        () => supabase
          .from('unified_inventory')
          .select('product_id, quantity, reorder_point, product_name')
          .lt('quantity', supabase.raw('reorder_point'))
          .limit(5)
          .then(({ data }) => data),
        
        // Notifications count
        () => supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false)
          .then(({ count }) => count)
      );
    }
    
    return this.executeBatchQueries(queries);
  }
  
  // Optimized order list with pagination
  static async getOrdersList(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    dateRange?: { start: string; end: string };
  } = {}) {
    const { page = 1, limit = 20, status, dateRange } = options;
    const offset = (page - 1) * limit;
    
    const filters: Record<string, any> = { created_by: userId };
    if (status) filters.status = status;
    
    let query = this.buildOptimizedQuery('orders', {
      select: `
        id,
        order_number,
        status,
        total_amount,
        created_at,
        franchise_location:franchise_locations(name),
        order_items(
          id,
          quantity,
          unit_price,
          product:products(name, sku)
        )
      `,
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset
    });
    
    // Apply date range filter if provided
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }
    
    const [{ data: orders, error }, { count }] = await Promise.all([
      query,
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
    ]);
    
    if (error) throw error;
    
    return {
      orders: orders || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  }
  
  // Optimized product catalog with search and filters
  static async getProductCatalog(options: {
    search?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    page?: number;
    limit?: number;
  } = {}) {
    const { search, category, priceRange, page = 1, limit = 24 } = options;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        price,
        category,
        image_url,
        description,
        in_stock,
        inventory_levels(current_stock)
      `)
      .eq('active', true)
      .order('name');
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }
    
    // Apply price range filter
    if (priceRange) {
      query = query.gte('price', priceRange.min).lte('price', priceRange.max);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      products: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  }
  
  // Optimized analytics queries
  static async getAnalyticsData(locationId: string, period: string) {
    const dateRange = this.getDateRange(period);
    
    const queries = [
      // Sales data
      () => supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('franchise_location_id', locationId)
        .eq('status', 'Completed')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at'),
      
      // Top products
      () => supabase
        .from('order_items')
        .select(`
          quantity,
          total_price,
          product:products(name),
          order:orders!inner(franchise_location_id, status, created_at)
        `)
        .eq('order.franchise_location_id', locationId)
        .eq('order.status', 'Completed')
        .gte('order.created_at', dateRange.start)
        .lte('order.created_at', dateRange.end)
        .limit(10),
      
      // Inventory turnover
      () => supabase
        .from('inventory_movements')
        .select('product_id, quantity, movement_type, created_at')
        .eq('warehouse_id', locationId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
    ];
    
    return this.executeBatchQueries(queries);
  }
  
  // Helper method to get date ranges
  private static getDateRange(period: string) {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  }
}

// Database indexing recommendations
export const indexingRecommendations = {
  // Critical indexes for performance
  orders: [
    'CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);',
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);',
    'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_orders_franchise_location ON orders(franchise_location_id);',
    'CREATE INDEX IF NOT EXISTS idx_orders_composite ON orders(created_by, status, created_at DESC);'
  ],
  
  products: [
    'CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;',
    'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);',
    'CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);',
    'CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector(\'english\', name || \' \' || description));'
  ],
  
  notifications: [
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);',
    'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);'
  ],
  
  inventory: [
    'CREATE INDEX IF NOT EXISTS idx_inventory_levels_product ON inventory_levels(product_id);',
    'CREATE INDEX IF NOT EXISTS idx_inventory_levels_warehouse ON inventory_levels(warehouse_id);',
    'CREATE INDEX IF NOT EXISTS idx_inventory_movements_warehouse_date ON inventory_movements(warehouse_id, created_at DESC);'
  ]
};

export default DatabaseOptimizer;
