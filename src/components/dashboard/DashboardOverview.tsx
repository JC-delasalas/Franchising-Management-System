import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { useDashboardSummary, useInventoryAnalytics, useLowStockItems } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';

export const DashboardOverview: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryAnalytics();
  const { data: lowStockItems, isLoading: lowStockLoading } = useLowStockItems();

  if (dashboardLoading || inventoryLoading || lowStockLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const summary = dashboardData?.data;
  const inventory = inventoryData?.data;
  const lowStock = lowStockItems?.data;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userProfile?.first_nm || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your franchise network today.
          </p>
        </div>
        <Badge variant={userProfile?.status === 'active' ? 'default' : 'secondary'}>
          {userProfile?.status || 'Unknown'}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.revenueGrowth && summary.revenueGrowth > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{summary.revenueGrowth.toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {summary?.revenueGrowth?.toFixed(1) || '0'}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalTransactions?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${summary?.averageOrderValue?.toFixed(2) || '0'} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory?.totalItems?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Value: ${inventory?.totalValue?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventory?.lowStockItems || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending orders: {inventory?.pendingOrders || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Alert */}
      {lowStock && lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-orange-700">
              The following items are running low and need restocking:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.inventory_id} className="flex justify-between items-center">
                  <span className="font-medium">
                    {(item.product as any)?.product_nm || 'Unknown Product'}
                  </span>
                  <div className="text-right">
                    <span className="text-sm text-orange-600">
                      {item.current_stock} / {item.min_stock_level} min
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {(item.location as any)?.location_nm || 'Unknown Location'}
                    </div>
                  </div>
                </div>
              ))}
              {lowStock.length > 5 && (
                <p className="text-sm text-orange-600 mt-2">
                  +{lowStock.length - 5} more items need attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Locations */}
      {summary?.topPerformingLocations && summary.topPerformingLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Locations</CardTitle>
            <CardDescription>
              Revenue leaders for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topPerformingLocations.slice(0, 5).map((location: any, index: number) => (
                <div key={location.location_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{location.location_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.transaction_count} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${location.total_revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: ${(location.total_revenue / location.transaction_count).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Summary */}
      {summary?.kpiSummary && summary.kpiSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>
              Current month performance vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.kpiSummary.map((kpi: any) => (
                <div key={kpi.kpi_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{kpi.kpi_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: {kpi.target_value}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{kpi.current_value}</p>
                    <Badge 
                      variant={kpi.achievement_percentage >= 100 ? 'default' : 
                               kpi.achievement_percentage >= 80 ? 'secondary' : 'destructive'}
                    >
                      {kpi.achievement_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
