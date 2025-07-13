import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notifications/notification.service';

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
 * Hook for managing real-time notifications
 */
export const useRealtimeNotifications = (channels?: NotificationChannel[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update notifications from service
  const updateNotifications = useCallback(() => {
    const allNotifications = notificationService.getNotifications();
    const filteredNotifications = channels 
      ? allNotifications.filter(n => channels.includes(n.type))
      : allNotifications;
    
    setNotifications(filteredNotifications);
    setUnreadCount(notificationService.getUnreadCount());
  }, [channels]);

  useEffect(() => {
    // Initial load
    updateNotifications();

    // Subscribe to all specified channels
    const unsubscribeFunctions: (() => void)[] = [];

    if (channels) {
      channels.forEach(channel => {
        const unsubscribe = notificationService.subscribe(channel, () => {
          updateNotifications();
        });
        unsubscribeFunctions.push(unsubscribe);
      });
    } else {
      // Subscribe to system alerts (catches all notifications)
      const unsubscribe = notificationService.subscribe('system_alerts', () => {
        updateNotifications();
      });
      unsubscribeFunctions.push(unsubscribe);
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [channels, updateNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    updateNotifications();
  }, [updateNotifications]);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
    updateNotifications();
  }, [updateNotifications]);

  const sendNotification = useCallback((
    channel: NotificationChannel,
    title: string,
    message: string,
    data?: Record<string, any>,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ) => {
    notificationService.sendNotification(channel, title, message, data, priority);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
  };
};

/**
 * Hook for specific notification channels
 */
export const useInventoryAlerts = () => {
  return useRealtimeNotifications(['inventory_alerts']);
};

export const useFinancialUpdates = () => {
  return useRealtimeNotifications(['financial_updates']);
};

export const useFranchiseeApplications = () => {
  return useRealtimeNotifications(['franchisee_applications']);
};

export const useTrainingReminders = () => {
  return useRealtimeNotifications(['training_reminders']);
};

export const useSalesUpdates = () => {
  return useRealtimeNotifications(['sales_updates']);
};

/**
 * Hook for notification sounds and browser notifications
 */
export const useNotificationEffects = () => {
  const { notifications } = useRealtimeNotifications();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    const currentCount = notifications.length;
    
    // Check if there's a new notification
    if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
      const latestNotification = notifications[0];
      
      // Play sound based on priority
      playNotificationSound(latestNotification.priority);
      
      // Show browser notification if permission granted
      showBrowserNotification(latestNotification);
    }
    
    setLastNotificationCount(currentCount);
  }, [notifications, lastNotificationCount]);

  const playNotificationSound = (priority: string) => {
    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      // Different sounds for different priorities
      switch (priority) {
        case 'urgent':
          playTone(800, 0.2);
          setTimeout(() => playTone(800, 0.2), 300);
          setTimeout(() => playTone(800, 0.2), 600);
          break;
        case 'high':
          playTone(600, 0.3);
          setTimeout(() => playTone(800, 0.3), 400);
          break;
        case 'medium':
          playTone(500, 0.4);
          break;
        case 'low':
          playTone(400, 0.2);
          break;
      }
    } catch (error) {
      console.warn('Audio notification failed:', error);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    requestNotificationPermission,
  };
};

/**
 * Hook for notification statistics
 */
export const useNotificationStats = () => {
  const { notifications } = useRealtimeNotifications();

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byPriority: {
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length,
    },
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recent: notifications.filter(n => {
      const notificationTime = new Date(n.created_at).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return notificationTime > oneHourAgo;
    }).length,
  };

  return stats;
};
