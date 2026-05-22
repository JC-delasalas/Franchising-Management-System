import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NotificationsAPI, NotificationWithDetails } from '@/api/notifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationToastProps {
  children: React.ReactNode;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Track the last notification ID to detect new notifications
  const [lastNotificationId, setLastNotificationId] = React.useState<string | null>(null);

  // Fetch latest notifications for real-time updates
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-realtime'],
    queryFn: () => NotificationsAPI.getNotifications(5, 0), // Get latest 5 notifications
    enabled: !!user,
    refetchInterval: 10000, // Check every 10 seconds for new notifications
  });

  useEffect(() => {
    if (!notifications.length) return;

    const latestNotification = notifications[0];
    
    // If this is a new notification (different from last seen)
    if (lastNotificationId && latestNotification.id !== lastNotificationId) {
      const display = NotificationsAPI.getNotificationDisplay(latestNotification.type);
      
      // Show toast notification
      toast(latestNotification.title, {
        description: latestNotification.message,
        icon: display.icon,
        duration: 5000,
        action: latestNotification.action_url ? {
          label: 'View',
          onClick: () => {
            // Navigate to the action URL
            window.location.href = latestNotification.action_url!;
          },
        } : undefined,
        className: getToastClassName(latestNotification.priority),
      });

      // Invalidate notification queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }

    // Update the last seen notification ID
    if (latestNotification) {
      setLastNotificationId(latestNotification.id);
    }
  }, [notifications, lastNotificationId, queryClient]);

  const getToastClassName = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return <>{children}</>;
};

export default NotificationToast;
