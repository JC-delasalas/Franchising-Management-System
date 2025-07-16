import { supabase } from '@/lib/supabase';
import { PaymentGatewayService } from './PaymentGatewayService';
import { NotificationService } from './NotificationService';

export interface RecurringBilling {
  id?: string;
  franchise_id: string;
  billing_type: 'royalty' | 'marketing_fee' | 'technology_fee' | 'insurance' | 'custom';
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  billing_day: number; // Day of month/week for billing
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'cancelled';
  auto_charge: boolean;
  payment_method_id?: string;
  last_billed?: string;
  next_billing_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id?: string;
  user_id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: 'stripe' | 'paypal' | 'gcash' | 'paymaya';
  provider_payment_method_id: string;
  is_default: boolean;
  metadata: {
    last_four?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
    bank_name?: string;
    account_type?: string;
  };
  status: 'active' | 'expired' | 'failed';
  created_at?: string;
}

export interface FinancialTransaction {
  id?: string;
  franchise_location_id: string;
  transaction_type: 'payment' | 'refund' | 'chargeback' | 'fee' | 'royalty' | 'commission';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method_id?: string;
  gateway_transaction_id?: string;
  reference_id?: string;
  reference_type?: 'order' | 'invoice' | 'billing' | 'manual';
  description: string;
  metadata?: any;
  processed_at?: string;
  created_at?: string;
}

export interface FinancialReport {
  period_start: string;
  period_end: string;
  franchise_id?: string;
  revenue: {
    total_revenue: number;
    product_sales: number;
    service_revenue: number;
    other_revenue: number;
  };
  expenses: {
    total_expenses: number;
    cost_of_goods: number;
    operating_expenses: number;
    marketing_expenses: number;
    administrative_expenses: number;
  };
  fees: {
    royalty_fees: number;
    marketing_fees: number;
    technology_fees: number;
    other_fees: number;
  };
  profit_loss: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
  cash_flow: {
    operating_cash_flow: number;
    investing_cash_flow: number;
    financing_cash_flow: number;
    net_cash_flow: number;
  };
  currency: string;
}

export class FinancialManagementService {
  private static paymentGateway = new PaymentGatewayService();
  private static notificationService = new NotificationService();

