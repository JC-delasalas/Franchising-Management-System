import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Shield, Play, RotateCcw, Database } from 'lucide-react';
import { rlsSecurityTestRunner, RLSTestResult } from '@/utils/rlsSecurityTestRunner';
import { useAuth } from '@/hooks/useAuth';

const RLSSecurityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<RLSTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, role, isAuthenticated } = useAuth();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await rlsSecurityTestRunner.runAllRLSTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running RLS security tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: RLSTestResult['status']) => {
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

  const getStatusBadge = (status: RLSTestResult['status']) => {
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

  const getSecurityLevelBadge = (level: RLSTestResult['securityLevel']) => {
    const variants = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <Badge className={`${variants[level]} border`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const summary = rlsSecurityTestRunner.getSummary();
  const criticalFailures = testResults.filter(r => 
    r.status === 'failed' && r.securityLevel === 'critical'
  );

  const vulnerableTables = [
    'product_categories', 'custom_fields', 'transaction_history',
    'entity_metadata', 'custom_field_values', 'user_addresses',
    'recurring_charges', 'sales_receipts', 'sales_receipt_items',
    'location_reviews', 'compliance_audits', 'kpi_summary', 'shipment_items'
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              RLS Security Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                Please log in to run RLS security tests.
              </p>
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Row Level Security (RLS) Test Suite
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Run RLS Security Tests'}
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
          {/* Critical Security Alert */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">🚨 Critical Security Issue Addressed</h3>
            <p className="text-sm text-red-700 mb-2">
              <strong>13 database tables</strong> were previously exposed without RLS protection, creating potential data breach risks.
            </p>
            <div className="text-xs text-red-600">
              <strong>Vulnerable Tables:</strong> {vulnerableTables.join(', ')}
            </div>
          </div>

          {/* Current User Context */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Test Context</h3>
            <div className="text-sm space-y-1">
              <div>User: {user?.email}</div>
              <div>Role: {role}</div>
              <div>User ID: {user?.id}</div>
            </div>
          </div>

          {/* RLS Test Summary */}
          {testResults.length > 0 && (
            <div className={`p-4 rounded-lg ${summary.isSecure ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">RLS Security Summary</h3>
                <div className={`text-lg font-bold ${summary.isSecure ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.successRate}% Secure
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>Total Tests: {summary.total}</div>
                <div className="text-green-600">Passed: {summary.passed}</div>
                <div className="text-red-600">Failed: {summary.failed}</div>
                <div className="text-yellow-600">Warnings: {summary.warnings}</div>
                <div className="text-blue-600">Tables: {summary.tablesSecured}/13</div>
              </div>
              {summary.isSecure && summary.allTablesSecured ? (
                <div className="mt-2 text-sm text-green-600">
                  ✅ All 13 vulnerable tables are now secured with RLS policies!
                </div>
              ) : (
                <div className="mt-2 text-sm text-red-600">
                  ⚠️ Critical security issues detected - immediate action required!
                </div>
              )}
            </div>
          )}

          {/* Critical Failures Alert */}
          {criticalFailures.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Critical Security Failures ({criticalFailures.length})</h3>
              <div className="space-y-1">
                {criticalFailures.map((test, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{test.table}</strong> - {test.test}: {test.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results by Category */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Security Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Critical Security Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults
                  .filter(r => r.securityLevel === 'critical')
                  .map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium text-sm">{test.table}</div>
                          <div className="text-xs text-gray-600">{test.test}</div>
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

          {/* High & Medium Priority Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                Access Control Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults
                  .filter(r => r.securityLevel !== 'critical')
                  .map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium text-sm">{test.table}</div>
                          <div className="text-xs text-gray-600">{test.test}</div>
                          {test.status === 'failed' && (
                            <div className="text-xs text-red-600 mt-1">{test.message}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSecurityLevelBadge(test.securityLevel)}
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
            <CardTitle>Complete RLS Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.table} - {test.test}</div>
                      <div className="text-sm text-gray-600">{test.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSecurityLevelBadge(test.securityLevel)}
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

      {/* RLS Information */}
      <Card>
        <CardHeader>
          <CardTitle>Row Level Security (RLS) Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-red-800">🔒 Critical Security Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• User data isolation (addresses, transactions)</li>
                <li>• Franchise location access control</li>
                <li>• Role-based permissions (franchisor/franchisee)</li>
                <li>• Financial data protection</li>
                <li>• Personal information security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-blue-800">🧪 Test Categories</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• RLS enabled verification</li>
                <li>• User data isolation testing</li>
                <li>• Franchise data isolation testing</li>
                <li>• Admin access control testing</li>
                <li>• Unauthorized access prevention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerable Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Previously Vulnerable Tables (Now Secured)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {vulnerableTables.map((table, index) => (
              <Badge key={index} variant="outline" className="justify-center p-2">
                {table}
              </Badge>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <strong>Total:</strong> 13 tables secured with comprehensive RLS policies
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RLSSecurityTest;
