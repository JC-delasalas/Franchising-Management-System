import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { NotificationsAPI } from './notifications';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends Order {
  order_items?: (OrderItem & {
    products?: {
      id: string;
      name: string;
      sku: string;
      price: number;
      images: any[];
      unit_of_measure: string;
    };
  })[];
  user_profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
  franchise_locations?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  payment_methods?: {
    id: string;
    type: string;
    nickname?: string;
  };
  billing_address?: {
    id: string;
    recipient_name: string;
    address_line_1: string;
    city: string;
    state_province: string;
    postal_code: string;
  };
  shipping_address?: {
    id: string;
    recipient_name: string;
    address_line_1: string;
    city: string;
    state_province: string;
    postal_code: string;
  };
}

export interface CreateOrderData {
  franchise_location_id: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  payment_method_id?: string;
  billing_address_id?: string;
  shipping_address_id?: string;
  order_notes?: string;
}

export const OrdersAPI = {
  // Get pending orders for franchisor approval
  async getPendingOrders(): Promise<OrderWithItems[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is franchisor
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (profile?.role !== 'franchisor' && profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price,
            images,
            unit_of_measure
          )
        ),
        user_profiles (
          id,
          full_name,
          email
        ),
        franchise_locations (
          id,
          name,
          address,
          city,
          state
        ),
        payment_methods (
          id,
          type,
          metadata
        ),
        billing_address:addresses!orders_billing_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        )
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending orders:', error);
      throw new Error(`Failed to fetch pending orders: ${error.message}`);
    }

    return data || [];
  },

  // Approve an order
  async approveOrder(orderId: string, comments?: string): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is franchisor
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (profile?.role !== 'franchisor' && profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        approved_by: user.user.id,
        approved_at: new Date().toISOString(),
        approval_comments: comments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error approving order:', error);
      throw new Error(`Failed to approve order: ${error.message}`);
    }

    // Log status change
    await this.logStatusChange(orderId, 'pending_approval', 'approved', user.user.id, comments);

    // Create approval record
    await supabase
      .from('order_approvals')
      .insert({
        order_id: orderId,
        approver_id: user.user.id,
        approval_level: 1,
        action: 'approve',
        comments: comments,
      });

    // Create notification for order creator
    try {
      await NotificationsAPI.createOrderNotification(
        data.created_by,
        orderId,
        'order_approved',
        comments
      );
    } catch (error) {
      console.error('Failed to create approval notification:', error);
    }

    return data;
  },

  // Reject an order
  async rejectOrder(orderId: string, reason: string): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is franchisor
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (profile?.role !== 'franchisor' && profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting order:', error);
      throw new Error(`Failed to reject order: ${error.message}`);
    }

    // Log status change
    await this.logStatusChange(orderId, 'pending_approval', 'rejected', user.user.id, reason);

    // Create approval record
    await supabase
      .from('order_approvals')
      .insert({
        order_id: orderId,
        approver_id: user.user.id,
        approval_level: 1,
        action: 'reject',
        comments: reason,
      });

    // Create notification for order creator
    try {
      await NotificationsAPI.createOrderNotification(
        data.created_by,
        orderId,
        'order_rejected',
        reason
      );
    } catch (error) {
      console.error('Failed to create rejection notification:', error);
    }

    return data;
  },

  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * 0.12; // 12% VAT
    const shippingAmount = subtotal > 5000 ? 0 : 200; // Free shipping over ₱5,000
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        franchise_location_id: orderData.franchise_location_id,
        created_by: user.user.id,
        status: 'pending_approval',
        order_type: 'inventory',
        priority: 'normal',
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        payment_method_id: orderData.payment_method_id,
        billing_address_id: orderData.billing_address_id,
        shipping_address_id: orderData.shipping_address_id,
        order_notes: orderData.order_notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Log status change
    await this.logStatusChange(order.id, 'draft', 'pending_approval', user.user.id, 'Order created');

    // Create notification for franchisors about new order
    try {
      // Get all franchisors to notify
      const { data: franchisors } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'franchisor');

      if (franchisors) {
        for (const franchisor of franchisors) {
          await NotificationsAPI.createOrderNotification(
            franchisor.id,
            order.id,
            'order_created'
          );
        }
      }
    } catch (error) {
      console.error('Failed to create order creation notifications:', error);
    }

    return order;
  },

  // Get user's orders
  async getUserOrders(): Promise<OrderWithItems[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price,
            images,
            unit_of_measure
          )
        ),
        user_profiles (
          id,
          full_name,
          email
        ),
        franchise_locations (
          id,
          name,
          address,
          city,
          state
        ),
        payment_methods (
          id,
          type,
          metadata
        ),
        billing_address:addresses!orders_billing_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        )
      `)
      .eq('created_by', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  },

  // Get single order with details
  async getOrder(orderId: string): Promise<OrderWithItems | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price,
            images,
            unit_of_measure
          )
        ),
        user_profiles (
          id,
          full_name,
          email
        ),
        franchise_locations (
          id,
          name,
          address,
          city,
          state
        ),
        payment_methods (
          id,
          type,
          metadata
        ),
        billing_address:addresses!orders_billing_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          city,
          state_province,
          postal_code
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching order:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data;
  },

  // Get orders ready for shipping (approved, processing, shipped)
  async getShippingOrders(): Promise<OrderWithItems[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is franchisor
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (profile?.role !== 'franchisor' && profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price,
            images,
            unit_of_measure
          )
        ),
        user_profiles (
          id,
          full_name,
          email
        ),
        franchise_locations (
          id,
          name,
          address,
          city,
          state
        ),
        shipping_address:addresses!orders_shipping_address_id_fkey (
          id,
          recipient_name,
          address_line_1,
          address_line_2,
          city,
          state_province,
          postal_code,
          phone_number
        )
      `)
      .in('status', ['approved', 'processing', 'shipped', 'delivered'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipping orders:', error);
      throw new Error(`Failed to fetch shipping orders: ${error.message}`);
    }

    return data || [];
  },

  // Update shipping information
  async updateShippingInfo(orderId: string, shippingInfo: {
    carrier?: string;
    tracking_number?: string;
    shipping_method?: string;
    estimated_delivery_date?: string;
  }): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...shippingInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating shipping info:', error);
      throw new Error(`Failed to update shipping info: ${error.message}`);
    }

    // Log status change
    await this.logStatusChange(orderId, 'shipping_info_updated', 'shipping_info_updated', user.user.id, 'Shipping information updated');

    return data;
  },

  // Mark order as shipped
  async markAsShipped(orderId: string): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipped_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error marking as shipped:', error);
      throw new Error(`Failed to mark as shipped: ${error.message}`);
    }

    // Log status change
    await this.logStatusChange(orderId, 'processing', 'shipped', user.user.id, 'Order marked as shipped');

    // Create notification for order creator
    try {
      await NotificationsAPI.createOrderNotification(
        data.created_by,
        orderId,
        'order_shipped'
      );
    } catch (error) {
      console.error('Failed to create shipping notification:', error);
    }

    return data;
  },

  // Mark order as delivered
  async markAsDelivered(orderId: string): Promise<Order> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error marking as delivered:', error);
      throw new Error(`Failed to mark as delivered: ${error.message}`);
    }

    // Log status change
    await this.logStatusChange(orderId, 'shipped', 'delivered', user.user.id, 'Order marked as delivered');

    // Create notification for order creator
    try {
      await NotificationsAPI.createOrderNotification(
        data.created_by,
        orderId,
        'order_delivered'
      );
    } catch (error) {
      console.error('Failed to create delivery notification:', error);
    }

    return data;
  },

  // Bulk update shipping information
  async bulkUpdateShipping(orderIds: string[], shippingInfo: {
    carrier?: string;
    tracking_number?: string;
    shipping_method?: string;
    estimated_delivery_date?: string;
  }): Promise<{ updated: number }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...shippingInfo,
        updated_at: new Date().toISOString(),
      })
      .in('id', orderIds)
      .select('id');

    if (error) {
      console.error('Error bulk updating shipping:', error);
      throw new Error(`Failed to bulk update shipping: ${error.message}`);
    }

    // Log status changes for all orders
    for (const orderId of orderIds) {
      await this.logStatusChange(orderId, 'bulk_shipping_update', 'bulk_shipping_update', user.user.id, 'Bulk shipping information update');
    }

    return { updated: data?.length || 0 };
  },

  // Helper method to log status changes
  async logStatusChange(orderId: string, previousStatus: string, newStatus: string, changedBy: string, notes?: string): Promise<void> {
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: changedBy,
        notes: notes,
      });
  },
};
