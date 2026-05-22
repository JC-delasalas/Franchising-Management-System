import { supabase } from '@/lib/supabase';

export interface Invoice {
  id?: string;
  invoice_number: string;
  order_id: string;
  location_id: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_terms: string;
  notes?: string;
  line_items: InvoiceLineItem[];
  billing_address: Address;
  shipping_address: Address;
  payment_info?: PaymentInfo;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceLineItem {
  id?: string;
  invoice_id?: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  description?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
}

export interface Address {
  name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface PaymentInfo {
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'digital_wallet';
  payment_date?: string;
  payment_reference?: string;
  payment_amount?: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface TaxCalculation {
  base_amount: number;
  tax_rate: number;
  tax_amount: number;
  tax_name: string;
}

export class InvoiceService {
  // Generate invoice from approved order
  static async generateInvoice(order: any): Promise<Invoice> {
    try {
      // Get order details with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku, description)
          ),
          franchise_locations (
            name,
            address,
            city,
            state,
            postal_code,
            country,
            phone,
            email
          ),
          user_profiles!created_by (
            full_name,
            email,
            phone
          )
        `)
        .eq('id', order.id)
        .single();

      if (orderError || !orderData) {
        throw new Error('Order not found');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(order.location_id);

      // Calculate due date (default 30 days)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Prepare line items
      const lineItems: InvoiceLineItem[] = orderData.order_items.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.products.name,
        product_sku: item.products.sku,
        description: item.products.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.total_price,
        tax_rate: 12, // Default VAT rate
        tax_amount: item.total_price * 0.12
      }));

      // Prepare addresses
      const billingAddress: Address = {
        name: orderData.user_profiles.full_name,
        street: orderData.franchise_locations.address,
        city: orderData.franchise_locations.city,
        state: orderData.franchise_locations.state,
        postal_code: orderData.franchise_locations.postal_code,
        country: orderData.franchise_locations.country,
        phone: orderData.user_profiles.phone,
        email: orderData.user_profiles.email
      };

      const shippingAddress = { ...billingAddress }; // Same as billing for now

      // Create invoice
      const invoice: Invoice = {
        invoice_number: invoiceNumber,
        order_id: order.id,
        location_id: order.location_id,
        customer_id: order.created_by,
        invoice_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        status: 'draft',
        subtotal: order.total_amount,
        tax_amount: order.tax_amount,
        shipping_amount: order.shipping_amount,
        discount_amount: 0,
        total_amount: order.grand_total,
        currency: order.currency || 'PHP',
        payment_terms: 'Net 30',
        line_items: lineItems,
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert invoice into database
      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      const lineItemsWithInvoiceId = lineItems.map(item => ({
        ...item,
        invoice_id: createdInvoice.id
      }));

      await supabase.from('invoice_line_items').insert(lineItemsWithInvoiceId);

      // Update order with invoice ID
      await supabase
        .from('orders')
        .update({ invoice_id: createdInvoice.id })
        .eq('id', order.id);

      return createdInvoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  // Generate final invoice after delivery
  static async generateFinalInvoice(orderId: string): Promise<Invoice> {
    try {
      // Get existing invoice
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!existingInvoice) {
        throw new Error('No invoice found for order');
      }

      // Update invoice status to sent
      const { data: updatedInvoice, error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingInvoice.id)
        .select()
        .single();

      if (error) throw error;

      // Generate PDF and send to customer
      await this.generateInvoicePDF(updatedInvoice);
      await this.sendInvoiceToCustomer(updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      console.error('Error generating final invoice:', error);
      throw error;
    }
  }

  // Record payment
  static async recordPayment(invoiceId: string, paymentInfo: PaymentInfo): Promise<void> {
    try {
      // Update invoice with payment information
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          payment_info: paymentInfo,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      // Create payment record
      await supabase.from('payments').insert({
        invoice_id: invoiceId,
        payment_method: paymentInfo.payment_method,
        payment_date: paymentInfo.payment_date || new Date().toISOString(),
        payment_reference: paymentInfo.payment_reference,
        amount: paymentInfo.payment_amount,
        status: paymentInfo.payment_status,
        created_at: new Date().toISOString()
      });

      // Send payment confirmation
      await this.sendPaymentConfirmation(invoiceId);
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Calculate taxes with multiple tax rates
  static async calculateTaxes(lineItems: InvoiceLineItem[], locationId: string): Promise<TaxCalculation[]> {
    try {
      // Get tax configuration for location
      const { data: taxConfig } = await supabase
        .from('tax_configurations')
        .select('*')
        .eq('location_id', locationId);

      const taxes: TaxCalculation[] = [];
      
      if (!taxConfig || taxConfig.length === 0) {
        // Default VAT calculation
        const baseAmount = lineItems.reduce((sum, item) => sum + item.line_total, 0);
        taxes.push({
          base_amount: baseAmount,
          tax_rate: 12,
          tax_amount: baseAmount * 0.12,
          tax_name: 'VAT'
        });
      } else {
        // Calculate based on configuration
        for (const config of taxConfig) {
          const baseAmount = lineItems.reduce((sum, item) => sum + item.line_total, 0);
          const taxAmount = config.tax_type === 'percentage' 
            ? baseAmount * (config.tax_rate / 100)
            : config.tax_rate;

          taxes.push({
            base_amount: baseAmount,
            tax_rate: config.tax_rate,
            tax_amount: taxAmount,
            tax_name: config.tax_name
          });
        }
      }

      return taxes;
    } catch (error) {
      console.error('Error calculating taxes:', error);
      return [];
    }
  }

  // Get invoice by ID
  static async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_line_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting invoice:', error);
      return null;
    }
  }

  // Get invoices for location
  static async getInvoicesForLocation(locationId: string, filters?: {
    status?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
  }): Promise<Invoice[]> {
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.from_date) {
        query = query.gte('invoice_date', filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte('invoice_date', filters.to_date);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting invoices for location:', error);
      return [];
    }
  }

  // Helper methods
  private static async generateInvoiceNumber(locationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Get location code
    const { data: location } = await supabase
      .from('franchise_locations')
      .select('location_code')
      .eq('id', locationId)
      .single();

    const locationCode = location?.location_code || 'LOC';

    // Get next sequence number for this month
    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .eq('location_id', locationId)
      .gte('invoice_date', `${year}-${month}-01T00:00:00.000Z`)
      .lt('invoice_date', `${year}-${month + 1}-01T00:00:00.000Z`);

    const sequence = String((count || 0) + 1).padStart(4, '0');

    return `INV-${locationCode}-${year}${month}-${sequence}`;
  }

  private static async generateInvoicePDF(invoice: Invoice): Promise<string> {
    try {
      // This would integrate with a PDF generation service
      // For now, we'll just return a placeholder URL
      const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${invoice.id}/pdf`;
      
      // Store PDF URL in database
      await supabase
        .from('invoices')
        .update({ pdf_url: pdfUrl })
        .eq('id', invoice.id);

      return pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  private static async sendInvoiceToCustomer(invoice: Invoice): Promise<void> {
    try {
      // Send invoice via email
      await supabase.from('notifications').insert({
        user_id: invoice.customer_id,
        title: 'Invoice Generated',
        message: `Invoice ${invoice.invoice_number} has been generated for your order.`,
        type: 'info',
        category: 'invoice',
        data: { invoice_id: invoice.id, invoice_number: invoice.invoice_number },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending invoice to customer:', error);
    }
  }

  private static async sendPaymentConfirmation(invoiceId: string): Promise<void> {
    try {
      const invoice = await this.getInvoice(invoiceId);
      if (!invoice) return;

      await supabase.from('notifications').insert({
        user_id: invoice.customer_id,
        title: 'Payment Received',
        message: `Payment for invoice ${invoice.invoice_number} has been received and processed.`,
        type: 'success',
        category: 'payment',
        data: { invoice_id: invoiceId, invoice_number: invoice.invoice_number },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }
}
