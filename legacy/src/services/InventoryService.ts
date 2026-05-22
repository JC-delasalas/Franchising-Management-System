import { supabase } from '@/lib/supabase';
import { OrderItem } from './OrderManagementService';

export interface InventoryReservation {
  id?: string;
  order_id: string;
  product_id: string;
  location_id: string;
  quantity_reserved: number;
  reserved_at: string;
  expires_at: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

export interface InventoryTransaction {
  id?: string;
  product_id: string;
  location_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'reservation' | 'release';
  quantity_change: number;
  reference_id?: string;
  reference_type?: 'order' | 'shipment' | 'adjustment' | 'transfer';
  unit_cost?: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface StockLevel {
  product_id: string;
  location_id: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_level: number;
  max_stock: number;
  last_updated: string;
}

export class InventoryService {
  // Reserve inventory for pending orders
  static async reserveInventory(items: OrderItem[], locationId: string, orderId: string): Promise<void> {
    try {
      const reservations: InventoryReservation[] = [];
      const transactions: InventoryTransaction[] = [];
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      for (const item of items) {
        // Check current stock
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('current_stock, reserved_stock')
          .eq('product_id', item.product_id)
          .eq('location_id', locationId)
          .single();

        if (inventoryError || !inventory) {
          throw new Error(`Product ${item.product_id} not found in inventory`);
        }

        const availableStock = inventory.current_stock - inventory.reserved_stock;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient available stock for product ${item.product_id}`);
        }

        // Create reservation
        reservations.push({
          order_id: orderId,
          product_id: item.product_id,
          location_id: locationId,
          quantity_reserved: item.quantity,
          reserved_at: new Date().toISOString(),
          expires_at: expiresAt,
          status: 'active'
        });

        // Create transaction record
        transactions.push({
          product_id: item.product_id,
          location_id: locationId,
          transaction_type: 'reservation',
          quantity_change: -item.quantity,
          reference_id: orderId,
          reference_type: 'order',
          notes: `Reserved for order ${orderId}`,
          created_by: 'system',
          created_at: new Date().toISOString()
        });

        // Update reserved stock
        await supabase
          .from('inventory')
          .update({
            reserved_stock: inventory.reserved_stock + item.quantity,
            last_updated: new Date().toISOString()
          })
          .eq('product_id', item.product_id)
          .eq('location_id', locationId);
      }

      // Insert reservations and transactions
      await supabase.from('inventory_reservations').insert(reservations);
      await supabase.from('inventory_transactions').insert(transactions);

    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw error;
    }
  }

  // Release reserved inventory (for cancelled/rejected orders)
  static async releaseReservedInventory(orderId: string): Promise<void> {
    try {
      // Get active reservations for this order
      const { data: reservations, error: reservationsError } = await supabase
        .from('inventory_reservations')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'active');

      if (reservationsError) throw reservationsError;
      if (!reservations || reservations.length === 0) return;

      const transactions: InventoryTransaction[] = [];

      for (const reservation of reservations) {
        // Update inventory to release reserved stock
        const { data: inventory } = await supabase
          .from('inventory')
          .select('reserved_stock')
          .eq('product_id', reservation.product_id)
          .eq('location_id', reservation.location_id)
          .single();

        if (inventory) {
          await supabase
            .from('inventory')
            .update({
              reserved_stock: Math.max(0, inventory.reserved_stock - reservation.quantity_reserved),
              last_updated: new Date().toISOString()
            })
            .eq('product_id', reservation.product_id)
            .eq('location_id', reservation.location_id);
        }

        // Create release transaction
        transactions.push({
          product_id: reservation.product_id,
          location_id: reservation.location_id,
          transaction_type: 'release',
          quantity_change: reservation.quantity_reserved,
          reference_id: orderId,
          reference_type: 'order',
          notes: `Released reservation for cancelled order ${orderId}`,
          created_by: 'system',
          created_at: new Date().toISOString()
        });
      }

      // Update reservation status
      await supabase
        .from('inventory_reservations')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)
        .eq('status', 'active');

      // Insert release transactions
      if (transactions.length > 0) {
        await supabase.from('inventory_transactions').insert(transactions);
      }

    } catch (error) {
      console.error('Error releasing reserved inventory:', error);
      throw error;
    }
  }

  // Confirm delivery and update actual stock
  static async confirmDelivery(orderId: string): Promise<void> {
    try {
      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      if (!orderItems || orderItems.length === 0) return;

      // Get order location
      const { data: order } = await supabase
        .from('orders')
        .select('location_id')
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      const transactions: InventoryTransaction[] = [];

      for (const item of orderItems) {
        // Update inventory - reduce both current stock and reserved stock
        const { data: inventory } = await supabase
          .from('inventory')
          .select('current_stock, reserved_stock')
          .eq('product_id', item.product_id)
          .eq('location_id', order.location_id)
          .single();

        if (inventory) {
          await supabase
            .from('inventory')
            .update({
              current_stock: Math.max(0, inventory.current_stock - item.quantity),
              reserved_stock: Math.max(0, inventory.reserved_stock - item.quantity),
              last_updated: new Date().toISOString()
            })
            .eq('product_id', item.product_id)
            .eq('location_id', order.location_id);
        }

        // Create sale transaction
        transactions.push({
          product_id: item.product_id,
          location_id: order.location_id,
          transaction_type: 'sale',
          quantity_change: -item.quantity,
          reference_id: orderId,
          reference_type: 'order',
          unit_cost: item.unit_price,
          notes: `Sale confirmed for order ${orderId}`,
          created_by: 'system',
          created_at: new Date().toISOString()
        });
      }

      // Update reservation status to fulfilled
      await supabase
        .from('inventory_reservations')
        .update({ status: 'fulfilled' })
        .eq('order_id', orderId)
        .eq('status', 'active');

      // Insert sale transactions
      if (transactions.length > 0) {
        await supabase.from('inventory_transactions').insert(transactions);
      }

      // Check for low stock alerts
      await this.checkLowStockAlerts(order.location_id);

    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  }

  // Get current stock levels with reservations
  static async getStockLevels(locationId: string, productIds?: string[]): Promise<StockLevel[]> {
    try {
      let query = supabase
        .from('unified_inventory')
        .select(`
          product_id,
          location_id,
          quantity as current_stock,
          reserved_quantity as reserved_stock,
          reorder_point as reorder_level,
          max_stock_level as max_stock,
          updated_at as last_updated
        `)
        .eq('location_id', locationId);

      if (productIds && productIds.length > 0) {
        query = query.in('product_id', productIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        available_stock: item.current_stock - item.reserved_stock
      }));

    } catch (error) {
      console.error('Error getting stock levels:', error);
      throw error;
    }
  }

  // Transfer inventory between locations
  static async transferInventory(
    fromLocationId: string,
    toLocationId: string,
    items: { product_id: string; quantity: number }[],
    notes?: string
  ): Promise<void> {
    try {
      const transferId = `TRF-${Date.now()}`;
      const transactions: InventoryTransaction[] = [];

      for (const item of items) {
        // Check source inventory
        const { data: sourceInventory } = await supabase
          .from('inventory')
          .select('current_stock, reserved_stock')
          .eq('product_id', item.product_id)
          .eq('location_id', fromLocationId)
          .single();

        if (!sourceInventory) {
          throw new Error(`Product ${item.product_id} not found in source location`);
        }

        const availableStock = sourceInventory.current_stock - sourceInventory.reserved_stock;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient available stock for product ${item.product_id}`);
        }

        // Update source location (decrease)
        await supabase
          .from('inventory')
          .update({
            current_stock: sourceInventory.current_stock - item.quantity,
            last_updated: new Date().toISOString()
          })
          .eq('product_id', item.product_id)
          .eq('location_id', fromLocationId);

        // Update destination location (increase)
        const { data: destInventory } = await supabase
          .from('inventory')
          .select('current_stock')
          .eq('product_id', item.product_id)
          .eq('location_id', toLocationId)
          .single();

        if (destInventory) {
          // Update existing inventory
          await supabase
            .from('inventory')
            .update({
              current_stock: destInventory.current_stock + item.quantity,
              last_updated: new Date().toISOString()
            })
            .eq('product_id', item.product_id)
            .eq('location_id', toLocationId);
        } else {
          // Create new inventory record
          await supabase
            .from('inventory')
            .insert({
              product_id: item.product_id,
              location_id: toLocationId,
              current_stock: item.quantity,
              reserved_stock: 0,
              reorder_level: 10, // Default
              max_stock: 1000, // Default
              last_updated: new Date().toISOString()
            });
        }

        // Create transfer transactions
        transactions.push(
          {
            product_id: item.product_id,
            location_id: fromLocationId,
            transaction_type: 'transfer',
            quantity_change: -item.quantity,
            reference_id: transferId,
            reference_type: 'transfer',
            notes: `Transfer out to ${toLocationId}: ${notes || ''}`,
            created_by: 'system',
            created_at: new Date().toISOString()
          },
          {
            product_id: item.product_id,
            location_id: toLocationId,
            transaction_type: 'transfer',
            quantity_change: item.quantity,
            reference_id: transferId,
            reference_type: 'transfer',
            notes: `Transfer in from ${fromLocationId}: ${notes || ''}`,
            created_by: 'system',
            created_at: new Date().toISOString()
          }
        );
      }

