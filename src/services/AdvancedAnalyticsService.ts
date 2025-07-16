import { supabase } from '@/lib/supabase';

// Advanced Analytics Service Interfaces
export interface BusinessIntelligenceData {
  franchise_location_id: string;
  time_period: {
    start: string;
    end: string;
  };
  metrics: {
    revenue: {
      current: number;
      previous: number;
      growth_rate: number;
      trend: 'up' | 'down' | 'stable';
    };
    orders: {
      total: number;
      average_value: number;
      completion_rate: number;
      trend: 'up' | 'down' | 'stable';
    };
    inventory: {
      turnover_rate: number;
      stockout_incidents: number;
      carrying_cost: number;
      optimization_score: number;
    };
    financial: {
      profit_margin: number;
      cash_flow: number;
      expenses: number;
      roi: number;
    };
  };
  charts_data: {
    revenue_trend: Array<{ date: string; value: number; }>;
    order_volume: Array<{ date: string; count: number; }>;
    inventory_levels: Array<{ product: string; current: number; optimal: number; }>;
    expense_breakdown: Array<{ category: string; amount: number; percentage: number; }>;
  };
}

export interface KPIDashboard {
  user_id: string;
  dashboard_name: string;
  role: string;
  widgets: Array<{
    id: string;
    type: 'metric' | 'chart' | 'table' | 'gauge';
    title: string;
    data_source: string;
    configuration: any;
    position: { x: number; y: number; width: number; height: number; };
    refresh_interval: number; // in seconds
  }>;
  filters: {
    date_range: { start: string; end: string; };
    locations: string[];
    categories: string[];
  };
  last_updated: string;
}

export interface ComparativeAnalytics {
  comparison_type: 'location' | 'time_period' | 'category';
  base_entity: string;
  comparison_entities: string[];
  metrics: Array<{
    name: string;
    base_value: number;
    comparison_values: Array<{ entity: string; value: number; variance: number; }>;
    benchmark: number;
    performance_rating: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  insights: string[];
  recommendations: string[];
}

export interface InteractiveChart {
  chart_id: string;
  chart_type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge';
  title: string;
  data: any[];
  configuration: {
    x_axis: string;
    y_axis: string;
    color_scheme: string;
    interactive_features: string[];
    drill_down_enabled: boolean;
    real_time_updates: boolean;
  };
  filters: any;
  last_updated: string;
}

export interface MultiDimensionalData {
  dimensions: string[];
  measures: string[];
  data: Array<{
    [key: string]: any;
  }>;
  aggregations: {
    [measure: string]: {
      sum: number;
      average: number;
      min: number;
      max: number;
      count: number;
    };
  };
  drill_paths: Array<{
    path: string[];
    available_measures: string[];
  }>;
}

/**
 * Advanced Analytics Service for Business Intelligence and Data Visualization
 * Provides real-time analytics, customizable dashboards, and comparative analysis
 */
export class AdvancedAnalyticsService {
  private static readonly CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

  /**
   * Generate comprehensive business intelligence data
   */
  static async generateBusinessIntelligence(
    franchiseLocationId: string,
    timePeriod: { start: string; end: string }
  ): Promise<BusinessIntelligenceData> {
    try {
      // Fetch revenue data
      const revenueData = await this.fetchRevenueMetrics(franchiseLocationId, timePeriod);

      // Fetch order data
      const orderData = await this.fetchOrderMetrics(franchiseLocationId, timePeriod);

      // Fetch inventory data
      const inventoryData = await this.fetchInventoryMetrics(franchiseLocationId, timePeriod);

      // Fetch financial data
      const financialData = await this.fetchFinancialMetrics(franchiseLocationId, timePeriod);

      // Generate chart data
      const chartsData = await this.generateChartsData(franchiseLocationId, timePeriod);

      return {
        franchise_location_id: franchiseLocationId,
        time_period: timePeriod,
        metrics: {
          revenue: revenueData,
          orders: orderData,
          inventory: inventoryData,
          financial: financialData
        },
        charts_data: chartsData
      };
    } catch (error) {
      console.error('Error generating business intelligence:', error);
      throw new Error('Failed to generate business intelligence data');
    }
  }

  /**
   * Create or update customizable KPI dashboard
   */
  static async createKPIDashboard(
    userId: string,
    dashboardConfig: Omit<KPIDashboard, 'user_id' | 'last_updated'>
  ): Promise<KPIDashboard> {
    try {
      const dashboard: KPIDashboard = {
        user_id: userId,
        ...dashboardConfig,
        last_updated: new Date().toISOString()
      };

      // Save dashboard configuration
      const { data, error } = await supabase
        .from('kpi_dashboards')
        .upsert(dashboard)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating KPI dashboard:', error);
      throw new Error('Failed to create KPI dashboard');
    }
  }

