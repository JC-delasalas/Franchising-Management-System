import { supabase } from '@/integrations/supabase/client';

export interface POSTransaction {
  transaction_id: string;
  location_id: string;
  customer_id?: string;
  cashier_id: string;
  transaction_date: string;
  payment_method: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  items: POSTransactionItem[];
}

export interface POSTransactionItem {
  item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface POSSession {
  session_id: string;
  location_id: string;
  cashier_id: string;
  terminal_id: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  total_transactions: number;
  status: 'active' | 'closed';
}

export interface POSProduct {
  product_id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
}

/**
 * Point of Sale (POS) Integration Service
 * Handles POS transactions, sessions, and real-time inventory updates
 */
export class POSService {
  
  /**
   * Start a new POS session
   */
  static async startSession(
    locationId: string,
    cashierId: string,
    terminalId: string,
    openingCash: number
  ): Promise<{ success: boolean; session?: POSSession; error?: string }> {
    
    try {
      const { data, error } = await supabase
        .from('pos_session')
        .insert({
          location_id: locationId,
          cashier_id: cashierId,
          terminal_id: terminalId,
          start_time: new Date().toISOString(),
          opening_cash: openingCash,
          total_sales: 0,
          total_transactions: 0,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, session: data };
    } catch (error) {
      console.error('Error starting POS session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * End POS session
   */
  static async endSession(
    sessionId: string,
    closingCash: number
  ): Promise<{ success: boolean; error?: string }> {
    
    try {
      const { error } = await supabase
        .from('pos_session')
        .update({
          end_time: new Date().toISOString(),
          closing_cash: closingCash,
          status: 'closed'
        })
        .eq('session_id', sessionId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error ending POS session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get active session for location
   */
  static async getActiveSession(locationId: string): Promise<POSSession | null> {
    try {
      const { data, error } = await supabase
        .from('pos_session')
        .select('*')
        .eq('location_id', locationId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active session:', error);
      return null;
    }
  }
  
  /**
   * Get products for POS
   */
  static async getPOSProducts(locationId: string): Promise<POSProduct[]> {
    try {
      const { data, error } = await supabase
        .from('product')
        .select(`
          product_id,
          product_nm,
          sku,
          unit_price,
          is_active,
          product_category:category_id(cat_nm),
          inventory:inventory(current_stock)
        `)
        .eq('is_active', true)
        .eq('inventory.location_id', locationId);
      
      if (error) throw error;
      
      return data?.map(item => ({
        product_id: item.product_id,
        name: item.product_nm,
        sku: item.sku,
        price: Number(item.unit_price),
        category: item.product_category?.cat_nm || 'General',
        stock_quantity: item.inventory?.[0]?.current_stock || 0,
        is_active: item.is_active
      })) || [];
    } catch (error) {
      console.error('Error fetching POS products:', error);
      return [];
    }
  }
  
  /**
   * Process POS transaction
   */
  static async processTransaction(
    sessionId: string,
    transactionData: {
      location_id: string;
      customer_id?: string;
      cashier_id: string;
      payment_method: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        discount_amount?: number;
      }>;
      discount_amount?: number;
    }
  ): Promise<{ success: boolean; transaction?: POSTransaction; error?: string }> {
    
    try {
      // Calculate totals
      const subtotal = transactionData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 0
      );
      const totalDiscount = (transactionData.discount_amount || 0) + 
        transactionData.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
      const taxAmount = (subtotal - totalDiscount) * 0.12; // 12% VAT
      const totalAmount = subtotal - totalDiscount + taxAmount;
      
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('sales_transaction')
        .insert({
          location_id: transactionData.location_id,
          customer_id: transactionData.customer_id,
          cashier_id: transactionData.cashier_id,
          transaction_date: new Date().toISOString(),
          payment_method: transactionData.payment_method,
          status: 'completed'
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Create transaction items
      const items = transactionData.items.map(item => ({
        transaction_id: transaction.transaction_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('sales_item')
        .insert(items);
      
      if (itemsError) throw itemsError;
      
      // Update inventory
      for (const item of transactionData.items) {
        await this.updateInventory(transactionData.location_id, item.product_id, -item.quantity);
      }
      
      // Update session totals
      await this.updateSessionTotals(sessionId, totalAmount);
      
      // Create POS transaction record
      const posTransaction: POSTransaction = {
        transaction_id: transaction.transaction_id,
        location_id: transactionData.location_id,
        customer_id: transactionData.customer_id,
        cashier_id: transactionData.cashier_id,
        transaction_date: transaction.transaction_date,
        payment_method: transactionData.payment_method as any,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: totalDiscount,
        total_amount: totalAmount,
        status: 'completed',
        items: items.map(item => ({
          item_id: item.transaction_id, // Placeholder
          product_id: item.product_id,
          product_name: '', // Will be populated from product lookup
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          total_price: item.quantity * item.unit_price - item.discount_amount
        }))
      };
      
      return { success: true, transaction: posTransaction };
    } catch (error) {
      console.error('Error processing POS transaction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    locationId: string,
    dateFrom?: string,
    dateTo?: string,
    limit: number = 50
  ): Promise<POSTransaction[]> {
    
    try {
      let query = supabase
        .from('sales_transaction')
        .select(`
          *,
          sales_item:sales_item(
            *,
            product:product_id(product_nm)
          ),
          customer:customer_id(first_nm, last_nm),
          cashier:cashier_id(first_name, last_name)
        `)
        .eq('location_id', locationId)
        .order('transaction_date', { ascending: false })
        .limit(limit);
      
      if (dateFrom) {
        query = query.gte('transaction_date', dateFrom);
      }
      
      if (dateTo) {
        query = query.lte('transaction_date', dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(transaction => ({
        transaction_id: transaction.transaction_id,
        location_id: transaction.location_id,
        customer_id: transaction.customer_id,
        cashier_id: transaction.cashier_id,
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method,
        subtotal: 0, // Calculate from items
        tax_amount: 0, // Calculate
        discount_amount: 0, // Calculate
        total_amount: transaction.sales_item?.reduce(
          (sum: number, item: any) => sum + (item.quantity * item.unit_price - item.discount_amount), 0
        ) || 0,
        status: transaction.status,
        items: transaction.sales_item?.map((item: any) => ({
          item_id: item.item_id,
          product_id: item.product_id,
          product_name: item.product?.product_nm || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          total_price: item.quantity * item.unit_price - item.discount_amount
        })) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
  
  /**
   * Get daily sales summary
   */
  static async getDailySalesSummary(locationId: string, date: string): Promise<{
    total_sales: number;
    total_transactions: number;
    average_transaction: number;
    payment_methods: Record<string, number>;
  }> {
    
    try {
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;
      
      const { data, error } = await supabase
        .from('sales_transaction')
        .select(`
          payment_method,
          sales_item:sales_item(quantity, unit_price, discount_amount)
        `)
        .eq('location_id', locationId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
      
      if (error) throw error;
      
      const totalSales = data?.reduce((sum, transaction) => {
        const transactionTotal = transaction.sales_item?.reduce(
          (itemSum: number, item: any) => itemSum + (item.quantity * item.unit_price - item.discount_amount), 0
        ) || 0;
        return sum + transactionTotal;
      }, 0) || 0;
      
      const totalTransactions = data?.length || 0;
      const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      
      const paymentMethods = data?.reduce((acc: Record<string, number>, transaction) => {
        const method = transaction.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {}) || {};
      
      return {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_transaction: averageTransaction,
        payment_methods: paymentMethods
      };
    } catch (error) {
      console.error('Error fetching daily sales summary:', error);
      return {
        total_sales: 0,
        total_transactions: 0,
        average_transaction: 0,
        payment_methods: {}
      };
    }
  }
  
  // Private helper methods
  private static async updateInventory(locationId: string, productId: string, quantityChange: number): Promise<void> {
    try {
      const { data: inventory, error: fetchError } = await supabase
        .from('inventory')
        .select('current_stock')
        .eq('location_id', locationId)
        .eq('product_id', productId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newStock = Math.max(0, (inventory.current_stock || 0) + quantityChange);
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ current_stock: newStock })
        .eq('location_id', locationId)
        .eq('product_id', productId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }
  
  private static async updateSessionTotals(sessionId: string, transactionAmount: number): Promise<void> {
    try {
      const { data: session, error: fetchError } = await supabase
        .from('pos_session')
        .select('total_sales, total_transactions')
        .eq('session_id', sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error: updateError } = await supabase
        .from('pos_session')
        .update({
          total_sales: (session.total_sales || 0) + transactionAmount,
          total_transactions: (session.total_transactions || 0) + 1
        })
        .eq('session_id', sessionId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating session totals:', error);
    }
  }
}
