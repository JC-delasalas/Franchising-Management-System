import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { quickCartTest } from '@/utils/quickCartTest';
import { cartStatusDiagnostic } from '@/utils/cartStatusDiagnostic';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CartTest: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      console.log('🚀 Running quick cart tests...');
      const results = await quickCartTest.runAllTests();
      setTestResults(results);

      toast({
        title: "Cart Tests Complete",
        description: `Found ${results.diagnosis.filter((d: string) => d.includes('❌')).length} issues`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error running cart tests:', error);
      toast({
        title: "Tests Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runStatusDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Running cart status diagnostic...');
      const { results, report } = await cartStatusDiagnostic.runAndReport();
      setTestResults({ diagnostic: results, report });

      toast({
        title: "Diagnostic Complete",
        description: `Cart status: ${results.status.toUpperCase()}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Diagnostic failed:', error);
      toast({
        title: "Diagnostic Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Cart Functionality Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              This test suite verifies that the shopping cart functionality is working correctly.
              It checks authentication, cart data fetching, and API responses.
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={runStatusDiagnostic}
                disabled={isRunning}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'URGENT: Cart Status Check'}
              </Button>

              <Button
                onClick={runTests}
                disabled={isRunning}
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running Tests...' : 'Full Test Suite'}
              </Button>
            </div>

            {summary && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Summary:</strong> {summary.passed}/{summary.total} tests passed
                  {summary.failed > 0 && (
                    <span className="text-red-600 ml-2">
                      ({summary.failed} failed)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.passed)}
                      <h3 className="font-semibold">{result.testName}</h3>
                    </div>
                    {getStatusBadge(result.passed)}
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>
                        <strong>Error:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {result.details && (
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Details:</h4>
                      <pre className="text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Authentication Check Failed:</strong>
              <p className="text-gray-600">Make sure you're logged in as a franchisee user.</p>
            </div>
            <div>
              <strong>Cart Summary Failed:</strong>
              <p className="text-gray-600">Check if the shopping_cart table exists and has proper permissions.</p>
            </div>
            <div>
              <strong>Database Connection Issues:</strong>
              <p className="text-gray-600">Verify Supabase configuration and network connectivity.</p>
            </div>
            <div>
              <strong>RLS (Row Level Security) Issues:</strong>
              <p className="text-gray-600">Ensure proper RLS policies are set up for the shopping_cart table.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CartTest;
