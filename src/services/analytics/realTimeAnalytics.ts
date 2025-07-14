import { supabase } from '@/integrations/supabase/client';

export interface RealTimeMetrics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  topPerformingLocations: Array<{
    locationName: string;
    sales: number;
    transactions: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  kpiPerformance: Array<{
    kpiName: string;
    actual: number;
    target: number;
    achievement: number;
  }>;
  lastUpdated: string;
}

export interface AnalyticsFilter {
  dateFrom?: string;
  dateTo?: string;
  brandId?: string;
  locationId?: string;
  franchisorId?: string;
}

/**
 * Real-time Analytics Service
 * Provides hybrid OLTP/OLAP analytics with real-time data synchronization
 */
export class RealTimeAnalyticsService {
  
  /**
   * Get real-time dashboard metrics
   */
  static async getRealTimeMetrics(filter: AnalyticsFilter = {}): Promise<RealTimeMetrics> {
    const dateFrom = filter.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = filter.dateTo || new Date().toISOString().split('T')[0];
    
    try {
      // Get sales data from OLTP system for real-time accuracy
      const salesData = await this.getSalesData(dateFrom, dateTo, filter);
      
      // Get KPI data
      const kpiData = await this.getKPIData(dateFrom, dateTo, filter);
      
      // Calculate metrics
      const totalSales = salesData.reduce((sum, sale) => sum + (sale.total_sales || 0), 0);
      const totalTransactions = salesData.reduce((sum, sale) => sum + (sale.transaction_count || 0), 0);
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      
      // Get top performing locations
      const locationPerformance = await this.getLocationPerformance(dateFrom, dateTo, filter);
      
      // Get sales trend
      const salesTrend = await this.getSalesTrend(dateFrom, dateTo, filter);
      
      return {
        totalSales,
        totalTransactions,
        averageOrderValue,
        topPerformingLocations: locationPerformance,
        salesTrend,
        kpiPerformance: kpiData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get sales data from OLTP system
   */
  private static async getSalesData(dateFrom: string, dateTo: string, filter: AnalyticsFilter) {
    let query = supabase
      .from('daily_sales_report')
      .select(`
        total_sales,
        total_transactions,
        report_date,
        location:location_id(
          location_name,
          franchisee:franchisee_id(
            business_name,
            brand:brand_id(
              brand_name,
              franchisor_id
            )
          )
        )
      `)
      .gte('report_date', dateFrom)
      .lte('report_date', dateTo);
    
    if (filter.brandId) {
      query = query.eq('location.franchisee.brand_id', filter.brandId);
    }
    
    if (filter.locationId) {
      query = query.eq('location_id', filter.locationId);
    }
    
    if (filter.franchisorId) {
      query = query.eq('location.franchisee.brand.franchisor_id', filter.franchisorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(item => ({
      total_sales: item.total_sales || 0,
      transaction_count: item.total_transactions || 0,
      date: item.report_date,
      location_name: item.location?.location_name,
      franchisee_name: item.location?.franchisee?.business_name,
      brand_name: item.location?.franchisee?.brand?.brand_name
    })) || [];
  }
  
  /**
   * Get KPI performance data
   */
  private static async getKPIData(dateFrom: string, dateTo: string, filter: AnalyticsFilter) {
    let query = supabase
      .from('kpi_data')
      .select(`
        actual_value,
        recorded_date,
        kpi:kpi_id(
          kpi_name,
          target_value,
          brand_id
        ),
        location:location_id(
          franchisee:franchisee_id(
            brand:brand_id(
              franchisor_id
            )
          )
        )
      `)
      .gte('recorded_date', dateFrom)
      .lte('recorded_date', dateTo);
    
    if (filter.brandId) {
      query = query.eq('kpi.brand_id', filter.brandId);
    }
    
    if (filter.locationId) {
      query = query.eq('location_id', filter.locationId);
    }
    
    if (filter.franchisorId) {
      query = query.eq('location.franchisee.brand.franchisor_id', filter.franchisorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Aggregate KPI data by KPI name
    const kpiMap = new Map();
    
    data?.forEach(item => {
      const kpiName = item.kpi?.kpi_name;
      if (!kpiName) return;
      
      if (!kpiMap.has(kpiName)) {
        kpiMap.set(kpiName, {
          kpiName,
          actual: 0,
          target: item.kpi.target_value || 0,
          count: 0
        });
      }
      
      const kpi = kpiMap.get(kpiName);
      kpi.actual += item.actual_value || 0;
      kpi.count += 1;
    });
    
    return Array.from(kpiMap.values()).map(kpi => ({
      kpiName: kpi.kpiName,
      actual: kpi.actual / kpi.count, // Average actual value
      target: kpi.target,
      achievement: kpi.target > 0 ? (kpi.actual / kpi.count / kpi.target) * 100 : 0
    }));
  }
  
  /**
   * Get location performance data
   */
  private static async getLocationPerformance(dateFrom: string, dateTo: string, filter: AnalyticsFilter) {
    const salesData = await this.getSalesData(dateFrom, dateTo, filter);
    
    const locationMap = new Map();
    
    salesData.forEach(sale => {
      const locationName = sale.location_name || 'Unknown Location';
      
      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, {
          locationName,
          sales: 0,
          transactions: 0
        });
      }
      
      const location = locationMap.get(locationName);
      location.sales += sale.total_sales;
      location.transactions += sale.transaction_count;
    });
    
    return Array.from(locationMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 locations
  }
  
  /**
   * Get sales trend data
   */
  private static async getSalesTrend(dateFrom: string, dateTo: string, filter: AnalyticsFilter) {
    const salesData = await this.getSalesData(dateFrom, dateTo, filter);
    
    const trendMap = new Map();
    
    salesData.forEach(sale => {
      const date = sale.date;
      
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          sales: 0,
          transactions: 0
        });
      }
      
      const trend = trendMap.get(date);
      trend.sales += sale.total_sales;
      trend.transactions += sale.transaction_count;
    });
    
    return Array.from(trendMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Subscribe to real-time updates
   */
  static subscribeToRealTimeUpdates(callback: (metrics: RealTimeMetrics) => void, filter: AnalyticsFilter = {}) {
    // Subscribe to daily_sales_report changes
    const salesSubscription = supabase
      .channel('sales-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_sales_report' 
        }, 
        async () => {
          try {
            const metrics = await this.getRealTimeMetrics(filter);
            callback(metrics);
          } catch (error) {
            console.error('Error updating real-time metrics:', error);
          }
        }
      )
      .subscribe();
    
    // Subscribe to KPI data changes
    const kpiSubscription = supabase
      .channel('kpi-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'kpi_data' 
        }, 
        async () => {
          try {
            const metrics = await this.getRealTimeMetrics(filter);
            callback(metrics);
          } catch (error) {
            console.error('Error updating real-time metrics:', error);
          }
        }
      )
      .subscribe();
    
    return () => {
      salesSubscription.unsubscribe();
      kpiSubscription.unsubscribe();
    };
  }
  
  /**
   * Sync OLTP data to OLAP warehouse
   */
  static async syncToWarehouse(dateFrom?: string, dateTo?: string): Promise<void> {
    const from = dateFrom || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = dateTo || new Date().toISOString().split('T')[0];
    
    console.log(`Syncing data to warehouse for period: ${from} to ${to}`);
    
    try {
      // Get sales data from OLTP
      const salesData = await this.getSalesData(from, to, {});
      
      // Transform and load to OLAP fact tables
      await this.loadDailySalesFacts(salesData);
      
      console.log('Data sync to warehouse completed');
    } catch (error) {
      console.error('Error syncing to warehouse:', error);
      throw error;
    }
  }
  
  /**
   * Load daily sales facts to OLAP warehouse
   */
  private static async loadDailySalesFacts(salesData: any[]) {
    // Get dimension keys
    const { data: locationKeys } = await supabase
      .from('analytics.dim_location')
      .select('location_key, location_id')
      .eq('is_current', true);
    
    const locationKeyMap = new Map(
      locationKeys?.map(l => [l.location_id, l.location_key]) || []
    );
    
    // Transform sales data to fact format
    const factData = salesData.map(sale => {
      const dateKey = parseInt(sale.date.replace(/-/g, ''));
      
      return {
        date_key: dateKey,
        location_key: locationKeyMap.get(sale.location_id),
        total_transactions: sale.transaction_count,
        total_customers: sale.transaction_count, // Assuming 1:1 for now
        total_quantity_sold: sale.transaction_count, // Placeholder
        gross_sales_amount: sale.total_sales,
        net_sales_amount: sale.total_sales,
        total_discount_amount: 0,
        average_transaction_value: sale.transaction_count > 0 ? sale.total_sales / sale.transaction_count : 0
      };
    }).filter(fact => fact.location_key);
    
    if (factData.length > 0) {
      await supabase
        .from('analytics.fact_daily_sales')
        .upsert(factData, { onConflict: 'date_key,location_key' });
    }
  }
}
