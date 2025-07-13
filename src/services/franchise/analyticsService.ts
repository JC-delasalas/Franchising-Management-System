import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type KPI = Database['public']['Tables']['kpi']['Row'];
type KPIInsert = Database['public']['Tables']['kpi']['Insert'];
type KPIData = Database['public']['Tables']['kpi_data']['Row'];
type KPIDataInsert = Database['public']['Tables']['kpi_data']['Insert'];

export interface KPICreateData {
  brand_id: string;
  kpi_nm: string;
  details?: string;
  target_value?: number;
  unit_of_measure?: string;
}

export interface KPIDataCreateData {
  kpi_id: string;
  location_id?: string;
  actual_value: number;
  recorded_date: string;
}

export interface AnalyticsFilter {
  brandId?: string;
  locationId?: string;
  franchiseeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: Array<{
    product_nm: string;
    total_sales: number;
    transaction_count: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  kpiPerformance: Array<{
    kpi_nm: string;
    target_value: number;
    actual_value: number;
    achievement_percentage: number;
  }>;
}

/**
 * Data-Driven Performance Analytics Service
 * Supports Objective 5: Data-Driven Performance Analytics
 */
export class AnalyticsService {

  /**
   * Create a new KPI
   */
  static async createKPI(kpiData: KPICreateData) {
    try {
      const { data, error } = await supabase
        .from('kpi')
        .insert(kpiData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating KPI:', error);
      return { success: false, error };
    }
  }

  /**
   * Get KPIs for a brand
   */
  static async getKPIs(brandId: string) {
    try {
      const { data, error } = await supabase
        .from('kpi')
        .select(`
          *,
          latest_data:kpi_data(
            actual_value,
            recorded_date,
            location:location_id(location_nm)
          )
        `)
        .eq('brand_id', brandId)
        .order('kpi_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return { success: false, error };
    }
  }

  /**
   * Record KPI data
   */
  static async recordKPIData(kpiDataArray: KPIDataCreateData[]) {
    try {
      const { data, error } = await supabase
        .from('kpi_data')
        .insert(kpiDataArray)
        .select(`
          *,
          kpi:kpi_id(kpi_nm, target_value, unit_of_measure),
          location:location_id(location_nm)
        `);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error recording KPI data:', error);
      return { success: false, error };
    }
  }

  /**
   * Get KPI performance data
   */
  static async getKPIPerformance(kpiId: string, filter: AnalyticsFilter = {}) {
    try {
      let query = supabase
        .from('kpi_data')
        .select(`
          *,
          kpi:kpi_id(kpi_nm, target_value, unit_of_measure),
          location:location_id(location_nm, franchisee_id)
        `)
        .eq('kpi_id', kpiId);

      if (filter.locationId) {
        query = query.eq('location_id', filter.locationId);
      }

      if (filter.dateFrom) {
        query = query.gte('recorded_date', filter.dateFrom);
      }

      if (filter.dateTo) {
        query = query.lte('recorded_date', filter.dateTo);
      }

      const { data, error } = await query.order('recorded_date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching KPI performance:', error);
      return { success: false, error };
    }
  }

  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(filter: AnalyticsFilter = {}): Promise<{ success: boolean; data?: DashboardMetrics; error?: any }> {
    try {
      const dateFrom = filter.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = filter.dateTo || new Date().toISOString().split('T')[0];

      // Build base query for sales transactions
      let salesQuery = supabase
        .from('sales_transaction')
        .select(`
          total_amt,
          txn_date,
          location:location_id(
            location_nm,
            franchisee:franchisee_id(
              franchisee_id,
              brand_id
            )
          )
        `)
        .gte('txn_date', dateFrom)
        .lte('txn_date', dateTo);

      if (filter.brandId) {
        salesQuery = salesQuery.eq('location.franchisee.brand_id', filter.brandId);
      }

      if (filter.locationId) {
        salesQuery = salesQuery.eq('location_id', filter.locationId);
      }

      if (filter.franchiseeId) {
        salesQuery = salesQuery.eq('location.franchisee_id', filter.franchiseeId);
      }

      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) throw salesError;

      // Calculate basic metrics
      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.total_amt || 0), 0) || 0;
      const totalTransactions = salesData?.length || 0;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Calculate sales trend (daily aggregation)
      const salesTrend = this.aggregateSalesByDate(salesData || []);

      // Get KPI performance
      let kpiQuery = supabase
        .from('kpi_data')
        .select(`
          actual_value,
          recorded_date,
          kpi:kpi_id(
            kpi_nm,
            target_value,
            brand_id
          ),
          location:location_id(
            franchisee:franchisee_id(
              brand_id
            )
          )
        `)
        .gte('recorded_date', dateFrom)
        .lte('recorded_date', dateTo);

      if (filter.brandId) {
        kpiQuery = kpiQuery.eq('kpi.brand_id', filter.brandId);
      }

      if (filter.locationId) {
        kpiQuery = kpiQuery.eq('location_id', filter.locationId);
      }

      const { data: kpiData, error: kpiError } = await kpiQuery;

      if (kpiError) throw kpiError;

      const kpiPerformance = this.aggregateKPIPerformance(kpiData || []);

      // Get top products (placeholder - would need product transaction details)
      const topProducts = await this.getTopProducts(filter);

      const metrics: DashboardMetrics = {
        totalSales,
        totalTransactions,
        averageOrderValue,
        salesTrend,
        kpiPerformance,
        topProducts: topProducts.data || []
      };

      return { success: true, data: metrics };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { success: false, error };
    }
  }

