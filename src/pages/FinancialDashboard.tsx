import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialManagement, useFranchisorFinancials } from '@/hooks/useFinancialManagement';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { PageHeaderWithBack } from '@/components/navigation/BackToDashboard';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const FinancialDashboard = () => {
  const { user, role } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedTab, setSelectedTab] = useState('overview');

  const {
    financialDashboard,
    recurringBillings,
    paymentMethods,
    transactions,
    financialMetrics,
    isLoading,
    isRealTimeConnected,
    generateReport,
    isGeneratingReport
  } = useFinancialManagement();

  const {
    networkFinancials,
    totalRevenue: networkRevenue,
    totalRoyalties,
    franchiseCount
  } = useFranchisorFinancials();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-green-600';
      case 'refund':
        return 'text-red-600';
      case 'royalty':
        return 'text-blue-600';
      case 'fee':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PHP') => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleGenerateReport = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    generateReport({ periodStart: startOfMonth, periodEnd: endOfMonth });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Financial Dashboard - FranchiseHub"
        description="Comprehensive financial management and reporting for your franchise operations"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeaderWithBack
          title="Financial Dashboard"
          subtitle="Comprehensive financial management and reporting"
        />

        {/* Real-time Status and Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isRealTimeConnected ? 'Real-time updates active' : 'Offline mode'}
              </span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">Current Quarter</SelectItem>
                <SelectItem value="current_year">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(role === 'franchisor' ? networkRevenue : financialMetrics.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    +12.5% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialMetrics.netProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {financialMetrics.profitMargin.toFixed(1)}% profit margin
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${financialMetrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialMetrics.cashFlow)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {financialMetrics.cashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {role === 'franchisor' ? 'Total Royalties' : 'Upcoming Bills'}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(role === 'franchisor' ? totalRoyalties : financialMetrics.upcomingBillingsAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role === 'franchisor' ? `From ${franchiseCount} franchises` : `${financialMetrics.upcomingBillingsCount} upcoming`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Billings Alert */}
        {financialMetrics.upcomingBillingsCount > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Upcoming Recurring Billings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {recurringBillings?.slice(0, 4).map((billing) => (
                  <div key={billing.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium">{billing.billing_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(billing.amount)} • {billing.frequency}
                      </p>
                      <p className="text-xs text-orange-700">
                        Next: {new Date(billing.next_billing_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={billing.auto_charge ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {billing.auto_charge ? 'Auto' : 'Manual'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                    <p className="text-gray-500">Revenue chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cost of Goods</span>
                      <span className="font-medium">{formatCurrency(financialMetrics.totalExpenses * 0.6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Operating Expenses</span>
                      <span className="font-medium">{formatCurrency(financialMetrics.totalExpenses * 0.3)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing & Fees</span>
                      <span className="font-medium">{formatCurrency(financialMetrics.totalExpenses * 0.1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {financialMetrics.pendingTransactions} Pending
                    </Badge>
                    {financialMetrics.failedTransactions > 0 && (
                      <Badge variant="destructive">
                        {financialMetrics.failedTransactions} Failed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.created_at!).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={getTransactionTypeColor(transaction.transaction_type)}>
                              {transaction.transaction_type}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recurring Billings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Billings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recurringBillings?.map((billing) => (
                      <div key={billing.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{billing.billing_type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(billing.amount)} • {billing.frequency}
                          </p>
                          <p className="text-xs text-gray-500">
                            Next: {new Date(billing.next_billing_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={billing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {billing.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods?.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {method.metadata.brand} •••• {method.metadata.last_four}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expires {method.metadata.exp_month}/{method.metadata.exp_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.is_default && (
                            <Badge variant="outline">Default</Badge>
                          )}
                          <Badge className={method.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {method.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Generate Financial Reports</h3>
                  <p className="text-gray-600 mb-6">
                    Create comprehensive financial reports for any time period
                  </p>
                  <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                    {isGeneratingReport ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Generate Current Month Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinancialDashboard;
