import React, { useState } from 'react';
import { Bell, Check, CheckCheck, X, AlertTriangle, DollarSign, Users, BookOpen, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeNotifications, useNotificationStats } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'inventory_alerts':
      return <Package className="h-4 w-4" />;
    case 'financial_updates':
      return <DollarSign className="h-4 w-4" />;
    case 'franchisee_applications':
      return <Users className="h-4 w-4" />;
    case 'training_reminders':
      return <BookOpen className="h-4 w-4" />;
    case 'sales_updates':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-red-500 bg-red-50';
    case 'high':
      return 'border-orange-500 bg-orange-50';
    case 'medium':
      return 'border-blue-500 bg-blue-50';
    case 'low':
      return 'border-gray-500 bg-gray-50';
    default:
      return 'border-gray-300 bg-white';
  }
};

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const stats = useNotificationStats();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const readNotifications = filteredNotifications.filter(n => n.read);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{stats.byPriority.urgent}</div>
              <div className="text-xs text-muted-foreground">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.byPriority.high}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.unread}</div>
              <div className="text-xs text-muted-foreground">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.recent}</div>
              <div className="text-xs text-muted-foreground">Recent</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="inventory_alerts" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="financial_updates" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Finance
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            <ScrollArea className="h-96">
              <div className="p-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Unread notifications first */}
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                    
                    {/* Separator if there are both read and unread */}
                    {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                      <Separator className="my-2" />
                    )}
                    
                    {/* Read notifications */}
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    read: boolean;
    created_at: string;
    data?: Record<string, any>;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-sm ${
        !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
      } ${getPriorityColor(notification.priority)}`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </p>
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
            
            {/* Additional data display */}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                {notification.type === 'inventory_alerts' && notification.data.current_stock && (
                  <div>Stock: {notification.data.current_stock} / {notification.data.min_stock_level} min</div>
                )}
                {notification.type === 'financial_updates' && notification.data.amount && (
                  <div>Amount: ${notification.data.amount}</div>
                )}
                {notification.type === 'sales_updates' && notification.data.amount && (
                  <div>Sale Amount: ${notification.data.amount}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
