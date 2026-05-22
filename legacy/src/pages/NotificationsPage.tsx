import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { NotificationsAPI, NotificationWithDetails } from '@/api/notifications';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Settings,
  Eye,
  Calendar,
  Package
} from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-full'],
    queryFn: () => NotificationsAPI.getNotifications(100, 0),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: NotificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-full'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: NotificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-full'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: NotificationsAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-full'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      setSelectedNotifications([]);
    },
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.is_read) ||
                         (statusFilter === 'unread' && !notification.is_read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      selectedNotifications.forEach(id => {
        deleteNotificationMutation.mutate(id);
      });
    }
  };

  const handleBulkMarkAsRead = () => {
    if (selectedNotifications.length === 0) return;
    
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.is_read) {
        markAsReadMutation.mutate(id);
      }
    });
    setSelectedNotifications([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
      default:
        return 'border-l-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/franchisee-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Notifications</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {unreadCount} Unread
                </Badge>
              )}
              <Link to="/notification-settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order_approved">Order Approved</SelectItem>
                    <SelectItem value="order_rejected">Order Rejected</SelectItem>
                    <SelectItem value="order_shipped">Order Shipped</SelectItem>
                    <SelectItem value="order_delivered">Order Delivered</SelectItem>
                    <SelectItem value="order_created">Order Created</SelectItem>
                    <SelectItem value="system_announcement">System</SelectItem>
                    <SelectItem value="low_stock_alert">Low Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                
                {selectedNotifications.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMarkAsRead}
                    >
                      Mark Read ({selectedNotifications.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedNotifications.length})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bulk Selection */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center mt-4 pt-4 border-t">
                <Checkbox
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select all {filteredNotifications.length} notifications
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">
                {notifications.length === 0 ? 'No notifications yet' : 'No notifications match your filters'}
              </h2>
              <p className="text-gray-600 mb-6">
                {notifications.length === 0 
                  ? 'You\'ll see notifications here when you have updates.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const display = NotificationsAPI.getNotificationDisplay(notification.type);
              const timeAgo = NotificationsAPI.formatNotificationTime(notification.created_at);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => handleSelectNotification(notification.id)}
                      />
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${display.bgColor}`}>
                        <span>{display.icon}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {notification.related_order && (
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Package className="w-4 h-4 mr-1" />
                                Order #{notification.related_order.order_number} • ₱{notification.related_order.total_amount?.toLocaleString()}
                              </div>
                            )}
                            
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {timeAgo}
                              <Badge variant="outline" className="ml-3 text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            
                            {notification.action_url && (
                              <Link to={notification.action_url}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
