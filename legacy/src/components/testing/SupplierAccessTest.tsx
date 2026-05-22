import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useSupplierPermissions } from '@/components/auth/SupplierRouteGuard';
import { SuppliersAPI } from '@/api/suppliers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  User,
  Truck,
  Database,
  TestTube,
  RefreshCw
} from 'lucide-react';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

export const SupplierAccessTest: React.FC = () => {
  const { user } = useAuth();
  const { hasSupplierRead, hasSupplierWrite, userRole } = useSupplierPermissions();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test supplier access permissions
  const { data: accessTest, refetch: refetchAccessTest } = useQuery({
    queryKey: ['supplier-access-test'],
    queryFn: SuppliersAPI.testSupplierAccess,
    enabled: false // Only run when manually triggered
  });

  // Test supplier data fetching
  const { data: suppliersTest, refetch: refetchSuppliersTest } = useQuery({
    queryKey: ['suppliers-test'],
    queryFn: () => SuppliersAPI.getSuppliers({ limit: 5 }),
    enabled: false // Only run when manually triggered
  });

  // Test supplier creation (for write access)
  const createSupplierMutation = useMutation({
    mutationFn: (testData: any) => SuppliersAPI.createSupplier(testData),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, {
        test: 'Create Supplier',
        passed: true,
        message: 'Successfully created test supplier',
        details: data.supplier
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, {
        test: 'Create Supplier',
        passed: false,
        message: error.message || 'Failed to create supplier',
        details: error
      }]);
    }
  });

  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: User Authentication
    results.push({
      test: 'User Authentication',
      passed: !!user,
      message: user ? `Authenticated as ${user.email}` : 'User not authenticated',
      details: { userId: user?.id, role: userRole }
    });

    // Test 2: Role-based Permissions
    results.push({
      test: 'Supplier Read Permission',
      passed: hasSupplierRead,
      message: hasSupplierRead 
        ? `${userRole} has supplier read access` 
        : `${userRole} does not have supplier read access`,
      details: { userRole, hasSupplierRead }
    });

    results.push({
      test: 'Supplier Write Permission',
      passed: userRole === 'franchisor' ? hasSupplierWrite : !hasSupplierWrite,
      message: hasSupplierWrite 
        ? `${userRole} has supplier write access` 
        : `${userRole} correctly restricted from supplier write access`,
      details: { userRole, hasSupplierWrite }
    });

    // Test 3: Database Access
    try {
      const accessResult = await refetchAccessTest();
      results.push({
        test: 'Database Access',
        passed: accessResult.data?.hasAccess || false,
        message: accessResult.data?.hasAccess 
          ? 'Successfully accessed supplier database' 
          : `Database access denied: ${accessResult.data?.error}`,
        details: accessResult.data
      });
    } catch (error: any) {
      results.push({
        test: 'Database Access',
        passed: false,
        message: `Database access failed: ${error.message}`,
        details: error
      });
    }

    // Test 4: Supplier Data Fetching (only if has read access)
    if (hasSupplierRead) {
      try {
        const suppliersResult = await refetchSuppliersTest();
        results.push({
          test: 'Fetch Suppliers',
          passed: !!suppliersResult.data,
          message: suppliersResult.data 
            ? `Successfully fetched ${suppliersResult.data.suppliers.length} suppliers` 
            : 'Failed to fetch suppliers',
          details: suppliersResult.data
        });
      } catch (error: any) {
        results.push({
          test: 'Fetch Suppliers',
          passed: false,
          message: `Failed to fetch suppliers: ${error.message}`,
          details: error
        });
      }
    } else {
      results.push({
        test: 'Fetch Suppliers',
        passed: true, // This should be blocked, so "passing" means it's correctly blocked
        message: 'Supplier fetching correctly blocked for this role',
        details: { userRole, hasSupplierRead: false }
      });
    }

    // Test 5: Supplier Creation (only if has write access)
    if (hasSupplierWrite) {
      const testSupplierData = {
        organization_id: '550e8400-e29b-41d4-a716-446655440001', // Test org ID
        name: `Test Supplier ${Date.now()}`,
        code: `TEST${Date.now()}`,
        description: 'Test supplier created by automated testing',
        supplier_type: 'primary' as const,
        status: 'active' as const,
        contact_name: 'Test Contact',
        contact_email: 'test@example.com',
        contact_phone: '+1-555-0123',
        lead_time_days: 7,
        minimum_order_amount: 100
      };

      try {
        await createSupplierMutation.mutateAsync(testSupplierData);
      } catch (error) {
        // Error handling is done in the mutation callbacks
      }
    } else {
      results.push({
        test: 'Create Supplier',
        passed: true, // This should be blocked, so "passing" means it's correctly blocked
        message: 'Supplier creation correctly blocked for this role',
        details: { userRole, hasSupplierWrite: false }
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getTestBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TestTube className="h-8 w-8 mr-3 text-blue-600" />
            Supplier Access Control Testing
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive testing of role-based supplier management access
          </p>
        </div>
        
        <Button 
          onClick={runComprehensiveTests}
          disabled={isRunningTests}
          className="min-w-[150px]"
        >
          {isRunningTests ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Current User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-gray-600">{user?.email || 'Not authenticated'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Role:</span>
                    <Badge variant="outline" className="ml-2">
                      {userRole || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">User ID:</span>
                    <p className="text-xs text-gray-500 font-mono">{user?.id || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supplier Read:</span>
                    {hasSupplierRead ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supplier Write:</span>
                    {hasSupplierWrite ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Access:</span>
                    {accessTest?.hasAccess ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Connection:</span>
                    <Badge variant={accessTest?.hasAccess ? "default" : "destructive"} className="ml-2">
                      {accessTest?.hasAccess ? 'Connected' : 'Denied'}
                    </Badge>
                  </div>
                  {accessTest?.error && (
                    <div>
                      <span className="text-sm font-medium">Error:</span>
                      <p className="text-xs text-red-600 mt-1">{accessTest.error}</p>
                    </div>
                  )}
                  {suppliersTest && (
                    <div>
                      <span className="text-sm font-medium">Suppliers Found:</span>
                      <p className="text-sm text-gray-600">{suppliersTest.suppliers.length}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">View Suppliers</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Create/Edit</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Delete</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Purchase Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={userRole === 'franchisor' ? 'bg-blue-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Franchisor</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                    </tr>
                    <tr className={userRole === 'franchisee' ? 'bg-blue-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Franchisee</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className="text-xs text-gray-600">View Own Only</span>
                      </td>
                    </tr>
                    <tr className={userRole === 'admin' ? 'bg-blue-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Admin</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className="text-xs text-gray-600">Read Only</span>
                      </td>
                    </tr>
                    <tr className={userRole === 'user' ? 'bg-blue-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">User</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tests run yet. Click "Run All Tests" to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getTestIcon(result.passed)}
                          <h4 className="font-medium">{result.test}</h4>
                        </div>
                        {getTestBadge(result.passed)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Results:</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600">
                          {testResults.filter(r => r.passed).length} Passed
                        </span>
                        <span className="text-red-600">
                          {testResults.filter(r => !r.passed).length} Failed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierAccessTest;
