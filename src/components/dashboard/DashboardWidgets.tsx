
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const DashboardWidgets: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    retryCount,
    canRetry,
    lastUpdated,
    refresh,
    retry,
    reset
  } = useDashboardData();

  if (error && !canRetry) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={reset}
        context="dashboard widgets"
        showDetails={true}
      />
    );
  }

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dashboard Overview</h3>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          {retryCount > 0 && (
            <div className="flex items-center text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Retry {retryCount}/3
            </div>
          )}
          {error && canRetry && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.metrics.map((metric, index) => (
          <Card key={index} className={error ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {data?.recentActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-800">
            Some data may be outdated due to connection issues. 
            {canRetry && " Click retry to refresh."}
          </p>
        </div>
      )}
    </div>
  );
};
