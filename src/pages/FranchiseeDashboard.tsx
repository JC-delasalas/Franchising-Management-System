
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatAssistant from '@/components/ChatAssistant';
import FranchiseeAnalytics from '@/components/analytics/FranchiseeAnalytics';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { KPICards } from '@/components/dashboard/KPICards';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import {
  Bell,
  PlusCircle,
  ArrowUp,
  BarChart3,
  TrendingUp,
  Upload,
  Package,
  ImageIcon,
  FileText,
  Award,
  ShoppingCart,
  Download,
  BookOpen
} from 'lucide-react';

const FranchiseeDashboard = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const salesData = {
    today: '₱45,250',
    thisWeek: '₱342,100',
    thisMonth: '₱1,370,000',
    target: '₱1,000,000'
  };

  const inventoryItems = [
    { name: 'Siomai Mix', stock: 45, unit: 'pcs', reorderLevel: 20, status: 'Good' },
    { name: 'Sauce Packets', stock: 12, unit: 'boxes', reorderLevel: 15, status: 'Low' },
    { name: 'Disposable Containers', stock: 156, unit: 'pcs', reorderLevel: 50, status: 'Good' },
    { name: 'Paper Bags', stock: 8, unit: 'bundles', reorderLevel: 10, status: 'Critical' }
  ];

  const notices = [
    { title: 'New Product Launch', message: 'Introducing Spicy Siomai variant - now available for order!', date: '2024-01-15', type: 'info' },
    { title: 'Training Reminder', message: 'Monthly compliance training due by January 20th', date: '2024-01-14', type: 'warning' },
    { title: 'Promotion Update', message: 'Valentine\'s Day promo materials now ready for download', date: '2024-01-13', type: 'success' }
  ];

  const milestones = [
    { title: 'Top 10 Sales Performance', progress: 85, reward: 'Certificate + ₱5,000 bonus', status: 'In Progress' },
    { title: 'Perfect Compliance Score', progress: 100, reward: 'Recognition Award', status: 'Achieved' },
    { title: 'Customer Satisfaction Excellence', progress: 67, reward: 'Premium Support Access', status: 'In Progress' }
  ];

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoticeType = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Robert!</h1>
              <p className="text-gray-600">Siomai Shop - Makati Branch (Package B)</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgrade(!showUpgrade)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade Package
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/franchisee/support-requests">
                  <Bell className="w-4 h-4 mr-2" />
                  Support
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/franchisee/sales-upload">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Upload Sales
                </Link>
              </Button>
            </div>
          </div>

          {/* Upgrade Package Banner */}
          <UpgradeBanner showUpgrade={showUpgrade} onClose={() => setShowUpgrade(false)} />

          {/* KPI Cards */}
          <KPICards salesData={salesData} />

          {/* Milestones Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>Achievement Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <Badge className={milestone.status === 'Achieved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {milestone.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">{milestone.progress}% complete</p>
                    <p className="text-xs text-green-600 mt-1">🏆 {milestone.reward}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <TabsList className="grid w-full grid-cols-6 bg-gray-50 rounded-lg p-1 gap-1">
                <TabsTrigger
                  value="analytics"
                  className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Upload Sales</span>
                  <span className="sm:hidden">Sales</span>
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
                  value="marketing"
                  className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Marketing</span>
                  <span className="sm:hidden">Media</span>
                </TabsTrigger>
                <TabsTrigger
                  value="contract"
                  className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Contract</span>
                  <span className="sm:hidden">Docs</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <FranchiseeAnalytics franchiseeName="Siomai Shop - Makati Branch" />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/franchisee/sales-upload">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Today's Sales Report
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/franchisee/inventory-order">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Order Inventory Items
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/franchisee/marketing-assets">
                        <Download className="w-4 h-4 mr-2" />
                        Download Marketing Materials
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link to="/franchisee-training">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Continue Training Modules
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Announcements & Notices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notices.map((notice, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{notice.title}</h4>
                            <Badge className={getNoticeType(notice.type)}>
                              {notice.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notice.message}</p>
                          <p className="text-xs text-gray-500">{notice.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sales Upload Tab */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Daily Sales Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sales Date</label>
                        <Input type="date" defaultValue="2024-01-15" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Sales Amount</label>
                        <Input placeholder="₱ 0.00" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Transactions</label>
                        <Input placeholder="0" type="number" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Sales Sheet</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload Excel file or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">Supported: .xlsx, .xls, .csv</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Submit Report</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inventoryItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.stock} {item.unit} remaining</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStockStatus(item.status)}>
                              {item.status}
                            </Badge>
                            {item.status !== 'Good' && (
                              <Button size="sm" className="ml-2">Order</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Siomai Mix (500pcs)', price: '₱2,500' },
                        { name: 'Sauce Packets (100pcs)', price: '₱450' },
                        { name: 'Disposable Containers (200pcs)', price: '₱1,200' },
                        { name: 'Paper Bags (50 bundles)', price: '₱800' }
                      ].map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.price}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <Button className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Full Catalog
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="marketing">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { category: 'Logos & Branding', items: ['High-res Logo', 'Brand Guidelines', 'Color Palette'] },
                  { category: 'Menu & Pricing', items: ['Current Menu Cards', 'Price Lists', 'Nutritional Info'] },
                  { category: 'Promotional Materials', items: ['Social Media Templates', 'Flyers & Posters', 'Banner Designs'] }
                ].map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{item}</span>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contract">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Franchise Agreement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Package B - Mid Tier</h4>
                      <p className="text-blue-800 text-sm">Investment: ₱120,000</p>
                      <p className="text-blue-700 text-xs mt-2">Agreement Date: January 1, 2024</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Franchise Term:</span>
                        <span className="text-sm font-medium">5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Territory:</span>
                        <span className="text-sm font-medium">Makati CBD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Royalty Rate:</span>
                        <span className="text-sm font-medium">8% monthly</span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Contract
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Package Inclusions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        'Kiosk Setup & Installation',
                        'POS System & Training',
                        'Complete Marketing Kit',
                        '30-Day Launch Support',
                        'Branded Uniforms (5 sets)',
                        'Initial Inventory Package',
                        'Operations Manual',
                        'Territory Protection'
                      ].map((inclusion, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{inclusion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default FranchiseeDashboard;
