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

    try {
      // Get current order with full details
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          franchise_locations (
            id, name, franchisee_id,
            franchises (id, name, owner_id)
          )
        `)
        .eq('id', orderId)
        .single()

      if (fetchError) throw fetchError

      // Check permissions
      const isOwner = currentOrder.created_by === user.id
      const isFranchisor = user.role === 'franchisor' &&
        currentOrder.franchise_locations?.franchises?.owner_id === user.id
      const isAdmin = user.role === 'admin'

      if (!isOwner && !isFranchisor && !isAdmin) {
        throw new Error('Access denied to update this order')
      }

      const updateData: any = {
        status: updates.status,
        updated_at: new Date().toISOString()
      }

      // Handle status-specific updates
      if (updates.status === 'approved' && user.role === 'franchisor') {
        updateData.approved_by = user.id
        updateData.approved_at = new Date().toISOString()
        updateData.approval_comments = updates.notes
      }

      if (updates.status === 'rejected') {
        updateData.rejection_reason = updates.rejection_reason
        updateData.rejected_by = user.id
        updateData.rejected_at = new Date().toISOString()
      }

      if (updates.status === 'shipped') {
        updateData.shipped_date = new Date().toISOString()
        updateData.tracking_number = updates.tracking_number
        updateData.carrier = updates.carrier
        updateData.shipping_method = updates.shipping_method
        updateData.estimated_delivery_date = updates.estimated_delivery_date
      }

      if (updates.status === 'delivered') {
        updateData.delivered_date = new Date().toISOString()
      }

      // Update the order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (updateError) throw updateError

      // Create status history
      await this.createStatusHistory(orderId, currentOrder.status, updates.status, user.id, updates.notes)

      // Handle post-update actions
      if (updates.status === 'approved') {
        await this.handleOrderApproval(updatedOrder)
      }

      if (updates.status === 'delivered') {
        await this.handleOrderDelivery(updatedOrder)
      }

      // Create transaction history
      await this.createOrderTransactionHistory(updatedOrder, updates.status, user.id)

      return updatedOrder
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
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

  // Get orders for franchisor (all orders in their network)
  static async getOrdersForFranchisor(franchisorId: string): Promise<Order[]> {
    await this.checkPermission(['franchisor', 'admin'])

    try {
      // Get all franchises owned by this franchisor
      const { data: franchises, error: franchisesError } = await supabase
        .from('franchises')
        .select('id')
        .eq('owner_id', franchisorId)

      if (franchisesError) throw franchisesError

      const franchiseIds = franchises?.map(f => f.id) || []

      // Get all locations for these franchises
      const { data: locations, error: locationsError } = await supabase
        .from('franchise_locations')
        .select('id')
        .in('franchise_id', franchiseIds)

      if (locationsError) throw locationsError

      const locationIds = locations?.map(l => l.id) || []

      // Get all orders for these locations
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku, price, images)
          ),
          franchise_locations (name, franchisee_id),
          user_profiles!created_by (full_name, email)
        `)
        .in('franchise_location_id', locationIds)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      return orders || []
    } catch (error) {
      console.error('Error fetching franchisor orders:', error)
      throw new Error('Failed to fetch orders for franchisor')
    }
  }

  // Get orders by franchisee
  static async getOrdersByFranchisee(franchiseeId: string): Promise<Order[]> {
    const user = await this.getCurrentUserProfile()

    // Verify access - user can only see their own orders unless they're franchisor/admin
    if (user.id !== franchiseeId && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied')
    }

    return this.read<Order>('orders',
      { created_by: franchiseeId },
      `
        *,
        order_items (
          *,
          products (name, sku, price, images)
        )
      `,
      { column: 'created_at', ascending: false }
    )
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

  // Create status history entry
  private static async createStatusHistory(
    orderId: string,
    previousStatus: string,
    newStatus: string,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Check if order_status_history table exists, if not create entry in transaction_history
      const { error } = await supabase
        .from('transaction_history')
        .insert({
          transaction_number: `TXN-STATUS-${Date.now()}`,
          transaction_type: 'order_status_change',
          reference_id: orderId,
          reference_type: 'order',
          amount: 0,
          description: `Order status changed from ${previousStatus} to ${newStatus}`,
          status: 'completed',
          metadata: {
            previous_status: previousStatus,
            new_status: newStatus,
            changed_by: changedBy,
            notes: notes || ''
          }
        })

      if (error) {
        console.error('Error creating status history:', error)
      }
    } catch (error) {
      console.error('Error in createStatusHistory:', error)
    }
  }

  // Handle order approval workflow
  private static async handleOrderApproval(order: Order): Promise<void> {
    try {
      // Send approval notification to franchisee
      await this.sendOrderNotification(order, 'approved')

    } catch (error) {
      console.error('Error handling order approval:', error)
    }
  }

  // Handle order delivery workflow
  private static async handleOrderDelivery(order: Order): Promise<void> {
    try {
      // Generate invoice automatically
      await this.generateInvoiceForOrder(order.id)

      // Send delivery notification
      await this.sendOrderNotification(order, 'delivered')

    } catch (error) {
      console.error('Error handling order delivery:', error)
    }
  }

  // Generate invoice for delivered order
  private static async generateInvoiceForOrder(orderId: string): Promise<void> {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Check if invoice already exists
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('order_id', orderId)
        .single()

      if (existingInvoice) return // Invoice already exists

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      const invoiceData = {
        invoice_number: invoiceNumber,
        order_id: orderId,
        franchise_location_id: order.franchise_location_id,
        invoice_type: 'order',
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        total_amount: order.total_amount,
        currency: 'PHP',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'sent',
        payment_terms: 'Net 30 days',
        notes: `Invoice for order ${order.order_number}`,
        created_by: (await this.getCurrentUserProfile()).id
      }

      await supabase
        .from('invoices')
        .insert(invoiceData)

    } catch (error) {
      console.error('Error generating invoice:', error)
    }
  }

  // Create transaction history for order updates
  private static async createOrderTransactionHistory(
    order: Order,
    newStatus: string,
    userId: string
  ): Promise<void> {
    try {
      const transactionData = {
        transaction_number: `TXN-${newStatus.toUpperCase()}-${Date.now()}`,
        transaction_type: 'order_status_change',
        reference_id: order.id,
        reference_type: 'order',
        franchise_location_id: order.franchise_location_id,
        franchisee_id: order.created_by,
        franchisor_id: userId,
        amount: order.total_amount,
        description: `Order ${order.order_number} status changed to ${newStatus}`,
        status: 'completed',
        metadata: {
          order_number: order.order_number,
          new_status: newStatus,
          order_type: order.order_type
        }
      }

      await supabase
        .from('transaction_history')
        .insert(transactionData)

    } catch (error) {
      console.error('Error creating transaction history:', error)
    }
  }

  // Send order notifications
  private static async sendOrderNotification(order: Order, type: string): Promise<void> {
    try {
      const notificationData = {
        user_id: order.created_by,
        type: `order_${type}`,
        title: `Order ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        message: `Your order ${order.order_number} has been ${type}`,
        data: {
          order_id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount
        },
        is_read: false
      }

      await supabase
        .from('notifications')
        .insert(notificationData)

    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }
}
