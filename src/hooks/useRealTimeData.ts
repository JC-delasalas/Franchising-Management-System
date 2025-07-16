import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface RealTimeSubscription {
  table: string;
  filter?: string;
  callback: (payload: any) => void;
}

interface RealTimeConfig {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useRealTimeSubscription = (
  subscriptions: RealTimeSubscription[],
  config: RealTimeConfig = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!config.enabled) return;

    const channels = subscriptions.map(({ table, filter, callback }) => {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter || undefined,
          },
          (payload) => {
            console.log(`Real-time update for ${table}:`, payload);
            callback(payload);
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: [table] });
            
            // Show toast notification for important updates
            if (['orders', 'inventory', 'approvals'].includes(table)) {
              const eventType = payload.eventType;
              const message = `${table.slice(0, -1)} ${eventType === 'INSERT' ? 'created' : eventType === 'UPDATE' ? 'updated' : 'deleted'}`;
              
              toast({
                title: "Real-time Update",
                description: message,
                duration: 3000,
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setConnectionError(null);
            config.onConnect?.();
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionError('Connection error');
            config.onError?.(new Error('Real-time connection failed'));
          }
        });

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
      config.onDisconnect?.();
    };
  }, [subscriptions, config, queryClient, toast]);

  return { isConnected, connectionError };
};

// Real-time inventory tracking
export const useRealTimeInventory = (locationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory', locationId || user?.metadata?.primary_location_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (name, sku, category),
          franchise_locations (name, address)
        `)
        .eq('location_id', locationId || user?.metadata?.primary_location_id);

      if (error) throw error;
      return data;
    },
    enabled: !!(locationId || user?.metadata?.primary_location_id),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Real-time subscription for inventory changes
  const { isConnected } = useRealTimeSubscription([
    {
      table: 'inventory',
      filter: `location_id=eq.${locationId || user?.metadata?.primary_location_id}`,
      callback: (payload) => {
        // Update inventory cache immediately
        queryClient.setQueryData(
          ['inventory', locationId || user?.metadata?.primary_location_id],
          (oldData: any) => {
            if (!oldData) return oldData;
            
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            switch (eventType) {
              case 'INSERT':
                return [...oldData, newRecord];
              case 'UPDATE':
                return oldData.map((item: any) => 
                  item.id === newRecord.id ? { ...item, ...newRecord } : item
                );
              case 'DELETE':
                return oldData.filter((item: any) => item.id !== oldRecord.id);
              default:
                return oldData;
            }
          }
        );
      }
    }
  ], { enabled: !!(locationId || user?.metadata?.primary_location_id) });

  return {
    inventory,
    isLoading,
    error,
    isRealTimeConnected: isConnected,
    lowStockItems: inventory?.filter(item => item.current_stock <= item.reorder_level) || [],
    totalValue: inventory?.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0) || 0
  };
};

// Real-time order tracking
export const useRealTimeOrders = (filters: { status?: string; locationId?: string } = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku, category)
          ),
          franchise_locations (name, address),
          user_profiles!created_by (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.locationId) {
        query = query.eq('franchise_location_id', filters.locationId);
      } else if (user?.metadata?.primary_location_id) {
        query = query.eq('franchise_location_id', user.metadata.primary_location_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Real-time subscription for order updates
  const { isConnected } = useRealTimeSubscription([
    {
      table: 'orders',
      callback: (payload) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        
        // Show notification for status changes
        if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old.status) {
          const orderNumber = payload.new.order_number;
          const newStatus = payload.new.status;
          
          // Show toast notification based on status
          const statusMessages = {
            'pending': 'Order is pending approval',
            'approved': 'Order has been approved',
            'processing': 'Order is being processed',
            'shipped': 'Order has been shipped',
            'delivered': 'Order has been delivered',
            'cancelled': 'Order has been cancelled'
          };
        }
      }
    }
  ], { enabled: !!user });

  return {
    orders,
    isLoading,
    error,
    isRealTimeConnected: isConnected,
    pendingOrders: orders?.filter(order => order.status === 'pending') || [],
    recentOrders: orders?.slice(0, 10) || [],
    totalValue: orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  };
};

// Real-time notifications
export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Real-time subscription for new notifications
  const { isConnected } = useRealTimeSubscription([
    {
      table: 'notifications',
      filter: `user_id=eq.${user?.id}`,
      callback: (payload) => {
        if (payload.eventType === 'INSERT') {
          // Show browser notification for new alerts
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/favicon.ico'
            });
          }
        }
      }
    }
  ], { enabled: !!user });

  return {
    notifications,
    isLoading,
    isRealTimeConnected: isConnected,
    unreadCount: notifications?.filter(n => !n.read_at).length || 0,
    markAsRead: markAsReadMutation.mutate
  };
};
