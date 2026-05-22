import { supabase } from '@/lib/supabase';

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  supplier_type: 'primary' | 'backup' | 'emergency' | 'specialty';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  address?: any;
  lead_time_days: number;
  minimum_order_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_sku: string;
  unit_cost: number;
  list_price?: number;
  minimum_order_qty: number;
  case_pack_size: number;
  unit_of_measure: string;
  lead_time_days: number;
  preferred_supplier: boolean;
  priority_rank: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  franchise_location_id?: string;
  order_id?: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'shipped' | 'received' | 'cancelled';
  order_date: string;
  requested_delivery_date?: string;
  promised_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  special_instructions?: string;
  delivery_address?: any;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export class SuppliersAPI {
  /**
   * Get all suppliers for the current organization
   */
  static async getSuppliers(params?: {
    search?: string;
    status?: string;
    supplier_type?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          supplier_performance:supplier_performance(overall_rating, on_time_delivery_rate)
        `)
        .order('name');

      // Apply filters
      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.supplier_type && params.supplier_type !== 'all') {
        query = query.eq('supplier_type', params.supplier_type);
      }

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
      }

      // Apply pagination
      if (params?.page && params?.limit) {
        const offset = (params.page - 1) * params.limit;
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        suppliers: data || [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (params?.limit || 50))
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get a single supplier by ID
   */
  static async getSupplier(id: string) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          supplier_products:supplier_products(*,
            products:products(name, sku)
          ),
          supplier_contracts:supplier_contracts(*),
          supplier_performance:supplier_performance(*),
          purchase_orders:purchase_orders(id, po_number, status, total_amount, order_date)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { supplier: data };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { supplier: data };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Update a supplier
   */
  static async updateSupplier(id: string, updates: Partial<Supplier>) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { supplier: data };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Delete a supplier
   */
  static async deleteSupplier(id: string) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  /**
   * Get supplier products
   */
  static async getSupplierProducts(supplierId: string) {
    try {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`
          *,
          products:products(id, name, sku, category),
          suppliers:suppliers(name, code)
        `)
        .eq('supplier_id', supplierId)
        .eq('active', true)
        .order('priority_rank');

      if (error) {
        throw new Error(error.message);
      }

      return { supplierProducts: data || [] };
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      throw error;
    }
  }

  /**
   * Get purchase orders
   */
  static async getPurchaseOrders(params?: {
    status?: string;
    supplier_id?: string;
    location_id?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers:suppliers(name, contact_email),
          franchise_locations:franchise_locations(name),
          orders:orders(order_number)
        `)
        .order('order_date', { ascending: false });

      // Apply filters
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.supplier_id) {
        query = query.eq('supplier_id', params.supplier_id);
      }

      if (params?.location_id) {
        query = query.eq('franchise_location_id', params.location_id);
      }

      // Apply pagination
      if (params?.page && params?.limit) {
        const offset = (params.page - 1) * params.limit;
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        purchaseOrders: data || [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (params?.limit || 50))
        }
      };
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  /**
   * Test supplier access permissions
   */
  static async testSupplierAccess() {
    try {
      // This will test if the current user can access suppliers
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, status')
        .limit(1);

      if (error) {
        return {
          hasAccess: false,
          error: error.message,
          userRole: null
        };
      }

      // Get current user role
      const { data: { user } } = await supabase.auth.getUser();
      let userRole = null;

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        userRole = profile?.role;
      }

      return {
        hasAccess: true,
        error: null,
        userRole,
        supplierCount: data?.length || 0
      };
    } catch (error) {
      return {
        hasAccess: false,
        error: error.message,
        userRole: null
      };
    }
  }
}

export default SuppliersAPI;
