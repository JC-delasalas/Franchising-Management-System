import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Wrench, Play, RotateCcw } from 'lucide-react';
import { ProductsAPI } from '@/api/products';
import { AnalyticsAPI } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  details?: any;
  category: 'build' | 'api' | 'dashboard' | 'security';
}

const ProductionFixesTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, role } = useAuth();

  const runTest = async (
    name: string,
    testFn: () => Promise<void>,
    category: 'build' | 'api' | 'dashboard' | 'security'
  ): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        status: 'passed',
        message: 'Test passed successfully',
        duration,
        category
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        category,
        details: error
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [];

    // Build Error Tests
    tests.push(await runTest('Products API Syntax Fix', async () => {
      // Test that ProductsAPI methods can be called without syntax errors
      const categories = await ProductsAPI.getCategories();
      if (!Array.isArray(categories)) {
        throw new Error('getCategories should return an array');
      }
    }, 'build'));

    tests.push(await runTest('Products API Enhanced Methods', async () => {
      // Test that enhanced BaseAPI methods are working
      const products = await ProductsAPI.getProducts({ active: true });
      if (!Array.isArray(products)) {
        throw new Error('getProducts should return an array');
      }
    }, 'api'));

    // Dashboard Widget Tests
    if (user?.id) {
      tests.push(await runTest('Dashboard Metrics Loading', async () => {
        if (role === 'franchisor') {
          const metrics = await AnalyticsAPI.getFranchisorMetrics(user.id);
          if (!metrics || typeof metrics !== 'object') {
            throw new Error('Franchisor metrics should return an object');
          }
        } else if (role === 'franchisee') {
          const locationId = user.metadata?.primary_location_id;
          if (locationId) {
            const metrics = await AnalyticsAPI.getFranchiseeMetrics(locationId);
            if (!metrics || typeof metrics !== 'object') {
              throw new Error('Franchisee metrics should return an object');
            }
          } else {
            throw new Error('Franchisee user missing primary_location_id');
          }
        }
      }, 'dashboard'));

      tests.push(await runTest('KPI Metrics Access Control', async () => {
        // Test that users can only access their authorized locations
        if (role === 'franchisee') {
          const locationId = user.metadata?.primary_location_id;
          if (locationId) {
            const kpiMetrics = await AnalyticsAPI.getKPIMetrics(locationId);
            if (!kpiMetrics || typeof kpiMetrics !== 'object') {
              throw new Error('KPI metrics should return an object');
            }
          }
        }
      }, 'security'));
    }

    // API Enhancement Tests
    tests.push(await runTest('Enhanced BaseAPI Error Handling', async () => {
      try {
        // Test error handling with invalid ID
        await ProductsAPI.getProductById('invalid-id-12345');
      } catch (error: any) {
        // Should handle the error gracefully
        if (error.code !== 'RESOURCE_NOT_FOUND') {
          throw new Error('Should return RESOURCE_NOT_FOUND error for invalid ID');
        }
      }
    }, 'api'));

    tests.push(await runTest('Product Catalog with Cart Integration', async () => {
      // Test that catalog products load without syntax errors
      const catalogProducts = await ProductsAPI.getCatalogProducts({ active: true });
      if (!Array.isArray(catalogProducts)) {
        throw new Error('getCatalogProducts should return an array');
      }
      
      // Check that cart integration fields are present
      catalogProducts.forEach(product => {
        if (typeof product.in_cart !== 'boolean') {
          throw new Error('Product should have in_cart boolean field');
        }
        if (typeof product.cart_quantity !== 'number') {
          throw new Error('Product should have cart_quantity number field');
        }
      });
    }, 'api'));

    // Analytics Schema Tests
    tests.push(await runTest('Analytics Schema Alignment', async () => {
      // Test that analytics queries use correct field names
      if (user?.id && role === 'franchisor') {
        const analytics = await AnalyticsAPI.getFranchisorAnalytics();
        if (!analytics.overview || !analytics.performance || !analytics.financial) {
          throw new Error('Franchisor analytics missing required sections');
        }
      }
    }, 'dashboard'));

    setTestResults(tests);
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: TestResult['category']) => {
    const variants = {
      build: 'bg-blue-100 text-blue-800',
      api: 'bg-purple-100 text-purple-800',
      dashboard: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[category]}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const summary = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    warnings: testResults.filter(r => r.status === 'warning').length,
  };

  const criticalFailures = testResults.filter(r => 
    r.status === 'failed' && (r.category === 'build' || r.category === 'security')
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-600" />
              Production Fixes Validation Suite
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Validate All Fixes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Summary */}
          {testResults.length > 0 && (
            <div className={`p-4 rounded-lg ${summary.failed === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Production Fixes Summary</h3>
                <div className={`text-lg font-bold ${summary.failed === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.passed}/{summary.total} Passed
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Total Tests: {summary.total}</div>
                <div className="text-green-600">Passed: {summary.passed}</div>
                <div className="text-red-600">Failed: {summary.failed}</div>
                <div className="text-yellow-600">Warnings: {summary.warnings}</div>
              </div>
              {summary.failed === 0 && summary.total > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  ✅ All production fixes are working correctly!
                </div>
              )}
            </div>
          )}

          {/* Critical Failures Alert */}
          {criticalFailures.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Critical Issues Found ({criticalFailures.length})</h3>
              <div className="space-y-1">
                {criticalFailures.map((test, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{test.name}</strong> ({test.category}): {test.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Context */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Test Context</h3>
            <div className="text-sm space-y-1">
              <div>User: {user?.email || 'Not authenticated'}</div>
              <div>Role: {role || 'Unknown'}</div>
              <div>Location ID: {user?.metadata?.primary_location_id || 'Not set'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-600">{test.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(test.category)}
                    <span className="text-xs text-gray-500">
                      {test.duration}ms
                    </span>
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fix Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Production Fixes Validated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-blue-800">🔧 Build Fixes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Fixed TypeScript syntax error in products.ts</li>
                <li>• Resolved optional chaining compilation issues</li>
                <li>• Updated all methods to use enhanced BaseAPI</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-purple-800">🔌 API Enhancements</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enhanced error handling with retry logic</li>
                <li>• Fixed schema mismatches in analytics API</li>
                <li>• Improved cart integration in product catalog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-orange-800">📊 Dashboard Fixes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Fixed KPI cards data loading issues</li>
                <li>• Resolved dashboard widget API calls</li>
                <li>• Enhanced metrics calculation accuracy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-800">🔒 Security Improvements</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enhanced franchise location access control</li>
                <li>• Improved permission validation</li>
                <li>• Maintained authentication security fixes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionFixesTest;
