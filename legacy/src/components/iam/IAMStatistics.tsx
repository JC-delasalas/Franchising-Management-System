
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIAMStatistics } from '@/hooks/useIAMStatistics';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Shield,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const IAMStatistics: React.FC = () => {
  const {
    totalUsers,
    activeUsers,
    pendingUsers,
    customRoles,
    systemRoles,
    activeUserPercentage,
    isLoading,
    error,
    retryCount,
    refresh,
    retry
  } = useIAMStatistics();

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badge: `${activeUserPercentage}%`
    },
    {
      title: 'Pending Users',
      value: pendingUsers,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Custom Roles',
      value: customRoles,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      badge: `${systemRoles} system`
    }
  ];

  if (isLoading && !totalUsers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">IAM Statistics</h3>
        <div className="flex items-center space-x-2">
          {retryCount > 0 && (
            <Badge variant="outline" className="text-orange-600">
              Retry {retryCount}/3
            </Badge>
          )}
          {error && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={error ? 'border-orange-200 bg-orange-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Statistics may be outdated
              </p>
              <p className="text-xs text-orange-600">
                {error.message}. Click retry to refresh data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
