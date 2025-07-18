import { supabase } from '@/lib/supabase';
import { NotificationService } from './NotificationService';
import { InventoryService } from './InventoryService';
import { PricingService } from './PricingService';
import { InvoiceService } from './InvoiceService';

export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
  product_sku?: string;
}

export interface Order {
  id?: string;
  order_number: string;
  franchise_location_id: string;
  created_by: string;
  status: 'draft' | 'pending_approval' | 'level1_approved' | 'level2_approved' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
  approval_level: 0 | 1 | 2 | 3;
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  grand_total: number;
  currency: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requested_delivery_date?: string;
  notes?: string;
  items: OrderItem[];
  approval_history: ApprovalRecord[];
  shipping_info?: ShippingInfo;
  invoice_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApprovalRecord {
  id?: string;
  order_id: string;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  approval_level: 1 | 2 | 3;
  action: 'approved' | 'rejected' | 'escalated';
  comments?: string;
  approved_at: string;
}

export interface ShippingInfo {
  carrier: string;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface ApprovalThresholds {
  level1_threshold: number; // Franchisee manager approval required above this amount
  level2_threshold: number; // Regional coordinator approval required above this amount
  level3_threshold: number; // Franchisor approval required above this amount
  auto_approve_limit: number; // Orders below this amount are auto-approved
}

export class OrderManagementService {
  private static notificationService = new NotificationService();
  private static inventoryService = new InventoryService();
  private static pricingService = new PricingService();
  private static invoiceService = new InvoiceService();

  // Create new order with inventory validation and automatic pricing
  static async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
    // Use database transaction for atomic order creation
    const { data: transactionResult, error: transactionError } = await supabase.rpc('create_order_transaction', {
      order_data: orderData
    });

    if (transactionError) {
      console.error('Transaction error creating order:', transactionError);
      throw new Error(`Order creation failed: ${transactionError.message}`);
    }

    if (!transactionResult) {
      throw new Error('Order creation transaction returned no result');
    }

    try {
      // The transaction function handles all the atomic operations
      // Now we just need to handle post-creation workflows
      const createdOrder = transactionResult;

      // Start approval workflow if needed (outside transaction)
      if (createdOrder.approval_level > 0) {
        await this.initiateApprovalWorkflow(createdOrder);
      } else {
        // Auto-approve and process
        await this.processApprovedOrder(createdOrder);
      }

      // Send notifications (outside transaction)
      await this.notificationService.sendOrderCreatedNotification(createdOrder);

      return createdOrder;
    } catch (error) {
      console.error('Error in post-order creation workflow:', error);

      // If post-creation workflow fails, we need to clean up
      try {
        await this.rollbackOrderCreation(transactionResult.id);
      } catch (rollbackError) {
        console.error('Failed to rollback order creation:', rollbackError);
      }

      throw error;
    }
  }

  // Rollback order creation if post-creation workflow fails
  private static async rollbackOrderCreation(orderId: string): Promise<void> {
    try {
      // Release reserved inventory
      await this.inventoryService.releaseReservedInventory(orderId);

      // Delete order items
      await supabase.from('order_items').delete().eq('order_id', orderId);

      // Delete order
      await supabase.from('orders').delete().eq('id', orderId);

      console.log(`Order ${orderId} rolled back successfully`);
    } catch (error) {
      console.error(`Failed to rollback order ${orderId}:`, error);
      throw error;
    }
  }

  // Three-tier approval system with race condition protection
  static async processApproval(orderId: string, approverId: string, action: 'approved' | 'rejected', comments?: string): Promise<Order> {
    // Use database transaction to prevent race conditions
    const { data: approvalResult, error: approvalError } = await supabase.rpc('process_order_approval', {
      p_order_id: orderId,
      p_approver_id: approverId,
      p_action: action,
      p_comments: comments || null
    });

    if (approvalError) {
      console.error('Approval processing error:', approvalError);
      throw new Error(`Approval processing failed: ${approvalError.message}`);
    }

    if (!approvalResult) {
      throw new Error('Approval processing returned no result');
    }

    try {
      const updatedOrder = approvalResult.order;
      const approvalRecord = approvalResult.approval_record;

      // Handle post-approval actions (outside transaction)
      if (action === 'approved' && updatedOrder.status === 'approved') {
        await this.processApprovedOrder(updatedOrder);
      } else if (action === 'rejected') {
        await this.rejectOrder(updatedOrder, approverId, comments);
      } else if (action === 'approved' && updatedOrder.status === 'pending_approval') {
        // Escalate to next level
        await this.escalateToNextLevel(updatedOrder);
      }

      // Send notifications
      await this.notificationService.sendApprovalNotification(updatedOrder, approvalRecord);

      return updatedOrder;
    } catch (error) {
      console.error('Error in post-approval workflow:', error);
      throw error;
    }

      if (!approver) throw new Error('Approver not found');

      // Determine current approval level
      const currentLevel = this.getCurrentApprovalLevel(order.status);
      
      if (action === 'rejected') {
        // Reject order
        await this.rejectOrder(order, approverId, comments);
        return order;
      }

      // Create approval record
      const approvalRecord: ApprovalRecord = {
        order_id: orderId,
        approver_id: approverId,
        approver_name: approver.full_name,
        approver_role: approver.role,
        approval_level: currentLevel,
        action: 'approved',
        comments,
        approved_at: new Date().toISOString()
      };

      // Insert approval record
      await supabase.from('order_approvals').insert(approvalRecord);

      // Update order status
      let newStatus = order.status;
      if (currentLevel === 1) {
        newStatus = order.approval_level > 1 ? 'level1_approved' : 'approved';
      } else if (currentLevel === 2) {
        newStatus = order.approval_level > 2 ? 'level2_approved' : 'approved';
      } else if (currentLevel === 3) {
        newStatus = 'approved';
      }

      // Update order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      // If fully approved, process the order
      if (newStatus === 'approved') {
        await this.processApprovedOrder(updatedOrder);
      } else {
        // Escalate to next level
        await this.escalateToNextLevel(updatedOrder);
      }

      // Send notifications
      await this.notificationService.sendApprovalNotification(updatedOrder, approvalRecord);

      return updatedOrder;
    } catch (error) {
      console.error('Error processing approval:', error);
      throw error;
    }
  }

