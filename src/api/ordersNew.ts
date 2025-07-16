import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

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

    return order;
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
