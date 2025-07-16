import { supabase } from '@/lib/supabase';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  variables: string[];
}

export interface NotificationRecipient {
  user_id: string;
  email?: string;
  phone?: string;
  full_name: string;
  role: string;
}

export class NotificationService {
  // Send order created notification
  static async sendOrderCreatedNotification(order: any): Promise<void> {
    try {
      // Get order creator details
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', order.created_by)
        .single();

      // Send notification to order creator
      await this.createNotification({
        user_id: order.created_by,
        title: 'Order Created Successfully',
        message: `Your order ${order.order_number} has been created and is ${order.status === 'approved' ? 'approved' : 'pending approval'}.`,
        type: 'success',
        category: 'order',
        data: { order_id: order.id, order_number: order.order_number }
      });

      // Send notification to location manager if different from creator
      const { data: location } = await supabase
        .from('franchise_locations')
        .select('franchisee_id, manager_id')
        .eq('id', order.location_id)
        .single();

      if (location?.manager_id && location.manager_id !== order.created_by) {
        await this.createNotification({
          user_id: location.manager_id,
          title: 'New Order Created',
          message: `A new order ${order.order_number} worth ₱${order.grand_total.toLocaleString()} has been created by ${creator?.full_name}.`,
          type: 'info',
          category: 'order',
          data: { order_id: order.id, order_number: order.order_number }
        });
      }

      // Send email notification if configured
      await this.sendEmailNotification(
        creator?.email || '',
        'Order Created - ' + order.order_number,
        this.generateOrderCreatedEmail(order, creator?.full_name || 'Customer')
      );

    } catch (error) {
      console.error('Error sending order created notification:', error);
    }
  }

  // Send approval request notification
  static async sendApprovalRequestNotification(order: Order, level: 1 | 2 | 3): Promise<void> {
    try {
      const approvers = await this.getApproversForLevel(order.location_id, level);
      
      for (const approver of approvers) {
        await this.createNotification({
          user_id: approver.user_id,
          title: `Order Approval Required - Level ${level}`,
          message: `Order ${order.order_number} (₱${order.grand_total.toLocaleString()}) requires your approval.`,
          type: 'warning',
          priority: order.priority === 'urgent' ? 'urgent' : 'high',
          category: 'approval',
          data: { 
            order_id: order.id, 
            order_number: order.order_number,
            approval_level: level,
            amount: order.grand_total
          }
        });

        // Send email notification
        if (approver.email) {
          await this.sendEmailNotification(
            approver.email,
            `Approval Required: Order ${order.order_number}`,
            this.generateApprovalRequestEmail(order, approver.full_name, level)
          );
        }
      }
    } catch (error) {
      console.error('Error sending approval request notification:', error);
    }
  }

  // Send approval notification (approved/rejected)
  static async sendApprovalNotification(order: Order, approval: ApprovalRecord): Promise<void> {
    try {
      const action = approval.action === 'approved' ? 'approved' : 'rejected';
      const title = `Order ${action.charAt(0).toUpperCase() + action.slice(1)}`;
      
      // Notify order creator
      await this.createNotification({
        user_id: order.created_by,
        title,
        message: `Your order ${order.order_number} has been ${action} by ${approval.approver_name}.`,
        type: approval.action === 'approved' ? 'success' : 'error',
        category: 'approval',
        data: { 
          order_id: order.id, 
          order_number: order.order_number,
          approver: approval.approver_name,
          comments: approval.comments
        }
      });

      // Get order creator details for email
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', order.created_by)
        .single();

      if (creator?.email) {
        await this.sendEmailNotification(
          creator.email,
          `Order ${action}: ${order.order_number}`,
          this.generateApprovalNotificationEmail(order, approval, creator.full_name)
        );
      }

    } catch (error) {
      console.error('Error sending approval notification:', error);
    }
  }

  // Send escalation notification
  static async sendEscalationNotification(order: Order): Promise<void> {
    try {
      const nextLevel = this.getNextApprovalLevel(order.status);
      if (nextLevel) {
        await this.sendApprovalRequestNotification(order, nextLevel);
      }
    } catch (error) {
      console.error('Error sending escalation notification:', error);
    }
  }

  // Send rejection notification
  static async sendRejectionNotification(order: Order, approverId: string, comments?: string): Promise<void> {
    try {
      const { data: approver } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', approverId)
        .single();

      await this.createNotification({
        user_id: order.created_by,
        title: 'Order Rejected',
        message: `Your order ${order.order_number} has been rejected by ${approver?.full_name}.`,
        type: 'error',
        category: 'approval',
        data: { 
          order_id: order.id, 
          order_number: order.order_number,
          rejector: approver?.full_name,
          comments
        }
      });
    } catch (error) {
      console.error('Error sending rejection notification:', error);
    }
  }

  // Send shipping notification
  static async sendShippingNotification(orderId: string, shippingInfo: ShippingInfo): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, created_by')
        .eq('id', orderId)
        .single();

      if (!order) return;

