import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useRealTimeSubscription } from './useRealTimeData';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { useEffect } from 'react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'order' | 'inventory' | 'approval' | 'payment' | 'general';
  data?: any;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  low_stock_alerts: boolean;
  order_updates: boolean;
  approval_requests: boolean;
  payment_reminders: boolean;
  system_maintenance: boolean;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async (): Promise<NotificationPreferences> => {
      try {
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user!.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching notification preferences:', error);
        }

        // Return default preferences if none exist
        return data || {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          low_stock_alerts: true,
          order_updates: true,
          approval_requests: true,
          payment_reminders: true,
          system_maintenance: true
        };
      } catch (error) {
        console.error('Error in notification preferences query:', error);
        return {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          low_stock_alerts: true,
          order_updates: true,
          approval_requests: true,
          payment_reminders: true,
          system_maintenance: true
        };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user!.id,
          ...preferences,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved",
      });
    }
  });

  // Send notification (for system use)
  const sendNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'read_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Real-time subscription for new notifications
  const { isConnected: isRealTimeConnected } = useRealTimeSubscription([
    {
      table: 'notifications',
      filter: `recipient_id=eq.${user?.id}`,
      callback: (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new as Notification;
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
            duration: newNotification.priority === 'urgent' ? 10000 : 5000,
          });

          // Show browser notification if enabled and permission granted
          if (
            preferences?.push_notifications &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const browserNotification = new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: newNotification.id,
              requireInteraction: newNotification.priority === 'urgent',
              data: newNotification.data
            });

            // Auto-close after 5 seconds unless urgent
            if (newNotification.priority !== 'urgent') {
              setTimeout(() => browserNotification.close(), 5000);
            }

            // Handle notification click
            browserNotification.onclick = () => {
              window.focus();
              browserNotification.close();
              
              // Mark as read when clicked
              markAsReadMutation.mutate(newNotification.id);
            };
          }

          // Play sound for urgent notifications
          if (newNotification.priority === 'urgent') {
            try {
              const audio = new Audio('/notification-urgent.mp3');
              audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
              });
            } catch (error) {
              // Ignore audio errors
            }
          }
        }
        
        // Invalidate queries to refresh the notification list
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    }
  ], { enabled: !!user });

  // Calculate notification counts
  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;
  const urgentCount = notifications?.filter(n => !n.read_at && n.priority === 'urgent').length || 0;
  const todayCount = notifications?.filter(n => {
    const today = new Date().toDateString();
    return new Date(n.created_at).toDateString() === today;
  }).length || 0;

  // Group notifications by category
  const notificationsByCategory = notifications?.reduce((acc, notification) => {
    const category = notification.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>) || {};

  // Get recent notifications (last 24 hours)
  const recentNotifications = notifications?.filter(n => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(n.created_at) > oneDayAgo;
  }) || [];

  return {
    notifications,
    preferences,
    isLoading,
    error,
    isRealTimeConnected,
    unreadCount,
    urgentCount,
    todayCount,
    notificationsByCategory,
    recentNotifications,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending
  };
};

// Hook for system-wide notifications (franchisor use)
export const useSystemNotifications = () => {
  const { user } = useAuth();

  const sendBulkNotificationMutation = useMutation({
    mutationFn: async ({
      userIds,
      notification
    }: {
      userIds: string[];
      notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read_at'>;
    }) => {
      const notifications = userIds.map(userId => ({
        ...notification,
        user_id: userId,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notifications Sent",
        description: "Bulk notifications sent successfully",
      });
    }
  });

  const sendLocationNotificationMutation = useMutation({
    mutationFn: async ({
      locationId,
      notification
    }: {
      locationId: string;
      notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read_at'>;
    }) => {
      // Get all users for this location
      const { data: locationUsers } = await supabase
        .from('franchise_locations')
        .select('franchisee_id, staff_members')
        .eq('id', locationId)
        .single();

      if (!locationUsers) throw new Error('Location not found');

      const userIds = [locationUsers.franchisee_id, ...(locationUsers.staff_members || [])];
      
      const notifications = userIds.map(userId => ({
        ...notification,
        user_id: userId,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    }
  });

  return {
    sendBulkNotification: sendBulkNotificationMutation.mutate,
    sendLocationNotification: sendLocationNotificationMutation.mutate,
    isSendingBulk: sendBulkNotificationMutation.isPending,
    isSendingLocation: sendLocationNotificationMutation.isPending
  };
};
