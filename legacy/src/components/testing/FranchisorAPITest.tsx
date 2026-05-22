import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsAPI } from '@/api/analytics';
import { OrderAPI } from '@/api/orders';
import { FranchiseAPI } from '@/api/franchises';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

export const FranchisorAPITest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const updateTestResult = (name: string, result: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, ...result } : r);
      } else {
        return [...prev, { name, status: 'pending', ...result }];
      }
    });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestResult(name, { status: 'pending' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(name, { 
        status: 'success', 
        data: result, 
        duration 
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(name, { 
        status: 'error', 
        error: error.message, 
        duration 
      });
      throw error;
    }
  };

  const testFranchisorMetrics = async () => {
    return await runTest('Franchisor Metrics', async () => {
      // Mock franchisor user ID - in real app this would come from auth
      const franchisorId = 'cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51';
      const metrics = await AnalyticsAPI.getFranchisorMetrics(franchisorId);
      
      if (!metrics || !metrics.overview) {
        throw new Error('Invalid metrics structure returned');
      }
      
      return {
        total_franchises: metrics.overview.total_franchises,
        active_locations: metrics.overview.active_locations,
        pending_applications: metrics.overview.pending_applications,
        total_revenue: metrics.overview.total_revenue
      };
    });
  };

  const testFranchisorOrders = async () => {
    return await runTest('Franchisor Orders', async () => {
      const franchisorId = 'cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51';
      const orders = await OrderAPI.getOrdersForFranchisor(franchisorId);
      
      if (!Array.isArray(orders)) {
        throw new Error('Orders should be an array');
      }
      
      return {
        total_orders: orders.length,
        sample_order: orders[0] ? {
          id: orders[0].id,
          order_number: orders[0].order_number,
          status: orders[0].status,
          total_amount: orders[0].total_amount
        } : null
      };
    });
  };

  const testPendingOrders = async () => {
    return await runTest('Pending Orders', async () => {
      const pendingOrders = await OrderAPI.getPendingOrders();
      
      if (!Array.isArray(pendingOrders)) {
        throw new Error('Pending orders should be an array');
      }
      
      return {
        pending_count: pendingOrders.length,
        sample_pending: pendingOrders[0] ? {
          id: pendingOrders[0].id,
          order_number: pendingOrders[0].order_number,
          total_amount: pendingOrders[0].total_amount
        } : null
      };
    });
  };

  const testFranchiseApplications = async () => {
    return await runTest('Franchise Applications', async () => {
      const franchisorId = 'cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51';
      const applications = await FranchiseAPI.getApplicationsForFranchisor(franchisorId);
      
      if (!Array.isArray(applications)) {
        throw new Error('Applications should be an array');
      }
      
      return {
        total_applications: applications.length,
        pending_applications: applications.filter(app => app.status === 'pending').length,
        sample_application: applications[0] ? {
          id: applications[0].id,
          status: applications[0].status,
          applicant: applications[0].user_profiles?.full_name
        } : null
      };
    });
  };

  const testFranchiseAnalytics = async () => {
    return await runTest('Franchise Analytics', async () => {
      const analytics = await AnalyticsAPI.getFranchisorAnalytics();

      if (!analytics || !analytics.overview) {
        throw new Error('Invalid analytics structure returned');
      }

      return {
        overview: analytics.overview,
        performance_locations: analytics.performance?.top_performing_locations?.length || 0,
        financial_data: analytics.financial ? 'present' : 'missing'
      };
    });
  };

  const testInventoryManagement = async () => {
    return await runTest('Inventory Management', async () => {
      // Test inventory levels
      const { InventoryAPI } = await import('@/api/inventory');
      const inventory = await InventoryAPI.getInventoryLevels();

      // Test low stock alerts
      const lowStockAlerts = await InventoryAPI.getLowStockAlerts();

      return {
        total_inventory_items: inventory.length,
        low_stock_alerts: lowStockAlerts.length,
        sample_inventory: inventory[0] ? {
          product_name: inventory[0].products?.name,
          quantity: inventory[0].quantity_on_hand,
          reorder_level: inventory[0].reorder_level
        } : null
      };
    });
  };

  const testPaymentMethods = async () => {
    return await runTest('Payment Methods', async () => {
      const { PaymentsAPI } = await import('@/api/payments');
      const paymentMethods = await PaymentsAPI.getPaymentMethods();

      return {
        total_payment_methods: paymentMethods.length,
        payment_types: paymentMethods.map(pm => pm.type),
        sample_method: paymentMethods[0] ? {
          type: paymentMethods[0].type,
          provider: paymentMethods[0].provider,
          is_default: paymentMethods[0].is_default
        } : null
      };
    });
  };

  const testFranchisePackages = async () => {
    return await runTest('Franchise Packages', async () => {
      const franchisorId = 'cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51';
      const packages = await FranchiseAPI.getFranchisePackages(franchisorId);

      return {
        total_packages: packages.length,
        sample_package: packages[0] ? {
          name: packages[0].name,
          initial_fee: packages[0].initial_fee,
          monthly_royalty_rate: packages[0].monthly_royalty_rate
        } : null
      };
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      await testFranchisorMetrics();
      await testFranchisorOrders();
      await testPendingOrders();
      await testFranchiseApplications();
      await testFranchiseAnalytics();
      await testInventoryManagement();
      await testPaymentMethods();
      await testFranchisePackages();

      toast({
        title: "Tests Completed",
        description: "All franchisor API tests have been executed",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Some tests failed. Check results below.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const totalTests = testResults.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Franchisor API Testing</h2>
          <p className="text-gray-600">Test all franchisor functionality with real data</p>
        </div>
        <div className="flex items-center space-x-4">
          {totalTests > 0 && (
            <div className="text-sm">
              <span className="font-medium">{successCount}/{totalTests}</span> tests passed
            </div>
          )}
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="min-w-32"
          >
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {testResults.map((result) => (
          <Card key={result.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {result.duration && (
                    <span className="text-sm text-gray-500">{result.duration}ms</span>
                  )}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {result.status === 'success' && result.data && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              {result.status === 'error' && result.error && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              )}
              {result.status === 'pending' && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Test is running...</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Click "Run All Tests" to start testing franchisor APIs</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
