import { BaseAPI } from './base'
import { supabase } from '@/lib/supabase'

// Unified inventory interface that works with both warehouse and location inventory
export interface UnifiedInventoryItem {
  id: string
  inventory_type: 'warehouse' | 'location'
  location_id: string
  location_name: string
  city: string
  location_type: string
  product_id: string
  product_name: string
  sku: string
  category: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  reorder_point: number
  max_stock_level: number
  unit_cost: number
  total_value: number
  last_counted_at?: string
  last_restocked_at?: string
  created_at: string
  updated_at: string
}

// Legacy interface for backward compatibility
export interface InventoryItem {
  warehouse_id: string
  product_id: string
  quantity_on_hand: number
  reserved_quantity: number
  available_quantity: number
  reorder_level: number
  max_stock_level: number
  last_counted_at?: string
  last_restocked_at?: string
  cost_per_unit?: number
  expiry_date?: string
  product?: {
    name: string
    sku: string
    category: string
    price: number
  }
  warehouse?: {
    name: string
    code: string
  }
}

export interface InventorySummary {
  inventory_type: string
  location_id: string
  location_name: string
  location_type: string
  total_products: number
  total_quantity: number
  total_value: number
  low_stock_items: number
  avg_quantity_per_product: number
  last_updated: string
}

export interface StockMovement {
  id: string
  warehouse_id: string
  product_id: string
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return'
  quantity: number
  unit_cost?: number
  reference_type?: string
  reference_id?: string
  notes?: string
  performed_by: string
  movement_date: string
  created_at: string
}

export interface StockUpdateRequest {
  warehouse_id: string
  product_id: string
  quantity_change: number
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return'
  reference_type?: string
  reference_id?: string
  unit_cost?: number
  notes?: string
}

export interface InventoryAlert {
  warehouse_id: string
  warehouse_name: string
  product_id: string
  product_name: string
  sku: string
  category: string
  current_stock: number
  reorder_level: number
  alert_type: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'EXPIRING_SOON'
  days_until_expiry?: number
  priority: number
}

export interface LowStockAlert {
  product_id: string
  warehouse_id: string
  current_stock: number
  reorder_level: number
  suggested_reorder_quantity: number
  product_name: string
  product_sku: string
  warehouse_name: string
  days_until_stockout: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface ReorderRequest {
  product_id: string
  warehouse_id: string
  requested_quantity: number
  urgency: 'normal' | 'urgent' | 'critical'
  justification?: string
  estimated_cost: number
}

export class InventoryAPI extends BaseAPI {
  // Get unified inventory by location (works for both warehouses and franchise locations)
  static async getUnifiedInventoryByLocation(locationId: string): Promise<UnifiedInventoryItem[]> {
    const user = await this.getCurrentUserProfile()

    // Verify access to location
    try {
      // Check if it's a franchise location
      const location = await this.readSingle('franchise_locations', { id: locationId })
      if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
        throw new Error('Access denied to this location')
      }
    } catch {
      // Check if it's a warehouse (franchisor/admin only)
      await this.checkPermission(['franchisor', 'admin'])
    }

    // Use the unified inventory view
    const { data, error } = await supabase
      .from('unified_inventory')
      .select('*')
      .eq('location_id', locationId)
      .order('product_name', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  }

  // Get inventory summary for dashboard
  static async getInventorySummary(locationId?: string): Promise<InventorySummary[]> {
    const user = await this.getCurrentUserProfile()

    let query = supabase
      .from('inventory_summary')
      .select('*')
      .order('total_value', { ascending: false })

    // If locationId provided, filter by it
    if (locationId) {
      // Verify access
      if (user.role !== 'franchisor' && user.role !== 'admin') {
        const location = await this.readSingle('franchise_locations', { id: locationId })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to this location')
        }
      }
      query = query.eq('location_id', locationId)
    } else if (user.role === 'franchisee') {
      // Franchisees can only see their own locations
      const userLocationId = user.metadata?.primary_location_id
      if (userLocationId) {
        query = query.eq('location_id', userLocationId)
      }
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data || []
  }

  // Get network-wide inventory summary (franchisor only)
  static async getNetworkInventorySummary(): Promise<any> {
    await this.checkPermission(['franchisor', 'admin'])

    const { data, error } = await supabase.rpc('get_network_inventory_summary')
    if (error) throw new Error(error.message)
    return data?.[0] || {
      total_locations: 0,
      total_products: 0,
      total_inventory_value: 0,
      warehouse_value: 0,
      location_value: 0,
      critical_stock_items: 0,
      low_stock_items: 0
    }
  }

