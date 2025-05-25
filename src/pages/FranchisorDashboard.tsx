
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, Package, DollarSign, Bell, Search, Filter, Download, Plus } from 'lucide-react';

const mockApplications = [
  { id: 'APP001', name: 'Maria Santos', brand: 'Siomai King', package: 'Package B', status: 'Pending', date: '2024-01-15', phone: '+63 912 345 6789' },
  { id: 'APP002', name: 'Juan Dela Cruz', brand: 'Café Supremo', package: 'Package C', status: 'Approved', date: '2024-01-14', phone: '+63 917 234 5678' },
  { id: 'APP003', name: 'Ana Rodriguez', brand: 'Juicy Lemon', package: 'Package A', status: 'Under Review', date: '2024-01-13', phone: '+63 905 876 5432' },
  { id: 'APP004', name: 'Carlos Mendoza', brand: 'Bite & Go Burgers', package: 'Package D', status: 'Approved', date: '2024-01-12', phone: '+63 922 111 2222' },
  { id: 'APP005', name: 'Lisa Garcia', brand: 'Siomai King', package: 'Package A', status: 'Rejected', date: '2024-01-11', phone: '+63 909 333 4444' }
];

const mockFranchisees = [
  { id: 'FR001', name: 'Robert Kim', brand: 'Siomai King', location: 'Makati', monthlyRevenue: '₱45,000', status: 'Active' },
  { id: 'FR002', name: 'Jennifer Lopez', brand: 'Café Supremo', location: 'BGC', monthlyRevenue: '₱78,000', status: 'Active' },
  { id: 'FR003', name: 'Michael Chen', brand: 'Juicy Lemon', location: 'Ortigas', monthlyRevenue: '₱32,000', status: 'Active' },
  { id: 'FR004', name: 'Sarah Johnson', brand: 'Bite & Go Burgers', location: 'Quezon City', monthlyRevenue: '₱56,000', status: 'Active' }
];

const FranchisorDashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">FranchiseHub</span>
              </div>
              <span className="text-sm text-gray-500">Franchisor Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm">
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
                        <SelectItem value="siomai-king">Siomai King</SelectItem>
                        <SelectItem value="cafe-supremo">Café Supremo</SelectItem>
                        <SelectItem value="juicy-lemon">Juicy Lemon</SelectItem>
                        <SelectItem value="bite-go">Bite & Go Burgers</SelectItem>
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
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
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
                            <Button variant="outline" size="sm">View</Button>
                            <Button size="sm">Process</Button>
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
                        <Button size="sm" variant="outline">
                          Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { brand: 'Siomai King', revenue: '₱980,000', growth: '+15%', color: 'bg-red-500' },
                      { brand: 'Café Supremo', revenue: '₱750,000', growth: '+22%', color: 'bg-amber-600' },
                      { brand: 'Bite & Go Burgers', revenue: '₱560,000', growth: '+18%', color: 'bg-green-500' },
                      { brand: 'Juicy Lemon', revenue: '₱380,000', growth: '+12%', color: 'bg-yellow-500' }
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

          {/* Franchisees Tab */}
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
                    <Button variant="outline" size="sm">
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
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Contact</Button>
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
    </div>
  );
};

export default FranchisorDashboard;