  // Shipment and fulfillment
  static async createShipment(orderId: string, shippingInfo: ShippingInfo): Promise<void> {
    try {
      // Update order with shipping information
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          shipping_info: shippingInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Create shipment record
      await supabase.from('shipments').insert({
        order_id: orderId,
        carrier: shippingInfo.carrier,
        tracking_number: shippingInfo.tracking_number,
        estimated_delivery: shippingInfo.estimated_delivery,
        shipping_address: shippingInfo.shipping_address,
        status: 'in_transit',
        created_at: new Date().toISOString()
      });

      // Send shipping notification
      await this.notificationService.sendShippingNotification(orderId, shippingInfo);
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  // Delivery confirmation
  static async confirmDelivery(orderId: string, deliveryProof?: string): Promise<void> {
    try {
      const deliveryDate = new Date().toISOString();

      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'delivered',
          updated_at: deliveryDate
        })
        .eq('id', orderId);

      // Update shipment
      await supabase
        .from('shipments')
        .update({
          status: 'delivered',
          actual_delivery: deliveryDate,
          delivery_proof: deliveryProof
        })
        .eq('order_id', orderId);

      // Release reserved inventory and update stock
      await this.inventoryService.confirmDelivery(orderId);

      // Generate final invoice
      await this.invoiceService.generateFinalInvoice(orderId);

      // Send delivery confirmation
      await this.notificationService.sendDeliveryConfirmation(orderId);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  }

  // Helper methods
  private static async generateOrderNumber(locationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Get location code
    const { data: location } = await supabase
      .from('franchise_locations')
      .select('location_code')
      .eq('id', locationId)
      .single();

    const locationCode = location?.location_code || 'LOC';
    
    // Get next sequence number for today
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('location_id', locationId)
      .gte('created_at', `${year}-${month}-${day}T00:00:00.000Z`)
      .lt('created_at', `${year}-${month}-${day}T23:59:59.999Z`);

    const sequence = String((count || 0) + 1).padStart(4, '0');
    
    return `${locationCode}-${year}${month}${day}-${sequence}`;
  }

  private static async validateInventoryAvailability(items: OrderItem[], locationId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const item of items) {
      const { data: inventory } = await supabase
        .from('inventory')
        .select('current_stock, products(name)')
        .eq('product_id', item.product_id)
        .eq('location_id', locationId)
        .single();

      if (!inventory) {
        errors.push(`Product ${item.product_name || item.product_id} not found in inventory`);
        continue;
      }

      if (inventory.current_stock < item.quantity) {
        errors.push(`Insufficient stock for ${inventory.products.name}. Available: ${inventory.current_stock}, Requested: ${item.quantity}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static async determineApprovalLevel(totalAmount: number, locationId: string): Promise<0 | 1 | 2 | 3> {
    // Get approval thresholds for location
    const { data: thresholds } = await supabase
      .from('approval_thresholds')
      .select('*')
      .eq('location_id', locationId)
      .single();

    const defaultThresholds: ApprovalThresholds = {
      auto_approve_limit: 1000,
      level1_threshold: 5000,
      level2_threshold: 25000,
      level3_threshold: 100000
    };

    const config = thresholds || defaultThresholds;

    if (totalAmount <= config.auto_approve_limit) return 0;
    if (totalAmount <= config.level1_threshold) return 1;
    if (totalAmount <= config.level2_threshold) return 2;
    return 3;
  }

  private static getCurrentApprovalLevel(status: string): 1 | 2 | 3 {
    switch (status) {
      case 'pending_approval': return 1;
      case 'level1_approved': return 2;
      case 'level2_approved': return 3;
      default: return 1;
    }
  }

  private static async processApprovedOrder(order: Order): Promise<void> {
    // Update status to processing
    await supabase
      .from('orders')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Generate invoice
    await this.invoiceService.generateInvoice(order);

    // Send to fulfillment
    await this.initiateFullfillment(order);
  }

  private static async rejectOrder(order: Order, approverId: string, comments?: string): Promise<void> {
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Release reserved inventory
    await this.inventoryService.releaseReservedInventory(order.id);

    // Send rejection notification
    await this.notificationService.sendRejectionNotification(order, approverId, comments);
  }

  private static async escalateToNextLevel(order: Order): Promise<void> {
    // Send escalation notification to next level approvers
    await this.notificationService.sendEscalationNotification(order);
  }

  private static async initiateApprovalWorkflow(order: Order): Promise<void> {
    // Send notification to level 1 approvers
    await this.notificationService.sendApprovalRequestNotification(order, 1);
  }

  private static async initiateFullfillment(order: Order): Promise<void> {
    // Create fulfillment record
    await supabase.from('fulfillment_orders').insert({
      order_id: order.id,
      location_id: order.location_id,
      status: 'pending',
      priority: order.priority,
      created_at: new Date().toISOString()
    });

    // Send to warehouse management system
    await this.notificationService.sendFulfillmentNotification(order);
  }
}
