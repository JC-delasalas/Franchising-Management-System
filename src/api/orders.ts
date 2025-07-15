import { BaseAPI } from './base'
import { supabase } from '@/lib/supabase'

export interface CreateOrderRequest {
  franchise_location_id: string
  order_type: 'inventory' | 'equipment' | 'marketing' | 'supplies'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  items: Array<{
    product_id: string
    quantity: number
    unit_price?: number
  }>
  special_instructions?: string
  requested_delivery_date?: string
}

export interface UpdateOrderRequest {
  status?: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'
  rejection_reason?: string
  notes?: string
}

export interface Order {
  id: string
  order_number: string
  franchise_location_id: string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'
  order_date: string
  order_type: string
  priority: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  requested_delivery_date?: string
  special_instructions?: string
  created_by: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  delivered_quantity: number
  product?: {
    name: string
    sku: string
  }
}

export class OrderAPI extends BaseAPI {
  // Create new order
  static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const user = await this.getCurrentUserProfile()
    
    // Verify user has access to this location
    const location = await this.readSingle('franchise_locations', { 
      id: orderData.franchise_location_id 
    })
    
    if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to this location')
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber()
    
    // Get product prices if not provided
    const itemsWithPrices = await Promise.all(
      orderData.items.map(async (item) => {
        if (!item.unit_price) {
          const product = await this.readSingle('products', { id: item.product_id })
          return { ...item, unit_price: product.price }
        }
        return item
      })
    )

    // Calculate totals
    const subtotal = itemsWithPrices.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    )
    const taxAmount = subtotal * 0.12 // 12% VAT
    const totalAmount = subtotal + taxAmount

    // Create order
    const order = await this.create<Order>('orders', {
      order_number: orderNumber,
      franchise_location_id: orderData.franchise_location_id,
      order_type: orderData.order_type,
      priority: orderData.priority || 'normal',
      status: 'Pending',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      special_instructions: orderData.special_instructions,
      requested_delivery_date: orderData.requested_delivery_date,
      created_by: user.id,
      order_date: new Date().toISOString()
    })

    // Create order items
    const orderItems = await Promise.all(
      itemsWithPrices.map(item =>
        this.create('order_items', {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })
      )
    )

    return { ...order, items: orderItems }
  }

  // Get orders by location
  static async getOrdersByLocation(locationId: string): Promise<Order[]> {
    const user = await this.getCurrentUserProfile()
    
    // Verify access
    const location = await this.readSingle('franchise_locations', { id: locationId })
    if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to this location')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        )
      `)
      .eq('franchise_location_id', locationId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        ),
        franchise_locations (name),
        user_profiles!created_by (full_name)
      `)
      .eq('id', orderId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // Update order status
  static async updateOrderStatus(orderId: string, updates: UpdateOrderRequest): Promise<Order> {
    const user = await this.getCurrentUserProfile()
    
    // Get current order
    const currentOrder = await this.readSingle<Order>('orders', { id: orderId })
    
    // Check permissions
    const location = await this.readSingle('franchise_locations', { 
      id: currentOrder.franchise_location_id 
    })
    
    if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to update this order')
    }

    const updateData: any = {
      status: updates.status,
      updated_at: new Date().toISOString()
    }

    if (updates.status === 'Completed' && user.role === 'franchisor') {
      updateData.approved_by = user.id
      updateData.approved_at = new Date().toISOString()
    }

    if (updates.status === 'Cancelled') {
      updateData.cancellation_reason = updates.rejection_reason
      updateData.cancelled_by = user.id
      updateData.cancelled_at = new Date().toISOString()
    }

    return this.update<Order>('orders', orderId, updateData)
  }

  // Get pending orders for approval (franchisor only)
  static async getPendingOrders(): Promise<Order[]> {
    await this.checkPermission(['franchisor', 'admin'])

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        ),
        franchise_locations (name),
        user_profiles!created_by (full_name)
      `)
      .eq('status', 'Pending')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  }

  // Get order statistics
  static async getOrderStatistics(locationId?: string): Promise<{
    total_orders: number
    pending_orders: number
    completed_orders: number
    total_value: number
    avg_order_value: number
  }> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase.from('orders').select('*')
    
    if (locationId) {
      // Verify access to location
      const location = await this.readSingle('franchise_locations', { id: locationId })
      if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
        throw new Error('Access denied to this location')
      }
      query = query.eq('franchise_location_id', locationId)
    } else if (user.role === 'franchisee') {
      // Franchisees can only see their own orders
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('franchise_location_id', locationIds)
    }

    const { data: orders, error } = await query

    if (error) throw new Error(error.message)

    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0
    const completedOrders = orders?.filter(o => o.status === 'Completed').length || 0
    const totalValue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0

    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      total_value: totalValue,
      avg_order_value: avgOrderValue
    }
  }

  // Generate order number
  private static async generateOrderNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_order_number')
    
    if (error) {
      // Fallback if function doesn't exist
      const year = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-6)
      return `ORD-${year}-${timestamp}`
    }
    
    return data
  }

  // Search orders
  static async searchOrders(
    searchTerm: string, 
    locationId?: string,
    status?: string
  ): Promise<Order[]> {
    const user = await this.getCurrentUserProfile()
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        ),
        franchise_locations (name)
      `)

    // Apply search term
    if (searchTerm) {
      query = query.or(`order_number.ilike.%${searchTerm}%,special_instructions.ilike.%${searchTerm}%`)
    }

    // Apply location filter
    if (locationId) {
      const location = await this.readSingle('franchise_locations', { id: locationId })
      if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
        throw new Error('Access denied to this location')
      }
      query = query.eq('franchise_location_id', locationId)
    } else if (user.role === 'franchisee') {
      const locations = await this.read('franchise_locations', { franchisee_id: user.id })
      const locationIds = locations.map(loc => loc.id)
      query = query.in('franchise_location_id', locationIds)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false }).limit(50)

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }
}