  // Recurring Billing Management
  static async createRecurringBilling(billing: Omit<RecurringBilling, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringBilling> {
    try {
      // Calculate next billing date
      const nextBillingDate = this.calculateNextBillingDate(billing.start_date, billing.frequency, billing.billing_day);

      const billingRecord: RecurringBilling = {
        ...billing,
        next_billing_date: nextBillingDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('recurring_billing')
        .insert(billingRecord)
        .select()
        .single();

      if (error) throw error;

      // Schedule first billing if auto_charge is enabled
      if (billing.auto_charge && billing.payment_method_id) {
        await this.scheduleNextBilling(data.id);
      }

      return data;
    } catch (error) {
      console.error('Error creating recurring billing:', error);
      throw error;
    }
  }

  static async processRecurringBillings(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get all active recurring billings due today
      const { data: dueBillings, error } = await supabase
        .from('recurring_billing')
        .select(`
          *,
          franchises (name, contact_email),
          payment_methods (*)
        `)
        .eq('status', 'active')
        .eq('auto_charge', true)
        .lte('next_billing_date', today);

      if (error) throw error;
      if (!dueBillings || dueBillings.length === 0) return;

      for (const billing of dueBillings) {
        try {
          await this.processSingleBilling(billing);
        } catch (error) {
          console.error(`Error processing billing ${billing.id}:`, error);
          // Continue with other billings even if one fails
        }
      }
    } catch (error) {
      console.error('Error processing recurring billings:', error);
      throw error;
    }
  }

  private static async processSingleBilling(billing: any): Promise<void> {
    try {
      // Create transaction record
      const transaction: FinancialTransaction = {
        franchise_location_id: billing.franchise_location_id,
        transaction_type: billing.billing_type === 'royalty' ? 'royalty' : 'fee',
        amount: billing.amount,
        currency: billing.currency,
        status: 'pending',
        payment_method_id: billing.payment_method_id,
        reference_id: billing.id,
        reference_type: 'billing',
        description: `${billing.billing_type} - ${new Date().toLocaleDateString()}`,
        created_at: new Date().toISOString()
      };

      const { data: transactionRecord, error: transactionError } = await supabase
        .from('financial_transactions')
        .insert(transaction)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Process payment through gateway
      const paymentResult = await this.paymentGateway.processPayment({
        amount: billing.amount,
        currency: billing.currency,
        payment_method_id: billing.payment_methods.provider_payment_method_id,
        description: transaction.description,
        metadata: {
          franchise_id: billing.franchise_id,
          billing_id: billing.id,
          transaction_id: transactionRecord.id
        }
      });

      // Update transaction with payment result
      await supabase
        .from('financial_transactions')
        .update({
          status: paymentResult.status,
          gateway_transaction_id: paymentResult.transaction_id,
          processed_at: new Date().toISOString(),
          metadata: paymentResult.metadata
        })
        .eq('id', transactionRecord.id);

      // Update billing record
      const nextBillingDate = this.calculateNextBillingDate(
        billing.next_billing_date,
        billing.frequency,
        billing.billing_day
      );

      await supabase
        .from('recurring_billing')
        .update({
          last_billed: new Date().toISOString(),
          next_billing_date: nextBillingDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', billing.id);

      // Send notification
      if (paymentResult.status === 'completed') {
        await this.notificationService.sendPaymentSuccessNotification(billing, transactionRecord);
      } else {
        await this.notificationService.sendPaymentFailureNotification(billing, transactionRecord, paymentResult.error);
      }

    } catch (error) {
      console.error('Error processing single billing:', error);
      throw error;
    }
  }

  // Payment Method Management
  static async addPaymentMethod(userId: string, paymentMethodData: any): Promise<PaymentMethod> {
    try {
      // Create payment method with gateway
      const gatewayPaymentMethod = await this.paymentGateway.createPaymentMethod(paymentMethodData);

      const paymentMethod: PaymentMethod = {
        user_id: userId,
        type: paymentMethodData.type,
        provider: paymentMethodData.provider,
        provider_payment_method_id: gatewayPaymentMethod.id,
        is_default: paymentMethodData.is_default || false,
        metadata: gatewayPaymentMethod.metadata,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // If this is set as default, update other payment methods
      if (paymentMethod.is_default) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert(paymentMethod)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Financial Reporting
  static async generateFinancialReport(
    franchiseId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<FinancialReport> {
    try {
      // Get all financial transactions for the period
      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('franchise_id', franchiseId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'completed');

      if (transactionsError) throw transactionsError;

      // Get sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales_records')
        .select('total_amount, items_sold')
        .eq('location_id', franchiseId) // Assuming location_id maps to franchise
        .gte('sale_date', periodStart.split('T')[0])
        .lte('sale_date', periodEnd.split('T')[0]);

      if (salesError) throw salesError;

      // Get order data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, tax_amount, shipping_amount')
        .eq('location_id', franchiseId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'delivered');

      if (ordersError) throw ordersError;

      // Calculate revenue
      const productSales = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
      const orderRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalRevenue = productSales + orderRevenue;

      // Calculate fees
      const royaltyFees = transactions?.filter(t => t.transaction_type === 'royalty')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      const marketingFees = transactions?.filter(t => t.transaction_type === 'fee' && t.description.includes('marketing'))
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      const technologyFees = transactions?.filter(t => t.transaction_type === 'fee' && t.description.includes('technology'))
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Calculate expenses (simplified - would need more detailed expense tracking)
      const totalExpenses = royaltyFees + marketingFees + technologyFees;
      const costOfGoods = totalRevenue * 0.6; // Estimated 60% COGS
      const operatingExpenses = totalRevenue * 0.2; // Estimated 20% operating expenses

      // Calculate profit/loss
      const grossProfit = totalRevenue - costOfGoods;
      const netProfit = grossProfit - totalExpenses - operatingExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Calculate cash flow (simplified)
      const operatingCashFlow = netProfit + (totalRevenue * 0.1); // Add back depreciation estimate
      const investingCashFlow = 0; // Would need investment data
      const financingCashFlow = -(royaltyFees + marketingFees + technologyFees);
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

      const report: FinancialReport = {
        period_start: periodStart,
        period_end: periodEnd,
        franchise_id: franchiseId,
        revenue: {
          total_revenue: totalRevenue,
          product_sales: productSales,
          service_revenue: orderRevenue,
          other_revenue: 0
        },
        expenses: {
          total_expenses: totalExpenses + operatingExpenses,
          cost_of_goods: costOfGoods,
          operating_expenses: operatingExpenses,
          marketing_expenses: marketingFees,
          administrative_expenses: technologyFees
        },
        fees: {
          royalty_fees: royaltyFees,
          marketing_fees: marketingFees,
          technology_fees: technologyFees,
          other_fees: 0
        },
        profit_loss: {
          gross_profit: grossProfit,
          net_profit: netProfit,
          profit_margin: profitMargin
        },
        cash_flow: {
          operating_cash_flow: operatingCashFlow,
          investing_cash_flow: investingCashFlow,
          financing_cash_flow: financingCashFlow,
          net_cash_flow: netCashFlow
        },
        currency: 'PHP'
      };

      return report;
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  // Multi-currency Support
  static async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (fromCurrency === toCurrency) return amount;

      // Get exchange rate from database or external API
      const { data: exchangeRate } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (exchangeRate) {
        return amount * exchangeRate.rate;
      }

      // Fallback to external API (e.g., exchangerate-api.com)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      const rate = data.rates[toCurrency];

      if (rate) {
        // Store the rate for future use
        await supabase.from('exchange_rates').insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          created_at: new Date().toISOString()
        });

        return amount * rate;
      }

      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  // Helper methods
  private static calculateNextBillingDate(currentDate: string, frequency: string, billingDay: number): string {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        date.setDate(billingDay);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        date.setDate(billingDay);
        break;
      case 'annually':
        date.setFullYear(date.getFullYear() + 1);
        date.setDate(billingDay);
        break;
    }

    return date.toISOString();
  }

  private static async scheduleNextBilling(billingId: string): Promise<void> {
    // This would integrate with a job scheduler (e.g., cron, AWS Lambda, etc.)
    // For now, we'll just log it
    console.log(`Scheduled next billing for billing ID: ${billingId}`);
  }

  // Get financial dashboard data
  static async getFinancialDashboard(franchiseId: string): Promise<any> {
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

      const report = await this.generateFinancialReport(franchiseId, startOfMonth, endOfMonth);

      // Get upcoming billings
      const { data: upcomingBillings } = await supabase
        .from('recurring_billing')
        .select('*')
        .eq('franchise_id', franchiseId)
        .eq('status', 'active')
        .gte('next_billing_date', new Date().toISOString().split('T')[0])
        .order('next_billing_date', { ascending: true })
        .limit(5);

      // Get recent transactions
      const { data: recentTransactions } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        financial_report: report,
        upcoming_billings: upcomingBillings || [],
        recent_transactions: recentTransactions || []
      };
    } catch (error) {
      console.error('Error getting financial dashboard:', error);
      throw error;
    }
  }
}
