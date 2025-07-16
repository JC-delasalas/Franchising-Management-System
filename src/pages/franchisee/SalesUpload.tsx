import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { PageHeaderWithBack } from '@/components/navigation/BackToDashboard';
import { useRealTimeSales } from '@/hooks/useRealTimeSales';
import { useAuth } from '@/hooks/useAuth';
import {
  Upload,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const SalesUpload = () => {
  const { user } = useAuth();
  const { salesMetrics, isLoading, uploadSales, isUploading, isRealTimeConnected } = useRealTimeSales();

  const [salesData, setSalesData] = useState({
    sale_date: new Date().toISOString().split('T')[0],
    total_amount: '',
    items_sold: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }],
    payment_method: 'cash' as 'cash' | 'card' | 'digital',
    customer_count: 1,
    notes: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const salesUpload = {
      ...salesData,
      total_amount: parseFloat(salesData.total_amount),
      location_id: user?.metadata?.primary_location_id || '',
      items_sold: salesData.items_sold.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.quantity) * Number(item.unit_price)
      }))
    };

    uploadSales(salesUpload);

    // Reset form on success
    setSalesData({
      sale_date: new Date().toISOString().split('T')[0],
      total_amount: '',
      items_sold: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }],
      payment_method: 'cash',
      customer_count: 1,
      notes: ''
    });
    setUploadedFile(null);
  };

  const addItem = () => {
    setSalesData(prev => ({
      ...prev,
      items_sold: [...prev.items_sold, { product_id: '', product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setSalesData(prev => ({
      ...prev,
      items_sold: prev.items_sold.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setSalesData(prev => ({
      ...prev,
      items_sold: prev.items_sold.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Sales Upload - Franchisee Dashboard"
        description="Upload daily sales reports and track your franchise performance"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeaderWithBack
          title="Sales Upload"
          subtitle="Submit your daily sales reports and track performance"
        />

        {/* Real-time Sales Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₱{salesMetrics?.todaySales?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {isRealTimeConnected ? '🟢 Live data' : '🔴 Offline'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₱{salesMetrics?.weekSales?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesMetrics?.orderCount || 0} orders this week
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₱{salesMetrics?.monthSales?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesMetrics?.salesGrowth ? `${salesMetrics.salesGrowth > 0 ? '+' : ''}${salesMetrics.salesGrowth}%` : '+0%'} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₱{Math.round(salesMetrics?.avgOrderValue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on {salesMetrics?.orderCount || 0} orders
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Daily Sales Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sales Date *</label>
                        <Input 
                          type="date" 
                          value={salesData.date}
                          onChange={(e) => setSalesData({...salesData, date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Sales Amount *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            placeholder="0.00" 
                            type="number"
                            step="0.01"
                            className="pl-10"
                            value={salesData.totalSales}
                            onChange={(e) => setSalesData({...salesData, totalSales: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Transactions *</label>
                        <Input 
                          placeholder="0" 
                          type="number"
                          value={salesData.transactions}
                          onChange={(e) => setSalesData({...salesData, transactions: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Sales Sheet (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {uploadedFile ? uploadedFile.name : 'Click to upload Excel file or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Supported: .xlsx, .xls, .csv (Max 10MB)</p>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                        <Textarea 
                          placeholder="Any special notes about today's sales..."
                          value={salesData.notes}
                          onChange={(e) => setSalesData({...salesData, notes: e.target.value})}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline">Save as Draft</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Reporting Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Submit reports by 11:59 PM daily for accurate tracking</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Include all sales channels (walk-in, delivery, pickup)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Upload detailed sales sheet for better analytics</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Contact support if you need to modify submitted reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {report.amount}
                      </div>
                      <div className="text-xs text-gray-600">
                        {report.transactions} transactions
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report Template
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>This Week's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Sales</span>
                    <span className="font-semibold">₱14,240</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Daily Sales</span>
                    <span className="font-semibold">₱3,560</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="font-semibold">116</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth vs Last Week</span>
                    <span className="font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesUpload;
