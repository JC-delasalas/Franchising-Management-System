
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { getCurrentUser } from '@/services/authService';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface SalesData {
  today: string;
  thisWeek: string;
  thisMonth: string;
  target: string;
}

interface KPICardsProps {
  salesData: SalesData;
}

export const KPICards: React.FC<KPICardsProps> = ({ salesData }) => {
  const user = getCurrentUser();
  // Map accountType to role for consistency
  const userRole = user?.role || user?.accountType || 'franchisee';
  
  const {
    data,
    isLoading,
    error,
    retryCount,
    canRetry,
    refresh,
    retry,
    reset
  } = useAnalyticsData(userRole);

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !data && !canRetry) {
    return (
      <div className="text-center p-8 mb-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load KPIs</h3>
        <p className="text-gray-600 mb-4">Unable to fetch analytics data</p>
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Display sales data as KPI cards
  const kpiData = [
    { name: "Today's Sales", value: salesData.today, change: '+8.2%', trend: 'up' },
    { name: "This Week", value: salesData.thisWeek, change: '+12.5%', trend: 'up' },
    { name: "This Month", value: salesData.thisMonth, change: '+15.3%', trend: 'up' },
    { name: "Monthly Target", value: salesData.target, change: '137%', trend: 'up' }
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Header with error state */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Key Performance Indicators
        </h3>
        <div className="flex items-center space-x-2">
          {retryCount > 0 && (
            <Badge variant="outline" className="text-orange-600">
              Retry {retryCount}/3
            </Badge>
          )}
          {error && canRetry && (
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

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const isPositive = kpi.trend === 'up';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className={error ? 'border-orange-200 bg-orange-50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                <TrendIcon className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={isPositive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {kpi.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error notification */}
      {error && data && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Data may be outdated
              </p>
              <p className="text-xs text-orange-600">
                Showing cached data. {canRetry && "Click retry for latest information."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
