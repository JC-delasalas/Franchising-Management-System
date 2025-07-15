import { OrderAPI, CreateOrderRequest } from '@/api/orders'
import { InventoryAPI } from '@/api/inventory'
import { supabase } from '@/lib/supabase'

export interface OrderValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface QuickOrderRequest {
  locationId: string
  productId: string
  quantity: number
}

export class OrderService {
  // Create order with comprehensive validation
  static async createOrderWithValidation(orderData: CreateOrderRequest): Promise<any> {
    // 1. Validate order data
    const validation = await this.validateOrder(orderData)
    if (!validation.isValid) {
      throw new Error(`Order validation failed: ${validation.errors.join(', ')}`)
    }

    // 2. Check inventory availability
    const inventoryCheck = await this.checkInventoryAvailability(orderData)
    if (!inventoryCheck.isValid) {
      throw new Error(`Insufficient inventory: ${inventoryCheck.errors.join(', ')}`)
    }

    // 3. Create the order
    const order = await OrderAPI.createOrder(orderData)

    // 4. Reserve inventory for the order
    await this.reserveInventoryForOrder(order)

    // 5. Create automatic invoice
    await this.createInvoiceForOrder(order)

    // 6. Send notifications
    await this.sendOrderNotifications(order)

    return order
  }

  // Quick order for low stock items
  static async createQuickOrder(request: QuickOrderRequest): Promise<any> {
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', request.productId)
      .single()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    // Create order data
    const orderData: CreateOrderRequest = {
      franchise_location_id: request.locationId,
      order_type: 'inventory',
      priority: 'normal',
      items: [{
        product_id: request.productId,
        quantity: request.quantity,
        unit_price: product.price
      }],
      special_instructions: 'Quick reorder for low stock item'
    }

    return this.createOrderWithValidation(orderData)
  }

  // Validate order before creation
  private static async validateOrder(orderData: CreateOrderRequest): Promise<OrderValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if location exists and is active
    const { data: location } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('id', orderData.franchise_location_id)
      .single()

    if (!location) {
      errors.push('Invalid franchise location')
    } else if (location.status !== 'open') {
      warnings.push('Location is not currently open')
    }

    // Validate order items
    if (!orderData.items || orderData.items.length === 0) {
      errors.push('Order must contain at least one item')
    }

