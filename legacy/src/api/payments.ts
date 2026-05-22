import { BaseAPI } from './base'
import { supabase } from '@/lib/supabase'

export interface PaymentMethod {
  id: string
  user_id: string
  type: 'credit_card' | 'bank_transfer' | 'gcash' | 'paymaya' | 'cash'
  provider: string
  account_name: string
  account_number: string
  expiry_date?: string
  is_default: boolean
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  payment_number: string
  amount: number
  currency: string
  payment_method: string
  payment_date: string
  reference_number: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  notes?: string
  processed_by: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentMethodRequest {
  type: 'credit_card' | 'bank_transfer' | 'gcash' | 'paymaya' | 'cash'
  provider: string
  account_name: string
  account_number: string
  expiry_date?: string
  is_default?: boolean
  metadata?: Record<string, any>
}

export interface ProcessPaymentRequest {
  invoice_id: string
  payment_method_id: string
  amount: number
  reference_number?: string
  notes?: string
}

export class PaymentsAPI extends BaseAPI {
  // Get payment methods for user
  static async getPaymentMethods(userId?: string): Promise<PaymentMethod[]> {
    const user = await this.getCurrentUserProfile()
    const targetUserId = userId || user.id
    
    // Check permissions
    if (targetUserId !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to view payment methods')
    }
    
    return this.read<PaymentMethod>('payment_methods',
      { user_id: targetUserId, is_active: true },
      '*',
      { column: 'created_at', ascending: false }
    )
  }

  // Create payment method
  static async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const user = await this.getCurrentUserProfile()
    
    // If this is set as default, unset other defaults
    if (data.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }
    
    const paymentMethodData = {
      user_id: user.id,
      type: data.type,
      provider: data.provider,
      account_name: data.account_name,
      account_number: this.maskAccountNumber(data.account_number),
      expiry_date: data.expiry_date,
      is_default: data.is_default || false,
      is_active: true,
      metadata: data.metadata || {}
    }
    
    return this.create<PaymentMethod>('payment_methods', paymentMethodData)
  }

  // Update payment method
  static async updatePaymentMethod(
    paymentMethodId: string, 
    updates: Partial<CreatePaymentMethodRequest>
  ): Promise<PaymentMethod> {
    const user = await this.getCurrentUserProfile()
    
    // Verify ownership
    const paymentMethod = await this.readSingle<PaymentMethod>('payment_methods', { 
      id: paymentMethodId 
    })
    
    if (paymentMethod.user_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to update this payment method')
    }
    
    // If setting as default, unset other defaults
    if (updates.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', paymentMethod.user_id)
    }
    
    const updateData: any = { ...updates }
    if (updates.account_number) {
      updateData.account_number = this.maskAccountNumber(updates.account_number)
    }
    
    return this.update<PaymentMethod>('payment_methods', paymentMethodId, updateData)
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const user = await this.getCurrentUserProfile()
    
    // Verify ownership
    const paymentMethod = await this.readSingle<PaymentMethod>('payment_methods', { 
      id: paymentMethodId 
    })
    
    if (paymentMethod.user_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to delete this payment method')
    }
    
    // Soft delete
    await this.update('payment_methods', paymentMethodId, { is_active: false })
  }

  // Process payment
  static async processPayment(data: ProcessPaymentRequest): Promise<Payment> {
    const user = await this.getCurrentUserProfile()
    
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', data.invoice_id)
      .single()
    
    if (invoiceError) throw new Error('Invoice not found')
    
    // Verify payment method ownership
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', data.payment_method_id)
      .single()
    
    if (pmError) throw new Error('Payment method not found')
    
    if (paymentMethod.user_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to use this payment method')
    }
    
    // Generate payment number
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    // Create payment record
    const paymentData = {
      invoice_id: data.invoice_id,
      payment_number: paymentNumber,
      amount: data.amount,
      currency: 'PHP',
      payment_method: paymentMethod.type,
      payment_date: new Date().toISOString(),
      reference_number: data.reference_number || `REF-${Date.now()}`,
      status: 'completed', // In real system, this would be 'pending' initially
      notes: data.notes,
      processed_by: user.id
    }
    
    const payment = await this.create<Payment>('payments', paymentData)
    
    // Update invoice status if fully paid
    if (data.amount >= invoice.total_amount) {
      await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', data.invoice_id)
    }
    
    // Create transaction history
    await this.createPaymentTransaction(payment, invoice, user.id)
    
    return payment
  }

