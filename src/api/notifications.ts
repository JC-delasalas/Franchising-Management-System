import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface NotificationWithDetails extends Notification {
  related_order?: {
    id: string;
    order_number: string;
    total_amount: number;
  };
  sender?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateNotificationData {
  recipient_id: string;
  type: 'order_approved' | 'order_rejected' | 'order_shipped' | 'order_delivered' | 'order_created' | 'system_announcement' | 'low_stock_alert' | 'payment_reminder';
  title: string;
  message: string;
  related_order_id?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  system_announcements: boolean;
  marketing_notifications: boolean;
  low_stock_alerts: boolean;
}

export const NotificationsAPI = {
  // Get user's notifications
  async getNotifications(limit = 50, offset = 0): Promise<NotificationWithDetails[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Simplified query without complex foreign key relationships
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    // Return notifications with empty related data for now
    return (data || []).map(notification => ({
      ...notification,
      related_order: null,
      sender: null
    }));
  },

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('read_at', null); // Use read_at instead of is_read

    if (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(`Failed to fetch unread count: ${error.message}`);
    }

    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('recipient_id', user.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', user.user.id);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  },

  // Create notification (for system use)
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        sender_id: user.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data;
  },

  // Create order-related notification
  async createOrderNotification(
    recipientId: string,
    orderId: string,
    type: 'order_approved' | 'order_rejected' | 'order_shipped' | 'order_delivered' | 'order_created',
    customMessage?: string
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, total_amount')
      .eq('id', orderId)
      .single();

    if (!order) return;

    const notificationTemplates = {
      order_created: {
        title: 'New Order Created',
        message: customMessage || `Order #${order.order_number} has been created and is pending approval.`,
      },
      order_approved: {
        title: 'Order Approved',
        message: customMessage || `Your order #${order.order_number} has been approved and will be processed soon.`,
      },
      order_rejected: {
        title: 'Order Rejected',
        message: customMessage || `Your order #${order.order_number} has been rejected. Please check the order details for more information.`,
      },
      order_shipped: {
        title: 'Order Shipped',
        message: customMessage || `Your order #${order.order_number} has been shipped and is on its way to you.`,
      },
      order_delivered: {
        title: 'Order Delivered',
        message: customMessage || `Your order #${order.order_number} has been delivered successfully.`,
      },
    };

    const template = notificationTemplates[type];
    const priority = type === 'order_rejected' ? 'high' : type === 'order_delivered' ? 'medium' : 'low';

    await this.createNotification({
      user_id: recipientId,
      type,
      title: template.title,
      message: template.message,
      related_order_id: orderId,
      action_url: `/orders/${orderId}`,
      priority,
      metadata: {
        order_number: order.order_number,
        order_total: order.total_amount,
      },
    });
  },

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      throw new Error(`Failed to fetch notification preferences: ${error.message}`);
    }

    // Return default preferences if none exist
    if (!data) {
      return {
        email_notifications: true,
        push_notifications: true,
        order_updates: true,
        system_announcements: true,
        marketing_notifications: false,
        low_stock_alerts: true,
      };
    }

    return {
      email_notifications: data.email_notifications,
      push_notifications: data.push_notifications,
      order_updates: data.order_updates,
      system_announcements: data.system_announcements,
      marketing_notifications: data.marketing_notifications,
      low_stock_alerts: data.low_stock_alerts,
    };
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: user.user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error(`Failed to update notification preferences: ${error.message}`);
    }
  },

  // Get notification icon and color based on type
  getNotificationDisplay(type: string) {
    const displays = {
      order_approved: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-100' },
      order_rejected: { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-100' },
      order_shipped: { icon: '🚚', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      order_delivered: { icon: '📦', color: 'text-green-600', bgColor: 'bg-green-100' },
      order_created: { icon: '🛒', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      system_announcement: { icon: '📢', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      low_stock_alert: { icon: '⚠️', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      payment_reminder: { icon: '💳', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    };

    return displays[type as keyof typeof displays] || { 
      icon: '🔔', 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100' 
    };
  },

  // Format notification time
  formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  },
};
