
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useKPIMetrics } from '@/hooks/useKPIMetrics';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface KPICardsProps {
  locationId?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ locationId }) => {
  const { user, role } = useAuth();

  // Get the location ID from props or user's first location
  const effectiveLocationId = locationId || user?.metadata?.primary_location_id;

  // Use real database-driven KPI metrics
  const { data: kpiData, isLoading, error, refetch } = useKPIMetrics(effectiveLocationId);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center p-8 mb-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load KPIs</h3>
        <p className="text-gray-600 mb-4">Unable to fetch analytics data</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // Create KPI cards from real database data
  const salesChange = kpiData?.salesChange || 0;
  const kpiCards = [
    {
      name: "Today's Sales",
      value: formatCurrency(kpiData?.todaySales || 0),
      change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      trend: salesChange >= 0 ? 'up' : 'down',
      icon: DollarSign
    },
    {
      name: "This Week",
      value: formatCurrency(kpiData?.weekSales || 0),
      change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      trend: salesChange >= 0 ? 'up' : 'down',
      icon: TrendingUp
    },
    {
      name: "This Month",
      value: formatCurrency(kpiData?.monthSales || 0),
      change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      trend: salesChange >= 0 ? 'up' : 'down',
      icon: BarChart3
    },
    {
      name: "Orders",
      value: kpiData?.orderCount?.toString() || '0',
      change: `Avg: ${formatCurrency(kpiData?.avgOrderValue || 0)}`,
      trend: 'neutral',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Key Performance Indicators
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const isPositive = kpi.trend === 'up';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const IconComponent = kpi.icon;

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
};