  /**
   * Get sales analytics for a specific period
   */
  static async getSalesAnalytics(filter: AnalyticsFilter = {}) {
    try {
      let query = supabase
        .from('sales_transaction')
        .select(`
          total_amt,
          payment_method,
          txn_date,
          status,
          metadata,
          location:location_id(
            location_nm,
            franchisee:franchisee_id(
              op_nm,
              brand_id
            )
          ),
          customer:customer_id(
            first_nm,
            last_nm,
            loyalty_member
          )
        `);

      if (filter.brandId) {
        query = query.eq('location.franchisee.brand_id', filter.brandId);
      }

      if (filter.locationId) {
        query = query.eq('location_id', filter.locationId);
      }

      if (filter.franchiseeId) {
        query = query.eq('location.franchisee_id', filter.franchiseeId);
      }

      if (filter.dateFrom) {
        query = query.gte('txn_date', filter.dateFrom);
      }

      if (filter.dateTo) {
        query = query.lte('txn_date', filter.dateTo);
      }

      const { data, error } = await query.order('txn_date', { ascending: false });

      if (error) throw error;

      // Analyze the data
      const analytics = {
        totalSales: data?.reduce((sum, sale) => sum + (sale.total_amt || 0), 0) || 0,
        totalTransactions: data?.length || 0,
        averageOrderValue: data?.length ? (data.reduce((sum, sale) => sum + (sale.total_amt || 0), 0) / data.length) : 0,
        paymentMethodBreakdown: this.analyzePaymentMethods(data || []),
        customerTypeBreakdown: this.analyzeCustomerTypes(data || []),
        dailySales: this.aggregateSalesByDate(data || []),
        locationPerformance: this.analyzeLocationPerformance(data || [])
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      return { success: false, error };
    }
  }

  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(filter: AnalyticsFilter = {}) {
    try {
      let query = supabase
        .from('inventory')
        .select(`
          current_stock,
          min_stock_level,
          updated_at,
          product:product_id(
            product_nm,
            sku,
            unit_price,
            brand_id
          ),
          location:location_id(
            location_nm,
            franchisee:franchisee_id(
              op_nm,
              brand_id
            )
          )
        `);

      if (filter.brandId) {
        query = query.eq('product.brand_id', filter.brandId);
      }

      if (filter.locationId) {
        query = query.eq('location_id', filter.locationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const analytics = {
        totalProducts: data?.length || 0,
        lowStockItems: data?.filter(item => item.current_stock <= item.min_stock_level).length || 0,
        outOfStockItems: data?.filter(item => item.current_stock === 0).length || 0,
        totalInventoryValue: data?.reduce((sum, item) => {
          return sum + (item.current_stock * (item.product?.unit_price || 0));
        }, 0) || 0,
        lowStockProducts: data?.filter(item => item.current_stock <= item.min_stock_level) || [],
        locationInventoryStatus: this.analyzeLocationInventory(data || [])
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate automated reports
   */
  static async generateReport(reportType: string, filter: AnalyticsFilter = {}) {
    try {
      let reportData;
      let reportName;

      switch (reportType) {
        case 'sales_summary':
          reportData = await this.getSalesAnalytics(filter);
          reportName = 'Sales Summary Report';
          break;
        case 'kpi_performance':
          reportData = await this.getDashboardMetrics(filter);
          reportName = 'KPI Performance Report';
          break;
        case 'inventory_status':
          reportData = await this.getInventoryAnalytics(filter);
          reportName = 'Inventory Status Report';
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (!reportData.success) {
        throw reportData.error;
      }

      // Create report record
      const { data: report, error: reportError } = await supabase
        .from('generated_reports')
        .insert({
          report_name: reportName,
          report_type: reportType,
          parameters: filter,
          status: 'completed',
          date_from: filter.dateFrom,
          date_to: filter.dateTo
        })
        .select()
        .single();

      if (reportError) throw reportError;

      return {
        success: true,
        data: {
          report,
          reportData: reportData.data
        }
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error };
    }
  }

  // Helper methods for data analysis

  private static aggregateSalesByDate(salesData: any[]) {
    const dailySales = new Map();

    salesData.forEach(sale => {
      const date = sale.txn_date.split('T')[0]; // Get date part only
      if (!dailySales.has(date)) {
        dailySales.set(date, { date, sales: 0, transactions: 0 });
      }
      const dayData = dailySales.get(date);
      dayData.sales += sale.total_amt || 0;
      dayData.transactions += 1;
    });

    return Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private static aggregateKPIPerformance(kpiData: any[]) {
    const kpiMap = new Map();

    kpiData.forEach(data => {
      const kpiName = data.kpi?.kpi_nm;
      if (!kpiName) return;

      if (!kpiMap.has(kpiName)) {
        kpiMap.set(kpiName, {
          kpi_nm: kpiName,
          target_value: data.kpi.target_value || 0,
          actual_values: [],
          latest_date: data.recorded_date
        });
      }

      const kpi = kpiMap.get(kpiName);
      kpi.actual_values.push(data.actual_value);
      if (data.recorded_date > kpi.latest_date) {
        kpi.latest_date = data.recorded_date;
      }
    });

    return Array.from(kpiMap.values()).map(kpi => {
      const avgActual = kpi.actual_values.reduce((sum: number, val: number) => sum + val, 0) / kpi.actual_values.length;
      return {
        kpi_nm: kpi.kpi_nm,
        target_value: kpi.target_value,
        actual_value: avgActual,
        achievement_percentage: kpi.target_value > 0 ? (avgActual / kpi.target_value) * 100 : 0
      };
    });
  }

  private static analyzePaymentMethods(salesData: any[]) {
    const methods = new Map();
    salesData.forEach(sale => {
      const method = sale.payment_method || 'unknown';
      methods.set(method, (methods.get(method) || 0) + (sale.total_amt || 0));
    });
    return Array.from(methods.entries()).map(([method, amount]) => ({ method, amount }));
  }

  private static analyzeCustomerTypes(salesData: any[]) {
    let loyaltyMembers = 0;
    let regularCustomers = 0;

    salesData.forEach(sale => {
      if (sale.customer?.loyalty_member) {
        loyaltyMembers++;
      } else {
        regularCustomers++;
      }
    });

    return { loyaltyMembers, regularCustomers };
  }

  private static analyzeLocationPerformance(salesData: any[]) {
    const locations = new Map();
    salesData.forEach(sale => {
      const locationName = sale.location?.location_nm || 'Unknown';
      if (!locations.has(locationName)) {
        locations.set(locationName, { sales: 0, transactions: 0 });
      }
      const location = locations.get(locationName);
      location.sales += sale.total_amt || 0;
      location.transactions += 1;
    });

    return Array.from(locations.entries()).map(([name, data]) => ({
      location_nm: name,
      total_sales: data.sales,
      transaction_count: data.transactions,
      average_order_value: data.transactions > 0 ? data.sales / data.transactions : 0
    }));
  }

  private static analyzeLocationInventory(inventoryData: any[]) {
    const locations = new Map();
    inventoryData.forEach(item => {
      const locationName = item.location?.location_nm || 'Unknown';
      if (!locations.has(locationName)) {
        locations.set(locationName, { totalItems: 0, lowStockItems: 0, outOfStockItems: 0 });
      }
      const location = locations.get(locationName);
      location.totalItems += 1;
      if (item.current_stock <= item.min_stock_level) {
        location.lowStockItems += 1;
      }
      if (item.current_stock === 0) {
        location.outOfStockItems += 1;
      }
    });

    return Array.from(locations.entries()).map(([name, data]) => ({
      location_nm: name,
      ...data
    }));
  }

  private static async getTopProducts(filter: AnalyticsFilter) {
    // This would require a more complex query with product transaction details
    // For now, return placeholder data
    return {
      success: true,
      data: [
        { product_nm: 'Espresso', total_sales: 1500, transaction_count: 150 },
        { product_nm: 'Latte', total_sales: 1200, transaction_count: 120 },
        { product_nm: 'Cappuccino', total_sales: 900, transaction_count: 90 }
      ]
    };
  }
}

export default AnalyticsService;
