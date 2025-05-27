import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
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
  const [salesData, setSalesData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalSales: '',
    transactions: '',
    notes: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recentReports = [
    { date: '2024-01-14', amount: '₱3,450', status: 'Approved', transactions: 28 },
    { date: '2024-01-13', amount: '₱2,890', status: 'Approved', transactions: 22 },
    { date: '2024-01-12', amount: '₱4,120', status: 'Pending', transactions: 35 },
    { date: '2024-01-11', amount: '₱3,780', status: 'Approved', transactions: 31 }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Sales report submitted successfully!');
    setIsSubmitting(false);
    
    // Reset form
    setSalesData({
      date: new Date().toISOString().split('T')[0],
      totalSales: '',
      transactions: '',
      notes: ''
    });
    setUploadedFile(null);
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
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link to="/franchisee-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Upload</h1>
          <p className="text-gray-600">Submit your daily sales reports and track performance</p>
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
