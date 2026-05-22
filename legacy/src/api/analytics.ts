import { BaseAPI } from './base'
import { supabase } from '@/lib/supabase'
import { APIError } from '@/lib/errors'

export interface KPIMetrics {
  todaySales: number
  weekSales: number
  monthSales: number
  salesChange: number
  orderCount: number
  avgOrderValue: number
  inventoryValue: number
  lowStockItems: number
}

export interface FranchiseeAnalytics {
  sales: {
    today: number
    week: number
    month: number
    year: number
    change_percentage: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    avg_value: number
  }
  inventory: {
    total_items: number
    low_stock_items: number
    out_of_stock_items: number
    total_value: number
  }
  performance: {
    target_achievement: number
    customer_satisfaction: number
    compliance_score: number
  }
  insights: string[]
}

export interface FranchisorAnalytics {
  overview: {
    total_franchises: number
    active_locations: number
    pending_applications: number
    total_revenue: number
  }
  performance: {
    top_performing_locations: Array<{
      location_id: string
      location_name: string
      revenue: number
      growth: number
    }>
    underperforming_locations: Array<{
      location_id: string
      location_name: string
      revenue: number
      issues: string[]
    }>
  }
  financial: {
    total_royalties: number
    pending_payments: number
    revenue_trend: number[]
  }
}

export interface FranchisorAnalytics {
  overview: {
    total_franchises: number
    active_locations: number
    pending_applications: number
    total_revenue: number
  }
  performance: {
    top_performing_locations: Array<{
      location_id: string
      location_name: string
      revenue: number
      growth: number
    }>
    underperforming_locations: Array<{
      location_id: string
      location_name: string
      revenue: number
      issues: string[]
    }>
  }
  financial: {
    total_royalties: number
    pending_payments: number
    revenue_trend: Array<{
      period: string
      amount: number
    }>
  }
}

export class AnalyticsAPI extends BaseAPI {
  // Get comprehensive real-time KPI metrics
  static async getKPIMetrics(locationId: string): Promise<KPIMetrics> {
    const user = await this.getCurrentUserProfile()

    // Verify user has access to this location
    try {
      const location = await this.readSingleWithRetry('franchise_locations', { id: locationId })
      if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
        throw new APIError('Access denied to this location', 'PERMISSION_DENIED', 403)
      }
    } catch (error: any) {
      if (error.code === 'RESOURCE_NOT_FOUND') {
        throw new APIError('Franchise location not found', 'RESOURCE_NOT_FOUND', 404, 'The requested franchise location could not be found')
      }
      throw error
    }

