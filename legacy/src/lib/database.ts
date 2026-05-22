import { supabase } from './supabase'

// Generic database operations
export class DatabaseService {
  static async create<T>(table: string, data: Partial<T>): Promise<{ data: T | null; error: any }> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    return { data: result, error }
  }

  static async read<T>(
    table: string,
    filters?: Record<string, any>,
    options?: {
      select?: string
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    }
  ): Promise<{ data: T[] | null; error: any }> {
    let query = supabase.from(table)

    if (options?.select) {
      query = query.select(options.select)
    } else {
      query = query.select('*')
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    return { data, error }
  }

  static async update<T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<{ data: T | null; error: any }> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    return { data: result, error }
  }

  static async delete(
    table: string,
    id: string | number
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    return { error }
  }

  static async findById<T>(
    table: string,
    id: string | number,
    select?: string
  ): Promise<{ data: T | null; error: any }> {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  static async count(
    table: string,
    filters?: Record<string, any>
  ): Promise<{ count: number | null; error: any }> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { count, error } = await query

    return { count, error }
  }
}

// Franchise-specific database operations - Updated to use new API
export class FranchiseService {
  static async getFranchises(userId?: string) {
    // Import the new API dynamically to avoid circular dependencies
    const { FranchiseAPI } = await import('@/api/franchises')

    if (userId) {
      return FranchiseAPI.getFranchisesByOwner(userId)
    }
    return FranchiseAPI.getAllFranchises()
  }

  static async getFranchisePackages(franchiseId: string) {
    const { FranchiseAPI } = await import('@/api/franchises')
    return FranchiseAPI.getFranchisePackages(franchiseId)
  }

  static async createApplication(applicationData: any) {
    const { FranchiseAPI } = await import('@/api/franchises')
    return FranchiseAPI.createApplication(applicationData)
  }

  static async getApplicationsByUser(userId: string) {
    const { FranchiseAPI } = await import('@/api/franchises')
    return FranchiseAPI.getApplicationsByUser(userId)
  }

  static async getFranchiseLocations(franchiseId?: string, franchiseeId?: string) {
    const { FranchiseAPI } = await import('@/api/franchises')
    return FranchiseAPI.getFranchiseLocations(franchiseId, franchiseeId)
  }
}

// User profile operations - Updated to use new auth system
export class UserService {
  static async getUserProfile(userId: string) {
    const { updateUserProfile } = await import('@/hooks/useAuth')
    // Use the new auth system for user profiles
    return DatabaseService.findById('user_profiles', userId)
  }

  static async createUserProfile(profileData: any) {
    return DatabaseService.create('user_profiles', profileData)
  }

  static async updateUserProfile(userId: string, profileData: any) {
    const { updateUserProfile } = await import('@/hooks/useAuth')
    return updateUserProfile(profileData)
  }
}

// Storage operations
export class StorageService {
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)

    return { data, error }
  }

  static async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    return { data, error }
  }

  static async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { data, error }
  }

  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }
}

// Order management operations
export class OrderService {
  static async createOrder(orderData: any) {
    const { OrderAPI } = await import('@/api/orders')
    return OrderAPI.createOrder(orderData)
  }

  static async getOrdersByLocation(locationId: string) {
    const { OrderAPI } = await import('@/api/orders')
    return OrderAPI.getOrdersByLocation(locationId)
  }

  static async updateOrderStatus(orderId: string, updates: any) {
    const { OrderAPI } = await import('@/api/orders')
    return OrderAPI.updateOrderStatus(orderId, updates)
  }

  static async getPendingOrders() {
    const { OrderAPI } = await import('@/api/orders')
    return OrderAPI.getPendingOrders()
  }

  static async getOrderStatistics(locationId?: string) {
    const { OrderAPI } = await import('@/api/orders')
    return OrderAPI.getOrderStatistics(locationId)
  }
}

// Inventory management operations
export class InventoryService {
  static async getInventoryByLocation(locationId: string) {
    const { InventoryAPI } = await import('@/api/inventory')
    return InventoryAPI.getInventoryByLocation(locationId)
  }

  static async updateStock(updates: any[]) {
    const { InventoryAPI } = await import('@/api/inventory')
    return InventoryAPI.updateStock(updates)
  }

  static async getLowStockAlerts(warehouseId?: string) {
    const { InventoryAPI } = await import('@/api/inventory')
    return InventoryAPI.getLowStockAlerts(warehouseId)
  }

  static async getInventoryValuation(warehouseId?: string) {
    const { InventoryAPI } = await import('@/api/inventory')
    return InventoryAPI.getInventoryValuation(warehouseId)
  }

  static async performInventoryCount(warehouseId: string, counts: any[]) {
    const { InventoryAPI } = await import('@/api/inventory')
    return InventoryAPI.performInventoryCount(warehouseId, counts)
  }
}

// Analytics operations
export class AnalyticsService {
  static async getKPIMetrics(locationId: string) {
    const { AnalyticsAPI } = await import('@/api/analytics')
    return AnalyticsAPI.getKPIMetrics(locationId)
  }

  static async getFranchiseeAnalytics(locationId: string) {
    const { AnalyticsAPI } = await import('@/api/analytics')
    return AnalyticsAPI.getFranchiseeAnalytics(locationId)
  }

  static async getFranchisorAnalytics() {
    const { AnalyticsAPI } = await import('@/api/analytics')
    return AnalyticsAPI.getFranchisorAnalytics()
  }

  static async getDashboardData(userRole: string, locationId?: string) {
    const { AnalyticsAPI } = await import('@/api/analytics')
    return AnalyticsAPI.getDashboardData(userRole, locationId)
  }
}