      // Insert all transactions
      if (transactions.length > 0) {
        await supabase.from('inventory_transactions').insert(transactions);
      }

    } catch (error) {
      console.error('Error transferring inventory:', error);
      throw error;
    }
  }

  // Check and send low stock alerts
  private static async checkLowStockAlerts(locationId: string): Promise<void> {
    try {
      const { data: lowStockItems } = await supabase
        .from('inventory')
        .select(`
          *,
          products (name, sku)
        `)
        .eq('location_id', locationId)
        .filter('current_stock', 'lte', 'reorder_level');

      if (lowStockItems && lowStockItems.length > 0) {
        // Send low stock notification
        await supabase.from('notifications').insert({
          user_id: 'system', // This would be the location manager
          title: 'Low Stock Alert',
          message: `${lowStockItems.length} items are below reorder level`,
          type: 'warning',
          category: 'inventory',
          data: { low_stock_items: lowStockItems },
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
    }
  }

  // Get inventory transaction history
  static async getTransactionHistory(
    locationId: string,
    productId?: string,
    limit: number = 100
  ): Promise<InventoryTransaction[]> {
    try {
      let query = supabase
        .from('inventory_transactions')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  // Cleanup expired reservations
  static async cleanupExpiredReservations(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Get expired reservations
      const { data: expiredReservations } = await supabase
        .from('inventory_reservations')
        .select('*')
        .eq('status', 'active')
        .lt('expires_at', now);

      if (!expiredReservations || expiredReservations.length === 0) return;

      // Release expired reservations
      for (const reservation of expiredReservations) {
        await this.releaseReservedInventory(reservation.order_id);
      }

      // Update reservation status
      await supabase
        .from('inventory_reservations')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now);

    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
    }
  }
}
