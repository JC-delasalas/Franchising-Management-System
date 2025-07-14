import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  ShoppingBag, 
  TrendingUp, 
  Settings, 
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  totalUsers: number;
  totalFranchisors: number;
  totalBrands: number;
  totalFranchisees: number;
  totalLocations: number;
  pendingApplications: number;
  activeOnboarding: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'application_submitted' | 'onboarding_completed' | 'system_alert';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminPortal: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalFranchisors: 0,
    totalBrands: 0,
    totalFranchisees: 0,
    totalLocations: 0,
    pendingApplications: 0,
    activeOnboarding: 0,
    systemHealth: 'healthy'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load system statistics
      const [
        usersResult,
        franchisorsResult,
        brandsResult,
        franchiseesResult,
        locationsResult,
        applicationsResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('user_id', { count: 'exact' }),
        supabase.from('franchisor').select('franchisor_id', { count: 'exact' }),
        supabase.from('brand').select('brand_id', { count: 'exact' }),
        supabase.from('franchisee').select('franchisee_id', { count: 'exact' }),
        supabase.from('location').select('location_id', { count: 'exact' }),
        supabase.from('franchise_application').select('application_id, status', { count: 'exact' })
      ]);

      const pendingApps = applicationsResult.data?.filter(app => app.status === 'pending').length || 0;
      const onboardingApps = applicationsResult.data?.filter(app => app.status === 'onboarding').length || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalFranchisors: franchisorsResult.count || 0,
        totalBrands: brandsResult.count || 0,
        totalFranchisees: franchiseesResult.count || 0,
        totalLocations: locationsResult.count || 0,
        pendingApplications: pendingApps,
        activeOnboarding: onboardingApps,
        systemHealth: 'healthy'
      });

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered: john.doe@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'application_submitted',
          description: 'New franchise application submitted for Coffee Masters',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'onboarding_completed',
          description: 'Franchisee onboarding completed: Manila Branch',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'system_alert',
          description: 'Database backup completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          status: 'success'
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4" />;
      case 'application_submitted':
        return <FileText className="h-4 w-4" />;
      case 'onboarding_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const runSystemMaintenance = async () => {
    try {
      toast({
        title: "System Maintenance",
        description: "Running system maintenance tasks...",
      });

      // Simulate maintenance tasks
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: "System maintenance completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "System maintenance failed",
        variant: "destructive"
      });
    }
  };

  const exportSystemData = async () => {
    try {
      toast({
        title: "Data Export",
        description: "Preparing system data export...",
      });

      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "System data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Data export failed",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <div className="flex items-center gap-2">
          <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
            System {stats.systemHealth}
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Franchisors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFranchisors}</div>
            <p className="text-xs text-muted-foreground">{stats.totalBrands} brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Franchisees</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFranchisees}</div>
            <p className="text-xs text-muted-foreground">{stats.totalLocations} locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications + stats.activeOnboarding}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApplications} applications, {stats.activeOnboarding} onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={runSystemMaintenance}>
                  <Settings className="h-4 w-4 mr-2" />
                  Run System Maintenance
                </Button>
                
                <Button variant="outline" className="w-full" onClick={exportSystemData}>
                  <Database className="h-4 w-4 mr-2" />
                  Export System Data
                </Button>
                
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate System Report
                </Button>
                
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  Role Management
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  User Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
              <CardDescription>System configuration and maintenance tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Database Status
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Run Database Backup
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Optimize Database
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      System Diagnostics
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Performance Monitor
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Error Logs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Generate and download system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  User Activity Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  System Performance
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Database Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Building2 className="h-6 w-6 mb-2" />
                  Franchise Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  Sales Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Security Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPortal;
