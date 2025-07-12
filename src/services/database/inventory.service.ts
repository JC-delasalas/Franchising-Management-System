import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Inventory = Database['public']['Tables']['inventory']['Row'];
type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

type PurchaseOrder = Database['public']['Tables']['purchase_order']['Row'];
type Supplier = Database['public']['Tables']['supplier']['Row'];
type Shipment = Database['public']['Tables']['shipment']['Row'];

/**
 * Inventory Management Service
 * Objective 4: Efficient Inventory & Supply Chain Monitoring
 */
export class InventoryService extends BaseService<'inventory'> {
  constructor() {
    super('inventory');
  }

  /**
   * Get inventory with low stock alerts
   */
  async getLowStockItems(): Promise<{
    data: (Inventory & { product: any; location: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product(*),
        location:location(*)
      `)
      .eq('franchisor_id', franchisorId)
      .filter('current_stock', 'lte', 'min_stock_level')
      .order('current_stock');

    return { data, error };
  }

  /**
   * Update inventory stock levels
   */
  async updateStock(
    inventoryId: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set'
  ): Promise<{
    data: Inventory | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('inventory')
      .select('current_stock')
      .eq('inventory_id', inventoryId)
      .eq('franchisor_id', franchisorId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    let newStock: number;
    switch (type) {
      case 'add':
        newStock = (currentInventory.current_stock || 0) + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, (currentInventory.current_stock || 0) - quantity);
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return { data: null, error: new Error('Invalid stock update type') };
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        current_stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('inventory_id', inventoryId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Create purchase order for low stock items
   */
  async createPurchaseOrder(orderData: {
    supplier_id: string;
    location_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }): Promise<{
    data: PurchaseOrder | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );

    const { data: purchaseOrder, error: orderError } = await supabase
      .from('purchase_order')
      .insert({
        supplier_id: orderData.supplier_id,
        location_id: orderData.location_id,
        franchisor_id: franchisorId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) return { data: null, error: orderError };

    // Create order items
    const orderItems = orderData.items.map(item => ({
      purchase_order_id: purchaseOrder.purchase_order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_item')
      .insert(orderItems);

    if (itemsError) {
      // Rollback purchase order
      await supabase
        .from('purchase_order')
        .delete()
        .eq('purchase_order_id', purchaseOrder.purchase_order_id);
      return { data: null, error: itemsError };
    }

    return { data: purchaseOrder, error: null };
  }

  /**
   * Get inventory by location
   */
  async getInventoryByLocation(locationId: string): Promise<{
    data: (Inventory & { product: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:product(*)
      `)
      .eq('location_id', locationId)
      .eq('franchisor_id', franchisorId)
      .order('product(product_nm)');

    return { data, error };
  }

  /**
   * Get purchase orders with details
   */
  async getPurchaseOrders(status?: string): Promise<{
    data: (PurchaseOrder & {
      supplier: Supplier;
      location: any;
      items: any[];
    })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    let query = supabase
      .from('purchase_order')
      .select(`
        *,
        supplier:supplier(*),
        location:location(*),
        items:purchase_order_item(
          *,
          product:product(*)
        )
      `)
      .eq('franchisor_id', franchisorId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Update purchase order status
   */
  async updatePurchaseOrderStatus(
    orderId: string,
    status: string
  ): Promise<{
    data: PurchaseOrder | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('purchase_order')
      .update({ status })
      .eq('purchase_order_id', orderId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get shipment tracking information
   */
  async getShipments(purchaseOrderId?: string): Promise<{
    data: (Shipment & {
      purchase_order: PurchaseOrder;
      from_location: any;
      to_location: any;
    })[] | null;
    error: any;
  }> {
    let query = supabase
      .from('shipment')
      .select(`
        *,
        purchase_order:purchase_order(*),
        from_location:location!shipment_from_location_id_fkey(*),
        to_location:location!shipment_to_location_id_fkey(*)
      `);

    if (purchaseOrderId) {
      query = query.eq('purchase_order_id', purchaseOrderId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(): Promise<{
    data: {
      totalItems: number;
      lowStockItems: number;
      totalValue: number;
      pendingOrders: number;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get total inventory items
      const { count: totalItems } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId);

      // Get low stock items
      const { count: lowStockItems } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .filter('current_stock', 'lte', 'min_stock_level');

      // Get pending orders
      const { count: pendingOrders } = await supabase
        .from('purchase_order')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .eq('status', 'pending');

      // Calculate total inventory value
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('current_stock, product:product(unit_price)')
        .eq('franchisor_id', franchisorId);

      const totalValue = inventoryData?.reduce((sum, item) => {
        const unitPrice = (item.product as any)?.unit_price || 0;
        return sum + ((item.current_stock || 0) * unitPrice);
      }, 0) || 0;

      return {
        data: {
          totalItems: totalItems || 0,
          lowStockItems: lowStockItems || 0,
          totalValue,
          pendingOrders: pendingOrders || 0,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}
