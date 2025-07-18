
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Upload,
  ShoppingCart,
  Download,
  BookOpen,
  Bell,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  created_at: string;
  expires_at?: string;
}

const getNoticeType = (type: string) => {
  switch (type) {
    case 'info': return 'bg-blue-100 text-blue-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'success': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const OverviewTab: React.FC = () => {
  const { user } = useAuth();

  // Fetch real notifications/notices for the user
  const { data: notices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notice[]> => {
      if (!user?.id) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/sales-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Today's Sales Report
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/inventory-order">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Inventory Items
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/marketing-assets">
              <Download className="w-4 h-4 mr-2" />
              Download Marketing Materials
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee-training">
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Training Modules
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements & Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>Error loading notifications. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4" />
              <p>No new announcements or notices.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{notice.title}</h4>
                    <Badge className={getNoticeType(notice.type)}>
                      {notice.priority || notice.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notice.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
