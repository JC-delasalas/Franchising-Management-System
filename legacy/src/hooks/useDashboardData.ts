
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { AnalyticsAPI } from '@/api/analytics';
import { FranchiseAPI } from '@/api/franchises';
import { OrderAPI } from '@/api/orders';
import { InventoryAPI } from '@/api/inventory';
import { ApprovalAPI } from '@/api/approvals';
import { useToast } from './use-toast';

interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeUsers: number;
  usersChange: number;
  conversionRate: number;
  conversionChange: number;
}

interface RecentActivity {
  id: string;
  type: 'sale' | 'order' | 'user' | 'approval' | 'inventory';
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  notifications: DashboardNotification[];
  pendingApprovals: number;
  lowStockItems: number;
}

export const useDashboardData = (locationId?: string) => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time dashboard metrics query
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['dashboard-metrics', user?.id, locationId, role],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (role === 'franchisor') {
        return AnalyticsAPI.getFranchisorMetrics(user!.id);
      } else {
        return AnalyticsAPI.getFranchiseeMetrics(locationId || user!.metadata?.primary_location_id);
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    onError: (error) => {
      toast({
        title: "Metrics Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    }
  });

  // Recent activity query
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity', user?.id, locationId, role],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      if (role === 'franchisor') {
        // Get recent franchise activities
        const [orders, applications] = await Promise.all([
          OrderAPI.getRecentOrders({ limit: 5 }),
          FranchiseAPI.getRecentApplications({ limit: 3 })
        ]);

        activities.push(
          ...orders.map(order => ({
            id: order.id,
            type: 'order' as const,
            description: `Order #${order.order_number} - ${order.total_amount}`,
            timestamp: order.created_at,
            amount: order.total_amount,
            status: order.status
          })),
          ...applications.map(app => ({
            id: app.id,
            type: 'user' as const,
            description: `New application from ${app.applicant_name}`,
            timestamp: app.created_at,
            status: app.status
          }))
        );
      } else {
        // Get franchisee activities
        const [orders, inventory] = await Promise.all([
          OrderAPI.getOrdersByLocation(locationId || user!.metadata?.primary_location_id, { limit: 5 }),
          InventoryAPI.getRecentInventoryChanges(locationId || user!.metadata?.primary_location_id, { limit: 3 })
        ]);

        activities.push(
          ...orders.map(order => ({
            id: order.id,
            type: 'order' as const,
            description: `Order #${order.order_number} - ${order.total_amount}`,
            timestamp: order.created_at,
            amount: order.total_amount,
            status: order.status
          })),
          ...inventory.map(inv => ({
            id: inv.id,
            type: 'inventory' as const,
            description: `${inv.product_name} stock ${inv.change_type}`,
            timestamp: inv.created_at,
            status: inv.change_type
          }))
        );
      }

      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Notifications query
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['dashboard-notifications', user?.id],
    queryFn: async (): Promise<DashboardNotification[]> => {
      const userNotifications = await ApprovalAPI.getUserNotifications(user!.id, false);

      return userNotifications.map(notification => ({
        id: notification.id,
        type: notification.priority === 'high' ? 'warning' : 'info',
        title: notification.title,
        message: notification.message,
        timestamp: notification.created_at,
        read: notification.read_at !== null
      }));
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Pending approvals count
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals-count', user?.id],
    queryFn: async (): Promise<number> => {
      const approvals = await ApprovalAPI.getApprovalDashboard({
        assignee_id: user!.id,
        status: 'pending'
      });
      return approvals.length;
    },
    enabled: !!user?.id && role === 'franchisor',
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Low stock items count
  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock-count', locationId],
    queryFn: async (): Promise<number> => {
      const inventory = await InventoryAPI.getInventoryByLocation(locationId || user!.metadata?.primary_location_id);
      return inventory.filter(item => item.current_stock <= item.reorder_level).length;
    },
    enabled: !!user?.id && role === 'franchisee',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const isLoading = metricsLoading || activityLoading || notificationsLoading;
  const error = metricsError;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
    queryClient.invalidateQueries({ queryKey: ['low-stock-count'] });
  };

  const data: DashboardData | null = metrics ? {
    metrics,
    recentActivity: recentActivity || [],
    notifications: notifications || [],
    pendingApprovals: pendingApprovals || 0,
    lowStockItems: lowStockItems || 0
  } : null;

  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated: new Date()
  };
};