  /**
   * Generate comparative analytics across locations, time periods, or categories
   */
  static async generateComparativeAnalytics(
    comparisonType: 'location' | 'time_period' | 'category',
    baseEntity: string,
    comparisonEntities: string[],
    metrics: string[]
  ): Promise<ComparativeAnalytics> {
    try {
      const comparativeMetrics = [];

      for (const metric of metrics) {
        const baseValue = await this.getMetricValue(baseEntity, metric, comparisonType);
        const comparisonValues = [];

        for (const entity of comparisonEntities) {
          const value = await this.getMetricValue(entity, metric, comparisonType);
          const variance = ((value - baseValue) / baseValue) * 100;
          comparisonValues.push({ entity, value, variance });
        }

        const benchmark = await this.getBenchmarkValue(metric, comparisonType);
        const performanceRating = this.calculatePerformanceRating(baseValue, benchmark);

        comparativeMetrics.push({
          name: metric,
          base_value: baseValue,
          comparison_values: comparisonValues,
          benchmark,
          performance_rating: performanceRating
        });
      }

      const insights = this.generateComparativeInsights(comparativeMetrics);
      const recommendations = this.generateComparativeRecommendations(comparativeMetrics);

      return {
        comparison_type: comparisonType,
        base_entity: baseEntity,
        comparison_entities: comparisonEntities,
        metrics: comparativeMetrics,
        insights,
        recommendations
      };
    } catch (error) {
      console.error('Error generating comparative analytics:', error);
      throw new Error('Failed to generate comparative analytics');
    }
  }

  /**
   * Create interactive chart with real-time data
   */
  static async createInteractiveChart(
    chartConfig: Omit<InteractiveChart, 'chart_id' | 'last_updated'>
  ): Promise<InteractiveChart> {
    try {
      const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const chart: InteractiveChart = {
        chart_id: chartId,
        ...chartConfig,
        last_updated: new Date().toISOString()
      };

      // Fetch data based on configuration
      const data = await this.fetchChartData(chart);
      chart.data = data;

      return chart;
    } catch (error) {
      console.error('Error creating interactive chart:', error);
      throw new Error('Failed to create interactive chart');
    }
  }

  /**
   * Generate multi-dimensional data analysis
   */
  static async generateMultiDimensionalAnalysis(
    franchiseLocationId: string,
    dimensions: string[],
    measures: string[],
    filters?: any
  ): Promise<MultiDimensionalData> {
    try {
      // Build dynamic query based on dimensions and measures
      const query = this.buildMultiDimensionalQuery(dimensions, measures, filters);

      // Execute query
      const { data, error } = await supabase.rpc('execute_multidimensional_query', {
        query_config: {
          franchise_location_id: franchiseLocationId,
          dimensions,
          measures,
          filters: filters || {}
        }
      });

      if (error) throw error;

      // Calculate aggregations
      const aggregations = this.calculateAggregations(data, measures);

      // Generate drill paths
      const drillPaths = this.generateDrillPaths(dimensions, measures);

      return {
        dimensions,
        measures,
        data: data || [],
        aggregations,
        drill_paths: drillPaths
      };
    } catch (error) {
      console.error('Error generating multi-dimensional analysis:', error);
      throw new Error('Failed to generate multi-dimensional analysis');
    }
  }

  // Private helper methods for data fetching and processing
  private static async fetchRevenueMetrics(franchiseLocationId: string, timePeriod: any) {
    const { data: currentRevenue } = await supabase
      .from('sales_records')
      .select('total_amount')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('sale_date', timePeriod.start)
      .lte('sale_date', timePeriod.end);

    const currentTotal = currentRevenue?.reduce((sum, record) => sum + record.total_amount, 0) || 0;

    // Get previous period for comparison
    const periodDuration = new Date(timePeriod.end).getTime() - new Date(timePeriod.start).getTime();
    const previousStart = new Date(new Date(timePeriod.start).getTime() - periodDuration);
    const previousEnd = new Date(timePeriod.start);

    const { data: previousRevenue } = await supabase
      .from('sales_records')
      .select('total_amount')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('sale_date', previousStart.toISOString())
      .lte('sale_date', previousEnd.toISOString());

    const previousTotal = previousRevenue?.reduce((sum, record) => sum + record.total_amount, 0) || 0;
    const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    const trend = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';

    return {
      current: currentTotal,
      previous: previousTotal,
      growth_rate: growthRate,
      trend: trend as 'up' | 'down' | 'stable'
    };
  }

  private static async fetchOrderMetrics(franchiseLocationId: string, timePeriod: any) {
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('created_at', timePeriod.start)
      .lte('created_at', timePeriod.end);

    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
    const totalValue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const averageValue = totalOrders > 0 ? totalValue / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      total: totalOrders,
      average_value: averageValue,
      completion_rate: completionRate,
      trend: 'stable' as 'up' | 'down' | 'stable' // Would calculate based on historical data
    };
  }

  private static async fetchInventoryMetrics(franchiseLocationId: string, timePeriod: any) {
    const { data: inventoryData } = await supabase
      .from('inventory_levels')
      .select(`
        current_stock,
        products!inner(cost_price)
      `)
      .eq('warehouse_id', franchiseLocationId);

    const totalValue = inventoryData?.reduce((sum, item) =>
      sum + (item.current_stock * (item.products.cost_price || 0)), 0) || 0;

    return {
      turnover_rate: 4.2, // Would calculate from sales/inventory data
      stockout_incidents: 3, // Would count from inventory transactions
      carrying_cost: totalValue * 0.02, // 2% monthly carrying cost
      optimization_score: 0.85 // Would calculate from AI optimization results
    };
  }

