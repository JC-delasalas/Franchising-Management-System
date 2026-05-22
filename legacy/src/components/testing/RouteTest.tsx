import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Route, Play, RotateCcw } from 'lucide-react';
import { routeTestRunner, RouteTestResult } from '@/utils/routeTestRunner';

const RouteTest: React.FC = () => {
  const [testResults, setTestResults] = useState<RouteTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await routeTestRunner.runAllRouteTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running route tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: RouteTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: RouteTestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      missing: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAuthBadge = (requiresAuth: boolean, requiredRole?: string) => {
    if (!requiresAuth) {
      return <Badge className="bg-blue-100 text-blue-800">Public</Badge>;
    }
    
    if (requiredRole) {
      return <Badge className="bg-purple-100 text-purple-800">{requiredRole}</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800">Protected</Badge>;
  };

  const summary = routeTestRunner.getSummary();
  const errorRoutes = testResults.filter(r => r.status === 'error');
  const slowRoutes = testResults.filter(r => (r.loadTime || 0) > 1000);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-6 h-6 text-blue-600" />
              Route Component Test Suite
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Test All Routes'}
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
            <div className={`p-4 rounded-lg ${summary.allRoutesWorking ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Route Test Summary</h3>
                <div className={`text-lg font-bold ${summary.allRoutesWorking ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.successRate}% Success
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>Total Routes: {summary.total}</div>
                <div className="text-green-600">Successful: {summary.successful}</div>
                <div className="text-red-600">Failed: {summary.failed}</div>
                <div className="text-yellow-600">Missing: {summary.missing}</div>
                <div>Avg Load: {summary.avgLoadTime}ms</div>
              </div>
              {summary.allRoutesWorking && (
                <div className="mt-2 text-sm text-green-600">
                  ✅ All routes are working correctly!
                </div>
              )}
            </div>
          )}

          {/* Error Routes Alert */}
          {errorRoutes.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Failed Routes ({errorRoutes.length})</h3>
              <div className="space-y-1">
                {errorRoutes.map((route, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{route.path}</strong> ({route.component}): {route.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow Routes Alert */}
          {slowRoutes.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Slow Loading Routes ({slowRoutes.length})</h3>
              <div className="space-y-1">
                {slowRoutes.map((route, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    <strong>{route.path}</strong> ({route.component}): {route.loadTime}ms
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Route Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.path}</div>
                      <div className="text-sm text-gray-600">{test.component}</div>
                      {test.status === 'error' && (
                        <div className="text-sm text-red-600 mt-1">{test.message}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAuthBadge(test.requiresAuth, test.requiredRole)}
                    {test.loadTime && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        test.loadTime > 1000 ? 'bg-red-100 text-red-800' :
                        test.loadTime > 500 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {test.loadTime}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Route Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Public Routes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Landing Page (/)</li>
                <li>• Contact (/contact)</li>
                <li>• Blog (/blog)</li>
                <li>• Brand Pages (/brand/:id)</li>
                <li>• Auth Pages (/login, /signup)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Protected Routes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Dashboards</li>
                <li>• Order Management</li>
                <li>• Analytics</li>
                <li>• Profile Management</li>
                <li>• Notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Role-Specific Routes</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Franchisor: Analytics, Approvals</li>
                <li>• Franchisee: Training, Sales Upload</li>
                <li>• Admin: IAM Management</li>
                <li>• Supplier Management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Information */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>What This Test Does:</strong> Verifies that all route components can be dynamically imported and loaded without errors.
            </div>
            <div>
              <strong>Component Loading:</strong> Tests lazy-loaded components to ensure they have proper default exports and can be imported successfully.
            </div>
            <div>
              <strong>Performance Monitoring:</strong> Measures component load times to identify potential performance issues.
            </div>
            <div>
              <strong>Route Coverage:</strong> Tests all routes defined in App.tsx including public, protected, and role-specific routes.
            </div>
            <div>
              <strong>Authentication Awareness:</strong> Identifies which routes require authentication and specific user roles.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteTest;
