
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Calendar,
  Upload,
  Download,
  ShoppingCart,
  Bell,
  BookOpen,
  Phone,
  FileText,
  Image as ImageIcon,
  PlusCircle,
  ArrowUp,
  Award,
  MessageCircle
} from 'lucide-react';

const FranchiseeDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('January 2024');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const salesData = {
    today: '₱3,250',
    thisWeek: '₱22,100',
    thisMonth: '₱67,500',
    target: '₱75,000'
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
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <span className="text-2xl">🏪</span>
              <span className="text-xl font-bold text-gray-900">FranchiseHub</span>
            </div>
            
            <nav className="space-y-2">
              <a href="#overview" className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
                <span>Overview</span>
              </a>
              <a href="#sales" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <DollarSign className="w-5 h-5" />
                <span>Upload Sales</span>
              </a>
              <a href="#inventory" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Package className="w-5 h-5" />
                <span>Order Inventory</span>
              </a>
              <a href="#marketing" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <ImageIcon className="w-5 h-5" />
                <span>Marketing Assets</span>
              </a>
              <a href="#contract" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <FileText className="w-5 h-5" />
                <span>Contract & Package</span>
              </a>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4">
                <Link to="/franchisee-training">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Training
                </Link>
              </Button>
              <a href="#support" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Phone className="w-5 h-5" />
                <span>Support & Requests</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Robert!</h1>
              <p className="text-gray-600">Siomai King - Makati Branch (Package B)</p>
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
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>

          {/* Upgrade Package Banner */}
          {showUpgrade && (
            <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Upgrade to Package C - Advanced</h3>
                    <p className="text-purple-700">Get Food Stall setup + POS System + Uniforms for just ₱130,000 more!</p>
                    <ul className="text-sm text-purple-600 mt-2">
                      <li>• Larger territory rights</li>
                      <li>• Advanced POS integration</li>
                      <li>• Priority customer support</li>
                    </ul>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowUpgrade(false)}>
                      Maybe Later
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{salesData.today}</div>
                <p className="text-xs text-muted-foreground">+15% from yesterday</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.thisWeek}</div>
                <p className="text-xs text-muted-foreground">+8% from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.thisMonth}</div>
                <p className="text-xs text-muted-foreground">Target: {salesData.target}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">2 Low</div>
                <p className="text-xs text-muted-foreground">Items need reordering</p>
              </CardContent>
            </Card>
          </div>

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
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Upload Sales</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Today's Sales Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order Inventory Items
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Marketing Materials
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
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Chat with our assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default FranchiseeDashboard;