    for (const item of orderData.items || []) {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for product ${item.product_id}`)
      }

      // Check if product exists and is active
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single()

      if (!product) {
        errors.push(`Product ${item.product_id} not found`)
      } else if (!product.active) {
        errors.push(`Product ${product.name} is not active`)
      } else if (item.quantity < product.minimum_order_qty) {
        warnings.push(`Quantity for ${product.name} is below minimum order quantity (${product.minimum_order_qty})`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Check inventory availability
  private static async checkInventoryAvailability(orderData: CreateOrderRequest): Promise<OrderValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const inventory = await InventoryAPI.getInventoryByLocation(orderData.franchise_location_id)
      
      for (const item of orderData.items) {
        const stockItem = inventory.find(inv => inv.product_id === item.product_id)
        
        if (!stockItem) {
          errors.push(`No inventory record found for product ${item.product_id}`)
          continue
        }

        if (stockItem.available_quantity < item.quantity) {
          errors.push(`Insufficient stock for product ${item.product_id}. Available: ${stockItem.available_quantity}, Requested: ${item.quantity}`)
        } else if (stockItem.available_quantity - item.quantity <= stockItem.reorder_level) {
          warnings.push(`Product ${item.product_id} will be below reorder level after this order`)
        }
      }
    } catch (error) {
      errors.push('Unable to check inventory availability')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Reserve inventory for order
  private static async reserveInventoryForOrder(order: any): Promise<void> {
    const reservations = order.items?.map((item: any) => ({
      warehouse_id: order.franchise_location_id,
      product_id: item.product_id,
      quantity_change: -item.quantity,
      movement_type: 'out' as const,
      reference_type: 'order_reservation',
      reference_id: order.id,
      notes: `Reserved for order ${order.order_number}`
    })) || []

    if (reservations.length > 0) {
      await InventoryAPI.updateStock(reservations)
    }
  }

  // Create invoice for order
  private static async createInvoiceForOrder(order: any): Promise<void> {
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number')
    
    const invoiceData = {
      order_id: order.id,
      location_id: order.franchise_location_id,
      invoice_number: invoiceNumber || `INV-${Date.now()}`,
      invoice_type: 'order',
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      status: 'sent'
    }

    const { error } = await supabase
      .from('invoices')
      .insert(invoiceData)

    if (error) {
      console.error('Failed to create invoice:', error)
    }
  }

  // Send order notifications
  private static async sendOrderNotifications(order: any): Promise<void> {
    // This would integrate with a notification service
    // For now, we'll just log the notification
    console.log(`Order notification: Order ${order.order_number} created for location ${order.franchise_location_id}`)
    
    // In a real implementation, this would:
    // 1. Send email to franchisee
    // 2. Send notification to franchisor for approval
    // 3. Create in-app notifications
    // 4. Update dashboard counters
  }

  // Approve order (franchisor only)
  static async approveOrder(orderId: string, notes?: string): Promise<any> {
    // Update order status
    const order = await OrderAPI.updateOrderStatus(orderId, {
      status: 'Processing',
      notes
    })

    // Create shipment if auto-ship is enabled
    await this.createShipmentForOrder(order)

    // Send approval notifications
    await this.sendApprovalNotifications(order)

    return order
  }

  // Reject order (franchisor only)
  static async rejectOrder(orderId: string, reason: string): Promise<any> {
    // Update order status
    const order = await OrderAPI.updateOrderStatus(orderId, {
      status: 'Cancelled',
      rejection_reason: reason
    })

    // Release reserved inventory
    await this.releaseReservedInventory(order)

    // Send rejection notifications
    await this.sendRejectionNotifications(order, reason)

    return order
  }

  // Create shipment for approved order
  private static async createShipmentForOrder(order: any): Promise<void> {
    const { data: shipmentNumber } = await supabase.rpc('generate_shipment_number')
    
    const shipmentData = {
      shipment_number: shipmentNumber || `SHP-${Date.now()}`,
      order_id: order.id,
      warehouse_id: order.franchise_location_id, // Simplified: using location as warehouse
      status: 'preparing',
      estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days
    }

    const { error } = await supabase
      .from('shipments')
      .insert(shipmentData)

    if (error) {
      console.error('Failed to create shipment:', error)
    }
  }

  // Release reserved inventory
  private static async releaseReservedInventory(order: any): Promise<void> {
    const releases = order.items?.map((item: any) => ({
      warehouse_id: order.franchise_location_id,
      product_id: item.product_id,
      quantity_change: item.quantity,
      movement_type: 'in' as const,
      reference_type: 'order_cancellation',
      reference_id: order.id,
      notes: `Released from cancelled order ${order.order_number}`
    })) || []

    if (releases.length > 0) {
      await InventoryAPI.updateStock(releases)
    }
  }

  // Send approval notifications
  private static async sendApprovalNotifications(order: any): Promise<void> {
    console.log(`Order approved: ${order.order_number}`)
    // Implementation would send actual notifications
  }

  // Send rejection notifications
  private static async sendRejectionNotifications(order: any, reason: string): Promise<void> {
    console.log(`Order rejected: ${order.order_number}, Reason: ${reason}`)
    // Implementation would send actual notifications
  }

  // Get order recommendations based on inventory levels
  static async getOrderRecommendations(locationId: string): Promise<Array<{
    product_id: string
    product_name: string
    current_stock: number
    reorder_level: number
    suggested_quantity: number
    priority: 'high' | 'medium' | 'low'
  }>> {
    const inventory = await InventoryAPI.getInventoryByLocation(locationId)
    
    const recommendations = inventory
      .filter(item => item.available_quantity <= item.reorder_level)
      .map(item => {
        const deficit = item.reorder_level - item.available_quantity
        const suggestedQuantity = Math.max(deficit, item.max_stock_level - item.available_quantity)
        
        let priority: 'high' | 'medium' | 'low' = 'low'
        if (item.available_quantity === 0) {
          priority = 'high'
        } else if (item.available_quantity <= item.reorder_level * 0.5) {
          priority = 'medium'
        }

        return {
          product_id: item.product_id,
          product_name: item.product?.name || 'Unknown Product',
          current_stock: item.available_quantity,
          reorder_level: item.reorder_level,
          suggested_quantity: suggestedQuantity,
          priority
        }
      })
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

    return recommendations
  }
}
