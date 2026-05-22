import { supabase } from '@/lib/supabase';

export interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method_id: string;
  description: string;
  metadata?: any;
  customer_id?: string;
}

export interface PaymentResult {
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  gateway_response: any;
  error?: string;
  metadata?: any;
}

export interface PaymentMethodData {
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: 'stripe' | 'paypal' | 'gcash' | 'paymaya';
  card_data?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    name: string;
  };
  bank_data?: {
    account_number: string;
    routing_number: string;
    account_type: 'checking' | 'savings';
    account_holder_name: string;
  };
  digital_wallet_data?: {
    wallet_id: string;
    phone_number?: string;
    email?: string;
  };
}

export interface RefundRequest {
  transaction_id: string;
  amount?: number; // Partial refund if specified
  reason?: string;
}

export class PaymentGatewayService {
  private stripeSecretKey: string;
  private paypalClientId: string;
  private paypalClientSecret: string;

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    this.paypalClientId = process.env.PAYPAL_CLIENT_ID || '';
    this.paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  }

  // Process payment through appropriate gateway
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get payment method details to determine gateway
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('provider_payment_method_id', paymentRequest.payment_method_id)
        .single();

      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      switch (paymentMethod.provider) {
        case 'stripe':
          return await this.processStripePayment(paymentRequest, paymentMethod);
        case 'paypal':
          return await this.processPayPalPayment(paymentRequest, paymentMethod);
        case 'gcash':
          return await this.processGCashPayment(paymentRequest, paymentMethod);
        case 'paymaya':
          return await this.processPayMayaPayment(paymentRequest, paymentMethod);
        default:
          throw new Error(`Unsupported payment provider: ${paymentMethod.provider}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        transaction_id: '',
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gateway_response: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Stripe payment processing
  private async processStripePayment(paymentRequest: PaymentRequest, paymentMethod: any): Promise<PaymentResult> {
    try {
      // This would use the actual Stripe SDK
      // For demo purposes, we'll simulate the API call
      const stripeResponse = await this.simulateStripeAPI({
        amount: Math.round(paymentRequest.amount * 100), // Stripe uses cents
        currency: paymentRequest.currency.toLowerCase(),
        payment_method: paymentMethod.provider_payment_method_id,
        description: paymentRequest.description,
        metadata: paymentRequest.metadata,
        confirm: true
      });

      return {
        transaction_id: stripeResponse.id,
        status: stripeResponse.status === 'succeeded' ? 'completed' : 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gateway_response: stripeResponse,
        metadata: {
          stripe_payment_intent_id: stripeResponse.id,
          stripe_charge_id: stripeResponse.charges?.data[0]?.id
        }
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  }

  // PayPal payment processing
  private async processPayPalPayment(paymentRequest: PaymentRequest, paymentMethod: any): Promise<PaymentResult> {
    try {
      // Get PayPal access token
      const accessToken = await this.getPayPalAccessToken();

      // Create PayPal payment
      const paypalResponse = await this.simulatePayPalAPI({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: paymentRequest.currency,
            value: paymentRequest.amount.toFixed(2)
          },
          description: paymentRequest.description
        }],
        payment_source: {
          paypal: {
            vault_id: paymentMethod.provider_payment_method_id
          }
        }
      }, accessToken);

      return {
        transaction_id: paypalResponse.id,
        status: paypalResponse.status === 'COMPLETED' ? 'completed' : 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gateway_response: paypalResponse,
        metadata: {
          paypal_order_id: paypalResponse.id,
          paypal_capture_id: paypalResponse.purchase_units[0]?.payments?.captures[0]?.id
        }
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      throw error;
    }
  }

  // GCash payment processing (Philippines)
  private async processGCashPayment(paymentRequest: PaymentRequest, paymentMethod: any): Promise<PaymentResult> {
    try {
      // This would integrate with GCash API
      // For demo purposes, we'll simulate the response
      const gcashResponse = await this.simulateGCashAPI({
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        source: {
          type: 'gcash',
          redirect: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            failed: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`
          }
        },
        description: paymentRequest.description
      });

      return {
        transaction_id: gcashResponse.id,
        status: gcashResponse.status === 'paid' ? 'completed' : 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gateway_response: gcashResponse,
        metadata: {
          gcash_payment_id: gcashResponse.id,
          gcash_reference: gcashResponse.attributes?.external_reference_number
        }
      };
    } catch (error) {
      console.error('GCash payment error:', error);
      throw error;
    }
  }

  // PayMaya payment processing (Philippines)
  private async processPayMayaPayment(paymentRequest: PaymentRequest, paymentMethod: any): Promise<PaymentResult> {
    try {
      // This would integrate with PayMaya API
      const paymayaResponse = await this.simulatePayMayaAPI({
        totalAmount: {
          value: paymentRequest.amount,
          currency: paymentRequest.currency
        },
        buyer: {
          firstName: 'Customer',
          lastName: 'Name'
        },
        items: [{
          name: paymentRequest.description,
          quantity: 1,
          amount: {
            value: paymentRequest.amount,
            currency: paymentRequest.currency
          }
        }],
        redirectUrl: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
          cancel: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`
        }
      });

      return {
        transaction_id: paymayaResponse.checkoutId,
        status: paymayaResponse.status === 'PAYMENT_SUCCESS' ? 'completed' : 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gateway_response: paymayaResponse,
        metadata: {
          paymaya_checkout_id: paymayaResponse.checkoutId,
          paymaya_payment_id: paymayaResponse.paymentId
        }
      };
    } catch (error) {
      console.error('PayMaya payment error:', error);
      throw error;
    }
  }

  // Create payment method
  async createPaymentMethod(paymentMethodData: PaymentMethodData): Promise<any> {
    try {
      switch (paymentMethodData.provider) {
        case 'stripe':
          return await this.createStripePaymentMethod(paymentMethodData);
        case 'paypal':
          return await this.createPayPalPaymentMethod(paymentMethodData);
        case 'gcash':
          return await this.createGCashPaymentMethod(paymentMethodData);
        case 'paymaya':
          return await this.createPayMayaPaymentMethod(paymentMethodData);
        default:
          throw new Error(`Unsupported payment provider: ${paymentMethodData.provider}`);
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(refundRequest: RefundRequest): Promise<PaymentResult> {
    try {
      // Get original transaction details
      const { data: transaction } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('gateway_transaction_id', refundRequest.transaction_id)
        .single();

      if (!transaction) {
        throw new Error('Original transaction not found');
      }

      // Get payment method to determine gateway
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', transaction.payment_method_id)
        .single();

      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const refundAmount = refundRequest.amount || transaction.amount;

      switch (paymentMethod.provider) {
        case 'stripe':
          return await this.processStripeRefund(refundRequest.transaction_id, refundAmount);
        case 'paypal':
          return await this.processPayPalRefund(refundRequest.transaction_id, refundAmount);
        default:
          throw new Error(`Refunds not supported for provider: ${paymentMethod.provider}`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Simulate API calls (replace with actual SDK calls in production)
  private async simulateStripeAPI(data: any): Promise<any> {
    // Simulate Stripe API response
    return {
      id: `pi_${Date.now()}`,
      status: 'succeeded',
      amount: data.amount,
      currency: data.currency,
      charges: {
        data: [{
          id: `ch_${Date.now()}`,
          amount: data.amount,
          currency: data.currency
        }]
      }
    };
  }

  private async simulatePayPalAPI(data: any, accessToken: string): Promise<any> {
    // Simulate PayPal API response
    return {
      id: `ORDER_${Date.now()}`,
      status: 'COMPLETED',
      purchase_units: [{
        payments: {
          captures: [{
            id: `CAPTURE_${Date.now()}`,
            amount: data.purchase_units[0].amount
          }]
        }
      }]
    };
  }

  private async simulateGCashAPI(data: any): Promise<any> {
    // Simulate GCash API response
    return {
      id: `gcash_${Date.now()}`,
      status: 'paid',
      attributes: {
        external_reference_number: `REF_${Date.now()}`
      }
    };
  }

  private async simulatePayMayaAPI(data: any): Promise<any> {
    // Simulate PayMaya API response
    return {
      checkoutId: `checkout_${Date.now()}`,
      paymentId: `payment_${Date.now()}`,
      status: 'PAYMENT_SUCCESS'
    };
  }

  private async getPayPalAccessToken(): Promise<string> {
    // Simulate getting PayPal access token
    return `access_token_${Date.now()}`;
  }

  private async createStripePaymentMethod(data: PaymentMethodData): Promise<any> {
    return {
      id: `pm_${Date.now()}`,
      metadata: {
        last_four: data.card_data?.number.slice(-4),
        brand: 'visa',
        exp_month: data.card_data?.exp_month,
        exp_year: data.card_data?.exp_year
      }
    };
  }

  private async createPayPalPaymentMethod(data: PaymentMethodData): Promise<any> {
    return {
      id: `paypal_${Date.now()}`,
      metadata: {
        email: data.digital_wallet_data?.email
      }
    };
  }

  private async createGCashPaymentMethod(data: PaymentMethodData): Promise<any> {
    return {
      id: `gcash_${Date.now()}`,
      metadata: {
        phone_number: data.digital_wallet_data?.phone_number
      }
    };
  }

  private async createPayMayaPaymentMethod(data: PaymentMethodData): Promise<any> {
    return {
      id: `paymaya_${Date.now()}`,
      metadata: {
        phone_number: data.digital_wallet_data?.phone_number
      }
    };
  }

  private async processStripeRefund(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      transaction_id: `re_${Date.now()}`,
      status: 'completed',
      amount: -amount,
      currency: 'PHP',
      gateway_response: { refund_id: `re_${Date.now()}` }
    };
  }

  private async processPayPalRefund(transactionId: string, amount: number): Promise<PaymentResult> {
    return {
      transaction_id: `refund_${Date.now()}`,
      status: 'completed',
      amount: -amount,
      currency: 'PHP',
      gateway_response: { refund_id: `refund_${Date.now()}` }
    };
  }
}
