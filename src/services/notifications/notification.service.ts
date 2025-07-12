import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type NotificationChannel = 
  | 'inventory_alerts'
  | 'financial_updates'
  | 'franchisee_applications'
  | 'training_reminders'
  | 'system_alerts'
  | 'sales_updates';

interface Notification {
  id: string;
  type: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  created_at: string;
  expires_at?: string;
}

/**
 * Real-time Notification Service
 * Handles real-time notifications across the franchise system
 */
export class NotificationService {
  private subscribers: Map<string, Set<(notification: Notification) => void>> = new Map();
  private notifications: Notification[] = [];

  constructor() {
    this.setupRealtimeSubscriptions();
  }

  /**
   * Set up real-time subscriptions for different data changes
   */
  private setupRealtimeSubscriptions() {
    // Inventory alerts
    supabase
      .channel('inventory_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => this.handleInventoryChange(payload)
      )
      .subscribe();

    // New franchisee applications
    supabase
      .channel('franchisee_applications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'franchisee' },
        (payload) => this.handleNewApplication(payload)
      )
      .subscribe();

    // Financial updates
    supabase
      .channel('financial_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payment' },
        (payload) => this.handlePaymentReceived(payload)
      )
      .subscribe();

    // Training completions
    supabase
      .channel('training_updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_training' },
        (payload) => this.handleTrainingUpdate(payload)
      )
      .subscribe();

    // Sales transactions
    supabase
      .channel('sales_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales_transaction' },
        (payload) => this.handleSalesTransaction(payload)
      )
      .subscribe();
  }

  /**
   * Subscribe to notifications
   */
  subscribe(channel: NotificationChannel, callback: (notification: Notification) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(channel)?.delete(callback);
    };
  }

  /**
   * Send notification to subscribers
   */
  private notify(channel: NotificationChannel, notification: Notification) {
    // Add to local notifications
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Notify subscribers
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => callback(notification));
    }

    // Also notify 'all' channel subscribers
    const allSubscribers = this.subscribers.get('system_alerts');
    if (allSubscribers) {
      allSubscribers.forEach(callback => callback(notification));
    }
  }

  /**
   * Handle inventory changes
   */
  private async handleInventoryChange(payload: any) {
    const newRecord = payload.new;
    const oldRecord = payload.old;

    // Check for low stock
    if (newRecord.current_stock <= newRecord.min_stock_level && 
        oldRecord.current_stock > oldRecord.min_stock_level) {
      
      // Get product details
      const { data: product } = await supabase
        .from('product')
        .select('product_nm')
        .eq('product_id', newRecord.product_id)
        .single();

      this.notify('inventory_alerts', {
        id: `inv_${Date.now()}`,
        type: 'inventory_alerts',
        title: 'Low Stock Alert',
        message: `${product?.product_nm || 'Product'} is running low (${newRecord.current_stock} remaining)`,
        data: {
          inventory_id: newRecord.inventory_id,
          product_id: newRecord.product_id,
          current_stock: newRecord.current_stock,
          min_stock_level: newRecord.min_stock_level,
        },
        priority: 'high',
        read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle new franchisee applications
   */
  private handleNewApplication(payload: any) {
    const newRecord = payload.new;

    this.notify('franchisee_applications', {
      id: `app_${Date.now()}`,
      type: 'franchisee_applications',
      title: 'New Franchisee Application',
      message: `New application received from ${newRecord.company_nm}`,
      data: {
        franchisee_id: newRecord.franchisee_id,
        company_name: newRecord.company_nm,
        contact_person: newRecord.contact_person,
      },
      priority: 'medium',
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Handle payment received
   */
  private async handlePaymentReceived(payload: any) {
    const newRecord = payload.new;

    // Get invoice details
    const { data: invoice } = await supabase
      .from('invoice')
      .select(`
        *,
        franchisee:franchisee(company_nm)
      `)
      .eq('invoice_id', newRecord.invoice_id)
      .single();

    this.notify('financial_updates', {
      id: `pay_${Date.now()}`,
      type: 'financial_updates',
      title: 'Payment Received',
      message: `Payment of $${newRecord.amount} received from ${(invoice?.franchisee as any)?.company_nm || 'Unknown'}`,
      data: {
        payment_id: newRecord.payment_id,
        amount: newRecord.amount,
        invoice_id: newRecord.invoice_id,
      },
      priority: 'low',
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Handle training updates
   */
  private async handleTrainingUpdate(payload: any) {
    const newRecord = payload.new;
    const oldRecord = payload.old;

    // Check if training was completed
    if (newRecord.status === 'completed' && oldRecord.status !== 'completed') {
      // Get user and module details
      const { data: userTraining } = await supabase
        .from('user_training')
        .select(`
          *,
          user_profile:user_profiles(first_nm, last_nm),
          training_module:training_module(title)
        `)
        .eq('user_training_id', newRecord.user_training_id)
        .single();

      const userName = userTraining?.user_profile 
        ? `${(userTraining.user_profile as any).first_nm} ${(userTraining.user_profile as any).last_nm}`
        : 'Unknown User';

      this.notify('training_reminders', {
        id: `train_${Date.now()}`,
        type: 'training_reminders',
        title: 'Training Completed',
        message: `${userName} completed "${(userTraining?.training_module as any)?.title || 'Unknown Module'}"`,
        data: {
          user_training_id: newRecord.user_training_id,
          user_id: newRecord.user_id,
          score: newRecord.score,
        },
        priority: 'low',
        read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle sales transactions
   */
  private async handleSalesTransaction(payload: any) {
    const newRecord = payload.new;

    // Only notify for large transactions
    if (newRecord.total_amount >= 1000) {
      // Get location details
      const { data: location } = await supabase
        .from('location')
        .select('location_nm')
        .eq('location_id', newRecord.location_id)
        .single();

      this.notify('sales_updates', {
        id: `sale_${Date.now()}`,
        type: 'sales_updates',
        title: 'Large Sale Alert',
        message: `Large sale of $${newRecord.total_amount} at ${location?.location_nm || 'Unknown Location'}`,
        data: {
          transaction_id: newRecord.transaction_id,
          amount: newRecord.total_amount,
          location_id: newRecord.location_id,
        },
        priority: 'medium',
        read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => 
      new Date(n.created_at) > oneDayAgo || !n.read
    );
  }

  /**
   * Send custom notification
   */
  sendNotification(
    channel: NotificationChannel,
    title: string,
    message: string,
    data?: Record<string, any>,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): void {
    this.notify(channel, {
      id: `custom_${Date.now()}`,
      type: channel,
      title,
      message,
      data,
      priority,
      read: false,
      created_at: new Date().toISOString(),
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();
