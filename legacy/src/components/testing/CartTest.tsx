import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CartTest: React.FC = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [cartData, setCartData] = useState<any>(null);

  const testCartAPI = async () => {
    setIsRunning(true);
    try {
      console.log('🛒 Testing CartAPI directly...');

      // Test authentication
      const { data: user } = await supabase.auth.getUser();
      console.log('Auth:', user.user?.id);

      // Test cart summary
      const summary = await CartAPI.getCartSummary();
      console.log('Cart Summary:', summary);
      setCartData(summary);

      toast({
        title: "Cart API Test Complete",
        description: `Found ${summary.itemCount} items in cart`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Cart API test failed:', error);
      toast({
        title: "Cart API Failed",
        description: error.message || "Check console for details",
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
            
            <Button
              onClick={testCartAPI}
              disabled={isRunning}
              className="w-full sm:w-auto"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Testing...' : 'Test Cart API'}
            </Button>

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
