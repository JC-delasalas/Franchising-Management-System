import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FranchiseAPI } from '@/api/franchises';
import { AnalyticsAPI } from '@/api/analytics';
import Logo from '@/components/Logo';
import ChatAssistant from '@/components/ChatAssistant';
import KPICharts from '@/components/analytics/KPICharts';
import { IAMDashboard } from '@/components/iam/IAMDashboard';
import { TrendingUp, Users, Package, DollarSign, Bell, Search, Filter, Download, Plus, Check, X, Clock, MessageCircle, AlertTriangle, ArrowLeft, Eye, Mail, Phone, BarChart3, Shield, RefreshCw, CheckCircle } from 'lucide-react';

const FranchisorDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Temporary fallback for missing mockFranchisees - will be removed when fully integrated
  const mockFranchisees = [];

  // Fetch franchisor analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['franchisor-analytics'],
    queryFn: AnalyticsAPI.getFranchisorAnalytics,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Fetch all franchises owned by this user
  const { data: franchises, isLoading: franchisesLoading } = useQuery({
    queryKey: ['franchises', user?.id],
    queryFn: () => FranchiseAPI.getFranchisesByOwner(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch pending applications across all franchises
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['pending-applications'],
    queryFn: async () => {
      if (!franchises) return [];
      const allApplications = await Promise.all(
        franchises.map(franchise =>
          FranchiseAPI.getApplicationsForFranchise(franchise.id)
        )
      );
      return allApplications.flat();
    },
    enabled: !!franchises,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch franchise locations with franchisee data
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['franchise-locations'],
    queryFn: () => FranchiseAPI.getFranchiseLocations(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch all franchisees for the masterlist
  const { data: franchisees, isLoading: franchiseesLoading } = useQuery({
    queryKey: ['all-franchisees', user?.id],
    queryFn: async () => {
      if (!franchises) return [];
      const allLocations = await Promise.all(
        franchises.map(franchise =>
          FranchiseAPI.getFranchiseLocations(franchise.id)
        )
      );
      return allLocations.flat();
    },
    enabled: !!franchises,
    staleTime: 5 * 60 * 1000,
  });

  // Get low stock alerts
  const { data: lowStockAlerts, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock-alerts', user?.id],
    queryFn: async () => {
      if (!franchisees) return [];
      // This would typically come from an inventory API
      // For now, return empty array until inventory system is fully implemented
      return [];
    },
    enabled: !!franchisees,
    staleTime: 2 * 60 * 1000,
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, updates }: { applicationId: string; updates: any }) =>
      FranchiseAPI.updateApplicationStatus(applicationId, updates),
    onSuccess: () => {
      toast({
        title: "Application Updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
      setSelectedApplication(null);
      setActionType('');
      setActionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Semi-Approved': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplicationAction = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
  };

  const confirmApplicationAction = () => {
    console.log(`${actionType} application ${selectedApplication.id}:`, actionReason);
    setSelectedApplication(null);
    setActionType('');
    setActionReason('');
  };

  const sendLowStockNotification = (franchisee) => {
    console.log(`Sending low stock notification to ${franchisee.name} for items:`, franchisee.lowStock);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="text-gray-900 hover:text-gray-700">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Logo size="md" />
              <span className="text-sm text-gray-500">Franchisor Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Notifications feature coming soon!')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                size="sm"
                onClick={() => alert('New announcement feature coming soon!')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications Received</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{applications?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total pending applications</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Franchises</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {franchisesLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{franchises?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total active franchises</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{locations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total franchise locations</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ₱{analytics?.totalRevenue ? (analytics.totalRevenue / 1000000).toFixed(1) + 'M' : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.revenueGrowth ? `+${analytics.revenueGrowth}%` : '+0%'} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Franchisees with Low Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-orange-200">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : lowStockAlerts && lowStockAlerts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {lowStockAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium">{alert.franchisee_name}</p>
                      <p className="text-sm text-gray-600">{alert.brand} - {alert.location}</p>
                      <p className="text-xs text-orange-700">Low: {alert.low_stock_items?.join(', ')}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendLowStockNotification(alert)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Notify
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No low stock alerts at this time</p>
                <p className="text-sm text-gray-500">All franchisees have adequate inventory levels</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <TabsList className="grid w-full grid-cols-7 bg-gray-50 rounded-lg p-1 gap-1">
              <TabsTrigger
                value="analytics"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Applications</span>
                <span className="sm:hidden">Apps</span>
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Inventory</span>
                <span className="sm:hidden">Stock</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Orders</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Revenue</span>
                <span className="sm:hidden">Money</span>
              </TabsTrigger>
              <TabsTrigger
                value="franchisees"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Franchisees</span>
                <span className="sm:hidden">Partners</span>
              </TabsTrigger>
              <TabsTrigger
                value="iam"
                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Access Control</span>
                <span className="sm:hidden">IAM</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <KPICharts userType="franchisor" />
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Franchise Applications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Search applications..." className="pl-10 w-64" />
                    </div>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        <SelectItem value="siomai-shop">Siomai Shop</SelectItem>
                        <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
                        <SelectItem value="lemon-juice-stand">Lemon Juice Stand</SelectItem>
                        <SelectItem value="burger-fries">Burger & Fries</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="semi-approved">Semi-Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Export functionality coming soon!')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.id}</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.brand}</TableCell>
                        <TableCell>{app.package}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Application Details - {app.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Name</label>
                                      <p className="text-gray-900">{app.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Brand</label>
                                      <p className="text-gray-900">{app.brand}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Package</label>
                                      <p className="text-gray-900">{app.package}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Status</label>
                                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Phone</label>
                                      <p className="text-gray-900">{app.phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Email</label>
                                      <p className="text-gray-900">{app.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" asChild>
                                      <a href={`tel:${app.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call
                                      </a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                      <a href={`mailto:${app.email}`}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {app.status === 'Pending' && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApplicationAction(app, 'approve')}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Approve Application</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>Are you sure you want to approve {app.name}'s application?</p>
                                      <Textarea
                                        placeholder="Add approval notes (optional)"
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={confirmApplicationAction}>Confirm Approval</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                      onClick={() => handleApplicationAction(app, 'semi-approve')}
                                    >
                                      <Clock className="w-3 h-3 mr-1" />
                                      Semi-Approve
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Semi-Approve Application</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>What additional requirements does {app.name} need to complete?</p>
                                      <Textarea
                                        placeholder="List additional requirements..."
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={confirmApplicationAction}>Send Requirements</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                      onClick={() => handleApplicationAction(app, 'reject')}
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Application</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>Please provide a reason for rejecting {app.name}'s application:</p>
                                      <Textarea
                                        placeholder="Rejection reason..."
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button variant="destructive" onClick={confirmApplicationAction}>Confirm Rejection</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { franchisee: 'Robert Kim', items: 'Siomai Mix (500pcs)', status: 'Pending', date: '2024-01-15' },
                      { franchisee: 'Jennifer Lopez', items: 'Coffee Beans (10kg)', status: 'Shipped', date: '2024-01-14' },
                      { franchisee: 'Michael Chen', items: 'Lemon Syrup (20L)', status: 'Processing', date: '2024-01-13' }
                    ].map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{request.franchisee}</p>
                          <p className="text-sm text-gray-600">{request.items}</p>
                          <p className="text-xs text-gray-500">{request.date}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { item: 'Siomai Mix', brand: 'Siomai King', stock: '120 units', threshold: '< 150' },
                      { item: 'Burger Patties', brand: 'Bite & Go', stock: '85 units', threshold: '< 100' },
                      { item: 'Lemon Concentrate', brand: 'Juicy Lemon', stock: '45 units', threshold: '< 50' }
                    ].map((stockAlert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-medium text-red-900">{stockAlert.item}</p>
                          <p className="text-sm text-red-700">{stockAlert.brand}</p>
                          <p className="text-xs text-red-600">Current: {stockAlert.stock}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Reordering ${stockAlert.item} for ${stockAlert.brand}`)}
                        >
                          Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { brand: 'Siomai Shop', revenue: '₱980,000', growth: '+15%', color: 'bg-red-500' },
                      { brand: 'Coffee Shop', revenue: '₱750,000', growth: '+22%', color: 'bg-amber-600' },
                      { brand: 'Burger & Fries', revenue: '₱560,000', growth: '+18%', color: 'bg-green-500' },
                      { brand: 'Lemon Juice Stand', revenue: '₱380,000', growth: '+12%', color: 'bg-yellow-500' }
                    ].map((brand, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${brand.color}`}></div>
                          <div>
                            <p className="font-medium">{brand.brand}</p>
                            <p className="text-sm text-gray-600">{brand.revenue}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {brand.growth}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Royalty Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: 'January 2024', collected: '₱245,000', pending: '₱15,000', rate: '94%' },
                      { month: 'December 2023', collected: '₱238,000', pending: '₱8,000', rate: '97%' },
                      { month: 'November 2023', collected: '₱225,000', pending: '₱12,000', rate: '95%' }
                    ].map((month, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{month.month}</p>
                          <Badge className="bg-blue-100 text-blue-800">{month.rate}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Collected: </span>
                            <span className="font-medium text-green-600">{month.collected}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending: </span>
                            <span className="font-medium text-red-600">{month.pending}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="franchisees">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Franchisee Masterlist</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Search franchisees..." className="pl-10 w-64" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Franchisee export functionality coming soon!')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Franchisee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franchiseesLoading && (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    )}
                    {!franchiseesLoading && franchisees && franchisees.length > 0 && (
                      franchisees.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.id.slice(0, 8)}</TableCell>
                          <TableCell>{location.user_profiles?.full_name || 'N/A'}</TableCell>
                          <TableCell>{location.franchises?.name || 'N/A'}</TableCell>
                          <TableCell>{location.address || 'N/A'}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            ₱{location.monthly_revenue ? (location.monthly_revenue / 1000).toFixed(0) + 'K' : '0'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(location.status || 'Active')}>
                              {location.status || 'Active'}
                            </Badge>
                          </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Franchisee Details - {location.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Name</label>
                                      <p className="text-gray-900">{location.user_profiles?.full_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Brand</label>
                                      <p className="text-gray-900">{location.franchises?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Location</label>
                                      <p className="text-gray-900">{location.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Monthly Revenue</label>
                                      <p className="text-green-600 font-medium">
                                        ₱{location.monthly_revenue ? (location.monthly_revenue / 1000).toFixed(0) + 'K' : '0'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Status</label>
                                      <Badge className={getStatusColor(location.status || 'Active')}>
                                        {location.status || 'Active'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Contact</label>
                                      <p className="text-gray-900">{location.user_profiles?.email || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" asChild>
                                      <Link to="/franchisee-dashboard">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Dashboard
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <Link to="/contact">
                                <Mail className="w-4 h-4 mr-1" />
                                Contact
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                    {!franchiseesLoading && (!franchisees || franchisees.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No franchisees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Order Management</h2>
                <Link to="/order-approvals">
                  <Button>
                    <Clock className="w-4 h-4 mr-2" />
                    View All Pending Orders
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Approved Today</p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold">₱0</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Order Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent order activity</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Orders requiring approval will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New IAM Tab */}
          <TabsContent value="iam">
            <IAMDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default FranchisorDashboard;
