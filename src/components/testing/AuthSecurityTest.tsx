import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Shield, Play, RotateCcw } from 'lucide-react';
import { authSecurityTestRunner, AuthSecurityTestResult } from '@/utils/authSecurityTestRunner';
import SessionManager from '@/utils/sessionManager';
import { useAuth } from '@/hooks/useAuth';

const AuthSecurityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<AuthSecurityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const { isAuthenticated, user, role } = useAuth();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await authSecurityTestRunner.runAllSecurityTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running auth security tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setSessionInfo(null);
  };

  const checkSessionInfo = async () => {
    const info = await SessionManager.getSessionInfo();
    setSessionInfo(info);
  };

  const getStatusIcon = (status: AuthSecurityTestResult['status']) => {
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

  const getStatusBadge = (status: AuthSecurityTestResult['status']) => {
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

  const getSecurityLevelBadge = (level: AuthSecurityTestResult['securityLevel']) => {
    const variants = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={`${variants[level]} border`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const summary = authSecurityTestRunner.getSummary();
  const criticalFailures = testResults.filter(r => r.securityLevel === 'critical' && r.status === 'failed');
  const highFailures = testResults.filter(r => r.securityLevel === 'high' && r.status === 'failed');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Authentication Security Test Suite
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Run Security Tests'}
              </Button>
              <Button 
                variant="outline" 
                onClick={checkSessionInfo}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Check Session
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
          {/* Current Authentication Status */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Current Authentication Status</h3>
            <div className="text-sm space-y-1">
              <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
              {isAuthenticated && (
                <>
                  <div>User: {user?.email}</div>
                  <div>Role: {role}</div>
                </>
              )}
            </div>
          </div>

          {/* Security Summary */}
          {testResults.length > 0 && (
            <div className={`p-4 rounded-lg ${summary.isSecure ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Security Summary</h3>
                <div className={`text-lg font-bold ${summary.isSecure ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.securityScore}% Secure
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Total Tests: {summary.total}</div>
                <div className="text-green-600">Passed: {summary.passed}</div>
                <div className="text-red-600">Failed: {summary.failed}</div>
                <div className="text-yellow-600">Warnings: {summary.warnings}</div>
              </div>
              {(summary.criticalIssues > 0 || summary.highIssues > 0) && (
                <div className="mt-2 text-sm text-red-600">
                  🚨 Critical Issues: {summary.criticalIssues} | High Issues: {summary.highIssues}
                </div>
              )}
            </div>
          )}

          {/* Session Information */}
          {sessionInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Session Information</h3>
              <div className="text-sm space-y-1">
                <div>Active: {sessionInfo.isActive ? '✅ Yes' : '❌ No'}</div>
                {sessionInfo.isActive && (
                  <>
                    <div>User ID: {sessionInfo.user?.id}</div>
                    <div>Expires: {sessionInfo.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleString() : 'Unknown'}</div>
                    <div>Last Activity: {sessionInfo.lastActivity ? new Date(sessionInfo.lastActivity).toLocaleString() : 'Unknown'}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalFailures.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Critical Security Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalFailures.map((test, index) => (
                <div key={index} className="p-3 bg-red-100 rounded border border-red-200">
                  <div className="font-medium text-red-800">{test.name}</div>
                  <div className="text-sm text-red-700">{test.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Priority Issues */}
      {highFailures.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High Priority Security Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highFailures.map((test, index) => (
                <div key={index} className="p-3 bg-orange-100 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">{test.name}</div>
                  <div className="text-sm text-orange-700">{test.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
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

      {/* Test Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Test Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Session Persistence Security:</strong> Verifies that sessions have proper expiry times and security controls.
            </div>
            <div>
              <strong>Auth Guard Bypass Prevention:</strong> Tests that protected routes cannot be accessed without proper authentication.
            </div>
            <div>
              <strong>Login Form Security:</strong> Validates that login forms properly reject invalid credentials and don't expose sensitive information.
            </div>
            <div>
              <strong>Session Validation:</strong> Ensures that session information is properly validated and contains required security data.
            </div>
            <div>
              <strong>Unauthorized Access Prevention:</strong> Tests Row Level Security (RLS) policies to prevent unauthorized data access.
            </div>
            <div>
              <strong>Password Security:</strong> Validates password strength requirements and security policies.
            </div>
            <div>
              <strong>Token Security:</strong> Verifies that authentication tokens are properly secured and not exposed.
            </div>
            <div>
              <strong>Logout Security:</strong> Tests that logout properly clears all authentication data and sessions.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSecurityTest;
