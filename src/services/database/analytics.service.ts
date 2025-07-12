import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type KPI = Database['public']['Tables']['kpi']['Row'];
type KPIData = Database['public']['Tables']['kpi_data']['Row'];
type SalesTransaction = Database['public']['Tables']['sales_transaction']['Row'];

/**
 * Analytics and KPI Service
 * Objective 5: Data-Driven Performance Analytics
 */
export class AnalyticsService extends BaseService<'kpi'> {
  constructor() {
    super('kpi');
  }

  /**
   * Get all KPIs for the franchisor
   */
  async getKPIs(): Promise<{
    data: KPI[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('kpi')
      .select('*')
      .eq('franchisor_id', franchisorId)
      .order('kpi_nm');

    return { data, error };
  }

  /**
   * Create a new KPI
   */
  async createKPI(kpiData: {
    kpi_nm: string;
    description?: string;
    target_value: number;
    unit: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  }): Promise<{
    data: KPI | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('kpi')
      .insert({
        ...kpiData,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Record KPI data
   */
  async recordKPIData(
    kpiId: string,
    value: number,
    period: string,
    locationId?: string
  ): Promise<{
    data: KPIData | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('kpi_data')
      .insert({
        kpi_id: kpiId,
        value,
        period,
        location_id: locationId,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get KPI data with trend analysis
   */
  async getKPIData(
    kpiId: string,
    startDate?: string,
    endDate?: string,
    locationId?: string
  ): Promise<{
    data: (KPIData & {
      kpi: KPI;
      achievement_percentage: number;
    })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    let query = supabase
      .from('kpi_data')
      .select(`
        *,
        kpi:kpi(*)
      `)
      .eq('kpi_id', kpiId)
      .eq('franchisor_id', franchisorId);

    if (startDate) {
      query = query.gte('period', startDate);
    }
    if (endDate) {
      query = query.lte('period', endDate);
    }
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query.order('period');

    if (error) return { data: null, error };

    // Calculate achievement percentage
    const dataWithAchievement = data?.map((item: any) => ({
      ...item,
      achievement_percentage: item.kpi.target_value > 0 
        ? (item.value / item.kpi.target_value) * 100 
        : 0
    })) || [];

    return { data: dataWithAchievement, error: null };
  }

  /**
   * Get dashboard analytics summary
   */
  async getDashboardSummary(): Promise<{
    data: {
      totalRevenue: number;
      totalTransactions: number;
      averageOrderValue: number;
      topPerformingLocations: any[];
      kpiSummary: any[];
      revenueGrowth: number;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get sales data for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString().slice(0, 7);

      // Current month revenue
      const { data: currentRevenue } = await supabase
        .from('sales_transaction')
        .select('total_amount')
        .eq('franchisor_id', franchisorId)
        .gte('transaction_date', `${currentMonth}-01`)
        .lt('transaction_date', `${new Date().toISOString().slice(0, 7)}-01`);

      // Last month revenue
      const { data: lastRevenue } = await supabase
        .from('sales_transaction')
        .select('total_amount')
        .eq('franchisor_id', franchisorId)
        .gte('transaction_date', `${lastMonth}-01`)
        .lt('transaction_date', `${currentMonth}-01`);

      const totalRevenue = currentRevenue?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const lastMonthRevenue = lastRevenue?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Total transactions
      const { count: totalTransactions } = await supabase
        .from('sales_transaction')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .gte('transaction_date', `${currentMonth}-01`);

      // Average order value
      const averageOrderValue = totalTransactions && totalTransactions > 0 
        ? totalRevenue / totalTransactions 
        : 0;

      // Top performing locations
      const { data: locationPerformance } = await supabase
        .from('sales_transaction')
        .select(`
          location_id,
          location:location(location_nm),
          total_amount
        `)
        .eq('franchisor_id', franchisorId)
        .gte('transaction_date', `${currentMonth}-01`);

      const locationSummary = locationPerformance?.reduce((acc: any, transaction) => {
        const locationId = transaction.location_id;
        if (!acc[locationId]) {
          acc[locationId] = {
            location_id: locationId,
            location_name: (transaction.location as any)?.location_nm || 'Unknown',
            total_revenue: 0,
            transaction_count: 0
          };
        }
        acc[locationId].total_revenue += transaction.total_amount || 0;
        acc[locationId].transaction_count += 1;
        return acc;
      }, {});

      const topPerformingLocations = Object.values(locationSummary || {})
        .sort((a: any, b: any) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      // KPI Summary
      const { data: kpiData } = await supabase
        .from('kpi_data')
        .select(`
          *,
          kpi:kpi(*)
        `)
        .eq('franchisor_id', franchisorId)
        .gte('period', `${currentMonth}-01`)
        .order('period', { ascending: false });

      const kpiSummary = kpiData?.reduce((acc: any, item: any) => {
        const kpiId = item.kpi_id;
        if (!acc[kpiId]) {
          acc[kpiId] = {
            kpi_id: kpiId,
            kpi_name: item.kpi.kpi_nm,
            target_value: item.kpi.target_value,
            current_value: item.value,
            achievement_percentage: (item.value / item.kpi.target_value) * 100
          };
        }
        return acc;
      }, {});

      return {
        data: {
          totalRevenue,
          totalTransactions: totalTransactions || 0,
          averageOrderValue,
          topPerformingLocations,
          kpiSummary: Object.values(kpiSummary || {}),
          revenueGrowth,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    months: number = 12
  ): Promise<{
    data: Array<{
      period: string;
      revenue: number;
      transactions: number;
      average_order_value: number;
    }> | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: salesData, error } = await supabase
      .from('sales_transaction')
      .select('transaction_date, total_amount')
      .eq('franchisor_id', franchisorId)
      .gte('transaction_date', startDate.toISOString())
      .order('transaction_date');

    if (error) return { data: null, error };

    // Group data by period
    const groupedData = salesData?.reduce((acc: any, transaction) => {
      let periodKey: string;
      const date = new Date(transaction.transaction_date);
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().slice(0, 10);
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().slice(0, 10);
          break;
        case 'monthly':
        default:
          periodKey = date.toISOString().slice(0, 7);
          break;
      }

      if (!acc[periodKey]) {
        acc[periodKey] = {
          period: periodKey,
          revenue: 0,
          transactions: 0,
          average_order_value: 0
        };
      }

      acc[periodKey].revenue += transaction.total_amount || 0;
      acc[periodKey].transactions += 1;

      return acc;
    }, {});

    // Calculate average order values
    const trends = Object.values(groupedData || {}).map((item: any) => ({
      ...item,
      average_order_value: item.transactions > 0 ? item.revenue / item.transactions : 0
    }));

    return { data: trends, error: null };
  }
}
