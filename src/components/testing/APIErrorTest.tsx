import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play, RotateCcw, Zap } from 'lucide-react';
import { apiErrorTestRunner, APIErrorTestResult } from '@/utils/apiErrorTestRunner';
import { ProductsAPI } from '@/api/products';
import { APIError, handleAPIError, withRetry } from '@/lib/errors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const APIErrorTest: React.FC = () => {
  const [testResults, setTestResults] = useState<APIErrorTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [manualTestResult, setManualTestResult] = useState<string>('');
  const [manualTestLoading, setManualTestLoading] = useState(false);
  const [testEndpoint, setTestEndpoint] = useState('products');
  const [testProductId, setTestProductId] = useState('nonexistent-product-id');

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await apiErrorTestRunner.runAllAPIErrorTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running API error tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setManualTestResult('');
  };

  const runManualErrorTest = async () => {
    setManualTestLoading(true);
    setManualTestResult('');

    try {
      let result = '';

      switch (testEndpoint) {
        case 'products':
          try {
            const product = await ProductsAPI.getProductById(testProductId);
            result = `✅ Product request completed. Result: ${product ? 'Found product' : 'Product not found (null)'}`;
          } catch (error) {
            if (error instanceof APIError) {
              result = `🔧 APIError caught:\n- Code: ${error.code}\n- Status: ${error.statusCode}\n- User Message: ${error.userMessage}\n- Retryable: ${error.retryable}\n- Endpoint: ${error.endpoint}`;
            } else {
              result = `❌ Unexpected error type: ${error}`;
            }
          }
          break;

        case 'retry-test':
          let attemptCount = 0;
          try {
            const retryResult = await withRetry(
              async () => {
                attemptCount++;
                if (attemptCount < 3) {
                  throw new APIError('Simulated network error', 'NETWORK_ERROR', undefined, undefined, true);
                }
                return `Success after ${attemptCount} attempts`;
              },
              { maxAttempts: 5, baseDelay: 100 },
              { endpoint: 'test/retry', method: 'GET' }
            );
            result = `✅ Retry test completed: ${retryResult}`;
          } catch (error) {
            result = `❌ Retry test failed: ${error}`;
          }
          break;

        case 'error-classification':
          const testErrors = [
            { code: 'PGRST116', message: 'Not found' },
            { code: '23505', message: 'Duplicate key' },
            { code: 'PGRST301', message: 'Permission denied' }
          ];
          
          result = 'Error Classification Results:\n';
          testErrors.forEach(err => {
            const apiError = handleAPIError(err, 'test/endpoint', 'GET');
            result += `\n${err.code} → ${apiError.code} (${apiError.statusCode}) - ${apiError.userMessage}`;
          });
          break;

        default:
          result = '❌ Unknown test endpoint';
      }

      setManualTestResult(result);
    } catch (error) {
      setManualTestResult(`❌ Test failed: ${error}`);
    } finally {
      setManualTestLoading(false);
    }
  };

  const getStatusIcon = (status: APIErrorTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: APIErrorTestResult['status']) => {
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
            API Error Management Test Suite
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
        </CardContent>
      </Card>

      {/* Manual API Error Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Manual API Error Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEndpoint">Test Type</Label>
              <select
                id="testEndpoint"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={manualTestLoading}
              >
                <option value="products">Product API (Not Found Test)</option>
                <option value="retry-test">Retry Logic Test</option>
                <option value="error-classification">Error Classification Test</option>
              </select>
            </div>
            <div>
              <Label htmlFor="testProductId">Product ID (for Product API test)</Label>
              <Input
                id="testProductId"
                value={testProductId}
                onChange={(e) => setTestProductId(e.target.value)}
                disabled={manualTestLoading || testEndpoint !== 'products'}
                placeholder="Enter product ID to test"
              />
            </div>
          </div>
          
          <Button 
            onClick={runManualErrorTest}
            disabled={manualTestLoading}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {manualTestLoading ? 'Testing...' : 'Run Manual Test'}
          </Button>

          {manualTestResult && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <Label>Test Result:</Label>
              <Textarea
                value={manualTestResult}
                readOnly
                className="mt-2 font-mono text-sm"
                rows={6}
              />
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
              <strong>Error Classification:</strong> Tests that different error types are properly categorized with correct codes, status codes, and retry flags.
            </div>
            <div>
              <strong>Retry Logic:</strong> Verifies that retry decisions are made correctly based on error type and attempt count.
            </div>
            <div>
              <strong>WithRetry Function:</strong> Tests the retry mechanism with exponential backoff and jitter.
            </div>
            <div>
              <strong>BaseAPI Error Handling:</strong> Ensures the BaseAPI class properly handles and transforms errors.
            </div>
            <div>
              <strong>ProductsAPI Error Handling:</strong> Tests specific API implementations handle errors correctly.
            </div>
            <div>
              <strong>User-Friendly Messages:</strong> Verifies that all errors provide appropriate user-facing messages.
            </div>
            <div>
              <strong>Error Logging:</strong> Tests that errors are properly logged with context information.
            </div>
            <div>
              <strong>Concurrent Request Handling:</strong> Ensures multiple simultaneous requests handle errors independently.
            </div>
            <div>
              <strong>Error Recovery:</strong> Tests that the system can recover from temporary failures.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIErrorTest;
