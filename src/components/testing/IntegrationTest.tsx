import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Zap, Play, RotateCcw } from 'lucide-react';
import { integrationTestRunner, IntegrationTestResult } from '@/utils/integrationTestRunner';
import { useAuth } from '@/hooks/useAuth';

const IntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<IntegrationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, role, isAuthenticated } = useAuth();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await integrationTestRunner.runAllIntegrationTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running integration tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: IntegrationTestResult['status']) => {
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

  const getStatusBadge = (status: IntegrationTestResult['status']) => {
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

  const getCategoryBadge = (category: IntegrationTestResult['category']) => {
    const variants = {
      authentication: 'bg-blue-100 text-blue-800',
      api: 'bg-purple-100 text-purple-800',
      routing: 'bg-green-100 text-green-800',
      dashboard: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[category]}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const summary = integrationTestRunner.getSummary();
  const criticalFailures = testResults.filter(r => 
    r.status === 'failed' && (r.category === 'authentication' || r.category === 'security')
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Comprehensive Integration Test Suite
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
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
          {/* Current System Status */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Current System Status</h3>
            <div className="text-sm space-y-1">
              <div>Authentication: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
              {isAuthenticated && (
                <>
                  <div>User: {user?.email}</div>
                  <div>Role: {role}</div>
                  <div>Location ID: {user?.metadata?.primary_location_id || 'Not set'}</div>
                </>
              )}
            </div>
          </div>

          {/* Integration Test Summary */}
          {testResults.length > 0 && (
            <div className={`p-4 rounded-lg ${summary.isProductionReady ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Integration Test Summary</h3>
                <div className={`text-lg font-bold ${summary.isProductionReady ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.successRate}% Success
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>Total Tests: {summary.total}</div>
                <div className="text-green-600">Passed: {summary.passed}</div>
                <div className="text-red-600">Failed: {summary.failed}</div>
                <div className="text-yellow-600">Warnings: {summary.warnings}</div>
                <div className="text-red-800">Critical: {summary.criticalFailures}</div>
              </div>
              {summary.isProductionReady ? (
                <div className="mt-2 text-sm text-green-600">
                  🚀 System is production ready! All integration tests passed.
                </div>
              ) : (
                <div className="mt-2 text-sm text-red-600">
                  ⚠️ System has integration issues that need to be resolved before production deployment.
                </div>
              )}
            </div>
          )}

          {/* Critical Failures Alert */}
          {criticalFailures.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Critical Integration Issues ({criticalFailures.length})</h3>
              <div className="space-y-1">
                {criticalFailures.map((test, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{test.name}</strong> ({test.category}): {test.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Test Results by Category */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication & Security Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults
                  .filter(r => r.category === 'authentication' || r.category === 'security')
                  .map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium text-sm">{test.name}</div>
                          {test.status === 'failed' && (
                            <div className="text-xs text-red-600 mt-1">{test.message}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{test.duration}ms</span>
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* API & Dashboard Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API & Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults
                  .filter(r => r.category === 'api' || r.category === 'dashboard')
                  .map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium text-sm">{test.name}</div>
                          {test.status === 'failed' && (
                            <div className="text-xs text-red-600 mt-1">{test.message}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{test.duration}ms</span>
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Integration Test Results</CardTitle>
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

      {/* Integration Test Information */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Test Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-blue-800">🔐 Authentication Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Security fixes integration</li>
                <li>• Session management validation</li>
                <li>• Navigation security checks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-purple-800">🔌 API Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enhanced BaseAPI usage</li>
                <li>• Products API build fixes</li>
                <li>• Analytics schema alignment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-800">🛣️ Routing Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Component loading validation</li>
                <li>• Protected route security</li>
                <li>• Route accessibility checks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-orange-800">📊 Dashboard Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Widget data loading</li>
                <li>• KPI access control</li>
                <li>• Metrics calculation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-800">🔒 Security Integration</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Authentication bypass prevention</li>
                <li>• Data access validation</li>
                <li>• Permission enforcement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTest;
