import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Settings,
  FileText,
  GraduationCap,
  MapPin,
  Target,
  Zap,
  Building2,
  ShoppingCart,
  UserCheck,
  Calendar
} from 'lucide-react';
import { 
  useDashboardSummary, 
  useInventoryAnalytics, 
  useFranchiseePipeline,
  useFinancialDashboard,
  useTrainingAnalytics,
  useCustomerSegmentation,
  useBrands
} from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const FranchisorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryAnalytics();
  const { data: pipelineData, isLoading: pipelineLoading } = useFranchiseePipeline();
  const { data: financialData, isLoading: financialLoading } = useFinancialDashboard();
  const { data: trainingData, isLoading: trainingLoading } = useTrainingAnalytics();
  const { data: customerData, isLoading: customerLoading } = useCustomerSegmentation();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();

  const isLoading = dashboardLoading || inventoryLoading || pipelineLoading || 
                   financialLoading || trainingLoading || customerLoading || brandsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Franchisor Command Center
              </h1>
              <p className="text-muted-foreground">
                Complete franchise network management and growth platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Quick Actions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Training
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData?.data?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MRR: ${financialData?.data?.monthlyRecurringRevenue?.toLocaleString() || '0'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Franchisees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pipelineData?.data?.by_status?.active || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pipeline: {pipelineData?.data?.conversion_metrics?.total_applications || '0'} applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Brand Portfolio</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {brandsData?.data?.length || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active brands in network
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">
                    Uptime this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Franchisee
                  </CardTitle>
                  <CardDescription>
                    Onboard a new franchise partner
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Create New Brand
                  </CardTitle>
                  <CardDescription>
                    Launch a new franchise concept
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Add Products
                  </CardTitle>
                  <CardDescription>
                    Expand your product catalog
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Create Training
                  </CardTitle>
                  <CardDescription>
                    Develop new training modules
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Generate Reports
                  </CardTitle>
                  <CardDescription>
                    Create performance reports
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure franchise settings
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Critical Alerts */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Low Stock Items</span>
                    <Badge variant="destructive">{inventoryData?.data?.lowStockItems || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Overdue Invoices</span>
                    <Badge variant="destructive">{financialData?.data?.outstandingInvoices || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Applications</span>
                    <Badge variant="secondary">{pipelineData?.data?.by_onboarding_stage?.under_review || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Training Overdue</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Management Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Franchisee Pipeline</CardTitle>
                  <CardDescription>Application and onboarding status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(pipelineData?.data?.by_onboarding_stage || {}).map(([stage, count]) => (
                      <div key={stage} className="flex justify-between items-center">
                        <span className="capitalize">{stage.replace('_', ' ')}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                  <CardDescription>Key performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <Badge variant="default">
                        {pipelineData?.data?.conversion_metrics?.conversion_rate?.toFixed(1) || '0'}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Revenue per Franchisee</span>
                      <Badge variant="outline">$12,500</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Network Satisfaction</span>
                      <Badge variant="default">4.7/5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add other tab contents here... */}
          <TabsContent value="brands">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Brand Management</h3>
              <p className="text-muted-foreground">Manage your franchise brands and product catalogs</p>
            </div>
          </TabsContent>

          <TabsContent value="operations">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Operations Center</h3>
              <p className="text-muted-foreground">Monitor inventory, supply chain, and operational metrics</p>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Financial Management</h3>
              <p className="text-muted-foreground">Track revenue, manage billing, and analyze financial performance</p>
            </div>
          </TabsContent>

          <TabsContent value="growth">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Growth Analytics</h3>
              <p className="text-muted-foreground">Analyze growth trends and expansion opportunities</p>
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Training & Development</h3>
              <p className="text-muted-foreground">Manage training programs and track completion rates</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
