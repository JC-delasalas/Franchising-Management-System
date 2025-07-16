import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert'];
type PaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update'];

export interface CreatePaymentMethodData {
  payment_type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'gcash' | 'cash_on_delivery';
  nickname?: string;
  is_default?: boolean;
  
  // Bank Transfer fields
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  
  // Card fields
  card_last_four?: string;
  card_brand?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
  
  // GCash fields
  gcash_number?: string;
  gcash_account_name?: string;
}

export const PaymentMethodsAPI = {
  // Get all payment methods for current user
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error(`Failed to fetch payment methods: ${error.message}`);
    }

    return data || [];
  },

  // Get single payment method
  async getPaymentMethod(id: string): Promise<PaymentMethod | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching payment method:', error);
      throw new Error(`Failed to fetch payment method: ${error.message}`);
    }

    return data;
  },

  // Create new payment method
  async createPaymentMethod(paymentMethodData: CreatePaymentMethodData): Promise<PaymentMethod> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // If this is set as default, unset other defaults first
    if (paymentMethodData.is_default) {
      await this.unsetDefaultPaymentMethods();
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.user.id,
        ...paymentMethodData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment method:', error);
      throw new Error(`Failed to create payment method: ${error.message}`);
    }

    return data;
  },

  // Update payment method
  async updatePaymentMethod(id: string, updates: Partial<CreatePaymentMethodData>): Promise<PaymentMethod> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // If this is set as default, unset other defaults first
    if (updates.is_default) {
      await this.unsetDefaultPaymentMethods();
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment method:', error);
      throw new Error(`Failed to update payment method: ${error.message}`);
    }

    return data;
  },

  // Delete payment method
  async deletePaymentMethod(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting payment method:', error);
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  },

  // Set payment method as default
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // First, unset all defaults
    await this.unsetDefaultPaymentMethods();

    // Then set the new default
    const { data, error } = await supabase
      .from('payment_methods')
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error setting default payment method:', error);
      throw new Error(`Failed to set default payment method: ${error.message}`);
    }

    return data;
  },

  // Get default payment method
  async getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching default payment method:', error);
      throw new Error(`Failed to fetch default payment method: ${error.message}`);
    }

    return data;
  },

  // Helper function to unset all default payment methods
  async unsetDefaultPaymentMethods(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', user.user.id)
      .eq('is_default', true);

    if (error) {
      console.error('Error unsetting default payment methods:', error);
      throw new Error(`Failed to unset default payment methods: ${error.message}`);
    }
  },

  // Validate payment method data
  validatePaymentMethodData(data: CreatePaymentMethodData): string[] {
    const errors: string[] = [];

    if (!data.payment_type) {
      errors.push('Payment type is required');
    }

    switch (data.payment_type) {
      case 'bank_transfer':
        if (!data.bank_name) errors.push('Bank name is required');
        if (!data.account_number) errors.push('Account number is required');
        if (!data.account_holder_name) errors.push('Account holder name is required');
        break;

      case 'credit_card':
      case 'debit_card':
        if (!data.card_last_four) errors.push('Card last four digits are required');
        if (!data.card_brand) errors.push('Card brand is required');
        if (!data.card_expiry_month || data.card_expiry_month < 1 || data.card_expiry_month > 12) {
          errors.push('Valid expiry month is required');
        }
        if (!data.card_expiry_year || data.card_expiry_year < new Date().getFullYear()) {
          errors.push('Valid expiry year is required');
        }
        break;

      case 'gcash':
        if (!data.gcash_number) errors.push('GCash number is required');
        if (!data.gcash_account_name) errors.push('GCash account name is required');
        break;

      case 'cash_on_delivery':
        // No additional validation needed for COD
        break;

      default:
        errors.push('Invalid payment type');
    }

    return errors;
  },

  // Get payment method display info
  getPaymentMethodDisplay(paymentMethod: PaymentMethod): {
    title: string;
    subtitle: string;
    icon: string;
  } {
    switch (paymentMethod.payment_type) {
      case 'bank_transfer':
        return {
          title: paymentMethod.nickname || `${paymentMethod.bank_name} Transfer`,
          subtitle: `****${paymentMethod.account_number?.slice(-4)} - ${paymentMethod.account_holder_name}`,
          icon: 'bank',
        };

      case 'credit_card':
        return {
          title: paymentMethod.nickname || `${paymentMethod.card_brand} Credit Card`,
          subtitle: `****${paymentMethod.card_last_four} - Expires ${paymentMethod.card_expiry_month}/${paymentMethod.card_expiry_year}`,
          icon: 'credit-card',
        };

      case 'debit_card':
        return {
          title: paymentMethod.nickname || `${paymentMethod.card_brand} Debit Card`,
          subtitle: `****${paymentMethod.card_last_four} - Expires ${paymentMethod.card_expiry_month}/${paymentMethod.card_expiry_year}`,
          icon: 'credit-card',
        };

      case 'gcash':
        return {
          title: paymentMethod.nickname || 'GCash',
          subtitle: `${paymentMethod.gcash_number} - ${paymentMethod.gcash_account_name}`,
          icon: 'smartphone',
        };

      case 'cash_on_delivery':
        return {
          title: paymentMethod.nickname || 'Cash on Delivery',
          subtitle: 'Pay when you receive your order',
          icon: 'banknote',
        };

      default:
        return {
          title: 'Unknown Payment Method',
          subtitle: '',
          icon: 'help-circle',
        };
    }
  },
};
