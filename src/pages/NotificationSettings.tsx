import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { NotificationsAPI, NotificationPreferences } from '@/api/notifications';
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  Smartphone, 
  Package, 
  Megaphone,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: NotificationsAPI.getNotificationPreferences,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: NotificationsAPI.updateNotificationPreferences,
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };

    updatePreferencesMutation.mutate(updatedPreferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Unable to load settings</h2>
              <p className="text-gray-600 mb-6">
                We couldn't load your notification preferences. Please try again.
              </p>
              <Link to="/franchisee-dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/franchisee-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Notification Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* General Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                General Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-base font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="push-notifications" className="text-base font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive push notifications in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="order-updates" className="text-base font-medium">
                      Order Updates
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified about order status changes, approvals, and shipping updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="order-updates"
                  checked={preferences.order_updates}
                  onCheckedChange={(checked) => handlePreferenceChange('order_updates', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="low-stock-alerts" className="text-base font-medium">
                      Low Stock Alerts
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive alerts when inventory levels are low
                    </p>
                  </div>
                </div>
                <Switch
                  id="low-stock-alerts"
                  checked={preferences.low_stock_alerts}
                  onCheckedChange={(checked) => handlePreferenceChange('low_stock_alerts', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="w-5 h-5 mr-2" />
                System Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="system-announcements" className="text-base font-medium">
                      System Announcements
                    </Label>
                    <p className="text-sm text-gray-600">
                      Important updates and announcements from the system
                    </p>
                  </div>
                </div>
                <Switch
                  id="system-announcements"
                  checked={preferences.system_announcements}
                  onCheckedChange={(checked) => handlePreferenceChange('system_announcements', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label htmlFor="marketing-notifications" className="text-base font-medium">
                      Marketing Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Promotional offers, new features, and marketing updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={preferences.marketing_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing_notifications', checked)}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Frequency Info */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Order Status Updates:</span>
                  <span className="font-medium">Immediate</span>
                </div>
                <div className="flex justify-between">
                  <span>System Announcements:</span>
                  <span className="font-medium">As needed</span>
                </div>
                <div className="flex justify-between">
                  <span>Low Stock Alerts:</span>
                  <span className="font-medium">Daily digest</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing Updates:</span>
                  <span className="font-medium">Weekly</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              disabled={updatePreferencesMutation.isPending}
              onClick={() => {
                toast({
                  title: "Settings saved",
                  description: "Your notification preferences are automatically saved.",
                });
              }}
            >
              {updatePreferencesMutation.isPending ? 'Saving...' : 'Settings Auto-Saved'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