      await this.createNotification({
        user_id: order.created_by,
        title: 'Order Shipped',
        message: `Your order ${order.order_number} has been shipped via ${shippingInfo.carrier}. Tracking: ${shippingInfo.tracking_number}`,
        type: 'info',
        category: 'order',
        data: { 
          order_id: orderId, 
          order_number: order.order_number,
          tracking_number: shippingInfo.tracking_number,
          carrier: shippingInfo.carrier
        }
      });
    } catch (error) {
      console.error('Error sending shipping notification:', error);
    }
  }

  // Send delivery confirmation
  static async sendDeliveryConfirmation(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, created_by')
        .eq('id', orderId)
        .single();

      if (!order) return;

      await this.createNotification({
        user_id: order.created_by,
        title: 'Order Delivered',
        message: `Your order ${order.order_number} has been successfully delivered.`,
        type: 'success',
        category: 'order',
        data: { 
          order_id: orderId, 
          order_number: order.order_number
        }
      });
    } catch (error) {
      console.error('Error sending delivery confirmation:', error);
    }
  }

  // Send fulfillment notification
  static async sendFulfillmentNotification(order: Order): Promise<void> {
    try {
      // Notify warehouse/fulfillment team
      const { data: fulfillmentTeam } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'fulfillment')
        .eq('location_id', order.location_id);

      if (fulfillmentTeam) {
        for (const member of fulfillmentTeam) {
          await this.createNotification({
            user_id: member.id,
            title: 'New Order for Fulfillment',
            message: `Order ${order.order_number} is ready for fulfillment. Priority: ${order.priority}`,
            type: 'info',
            priority: order.priority === 'urgent' ? 'urgent' : 'medium',
            category: 'order',
            data: { 
              order_id: order.id, 
              order_number: order.order_number,
              priority: order.priority
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending fulfillment notification:', error);
    }
  }

  // Helper methods
  private static async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    data?: any;
  }): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        ...notification,
        priority: notification.priority || 'medium',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  private static async getApproversForLevel(locationId: string, level: 1 | 2 | 3): Promise<NotificationRecipient[]> {
    try {
      let roleFilter = '';
      switch (level) {
        case 1:
          roleFilter = 'franchisee_manager';
          break;
        case 2:
          roleFilter = 'regional_coordinator';
          break;
        case 3:
          roleFilter = 'franchisor';
          break;
      }

      const { data: approvers } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, role')
        .eq('role', roleFilter)
        .eq('is_active', true);

      return (approvers || []).map(approver => ({
        user_id: approver.id,
        email: approver.email,
        phone: approver.phone,
        full_name: approver.full_name,
        role: approver.role
      }));
    } catch (error) {
      console.error('Error getting approvers:', error);
      return [];
    }
  }

  private static getNextApprovalLevel(status: string): 1 | 2 | 3 | null {
    switch (status) {
      case 'pending_approval': return 1;
      case 'level1_approved': return 2;
      case 'level2_approved': return 3;
      default: return null;
    }
  }

  private static async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
    try {
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, we'll just log it
      console.log('Email notification:', { email, subject, body });
      
      // Example integration with Supabase Edge Functions for email
      // await supabase.functions.invoke('send-email', {
      //   body: { to: email, subject, html: body }
      // });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Email template generators
  private static generateOrderCreatedEmail(order: Order, customerName: string): string {
    return `
      <h2>Order Created Successfully</h2>
      <p>Dear ${customerName},</p>
      <p>Your order has been created successfully.</p>
      <h3>Order Details:</h3>
      <ul>
        <li>Order Number: ${order.order_number}</li>
        <li>Total Amount: ₱${order.grand_total.toLocaleString()}</li>
        <li>Status: ${order.status}</li>
        <li>Created: ${new Date(order.created_at!).toLocaleDateString()}</li>
      </ul>
      <p>You will receive updates as your order progresses through our fulfillment process.</p>
      <p>Thank you for your business!</p>
    `;
  }

  private static generateApprovalRequestEmail(order: Order, approverName: string, level: number): string {
    return `
      <h2>Order Approval Required</h2>
      <p>Dear ${approverName},</p>
      <p>An order requires your Level ${level} approval.</p>
      <h3>Order Details:</h3>
      <ul>
        <li>Order Number: ${order.order_number}</li>
        <li>Total Amount: ₱${order.grand_total.toLocaleString()}</li>
        <li>Priority: ${order.priority}</li>
        <li>Requested Delivery: ${order.requested_delivery_date || 'Not specified'}</li>
      </ul>
      <p>Please review and approve or reject this order in the system.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">Review Order</a></p>
    `;
  }

  private static generateApprovalNotificationEmail(order: Order, approval: ApprovalRecord, customerName: string): string {
    const action = approval.action === 'approved' ? 'approved' : 'rejected';
    return `
      <h2>Order ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
      <p>Dear ${customerName},</p>
      <p>Your order ${order.order_number} has been ${action} by ${approval.approver_name}.</p>
      ${approval.comments ? `<p>Comments: ${approval.comments}</p>` : ''}
      <h3>Order Details:</h3>
      <ul>
        <li>Order Number: ${order.order_number}</li>
        <li>Total Amount: ₱${order.grand_total.toLocaleString()}</li>
        <li>Status: ${order.status}</li>
      </ul>
      ${approval.action === 'approved' ? 
        '<p>Your order will now proceed to fulfillment.</p>' : 
        '<p>Please contact us if you have any questions about this decision.</p>'
      }
    `;
  }
}
