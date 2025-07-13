import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { AnalyticsService, FranchiseUtils } from '@/services/franchise';
import { useToast } from '@/hooks/use-toast';

interface KPI {
  kpi_id: string;
  kpi_nm: string;
  target_value: number;
  unit_of_measure: string;
  actual_value?: number;
  achievement_percentage?: number;
}

interface DashboardMetrics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  salesTrend: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  kpiPerformance: Array<{
    kpi_nm: string;
    target_value: number;
    actual_value: number;
    achievement_percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  franchisorId: string;
  brandId?: string;
  locationId?: string;
}

export function AnalyticsDashboard({ franchisorId, brandId, locationId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30Days');
  const [selectedBrand, setSelectedBrand] = useState(brandId || '');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [franchisorId, selectedBrand, locationId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const dateRanges = FranchiseUtils.getDateRanges();
      const selectedRange = dateRanges[dateRange as keyof typeof dateRanges];
      
      const filter = {
        brandId: selectedBrand || undefined,
        locationId: locationId || undefined,
        dateFrom: selectedRange.from,
        dateTo: selectedRange.to
      };

      const [metricsResult, kpisResult] = await Promise.all([
        AnalyticsService.getDashboardMetrics(filter),
        selectedBrand ? AnalyticsService.getKPIs(selectedBrand) : Promise.resolve({ success: true, data: [] })
      ]);

      if (metricsResult.success) {
        setMetrics(metricsResult.data || null);
      }

      if (kpisResult.success) {
        setKpis(kpisResult.data || []);
      }

    } catch (error) {
      toast({
        title: "Error loading analytics",
        description: "Failed to load dashboard metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const dateRanges = FranchiseUtils.getDateRanges();
      const selectedRange = dateRanges[dateRange as keyof typeof dateRanges];
      
      const filter = {
        brandId: selectedBrand || undefined,
        locationId: locationId || undefined,
        dateFrom: selectedRange.from,
        dateTo: selectedRange.to
      };

      const result = await AnalyticsService.generateReport('sales_summary', filter);
      
      if (result.success) {
        toast({
          title: "Report generated",
          description: "Your analytics report has been generated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate report",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Performance insights and key metrics</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7Days">Last 7 Days</SelectItem>
              <SelectItem value="last30Days">Last 30 Days</SelectItem>
              <SelectItem value="last90Days">Last 90 Days</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {FranchiseUtils.formatCurrency(metrics?.totalSales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {FranchiseUtils.formatCurrency(metrics?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.kpiPerformance?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active KPIs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Performance */}
      {metrics?.kpiPerformance && metrics.kpiPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              KPI Performance
            </CardTitle>
            <CardDescription>Target achievement across key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.kpiPerformance.map((kpi, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{kpi.kpi_nm}</h4>
                      <p className="text-sm text-muted-foreground">
                        Target: {FranchiseUtils.formatCurrency(kpi.target_value)} | 
                        Actual: {FranchiseUtils.formatCurrency(kpi.actual_value)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={kpi.achievement_percentage >= 100 ? "default" : "secondary"}>
                        {kpi.achievement_percentage.toFixed(1)}%
                      </Badge>
                      {kpi.achievement_percentage >= 100 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={Math.min(kpi.achievement_percentage, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Trend */}
      {metrics?.salesTrend && metrics.salesTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Trend
            </CardTitle>
            <CardDescription>Daily sales performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.salesTrend.slice(-7).map((day, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {day.transactions} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{FranchiseUtils.formatCurrency(day.sales)}</div>
                    <div className="text-sm text-muted-foreground">
                      {FranchiseUtils.formatCurrency(day.transactions > 0 ? day.sales / day.transactions : 0)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!metrics || (metrics.totalSales === 0 && metrics.totalTransactions === 0)) && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground mb-4">
              Analytics data will appear here once you have sales transactions
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={loadAnalytics}>
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
