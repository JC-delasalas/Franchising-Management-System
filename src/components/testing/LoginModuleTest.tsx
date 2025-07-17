import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play, RotateCcw, LogIn } from 'lucide-react';
import { loginTestRunner, LoginTestResult } from '@/utils/loginTestRunner';
import { signIn, signOut } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginModuleTest: React.FC = () => {
  const [testResults, setTestResults] = useState<LoginTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [manualTestEmail, setManualTestEmail] = useState('test@franchisehub.test');
  const [manualTestPassword, setManualTestPassword] = useState('TestPassword123!');
  const [manualTestLoading, setManualTestLoading] = useState(false);
  const [manualTestResult, setManualTestResult] = useState<string>('');
  
  const { user, isAuthenticated, isLoading } = useAuth();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await loginTestRunner.runAllLoginTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running login tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setManualTestResult('');
  };

  const runManualLoginTest = async () => {
    setManualTestLoading(true);
    setManualTestResult('');

    try {
      // First sign out if already authenticated
      if (isAuthenticated) {
        await signOut();
      }

      // Attempt login
      const result = await signIn(manualTestEmail, manualTestPassword);
      
      if (result.user) {
        setManualTestResult(`✅ Login successful! User: ${result.user.email}, Session: ${result.session ? 'Active' : 'None'}`);
      } else {
        setManualTestResult('❌ Login failed - no user returned');
      }
    } catch (error: any) {
      setManualTestResult(`❌ Login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setManualTestLoading(false);
    }
  };

  const getStatusIcon = (status: LoginTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: LoginTestResult['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Login Module Test Suite
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
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
          {totalTests > 0 && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <strong>Progress:</strong> {passedTests + failedTests} / {totalTests} tests completed
              </div>
              <div className="text-sm text-green-600">
                <strong>Passed:</strong> {passedTests}
              </div>
              <div className="text-sm text-red-600">
                <strong>Failed:</strong> {failedTests}
              </div>
            </div>
          )}

          {/* Current Auth Status */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Current Authentication Status</h3>
            <div className="text-sm space-y-1">
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
              <div>User: {user ? `${user.email} (${user.role})` : 'None'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Login Test */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manualEmail">Test Email</Label>
              <Input
                id="manualEmail"
                value={manualTestEmail}
                onChange={(e) => setManualTestEmail(e.target.value)}
                disabled={manualTestLoading}
              />
            </div>
            <div>
              <Label htmlFor="manualPassword">Test Password</Label>
              <Input
                id="manualPassword"
                type="password"
                value={manualTestPassword}
                onChange={(e) => setManualTestPassword(e.target.value)}
                disabled={manualTestLoading}
              />
            </div>
          </div>
          
          <Button 
            onClick={runManualLoginTest}
            disabled={manualTestLoading}
            className="flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {manualTestLoading ? 'Testing Login...' : 'Test Login'}
          </Button>

          {manualTestResult && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{manualTestResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
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
                      {test.error && (
                        <div className="text-xs text-red-600 mt-1">
                          Technical: {test.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
          <CardTitle>Test Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Error Handling Integration:</strong> Verifies that login errors use the new AuthenticationError classes and provide user-friendly messages.
            </div>
            <div>
              <strong>Valid Login Flow:</strong> Tests complete login process including user creation, authentication, and profile verification.
            </div>
            <div>
              <strong>Profile Loading Dependency:</strong> Ensures authentication properly depends on profile loading without being overly restrictive.
            </div>
            <div>
              <strong>Navigation After Login:</strong> Verifies that login doesn't break navigation flow and sessions are properly established.
            </div>
            <div>
              <strong>Error Boundary Integration:</strong> Tests that authentication errors are properly categorized for error boundary handling.
            </div>
            <div>
              <strong>Multiple Role Login:</strong> Verifies login works correctly for different user roles (franchisee, franchisor).
            </div>
            <div>
              <strong>Session Persistence:</strong> Tests that user sessions persist correctly and can be retrieved.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModuleTest;
