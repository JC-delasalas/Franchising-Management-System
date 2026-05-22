import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play, RotateCcw, BarChart3, Activity } from 'lucide-react';
import { reactQueryTestRunner, ReactQueryTestResult } from '@/utils/reactQueryTestRunner';
import { performanceMonitoring } from '@/lib/queryClient';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ReactQueryTest: React.FC = () => {
  const [testResults, setTestResults] = useState<ReactQueryTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [webVitalsEnabled, setWebVitalsEnabled] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = await reactQueryTestRunner.runAllReactQueryTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running React Query tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setPerformanceData(null);
    performanceMonitoring.resetMetrics();
  };

  const getPerformanceData = () => {
    const summary = performanceMonitoring.getPerformanceSummary();
    setPerformanceData(summary);
  };

  const toggleWebVitals = () => {
    if (!webVitalsEnabled) {
      performanceMonitoring.trackWebVitals();
      setWebVitalsEnabled(true);
    } else {
      setWebVitalsEnabled(false);
    }
  };

  const getStatusIcon = (status: ReactQueryTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ReactQueryTestResult['status']) => {
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
            React Query Optimization Test Suite
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
                onClick={getPerformanceData}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Get Performance Data
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleWebVitals}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                {webVitalsEnabled ? 'Stop' : 'Start'} Web Vitals
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

          {webVitalsEnabled && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Web Vitals Monitoring Active</h3>
              <p className="text-sm text-blue-700">
                Core Web Vitals are being tracked. Check the browser console for LCP, FID, and CLS measurements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Data */}
      {performanceData && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Total Queries</div>
                <div className="text-2xl font-bold">{performanceData.overall.totalQueries}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Avg Time</div>
                <div className="text-2xl font-bold">{performanceData.overall.averageTime.toFixed(0)}ms</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm text-yellow-600">Error Rate</div>
                <div className="text-2xl font-bold">{performanceData.overall.errorRate.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600">Cache Hit Rate</div>
                <div className="text-2xl font-bold">{performanceData.overall.cacheHitRate.toFixed(1)}%</div>
              </div>
            </div>

            <div>
              <Label>Detailed Performance Data:</Label>
              <Textarea
                value={JSON.stringify(performanceData, null, 2)}
                readOnly
                className="mt-2 font-mono text-xs"
                rows={10}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
              <strong>Query Key Consistency:</strong> Verifies that query keys are properly structured and typed for consistent caching.
            </div>
            <div>
              <strong>Query Configurations:</strong> Tests that different data types have appropriate cache durations and refresh strategies.
            </div>
            <div>
              <strong>Retry Logic Integration:</strong> Ensures retry logic properly integrates with the enhanced error management system.
            </div>
            <div>
              <strong>Cache Invalidation:</strong> Tests that cache invalidation functions work correctly and handle dependencies.
            </div>
            <div>
              <strong>Performance Monitoring:</strong> Verifies that performance tracking and metrics collection work as expected.
            </div>
            <div>
              <strong>Error Handling Integration:</strong> Tests that React Query error handlers integrate with the global error system.
            </div>
            <div>
              <strong>Query Client Configuration:</strong> Validates that the query client is configured with optimal default settings.
            </div>
            <div>
              <strong>Memory Management:</strong> Tests that queries are properly garbage collected and memory is managed efficiently.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Cache Strategies:</h4>
              <ul className="space-y-1">
                <li>• Real-time data: 30s stale time</li>
                <li>• Dashboard data: 2min stale time</li>
                <li>• Static data: 15min stale time</li>
                <li>• User data: 5min stale time</li>
                <li>• Analytics: 10min stale time</li>
                <li>• Notifications: 15s stale time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optimization Features:</h4>
              <ul className="space-y-1">
                <li>• Intelligent retry logic with error classification</li>
                <li>• Exponential backoff with jitter</li>
                <li>• Smart cache invalidation with dependencies</li>
                <li>• Performance monitoring and metrics</li>
                <li>• Role-based prefetching strategies</li>
                <li>• Memory management with garbage collection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReactQueryTest;