  // Legacy method for backward compatibility
  static async getInventoryByLocation(locationId: string): Promise<InventoryItem[]> {
    const unifiedData = await this.getUnifiedInventoryByLocation(locationId)

    // Convert unified format to legacy format
    return unifiedData.map(item => ({
      warehouse_id: item.location_id,
      product_id: item.product_id,
      quantity_on_hand: item.quantity,
      reserved_quantity: item.reserved_quantity,
      available_quantity: item.available_quantity,
      reorder_level: item.reorder_point,
      max_stock_level: item.max_stock_level,
      last_counted_at: item.last_counted_at,
      last_restocked_at: item.last_restocked_at,
      cost_per_unit: item.unit_cost,
      product: {
        name: item.product_name,
        sku: item.sku,
        category: item.category,
        price: item.unit_cost
      },
      warehouse: {
        name: item.location_name,
        code: item.sku
      }
    }))
  }

  // Get inventory across all locations (franchisor only)
  static async getAllInventory(): Promise<UnifiedInventoryItem[]> {
    await this.checkPermission(['franchisor', 'admin'])

    const { data, error } = await supabase
      .from('unified_inventory')
      .select('*')
      .order('inventory_type', { ascending: true })
      .order('location_name', { ascending: true })
      .order('product_name', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  }

  // Update stock levels
  static async updateStock(updates: StockUpdateRequest[]): Promise<void> {
    const user = await this.getCurrentUserProfile()
    
    // Verify access to all warehouses in the updates
    for (const update of updates) {
      if (user.role === 'franchisee') {
        const location = await this.readSingle('franchise_locations', { 
          id: update.warehouse_id 
        })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to update inventory at this location')
        }
      }
    }

    // Create stock movements and update inventory levels
    const movements = updates.map(update => ({
      warehouse_id: update.warehouse_id,
      product_id: update.product_id,
      movement_type: update.movement_type,
      quantity: Math.abs(update.quantity_change),
      unit_cost: update.unit_cost,
      reference_type: update.reference_type,
      reference_id: update.reference_id,
      notes: update.notes,
      performed_by: user.id,
      movement_date: new Date().toISOString()
    }))

    // Insert stock movements
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert(movements)

    if (movementError) throw new Error(movementError.message)

    // Update inventory levels
    for (const update of updates) {
      const { error: updateError } = await supabase.rpc('update_inventory_level', {
        p_warehouse_id: update.warehouse_id,
        p_product_id: update.product_id,
        p_quantity_change: update.quantity_change,
        p_movement_type: update.movement_type
      })

      if (updateError) {
        // Fallback: manual update if RPC doesn't exist
        const { data: currentInventory } = await supabase
          .from('inventory_levels')
          .select('quantity_on_hand')
          .eq('warehouse_id', update.warehouse_id)
          .eq('product_id', update.product_id)
          .single()

        if (currentInventory) {
          const newQuantity = Math.max(0, currentInventory.quantity_on_hand + update.quantity_change)
          
          await supabase
            .from('inventory_levels')
            .update({ 
              quantity_on_hand: newQuantity,
              last_updated: new Date().toISOString()
            })
            .eq('warehouse_id', update.warehouse_id)
            .eq('product_id', update.product_id)
        }
      }
    }
  }

