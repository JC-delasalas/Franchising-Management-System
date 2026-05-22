import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRealTimeSubscription } from './useRealTimeData';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { OrderManagementService, Order, OrderItem } from '@/services/OrderManagementService';
import { PricingService } from '@/services/PricingService';
import { InvoiceService } from '@/services/InvoiceService';

interface OrderFilters {
  status?: string;
  priority?: string;
  from_date?: string;
  to_date?: string;
  location_id?: string;
}

interface CreateOrderData {
  location_id: string;
  items: OrderItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requested_delivery_date?: string;
  notes?: string;
}

export const useOrderManagement = (filters: OrderFilters = {}) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get orders with real-time updates
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', filters, user?.id],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku, category)
          ),
          franchise_locations (name, address),
          user_profiles!created_by (full_name, email),
          order_approvals (
            *,
            user_profiles!approver_id (full_name, role)
          ),
          invoices (id, invoice_number, status, total_amount)
        `)
        .order('created_at', { ascending: false });

      // Apply filters based on user role
      if (role === 'franchisee' && user?.metadata?.primary_location_id) {
        query = query.eq('location_id', user.metadata.primary_location_id);
      } else if (filters.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.from_date) {
        query = query.gte('created_at', filters.from_date);
      }

      if (filters.to_date) {
        query = query.lte('created_at', filters.to_date);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      return data || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Get pending approvals for current user
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-approvals', user?.id, role],
    queryFn: async () => {
      if (!user || !['franchisee_manager', 'regional_coordinator', 'franchisor'].includes(role || '')) {
        return [];
      }

      // Determine which approval level this user can handle
      let statusFilter = '';
      switch (role) {
        case 'franchisee_manager':
          statusFilter = 'pending_approval';
          break;
        case 'regional_coordinator':
          statusFilter = 'level1_approved';
          break;
        case 'franchisor':
          statusFilter = 'level2_approved';
          break;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku)
          ),
          franchise_locations (name, address),
          user_profiles!created_by (full_name, email)
        `)
        .eq('status', statusFilter)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && ['franchisee_manager', 'regional_coordinator', 'franchisor'].includes(role || ''),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Create new order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      return OrderManagementService.createOrder({
        ...orderData,
        created_by: user!.id,
        status: 'draft',
        approval_level: 0,
        total_amount: 0,
        tax_amount: 0,
        shipping_amount: 0,
        grand_total: 0,
        currency: 'PHP',
        approval_history: []
      });
    },
    onSuccess: (newOrder) => {
      toast({
        title: "Order Created",
        description: `Order ${newOrder.order_number} has been created successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast({
        title: "Order Creation Failed",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    }
  });

  // Process approval (approve/reject)
  const processApprovalMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      action, 
      comments 
    }: { 
      orderId: string; 
      action: 'approved' | 'rejected'; 
      comments?: string 
    }) => {
      return OrderManagementService.processApproval(orderId, user!.id, action, comments);
    },
    onSuccess: (updatedOrder, variables) => {
      toast({
        title: `Order ${variables.action.charAt(0).toUpperCase() + variables.action.slice(1)}`,
        description: `Order ${updatedOrder.order_number} has been ${variables.action}`,
        variant: variables.action === 'approved' ? 'default' : 'destructive',
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to process approval",
        variant: "destructive",
      });
    }
  });

  // Create shipment
  const createShipmentMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      shippingInfo 
    }: { 
      orderId: string; 
      shippingInfo: any 
    }) => {
      return OrderManagementService.createShipment(orderId, shippingInfo);
    },
    onSuccess: () => {
      toast({
        title: "Shipment Created",
        description: "Order has been shipped successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Shipment Failed",
        description: error.message || "Failed to create shipment",
        variant: "destructive",
      });
    }
  });

  // Confirm delivery
  const confirmDeliveryMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      deliveryProof 
    }: { 
      orderId: string; 
      deliveryProof?: string 
    }) => {
      return OrderManagementService.confirmDelivery(orderId, deliveryProof);
    },
    onSuccess: () => {
      toast({
        title: "Delivery Confirmed",
        description: "Order delivery has been confirmed",
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delivery Confirmation Failed",
        description: error.message || "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  });

  // Cancel order
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      // Update order status to cancelled
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Release reserved inventory
      // This would be handled by the InventoryService
      return orderId;
    },
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription for order updates
  const { isConnected: isRealTimeConnected } = useRealTimeSubscription([
    {
      table: 'orders',
      callback: (payload) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
        
        if (payload.eventType === 'UPDATE') {
          const { new: newRecord, old: oldRecord } = payload;
          
          // Show notification for status changes
          if (newRecord.status !== oldRecord.status) {
            toast({
              title: "Order Status Updated",
              description: `Order ${newRecord.order_number} status changed to ${newRecord.status}`,
              duration: 5000,
            });
          }
        }
      }
    },
    {
      table: 'order_approvals',
      callback: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      }
    }
  ], { enabled: !!user });

  // Calculate order metrics
  const orderMetrics = {
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(order => order.status === 'pending_approval').length || 0,
    processingOrders: orders?.filter(order => order.status === 'processing').length || 0,
    shippedOrders: orders?.filter(order => order.status === 'shipped').length || 0,
    deliveredOrders: orders?.filter(order => order.status === 'delivered').length || 0,
    cancelledOrders: orders?.filter(order => order.status === 'cancelled').length || 0,
    totalValue: orders?.reduce((sum, order) => sum + order.grand_total, 0) || 0,
    averageOrderValue: orders?.length ? (orders.reduce((sum, order) => sum + order.grand_total, 0) / orders.length) : 0,
    pendingApprovalsCount: pendingApprovals?.length || 0
  };

  return {
    orders,
    pendingApprovals,
    orderMetrics,
    isLoading,
    approvalsLoading,
    error,
    isRealTimeConnected,
    createOrder: createOrderMutation.mutate,
    processApproval: processApprovalMutation.mutate,
    createShipment: createShipmentMutation.mutate,
    confirmDelivery: confirmDeliveryMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    isProcessingApproval: processApprovalMutation.isPending,
    isCreatingShipment: createShipmentMutation.isPending,
    isConfirmingDelivery: confirmDeliveryMutation.isPending,
    isCancellingOrder: cancelOrderMutation.isPending
  };
};

// Hook for pricing calculations
export const useOrderPricing = () => {
  const { user } = useAuth();

  const calculatePricingMutation = useMutation({
    mutationFn: async ({ items, locationId }: { items: OrderItem[]; locationId: string }) => {
      return PricingService.calculateOrderPricing(items, locationId);
    }
  });

  return {
    calculatePricing: calculatePricingMutation.mutate,
    pricingResult: calculatePricingMutation.data,
    isCalculating: calculatePricingMutation.isPending,
    pricingError: calculatePricingMutation.error
  };
};

// Hook for invoice management
export const useInvoiceManagement = (locationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', locationId || user?.metadata?.primary_location_id],
    queryFn: async () => {
      const effectiveLocationId = locationId || user?.metadata?.primary_location_id;
      if (!effectiveLocationId) return [];
      
      return InvoiceService.getInvoicesForLocation(effectiveLocationId);
    },
    enabled: !!(locationId || user?.metadata?.primary_location_id),
    staleTime: 2 * 60 * 1000,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, paymentInfo }: { invoiceId: string; paymentInfo: any }) => {
      return InvoiceService.recordPayment(invoiceId, paymentInfo);
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully",
      });
    }
  });

  return {
    invoices,
    isLoading,
    recordPayment: recordPaymentMutation.mutate,
    isRecordingPayment: recordPaymentMutation.isPending
  };
};