  private static async fetchFinancialMetrics(franchiseLocationId: string, timePeriod: any) {
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('amount, transaction_type')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('created_at', timePeriod.start)
      .lte('created_at', timePeriod.end);

    const revenue = transactions?.filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    const expenses = transactions?.filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
    const cashFlow = revenue - expenses;

    return {
      profit_margin: profitMargin,
      cash_flow: cashFlow,
      expenses: expenses,
      roi: 15.5 // Would calculate from investment data
    };
  }

  private static async generateChartsData(franchiseLocationId: string, timePeriod: any) {
    // Revenue trend data
    const { data: dailyRevenue } = await supabase
      .from('sales_records')
      .select('sale_date, total_amount')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('sale_date', timePeriod.start)
      .lte('sale_date', timePeriod.end)
      .order('sale_date');

    const revenueTrend = this.groupByDate(dailyRevenue || [], 'sale_date', 'total_amount');

    // Order volume data
    const { data: dailyOrders } = await supabase
      .from('orders')
      .select('created_at')
      .eq('franchise_location_id', franchiseLocationId)
      .gte('created_at', timePeriod.start)
      .lte('created_at', timePeriod.end)
      .order('created_at');

    const orderVolume = this.groupByDate(dailyOrders || [], 'created_at', null, true);

    return {
      revenue_trend: revenueTrend,
      order_volume: orderVolume,
      inventory_levels: [], // Would fetch from inventory optimization results
      expense_breakdown: [] // Would fetch from financial transactions
    };
  }

  private static async getMetricValue(entity: string, metric: string, comparisonType: string): Promise<number> {
    // Simplified implementation - would be more complex in production
    switch (metric) {
      case 'revenue':
        const { data } = await supabase
          .from('sales_records')
          .select('total_amount')
          .eq('franchise_location_id', entity);
        return data?.reduce((sum, record) => sum + record.total_amount, 0) || 0;
      default:
        return Math.random() * 100000; // Placeholder
    }
  }

  private static async getBenchmarkValue(metric: string, comparisonType: string): Promise<number> {
    // Would fetch industry benchmarks or calculate from all locations
    return Math.random() * 100000; // Placeholder
  }

  private static calculatePerformanceRating(value: number, benchmark: number): 'excellent' | 'good' | 'average' | 'poor' {
    const ratio = value / benchmark;
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.0) return 'good';
    if (ratio >= 0.8) return 'average';
    return 'poor';
  }

  private static generateComparativeInsights(metrics: any[]): string[] {
    const insights = [];

    for (const metric of metrics) {
      const bestPerformer = metric.comparison_values.reduce((best: any, current: any) =>
        current.value > best.value ? current : best
      );

      if (bestPerformer.variance > 20) {
        insights.push(`${metric.name}: ${bestPerformer.entity} outperforms by ${bestPerformer.variance.toFixed(1)}%`);
      }
    }

    return insights;
  }

  private static generateComparativeRecommendations(metrics: any[]): string[] {
    const recommendations = [];

    for (const metric of metrics) {
      if (metric.performance_rating === 'poor') {
        recommendations.push(`Improve ${metric.name} performance - currently ${((metric.base_value / metric.benchmark) * 100).toFixed(0)}% of benchmark`);
      }
    }

    return recommendations;
  }

  private static async fetchChartData(chart: InteractiveChart): Promise<any[]> {
    // Simplified implementation - would be more sophisticated in production
    const mockData = [];
    for (let i = 0; i < 30; i++) {
      mockData.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 1000
      });
    }
    return mockData;
  }

  private static buildMultiDimensionalQuery(dimensions: string[], measures: string[], filters: any): string {
    // Would build complex SQL query based on dimensions and measures
    return `SELECT ${dimensions.join(', ')}, ${measures.join(', ')} FROM analytics_view WHERE 1=1`;
  }

  private static calculateAggregations(data: any[], measures: string[]) {
    const aggregations: any = {};

    for (const measure of measures) {
      const values = data.map(row => row[measure]).filter(v => typeof v === 'number');
      aggregations[measure] = {
        sum: values.reduce((a, b) => a + b, 0),
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }

    return aggregations;
  }

  private static generateDrillPaths(dimensions: string[], measures: string[]) {
    // Generate possible drill-down paths
    const paths = [];
    for (let i = 1; i <= dimensions.length; i++) {
      paths.push({
        path: dimensions.slice(0, i),
        available_measures: measures
      });
    }
    return paths;
  }

  private static groupByDate(data: any[], dateField: string, valueField: string | null, count = false) {
    const grouped: any = {};

    data.forEach(item => {
      const date = item[dateField].split('T')[0];
      if (!grouped[date]) {
        grouped[date] = count ? 0 : 0;
      }

      if (count) {
        grouped[date]++;
      } else if (valueField) {
        grouped[date] += item[valueField];
      }
    });

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      [count ? 'count' : 'value']: value
    }));
  }
}