  // Get stock movements history
  static async getStockMovements(
    warehouseId?: string,
    productId?: string,
    limit: number = 100
  ): Promise<StockMovement[]> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        products (name, sku),
        warehouses (name, code),
        user_profiles!performed_by (full_name)
      `)

    if (warehouseId) {
      // Verify access
      if (user.role === 'franchisee') {
        const location = await this.readSingle('franchise_locations', { id: warehouseId })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to this location')
        }
      }
      query = query.eq('warehouse_id', warehouseId)
    } else if (user.role === 'franchisee') {
      // Franchisees can only see their own locations
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('warehouse_id', locationIds)
    }

    if (productId) {
      query = query.eq('product_id', productId)
    }

    query = query
      .order('movement_date', { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }

  // Get low stock alerts
  static async getLowStockAlerts(warehouseId?: string): Promise<InventoryAlert[]> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase.from('low_stock_alerts').select('*')

    if (warehouseId) {
      // Verify access
      if (user.role === 'franchisee') {
        const location = await this.readSingle('franchise_locations', { id: warehouseId })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to this location')
        }
      }
      query = query.eq('warehouse_id', warehouseId)
    } else if (user.role === 'franchisee') {
      // Franchisees can only see their own locations
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('warehouse_id', locationIds)
    }

    query = query.order('priority_order', { ascending: true })

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }

  // Perform inventory count
  static async performInventoryCount(
    warehouseId: string,
    counts: Array<{
      product_id: string
      counted_quantity: number
      notes?: string
    }>
  ): Promise<void> {
    const user = await this.getCurrentUserProfile()
    
    // Verify access
    if (user.role === 'franchisee') {
      const location = await this.readSingle('franchise_locations', { id: warehouseId })
      if (location.franchisee_id !== user.id) {
        throw new Error('Access denied to this location')
      }
    }

    // Process each count
    for (const count of counts) {
      // Get current inventory level
      const { data: currentInventory } = await supabase
        .from('inventory_levels')
        .select('quantity_on_hand')
        .eq('warehouse_id', warehouseId)
        .eq('product_id', count.product_id)
        .single()

      if (currentInventory) {
        const difference = count.counted_quantity - currentInventory.quantity_on_hand

        if (difference !== 0) {
          // Create adjustment movement
          await this.updateStock([{
            warehouse_id: warehouseId,
            product_id: count.product_id,
            quantity_change: difference,
            movement_type: 'adjustment',
            reference_type: 'inventory_count',
            notes: count.notes || `Inventory count adjustment: ${difference > 0 ? '+' : ''}${difference}`
          }])
        }

        // Update last counted date
        await supabase
          .from('inventory_levels')
          .update({ last_counted_at: new Date().toISOString() })
          .eq('warehouse_id', warehouseId)
          .eq('product_id', count.product_id)
      }
    }
  }

  // Get inventory valuation
  static async getInventoryValuation(warehouseId?: string): Promise<{
    total_items: number
    total_quantity: number
    total_value: number
    by_category: Array<{
      category: string
      quantity: number
      value: number
    }>
  }> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase
      .from('inventory_status')
      .select('*')

    if (warehouseId) {
      // Verify access
      if (user.role === 'franchisee') {
        const location = await this.readSingle('franchise_locations', { id: warehouseId })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to this location')
        }
      }
      query = query.eq('warehouse_id', warehouseId)
    } else if (user.role === 'franchisee') {
      // Franchisees can only see their own locations
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('warehouse_id', locationIds)
    }

    const { data: inventory, error } = await query

    if (error) throw new Error(error.message)

    const totalItems = inventory?.length || 0
    const totalQuantity = inventory?.reduce((sum, item) => sum + item.quantity_on_hand, 0) || 0
    const totalValue = inventory?.reduce((sum, item) => 
      sum + (item.quantity_on_hand * (item.cost_per_unit || 0)), 0) || 0

    // Group by category
    const categoryMap = new Map()
    inventory?.forEach(item => {
      const category = item.category || 'Uncategorized'
      const existing = categoryMap.get(category) || { quantity: 0, value: 0 }
      categoryMap.set(category, {
        quantity: existing.quantity + item.quantity_on_hand,
        value: existing.value + (item.quantity_on_hand * (item.cost_per_unit || 0))
      })
    })

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      quantity: data.quantity,
      value: data.value
    }))

    return {
      total_items: totalItems,
      total_quantity: totalQuantity,
      total_value: totalValue,
      by_category: byCategory
    }
  }

  // Search inventory
  static async searchInventory(
    searchTerm: string,
    warehouseId?: string,
    category?: string
  ): Promise<InventoryItem[]> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase.from('inventory_status').select('*')

    // Apply search term
    if (searchTerm) {
      query = query.or(`product_name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
    }

    // Apply warehouse filter
    if (warehouseId) {
      if (user.role === 'franchisee') {
        const location = await this.readSingle('franchise_locations', { id: warehouseId })
        if (location.franchisee_id !== user.id) {
          throw new Error('Access denied to this location')
        }
      }
      query = query.eq('warehouse_id', warehouseId)
    } else if (user.role === 'franchisee') {
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('warehouse_id', locationIds)
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    query = query.order('product_name', { ascending: true }).limit(100)

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }



  // Create reorder request
  static async createReorderRequest(requests: ReorderRequest[]): Promise<string> {
    const user = await this.getCurrentUserProfile()

    // Get user's franchise location
    const { data: location } = await supabase
      .from('franchise_locations')
      .select('id, name')
      .eq('franchisee_id', user.id)
      .single()

    if (!location) {
      throw new Error('No franchise location found for user')
    }

    // Calculate total estimated cost
    const totalCost = requests.reduce((sum, req) => sum + req.estimated_cost, 0)

    // Create order for restock
    const orderData = {
      order_number: `REORDER-${Date.now()}`,
      franchise_location_id: location.id,
      created_by: user.id,
      status: 'pending_approval',
      order_type: 'inventory',
      priority: requests.some(r => r.urgency === 'critical') ? 'high' : 'medium',
      subtotal: totalCost,
      tax_amount: totalCost * 0.12,
      shipping_amount: totalCost > 5000 ? 0 : 200,
      total_amount: totalCost * 1.12 + (totalCost > 5000 ? 0 : 200),
      special_instructions: requests
        .filter(r => r.justification)
        .map(r => `${r.justification}`)
        .join('; ')
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)

    // Create order items
    const orderItems = requests.map(req => ({
      order_id: order.id,
      product_id: req.product_id,
      quantity: req.requested_quantity,
      unit_price: req.estimated_cost / req.requested_quantity,
      total_price: req.estimated_cost
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw new Error(itemsError.message)

    return order.id
  }
}
