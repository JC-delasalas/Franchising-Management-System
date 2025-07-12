import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Customer = Database['public']['Tables']['customer']['Row'];
type SalesTransaction = Database['public']['Tables']['sales_transaction']['Row'];

/**
 * Customer Relationship Management Service
 * Objective 9: Streamlined Customer Relationship Management (CRM)
 */
export class CRMService extends BaseService<'customer'> {
  constructor() {
    super('customer');
  }

  /**
   * Create new customer profile
   */
  async createCustomer(customerData: {
    first_nm: string;
    last_nm: string;
    email?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    preferences?: Record<string, any>;
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Customer | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('customer')
      .insert({
        ...customerData,
        franchisor_id: franchisorId,
        customer_since: new Date().toISOString(),
        loyalty_member: false,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update customer profile
   */
  async updateCustomer(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<{
    data: Customer | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('customer')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customerId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Enroll customer in loyalty program
   */
  async enrollInLoyalty(
    customerId: string,
    loyaltyData: {
      program_name: string;
      tier?: string;
      points?: number;
      benefits?: Record<string, any>;
    }
  ): Promise<{
    data: Customer | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('customer')
      .update({
        loyalty_member: true,
        loyalty_data: loyaltyData,
        loyalty_enrolled_date: new Date().toISOString(),
      })
      .eq('customer_id', customerId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get customer purchase history
   */
  async getCustomerPurchaseHistory(customerId: string): Promise<{
    data: {
      transactions: SalesTransaction[];
      summary: {
        total_spent: number;
        transaction_count: number;
        average_order_value: number;
        first_purchase: string;
        last_purchase: string;
        favorite_products: any[];
        purchase_frequency: number;
      };
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      const { data: transactions, error } = await supabase
        .from('sales_transaction')
        .select(`
          *,
          sales_transaction_items:sales_transaction_item(
            *,
            product:product(*)
          )
        `)
        .eq('customer_id', customerId)
        .eq('franchisor_id', franchisorId)
        .order('transaction_date', { ascending: false });

      if (error) return { data: null, error };

      const total_spent = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const transaction_count = transactions?.length || 0;
      const average_order_value = transaction_count > 0 ? total_spent / transaction_count : 0;

      const sortedTransactions = transactions?.sort((a, b) => 
        new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
      );

      const first_purchase = sortedTransactions?.[0]?.transaction_date || '';
      const last_purchase = sortedTransactions?.[sortedTransactions.length - 1]?.transaction_date || '';

      // Calculate purchase frequency (days between purchases)
      let purchase_frequency = 0;
      if (transaction_count > 1 && first_purchase && last_purchase) {
        const daysDiff = (new Date(last_purchase).getTime() - new Date(first_purchase).getTime()) / (1000 * 60 * 60 * 24);
        purchase_frequency = daysDiff / (transaction_count - 1);
      }

      // Find favorite products
      const productCounts: Record<string, { count: number; product: any; total_spent: number }> = {};
      
      transactions?.forEach(transaction => {
        (transaction.sales_transaction_items as any)?.forEach((item: any) => {
          const productId = item.product_id;
          if (!productCounts[productId]) {
            productCounts[productId] = {
              count: 0,
              product: item.product,
              total_spent: 0
            };
          }
          productCounts[productId].count += item.quantity || 1;
          productCounts[productId].total_spent += item.total_price || 0;
        });
      });

      const favorite_products = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(p => ({
          product: p.product,
          purchase_count: p.count,
          total_spent: p.total_spent,
        }));

      return {
        data: {
          transactions: transactions || [],
          summary: {
            total_spent,
            transaction_count,
            average_order_value,
            first_purchase,
            last_purchase,
            favorite_products,
            purchase_frequency,
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get customer segmentation
   */
  async getCustomerSegmentation(): Promise<{
    data: {
      segments: {
        high_value: Customer[];
        frequent_buyers: Customer[];
        at_risk: Customer[];
        new_customers: Customer[];
        loyalty_members: Customer[];
      };
      metrics: {
        total_customers: number;
        active_customers: number;
        loyalty_rate: number;
        average_lifetime_value: number;
      };
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get all customers with their transaction data
      const { data: customers } = await supabase
        .from('customer')
        .select(`
          *,
          sales_transactions:sales_transaction(total_amount, transaction_date)
        `)
        .eq('franchisor_id', franchisorId);

      if (!customers) return { data: null, error: new Error('No customers found') };

      // Calculate customer metrics
      const customersWithMetrics = customers.map(customer => {
        const transactions = (customer.sales_transactions as any) || [];
        const total_spent = transactions.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0);
        const transaction_count = transactions.length;
        const last_purchase = transactions.length > 0 
          ? Math.max(...transactions.map((t: any) => new Date(t.transaction_date).getTime()))
          : 0;
        const days_since_last_purchase = last_purchase > 0 
          ? (Date.now() - last_purchase) / (1000 * 60 * 60 * 24)
          : Infinity;

        return {
          ...customer,
          total_spent,
          transaction_count,
          days_since_last_purchase,
        };
      });

      // Segment customers
      const high_value = customersWithMetrics
        .filter(c => c.total_spent > 1000)
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 50);

      const frequent_buyers = customersWithMetrics
        .filter(c => c.transaction_count >= 10)
        .sort((a, b) => b.transaction_count - a.transaction_count)
        .slice(0, 50);

      const at_risk = customersWithMetrics
        .filter(c => c.days_since_last_purchase > 90 && c.transaction_count > 0)
        .sort((a, b) => b.days_since_last_purchase - a.days_since_last_purchase)
        .slice(0, 50);

      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const new_customers = customersWithMetrics
        .filter(c => new Date(c.customer_since).getTime() > thirtyDaysAgo)
        .sort((a, b) => new Date(b.customer_since).getTime() - new Date(a.customer_since).getTime());

      const loyalty_members = customersWithMetrics.filter(c => c.loyalty_member);

      // Calculate overall metrics
      const total_customers = customers.length;
      const active_customers = customersWithMetrics.filter(c => c.days_since_last_purchase <= 90).length;
      const loyalty_rate = total_customers > 0 ? (loyalty_members.length / total_customers) * 100 : 0;
      const average_lifetime_value = total_customers > 0 
        ? customersWithMetrics.reduce((sum, c) => sum + c.total_spent, 0) / total_customers 
        : 0;

      return {
        data: {
          segments: {
            high_value,
            frequent_buyers,
            at_risk,
            new_customers,
            loyalty_members,
          },
          metrics: {
            total_customers,
            active_customers,
            loyalty_rate,
            average_lifetime_value,
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create marketing campaign
   */
  async createMarketingCampaign(campaignData: {
    name: string;
    description?: string;
    target_segment: 'high_value' | 'frequent_buyers' | 'at_risk' | 'new_customers' | 'loyalty_members' | 'all';
    campaign_type: 'email' | 'sms' | 'push' | 'direct_mail';
    content: Record<string, any>;
    schedule_date?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    data: any;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    // Get target customers based on segment
    const { data: segmentation } = await this.getCustomerSegmentation();
    let targetCustomers: Customer[] = [];

    if (segmentation) {
      switch (campaignData.target_segment) {
        case 'high_value':
          targetCustomers = segmentation.segments.high_value;
          break;
        case 'frequent_buyers':
          targetCustomers = segmentation.segments.frequent_buyers;
          break;
        case 'at_risk':
          targetCustomers = segmentation.segments.at_risk;
          break;
        case 'new_customers':
          targetCustomers = segmentation.segments.new_customers;
          break;
        case 'loyalty_members':
          targetCustomers = segmentation.segments.loyalty_members;
          break;
        case 'all':
          targetCustomers = Object.values(segmentation.segments).flat();
          break;
      }
    }

    const campaign = {
      ...campaignData,
      franchisor_id: franchisorId,
      created_at: new Date().toISOString(),
      target_count: targetCustomers.length,
      status: 'draft',
      target_customers: targetCustomers.map(c => c.customer_id),
    };

    // In a real implementation, you'd store this in a campaigns table
    return { data: campaign, error: null };
  }

  /**
   * Track customer interaction
   */
  async trackInteraction(interactionData: {
    customer_id: string;
    interaction_type: 'email_open' | 'email_click' | 'website_visit' | 'purchase' | 'support_contact' | 'review';
    details?: Record<string, any>;
    value?: number;
  }): Promise<{
    data: any;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const interaction = {
      ...interactionData,
      franchisor_id: franchisorId,
      timestamp: new Date().toISOString(),
    };

    // Store in customer metadata or create interactions table
    const { data: customer, error } = await supabase
      .from('customer')
      .select('metadata')
      .eq('customer_id', interactionData.customer_id)
      .eq('franchisor_id', franchisorId)
      .single();

    if (error) return { data: null, error };

    const interactions = (customer.metadata as any)?.interactions || [];
    interactions.push(interaction);

    const { error: updateError } = await supabase
      .from('customer')
      .update({
        metadata: {
          ...(customer.metadata as any),
          interactions,
        }
      })
      .eq('customer_id', interactionData.customer_id)
      .eq('franchisor_id', franchisorId);

    return { data: interaction, error: updateError };
  }

  /**
   * Generate customer insights
   */
  async getCustomerInsights(customerId: string): Promise<{
    data: {
      customer_score: number;
      risk_level: 'low' | 'medium' | 'high';
      recommendations: string[];
      predicted_ltv: number;
      churn_probability: number;
      next_purchase_prediction: string;
    } | null;
    error: any;
  }> {
    const { data: purchaseHistory } = await this.getCustomerPurchaseHistory(customerId);
    
    if (!purchaseHistory) {
      return { data: null, error: new Error('No purchase history found') };
    }

    const { summary } = purchaseHistory;
    
    // Simple scoring algorithm (in production, use ML models)
    let customer_score = 0;
    customer_score += Math.min(summary.total_spent / 100, 50); // Max 50 points for spending
    customer_score += Math.min(summary.transaction_count * 2, 30); // Max 30 points for frequency
    customer_score += summary.purchase_frequency > 0 ? Math.min(365 / summary.purchase_frequency, 20) : 0; // Max 20 points for regularity

    // Risk assessment
    const daysSinceLastPurchase = summary.last_purchase 
      ? (Date.now() - new Date(summary.last_purchase).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastPurchase > 180) risk_level = 'high';
    else if (daysSinceLastPurchase > 90) risk_level = 'medium';

    // Generate recommendations
    const recommendations: string[] = [];
    if (risk_level === 'high') {
      recommendations.push('Send win-back campaign');
      recommendations.push('Offer special discount');
    }
    if (summary.average_order_value < 50) {
      recommendations.push('Promote bundle deals');
    }
    if (!summary.favorite_products.length) {
      recommendations.push('Recommend popular products');
    }

    // Simple predictions (in production, use ML models)
    const predicted_ltv = summary.total_spent * 1.5; // Simple multiplier
    const churn_probability = Math.min(daysSinceLastPurchase / 365 * 100, 100);
    
    const next_purchase_prediction = summary.purchase_frequency > 0 
      ? new Date(Date.now() + summary.purchase_frequency * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : 'Unknown';

    return {
      data: {
        customer_score: Math.round(customer_score),
        risk_level,
        recommendations,
        predicted_ltv,
        churn_probability: Math.round(churn_probability),
        next_purchase_prediction,
      },
      error: null
    };
  }
}