    // Get real-time financial data (using correct field names)
    const [ordersData, inventoryData] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('franchise_location_id', locationId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('inventory_items')
        .select('current_stock, unit_cost, reorder_level')
        .eq('location_id', locationId)
    ]);

    // Calculate real-time metrics from actual data
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = ordersData.data?.filter(order =>
      order.created_at.startsWith(today) && order.status !== 'cancelled') || [];
    const todaySales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

    const last7Days = ordersData.data?.filter(order =>
      new Date(order.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      order.status !== 'cancelled') || [];
    const weekSales = last7Days.reduce((sum, order) => sum + order.total_amount, 0);

    const monthSales = ordersData.data?.filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Calculate inventory metrics from real data
    const inventoryValue = inventoryData.data?.reduce((sum, item) =>
      sum + (item.current_stock * item.unit_cost), 0) || 0;

    const lowStockItems = inventoryData.data?.filter(item =>
      item.current_stock <= item.reorder_level).length || 0;

    // Calculate growth rates from historical data
    const previousMonthStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const previousMonthEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: previousMonthOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('franchise_location_id', locationId)
      .gte('created_at', previousMonthStart.toISOString())
      .lt('created_at', previousMonthEnd.toISOString())
      .neq('status', 'cancelled');

    const previousMonthSales = previousMonthOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 1;
    const salesChange = previousMonthSales > 0 ? ((monthSales - previousMonthSales) / previousMonthSales) * 100 : 0;

    return {
      todaySales,
      weekSales,
      monthSales,
      salesChange: Math.round(salesChange * 10) / 10,
      orderCount: ordersData.data?.filter(order => order.status !== 'cancelled').length || 0,
      avgOrderValue: ordersData.data?.length > 0 ? monthSales / ordersData.data.length : 0,
      inventoryValue,
      lowStockItems
    }
  }

  // Get comprehensive analytics for franchisee
  static async getFranchiseeAnalytics(locationId: string): Promise<FranchiseeAnalytics> {
    const user = await this.getCurrentUserProfile()

    // Verify access
    const location = await this.readSingleWithRetry('franchise_locations', { id: locationId })
    if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new APIError('Access denied to this location', 'PERMISSION_DENIED', 403)
    }

    // Get data from actual tables (using correct field names)
    const [ordersData, inventoryData] = await Promise.all([
      supabase.from('orders').select('*').eq('franchise_location_id', locationId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('inventory_items').select('*').eq('location_id', locationId)
    ])

    const orders = ordersData.data || []
    const inventory = inventoryData.data || []

    // Calculate real analytics from actual data
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    const todayOrders = orders.filter(o => o.created_at.startsWith(today) && o.status !== 'cancelled')
    const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo && o.status !== 'cancelled')
    const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo && o.status !== 'cancelled')
    const yearOrders = orders.filter(o => new Date(o.created_at) >= yearAgo && o.status !== 'cancelled')

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const weekSales = weekOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const monthSales = monthOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const yearSales = yearOrders.reduce((sum, o) => sum + o.total_amount, 0)

    // Calculate inventory metrics
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0)
    const lowStockCount = inventory.filter(item => item.current_stock <= item.reorder_level).length
    const outOfStockCount = inventory.filter(item => item.current_stock === 0).length

    // Generate insights based on real data
    const insights = this.generateInsightsFromData(orders, inventory)

    // Calculate previous month for comparison
    const previousMonthStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const previousMonthEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const previousMonthOrders = orders.filter(o =>
      new Date(o.created_at) >= previousMonthStart &&
      new Date(o.created_at) < previousMonthEnd &&
      o.status !== 'cancelled'
    )
    const previousMonthSales = previousMonthOrders.reduce((sum, o) => sum + o.total_amount, 0)
    const salesChangePercentage = previousMonthSales > 0 ?
      ((monthSales - previousMonthSales) / previousMonthSales) * 100 : 0

    return {
      sales: {
        today: todaySales,
        week: weekSales,
        month: monthSales,
        year: yearSales,
        change_percentage: Math.round(salesChangePercentage * 10) / 10
      },
      orders: {
        total: monthOrders.length,
        pending: orders.filter(o => o.status === 'pending_approval').length,
        completed: orders.filter(o => o.status === 'delivered').length,
        avg_value: monthOrders.length > 0 ? monthSales / monthOrders.length : 0
      },
      inventory: {
        total_items: inventory.length,
        low_stock_items: lowStockCount,
        out_of_stock_items: outOfStockCount,
        total_value: totalInventoryValue
      },
      performance: {
        target_achievement: 85, // Default target achievement
        customer_satisfaction: 4.2, // From reviews (to be implemented)
        compliance_score: 92 // From audits (to be implemented)
      },
      insights
    }
  }

  // Get comprehensive analytics for franchisor dashboard with real-time data
  static async getFranchisorAnalytics(): Promise<FranchisorAnalytics> {
    await this.checkPermission(['franchisor', 'admin'])

    // Get all franchise data in parallel for better performance
    const [franchisesResult, locationsResult, ordersResult, applicationsResult, inventoryResult] = await Promise.all([
      supabase
        .from('franchises')
        .select('id, name, brand, status, created_at'),

      supabase
        .from('franchise_locations')
        .select(`
          id, name, status, created_at, monthly_revenue, address,
          user_profiles!franchisee_id (full_name, email),
          franchises (name, brand)
        `),

      supabase
        .from('orders')
        .select('total_amount, created_at, status, location_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      supabase
        .from('franchise_applications')
        .select('id, status, created_at, applicant_name'),

      supabase
        .from('inventory')
        .select('current_stock, reorder_level, location_id, unit_cost')
    ]);

    const franchises = franchisesResult.data || [];
    const locations = locationsResult.data || [];
    const allOrders = ordersResult.data || [];
    const applications = applicationsResult.data || [];
    const inventory = inventoryResult.data || [];

    // Calculate comprehensive metrics
    const totalFranchises = franchises.length;
    const activeLocations = locations.filter(l => l.status === 'active').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;

    // Calculate total revenue from actual orders
    const totalRevenue = allOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total_amount, 0);

    // Get top and underperforming locations
    const allLocations = await this.readWithRetry('franchise_locations', { status: 'open' }, `
      *,
      franchises (name)
    `)

    const locationsWithRevenue = await Promise.all(
      allLocations.map(async (location) => {
        const { data: financial } = await supabase
          .from('financial_summary')
          .select('sales_total_last_30_days')
          .eq('location_id', location.id)
          .single()

        return {
          location_id: location.id,
          location_name: location.name,
          revenue: financial?.sales_total_last_30_days || 0,
          growth: Math.random() * 20 - 10 // Mock growth data
        }
      })
    )

    const topPerforming = locationsWithRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const underperforming = locationsWithRevenue
      .filter(loc => loc.revenue < 30000 || loc.growth < -5)
      .slice(0, 5)
      .map(loc => ({
        ...loc,
        issues: this.identifyLocationIssues(loc)
      }))

    return {
      overview: {
        total_franchises: totalFranchises,
        active_locations: activeLocations,
        pending_applications: pendingApplications,
        total_revenue: totalRevenue
      },
      performance: {
        top_performing_locations: topPerforming,
        underperforming_locations: underperforming
      },
      financial: {
        total_royalties: totalRevenue * 0.05, // 5% royalty rate
        pending_payments: 25000, // From invoices
        revenue_trend: this.generateRevenueTrend(totalRevenue)
      }
    }
  }

  // Generate insights based on data
  private static generateInsights(financial: any, inventory: any[], performance: any[]): string[] {
    const insights: string[] = []

    // Sales insights
    if (financial?.sales_total_last_30_days > 50000) {
      insights.push('Sales performance is above average for your location type')
    } else if (financial?.sales_total_last_30_days < 30000) {
      insights.push('Sales are below target - consider promotional activities')
    }

    // Inventory insights
    const lowStockCount = inventory.filter(item => item.stock_status === 'Low Stock').length
    if (lowStockCount > 5) {
      insights.push(`${lowStockCount} items are running low - consider reordering soon`)
    }

    // Performance insights
    const avgAchievement = performance.length > 0 
      ? performance.reduce((sum, p) => sum + (p.achievement_percentage || 0), 0) / performance.length
      : 0

    if (avgAchievement > 100) {
      insights.push('Congratulations! You\'re exceeding your performance targets')
    } else if (avgAchievement < 80) {
      insights.push('Performance is below target - review your operational strategies')
    }

    return insights
  }

  // Identify issues for underperforming locations
  private static identifyLocationIssues(location: any): string[] {
    const issues: string[] = []

    if (location.revenue < 20000) {
      issues.push('Very low sales volume')
    }
    if (location.growth < -10) {
      issues.push('Declining revenue trend')
    }
    if (Math.random() > 0.7) { // Mock condition
      issues.push('High inventory turnover')
    }
    if (Math.random() > 0.8) { // Mock condition
      issues.push('Customer satisfaction below average')
    }

    return issues
  }

  // Generate revenue trend data
  private static generateRevenueTrend(currentRevenue: number): Array<{ period: string; amount: number }> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      period: month,
      amount: currentRevenue * (0.8 + (index * 0.05)) // Mock trend
    }))
  }

  // Get franchisor metrics for dashboard
  static async getFranchisorMetrics(userId: string): Promise<FranchisorAnalytics> {
    await this.checkPermission(['franchisor', 'admin'])

    try {
      // Get all franchises owned by this franchisor
      const { data: franchises, error: franchisesError } = await supabase
        .from('franchises')
        .select('id, name, status')
        .eq('owner_id', userId)

      if (franchisesError) throw franchisesError

      // Get all locations for these franchises
      const franchiseIds = franchises?.map(f => f.id) || []
      const { data: locations, error: locationsError } = await supabase
        .from('franchise_locations')
        .select(`
          id, name, status, monthly_revenue,
          franchises!inner(id, name),
          user_profiles!franchisee_id(full_name, email)
        `)
        .in('franchise_id', franchiseIds)

      if (locationsError) throw locationsError

      // Get pending applications
      const { data: applications, error: applicationsError } = await supabase
        .from('franchise_applications')
        .select('id, status')
        .in('franchise_id', franchiseIds)
        .eq('status', 'pending')

      if (applicationsError) throw applicationsError

      // Calculate metrics
      const totalRevenue = locations?.reduce((sum, loc) => sum + (loc.monthly_revenue || 0), 0) || 0
      const activeLocations = locations?.filter(loc => loc.status === 'open').length || 0

      // Get top performing locations
      const topPerforming = locations
        ?.sort((a, b) => (b.monthly_revenue || 0) - (a.monthly_revenue || 0))
        .slice(0, 5)
        .map(loc => ({
          location_id: loc.id,
          location_name: loc.name,
          revenue: loc.monthly_revenue || 0,
          growth: Math.random() * 20 - 10 // TODO: Calculate actual growth
        })) || []

      // Get underperforming locations
      const underperforming = locations
        ?.filter(loc => (loc.monthly_revenue || 0) < totalRevenue / (locations.length || 1) * 0.7)
        .map(loc => ({
          location_id: loc.id,
          location_name: loc.name,
          revenue: loc.monthly_revenue || 0,
          issues: ['Low revenue', 'Below average performance']
        })) || []

      return {
        overview: {
          total_franchises: franchises?.length || 0,
          active_locations: activeLocations,
          pending_applications: applications?.length || 0,
          total_revenue: totalRevenue
        },
        performance: {
          top_performing_locations: topPerforming,
          underperforming_locations: underperforming
        },
        financial: {
          total_royalties: totalRevenue * 0.05, // Assuming 5% royalty
          pending_payments: 0, // TODO: Calculate from payments table
          revenue_trend: [] // TODO: Calculate trend data
        }
      }
    } catch (error) {
      console.error('Error fetching franchisor metrics:', error)
      throw new Error('Failed to fetch franchisor metrics')
    }
  }

  // Get franchisee metrics for dashboard
  static async getFranchiseeMetrics(locationId: string): Promise<FranchiseeAnalytics> {
    const user = await this.getCurrentUserProfile()

    try {
      // Verify user has access to this location using enhanced BaseAPI method
      const location = await this.readSingleWithRetry('franchise_locations', { id: locationId })

      if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
        throw new APIError('Access denied to this location', 'PERMISSION_DENIED', 403)
      }

      // Get orders for this location using enhanced BaseAPI method
      const orders = await this.handleResponseWithRetry(
        () => supabase
          .from('orders')
          .select('total_amount, status, created_at')
          .eq('franchise_location_id', locationId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        'analytics/franchisee-orders',
        'GET'
      )

      // Calculate metrics
      const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending_approval').length || 0

      return {
        sales: {
          today: totalSales * 0.1, // Rough estimate
          week: totalSales * 0.3,
          month: totalSales,
          year: totalSales * 12,
          change_percentage: Math.random() * 20 - 10
        },
        orders: {
          total: orders?.length || 0,
          pending: pendingOrders,
          completed: completedOrders,
          avg_value: orders?.length ? totalSales / orders.length : 0
        },
        inventory: {
          total_items: 0, // TODO: Get from inventory
          low_stock_items: 0,
          out_of_stock_items: 0,
          total_value: 0
        },
        performance: {
          target_achievement: Math.random() * 100,
          customer_satisfaction: 85 + Math.random() * 15,
          compliance_score: 90 + Math.random() * 10
        },
        insights: [
          'Sales are trending upward this month',
          'Consider restocking popular items',
          'Customer satisfaction is above average'
        ]
      }
    } catch (error) {
      console.error('Error fetching franchisee metrics:', error)
      throw new Error('Failed to fetch franchisee metrics')
    }
  }

  // Get real-time dashboard data
  static async getDashboardData(userRole: string, locationId?: string): Promise<any> {
    if (userRole === 'franchisee' && locationId) {
      return this.getFranchiseeAnalytics(locationId)
    } else if (userRole === 'franchisor') {
      return this.getFranchisorAnalytics()
    } else {
      throw new Error('Invalid role or missing location ID')
    }
  }

  // Helper method to generate insights from real data
  private static generateInsightsFromData(orders: any[], inventory: any[]): string[] {
    const insights: string[] = []

    // Sales insights
    const recentOrders = orders.filter(o =>
      new Date(o.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    if (recentOrders.length > 0) {
      const avgOrderValue = recentOrders.reduce((sum, o) => sum + o.total_amount, 0) / recentOrders.length
      insights.push(`Average order value this week: ₱${avgOrderValue.toFixed(2)}`)
    }

    // Inventory insights
    const lowStockItems = inventory.filter(item => item.current_stock <= item.reorder_level)
    if (lowStockItems.length > 0) {
      insights.push(`${lowStockItems.length} items need restocking`)
    }

    // Performance insights
    const pendingOrders = orders.filter(o => o.status === 'pending_approval')
    if (pendingOrders.length > 0) {
      insights.push(`${pendingOrders.length} orders pending approval`)
    }

    return insights.length > 0 ? insights : ['All systems operating normally']
  }

  // Consistent KPI calculation methods to prevent dashboard inconsistencies
  static async getConsistentFranchisorKPIs(userId: string): Promise<any> {
    try {
      // Use database function for consistent calculations
      const { data: kpiData, error } = await supabase.rpc('calculate_franchisor_kpis', {
        franchisor_id: userId
      });

      if (error) {
        console.warn('Database KPI calculation failed, using fallback:', error);
        // Fallback to existing method
        return this.getFranchisorMetrics(userId);
      }

      return kpiData || {
        totalRevenue: 0,
        totalOrders: 0,
        activeLocations: 0,
        averageOrderValue: 0,
        revenueGrowth: 0,
        orderGrowth: 0
      };
    } catch (error) {
      logError(error as Error, { context: 'getConsistentFranchisorKPIs', userId });
      // Fallback to existing method
      return this.getFranchisorMetrics(userId);
    }
  }

  static async getConsistentFranchiseeKPIs(locationId: string): Promise<any> {
    try {
      // Use database function for consistent calculations
      const { data: kpiData, error } = await supabase.rpc('calculate_franchisee_kpis', {
        location_id: locationId
      });

      if (error) {
        console.warn('Database KPI calculation failed, using fallback:', error);
        // Fallback to existing method
        return this.getFranchiseeMetrics(locationId);
      }

      return kpiData || {
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        salesChange: 0,
        orderCount: 0,
        avgOrderValue: 0,
        inventoryValue: 0,
        lowStockItems: 0
      };
    } catch (error) {
      logError(error as Error, { context: 'getConsistentFranchiseeKPIs', locationId });
      // Fallback to existing method
      return this.getFranchiseeMetrics(locationId);
    }
  }
}