  // Get payments for invoice
  static async getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
    const user = await this.getCurrentUserProfile()
    
    // Verify access to invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        franchise_locations (franchisee_id)
      `)
      .eq('id', invoiceId)
      .single()
    
    if (!invoice) throw new Error('Invoice not found')
    
    const hasAccess = 
      invoice.franchise_locations?.franchisee_id === user.id ||
      ['franchisor', 'admin'].includes(user.role || '')
    
    if (!hasAccess) {
      throw new Error('Access denied to view payments for this invoice')
    }
    
    return this.read<Payment>('payments',
      { invoice_id: invoiceId },
      '*',
      { column: 'payment_date', ascending: false }
    )
  }

  // Get payment statistics
  static async getPaymentStatistics(userId?: string): Promise<{
    total_payments: number
    total_amount: number
    pending_payments: number
    completed_payments: number
    failed_payments: number
  }> {
    const user = await this.getCurrentUserProfile()
    const targetUserId = userId || user.id
    
    // Check permissions
    if (targetUserId !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Access denied to view payment statistics')
    }
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('processed_by', targetUserId)
    
    if (error) throw new Error(error.message)
    
    const totalPayments = payments?.length || 0
    const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0
    const completedPayments = payments?.filter(p => p.status === 'completed').length || 0
    const failedPayments = payments?.filter(p => p.status === 'failed').length || 0
    
    return {
      total_payments: totalPayments,
      total_amount: totalAmount,
      pending_payments: pendingPayments,
      completed_payments: completedPayments,
      failed_payments: failedPayments
    }
  }

  // Create payment transaction history
  private static async createPaymentTransaction(
    payment: Payment,
    invoice: any,
    userId: string
  ): Promise<void> {
    try {
      const transactionData = {
        transaction_number: `TXN-PAY-${Date.now()}`,
        transaction_type: 'payment',
        reference_id: payment.id,
        reference_type: 'payment',
        franchise_location_id: invoice.franchise_location_id,
        franchisee_id: userId,
        amount: payment.amount,
        description: `Payment ${payment.payment_number} for invoice ${invoice.invoice_number}`,
        status: 'completed',
        metadata: {
          payment_number: payment.payment_number,
          invoice_number: invoice.invoice_number,
          payment_method: payment.payment_method,
          reference_number: payment.reference_number
        }
      }
      
      await supabase
        .from('transaction_history')
        .insert(transactionData)
      
    } catch (error) {
      console.error('Error creating payment transaction:', error)
    }
  }

  // Mask account number for security
  private static maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber
    
    const visibleDigits = 4
    const maskedPortion = '*'.repeat(accountNumber.length - visibleDigits)
    const visiblePortion = accountNumber.slice(-visibleDigits)
    
    return maskedPortion + visiblePortion
  }

  // Validate payment method
  static async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const paymentMethod = await this.readSingle<PaymentMethod>('payment_methods', {
        id: paymentMethodId,
        is_active: true
      })
      
      // Additional validation logic would go here
      // For example, checking if credit card is not expired
      if (paymentMethod.type === 'credit_card' && paymentMethod.expiry_date) {
        const expiryDate = new Date(paymentMethod.expiry_date)
        if (expiryDate < new Date()) {
          return false
        }
      }
      
      return true
    } catch (error) {
      return false
    }
  }
}
