import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plan']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];
type Invoice = Database['public']['Tables']['invoice']['Row'];
type Payment = Database['public']['Tables']['payment']['Row'];

/**
 * Financial Management Service
 * Objective 6: Automated Financial Management & Billing
 */
export class FinancialService extends BaseService<'plan'> {
  constructor() {
    super('plan');
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(planData: {
    brand_id: string;
    plan_nm: string;
    details?: string;
    price: number;
    billing_cycle: 'monthly' | 'annually' | 'one-time';
    features_included?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Plan | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('plan')
      .insert({
        ...planData,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get all plans for a brand
   */
  async getPlansByBrand(brandId: string): Promise<{
    data: Plan[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('plan')
      .select('*')
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId)
      .eq('is_active', true)
      .order('price');

    return { data, error };
  }

  /**
   * Create subscription for franchisee
   */
  async createSubscription(subscriptionData: {
    franchisee_id: string;
    plan_id: string;
    start_date: string;
    end_date?: string;
    custom_pricing?: number;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Subscription | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('subscription')
      .insert({
        ...subscriptionData,
        franchisor_id: franchisorId,
        status: 'active',
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Generate invoice for subscription
   */
  async generateInvoice(subscriptionId: string): Promise<{
    data: Invoice | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscription')
      .select(`
        *,
        plan:plan(*),
        franchisee:franchisee(*)
      `)
      .eq('subscription_id', subscriptionId)
      .eq('franchisor_id', franchisorId)
      .single();

    if (subError) return { data: null, error: subError };

    // Calculate invoice amount
    const amount = subscription.custom_pricing || (subscription.plan as any)?.price || 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    const { data, error } = await supabase
      .from('invoice')
      .insert({
        subscription_id: subscriptionId,
        franchisee_id: subscription.franchisee_id,
        amount,
        due_date: dueDate.toISOString(),
        status: 'pending',
        franchisor_id: franchisorId,
        metadata: {
          plan_name: (subscription.plan as any)?.plan_nm,
          billing_period: new Date().toISOString().slice(0, 7), // YYYY-MM
        },
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Process payment for invoice
   */
  async processPayment(paymentData: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    transaction_reference?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Payment | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    // Start transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payment')
      .insert({
        ...paymentData,
        franchisor_id: franchisorId,
        status: 'completed',
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) return { data: null, error: paymentError };

    // Update invoice status
    const { error: invoiceError } = await supabase
      .from('invoice')
      .update({ 
        status: 'paid',
        paid_date: new Date().toISOString()
      })
      .eq('invoice_id', paymentData.invoice_id);

    if (invoiceError) {
      // Rollback payment
      await supabase.from('payment').delete().eq('payment_id', payment.payment_id);
      return { data: null, error: invoiceError };
    }

    return { data: payment, error: null };
  }

  /**
   * Get financial dashboard data
   */
  async getFinancialDashboard(): Promise<{
    data: {
      totalRevenue: number;
      monthlyRecurringRevenue: number;
      outstandingInvoices: number;
      paidInvoices: number;
      activeSubscriptions: number;
      revenueByPlan: any[];
      paymentTrends: any[];
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get total revenue
      const { data: payments } = await supabase
        .from('payment')
        .select('amount')
        .eq('franchisor_id', franchisorId)
        .eq('status', 'completed');

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get MRR (Monthly Recurring Revenue)
      const { data: activeSubscriptions } = await supabase
        .from('subscription')
        .select(`
          *,
          plan:plan(price, billing_cycle)
        `)
        .eq('franchisor_id', franchisorId)
        .eq('status', 'active');

      const monthlyRecurringRevenue = activeSubscriptions?.reduce((sum, sub) => {
        const plan = sub.plan as any;
        const price = sub.custom_pricing || plan?.price || 0;
        const multiplier = plan?.billing_cycle === 'annually' ? 1/12 : 1;
        return sum + (price * multiplier);
      }, 0) || 0;

      // Get invoice statistics
      const { count: outstandingCount } = await supabase
        .from('invoice')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .eq('status', 'pending');

      const { count: paidCount } = await supabase
        .from('invoice')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .eq('status', 'paid');

      // Revenue by plan
      const { data: revenueByPlan } = await supabase
        .from('payment')
        .select(`
          amount,
          invoice:invoice(
            subscription:subscription(
              plan:plan(plan_nm)
            )
          )
        `)
        .eq('franchisor_id', franchisorId)
        .eq('status', 'completed');

      const planRevenue = revenueByPlan?.reduce((acc: any, payment) => {
        const planName = (payment.invoice as any)?.subscription?.plan?.plan_nm || 'Unknown';
        acc[planName] = (acc[planName] || 0) + (payment.amount || 0);
        return acc;
      }, {});

      const revenueByPlanArray = Object.entries(planRevenue || {}).map(([name, revenue]) => ({
        plan_name: name,
        revenue
      }));

      return {
        data: {
          totalRevenue,
          monthlyRecurringRevenue,
          outstandingInvoices: outstandingCount || 0,
          paidInvoices: paidCount || 0,
          activeSubscriptions: activeSubscriptions?.length || 0,
          revenueByPlan: revenueByPlanArray,
          paymentTrends: [], // TODO: Implement payment trends
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<{
    data: (Invoice & { franchisee: any; subscription: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('invoice')
      .select(`
        *,
        franchisee:franchisee(*),
        subscription:subscription(
          plan:plan(*)
        )
      `)
      .eq('franchisor_id', franchisorId)
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date');

    return { data, error };
  }

  /**
   * Generate recurring invoices
   */
  async generateRecurringInvoices(): Promise<{
    data: { generated: number; errors: any[] };
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get active subscriptions that need invoicing
      const { data: subscriptions } = await supabase
        .from('subscription')
        .select(`
          *,
          plan:plan(*)
        `)
        .eq('franchisor_id', franchisorId)
        .eq('status', 'active');

      const results = { generated: 0, errors: [] as any[] };

      for (const subscription of subscriptions || []) {
        try {
          // Check if invoice already exists for current period
          const currentPeriod = new Date().toISOString().slice(0, 7);
          const { data: existingInvoice } = await supabase
            .from('invoice')
            .select('invoice_id')
            .eq('subscription_id', subscription.subscription_id)
            .like('metadata->billing_period', `${currentPeriod}%`)
            .single();

          if (!existingInvoice) {
            await this.generateInvoice(subscription.subscription_id);
            results.generated++;
          }
        } catch (error) {
          results.errors.push({
            subscription_id: subscription.subscription_id,
            error: (error as Error).message
          });
        }
      }

      return { data: results, error: null };
    } catch (error) {
      return { data: { generated: 0, errors: [] }, error };
    }
  }
}
