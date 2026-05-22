import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cartDebugger, DebugResult } from '@/utils/cartDebugger';
import { useQuery } from '@tanstack/react-query';
import { CartAPI } from '@/api/cart';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Shield,
  Network,
  Code
} from 'lucide-react';

const CartLoadingDebugger: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  // Monitor the actual React Query hook behavior
  const { 
    data: cartSummary, 
    isLoading, 
    isError, 
    isFetching, 
    status, 
    fetchStatus,
    error 
  } = useQuery({
    queryKey: ['debug-cart-summary'],
    queryFn: CartAPI.getCartSummary,
    enabled: false, // Only run when explicitly triggered
  });

  const runCompleteAnalysis = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentStep('Starting analysis...');

    try {
      // Step 1: Authentication State
      setCurrentStep('Step 1: Verifying Authentication State');
      const authResult = await cartDebugger.verifyAuthenticationState();
      setResults(prev => [...prev, authResult]);

      // Step 2: Isolated Cart Queries
      setCurrentStep('Step 2: Testing Isolated Cart Queries');
      const queryResult = await cartDebugger.testIsolatedCartQueries();
      setResults(prev => [...prev, queryResult]);

      // Step 3: Network Layer
      setCurrentStep('Step 3: Inspecting Network Layer');
      const networkResult = await cartDebugger.inspectNetworkLayer();
      setResults(prev => [...prev, networkResult]);

      // Step 4: React Query Analysis (live monitoring)
      setCurrentStep('Step 4: Analyzing React Query Behavior');
      const reactQueryResult: DebugResult = {
        step: 'React Query Hook Behavior',
        success: true,
        data: {
          isLoading,
          isError,
          isFetching,
          status,
          fetchStatus,
          error: error?.message,
          dataPresent: !!cartSummary,
          queryKey: ['debug-cart-summary']
        }
      };
      setResults(prev => [...prev, reactQueryResult]);

      setCurrentStep('Analysis Complete');
    } catch (error: any) {
      console.error('Debug analysis failed:', error);
      setCurrentStep(`Analysis Failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (step: string) => {
    if (step.includes('Authentication')) return <Shield className="w-5 h-5" />;
    if (step.includes('Cart Queries')) return <Database className="w-5 h-5" />;
    if (step.includes('Network')) return <Network className="w-5 h-5" />;
    if (step.includes('React Query')) return <Code className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Cart Loading Root Cause Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Investigation Protocol:</strong> This tool executes the systematic 
                root cause analysis to identify the exact failure point in the cart loading process.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between">
              <Button 
                onClick={runCompleteAnalysis} 
                disabled={isRunning}
                className="w-full sm:w-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running Analysis...' : 'Start Root Cause Analysis'}
              </Button>
              
              {isRunning && (
                <div className="flex items-center text-blue-600">
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {currentStep}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStepIcon(result.step)}
                      <h3 className="font-semibold">{result.step}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "PASS" : "FAIL"}
                      </Badge>
                      {result.timing && (
                        <Badge variant="outline">
                          {result.timing.toFixed(2)}ms
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive" className="mb-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Failure Point:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {result.data && (
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Details:</h4>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
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
          <CardTitle>Investigation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Step 1: Authentication State</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• supabase.auth.getUser() response</li>
                <li>• User ID exists and valid</li>
                <li>• User profile exists in database</li>
                <li>• Session validity and expiration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Step 2: Isolated Cart Queries</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Direct shopping_cart table query</li>
                <li>• Cart with products join query</li>
                <li>• CartAPI.getCartSummary() execution</li>
                <li>• Query timing and response analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Step 3: Network Layer</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Supabase endpoint connectivity</li>
                <li>• API key validation</li>
                <li>• HTTP request/response analysis</li>
                <li>• Network timing and errors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Step 4: React Query Behavior</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Query state transitions</li>
                <li>• Loading/error/success states</li>
                <li>• Retry logic and cache behavior</li>
                <li>• Component lifecycle integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CartLoadingDebugger;
