
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
import Logo from '@/components/Logo';
import { TrendingUp, Users, Package, DollarSign, Bell, Search, Filter, Download, Plus, Check, X, Clock, MessageCircle, AlertTriangle, ArrowLeft, Eye, Mail, Phone } from 'lucide-react';

const mockApplications = [
  { id: 'APP001', name: 'Maria Santos', brand: 'Siomai Shop', package: 'Package B', status: 'Pending', date: '2024-01-15', phone: '+63 912 345 6789', email: 'maria@email.com' },
  { id: 'APP002', name: 'Juan Dela Cruz', brand: 'Coffee Shop', package: 'Package C', status: 'Approved', date: '2024-01-14', phone: '+63 917 234 5678', email: 'juan@email.com' },
  { id: 'APP003', name: 'Ana Rodriguez', brand: 'Lemon Juice Stand', package: 'Package A', status: 'Semi-Approved', date: '2024-01-13', phone: '+63 905 876 5432', email: 'ana@email.com' },
  { id: 'APP004', name: 'Carlos Mendoza', brand: 'Burger & Fries', package: 'Package D', status: 'Approved', date: '2024-01-12', phone: '+63 922 111 2222', email: 'carlos@email.com' },
  { id: 'APP005', name: 'Lisa Garcia', brand: 'Siomai Shop', package: 'Package A', status: 'Rejected', date: '2024-01-11', phone: '+63 909 333 4444', email: 'lisa@email.com' }
];

const mockFranchisees = [
  { id: 'FR001', name: 'Robert Kim', brand: 'Siomai Shop', location: 'Makati', monthlyRevenue: '₱45,000', status: 'Active', lowStock: ['Sauce Packets', 'Paper Bags'] },
  { id: 'FR002', name: 'Jennifer Lopez', brand: 'Coffee Shop', location: 'BGC', monthlyRevenue: '₱78,000', status: 'Active', lowStock: [] },
  { id: 'FR003', name: 'Michael Chen', brand: 'Lemon Juice Stand', location: 'Ortigas', monthlyRevenue: '₱32,000', status: 'Active', lowStock: ['Lemon Concentrate'] },
  { id: 'FR004', name: 'Sarah Johnson', brand: 'Burger & Fries', location: 'Quezon City', monthlyRevenue: '₱56,000', status: 'Active', lowStock: ['Burger Patties'] }
];

const FranchisorDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

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
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Franchisees</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Franchisees</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱2.4M</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
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
            <div className="grid md:grid-cols-2 gap-4">
              {mockFranchisees.filter(f => f.lowStock.length > 0).map((franchisee, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium">{franchisee.name}</p>
                    <p className="text-sm text-gray-600">{franchisee.brand} - {franchisee.location}</p>
                    <p className="text-xs text-orange-700">Low: {franchisee.lowStock.join(', ')}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendLowStockNotification(franchisee)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Notify
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="franchisees">Franchisees</TabsTrigger>
          </TabsList>

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
                    ].map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="font-medium text-red-900">{alert.item}</p>
                          <p className="text-sm text-red-700">{alert.brand}</p>
                          <p className="text-xs text-red-600">Current: {alert.stock}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Reordering ${alert.item} for ${alert.brand}`)}
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
                    {mockFranchisees.map((franchisee) => (
                      <TableRow key={franchisee.id}>
                        <TableCell className="font-medium">{franchisee.id}</TableCell>
                        <TableCell>{franchisee.name}</TableCell>
                        <TableCell>{franchisee.brand}</TableCell>
                        <TableCell>{franchisee.location}</TableCell>
                        <TableCell className="font-medium text-green-600">{franchisee.monthlyRevenue}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(franchisee.status)}>
                            {franchisee.status}
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
                                  <DialogTitle>Franchisee Details - {franchisee.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Name</label>
                                      <p className="text-gray-900">{franchisee.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Brand</label>
                                      <p className="text-gray-900">{franchisee.brand}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Location</label>
                                      <p className="text-gray-900">{franchisee.location}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Monthly Revenue</label>
                                      <p className="text-green-600 font-medium">{franchisee.monthlyRevenue}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Status</label>
                                      <Badge className={getStatusColor(franchisee.status)}>{franchisee.status}</Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Low Stock Items</label>
                                      <p className="text-gray-900">
                                        {franchisee.lowStock.length > 0 ? franchisee.lowStock.join(', ') : 'None'}
                                      </p>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Chat with our assistant"
          onClick={() => alert('Chat assistant feature coming soon!')}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default FranchisorDashboard;
