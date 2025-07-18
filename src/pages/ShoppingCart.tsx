import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CartAPI, CartSummary } from '@/api/cart';
import { cartDebugger } from '@/utils/cartDebugger';
import { cartPerformanceProfiler } from '@/utils/cartPerformanceProfiler';
import { queryKeys } from '@/lib/queryClient';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  AlertTriangle,
  CreditCard,
  Bug
} from 'lucide-react';

const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Fetch cart summary with optimized configuration for performance
  const { data: cartSummary, isLoading, refetch, error, isError, isFetching, status, fetchStatus } = useQuery<CartSummary>({
    queryKey: queryKeys.cart.summary,
    queryFn: CartAPI.getCartSummary,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Authentication failed') || error?.message?.includes('not authenticated')) {
        return false;
      }
      return failureCount < 1; // Reduced retries for faster feedback
    },
    retryDelay: 300, // Even faster retry delay
    staleTime: 30 * 1000, // Increased stale time to leverage caching
    gcTime: 5 * 60 * 1000, // Increased garbage collection time for better caching
    throwOnError: false, // Prevent error boundary from catching
    // Enable immediately - authentication is handled in API layer
    enabled: true,
    // Prevent background refetching to reduce load
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Add network mode for better offline handling
    networkMode: 'online',
    // Optimize for performance
    structuralSharing: true,
  });

  // Validate cart with proper error handling
  const { data: validation } = useQuery({
    queryKey: queryKeys.cart.validation,
    queryFn: CartAPI.validateCart,
    enabled: !!cartSummary?.items.length,
    retry: 1, // Only retry once for validation
    staleTime: 30 * 1000, // 30 seconds
    throwOnError: false,
  });

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn('Cart loading timeout - this may indicate an authentication or query issue');
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Performance profiling for development
  const runPerformanceProfile = async () => {
    try {
      console.log('🔍 Running cart performance profile...');
      const results = await cartPerformanceProfiler.profileCartLoading();
      setPerformanceMetrics(results);
      console.log('📊 Performance Results:', results);
      console.log(cartPerformanceProfiler.generateReport());

      toast({
        title: "Performance Profile Complete",
        description: `Total time: ${results.totalTime.toFixed(2)}ms. Check console for details.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Performance profiling failed:', error);
      toast({
        title: "Performance Profile Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    }
  };

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Cart Query State:', {
        isLoading,
        isError,
        isFetching,
        status,
        fetchStatus,
        error: error?.message,
        dataPresent: !!cartSummary,
        itemCount: cartSummary?.itemCount
      });
    }
  }, [isLoading, isError, isFetching, status, fetchStatus, error, cartSummary]);

  // Simplified error handling without excessive logging
  const hasCartData = cartSummary && cartSummary.items.length > 0;
  const isEmpty = cartSummary && cartSummary.items.length === 0;

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      CartAPI.updateCartItemQuantity(cartItemId, quantity),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count });
    },
    onError: (error: any) => {
      console.error('Error updating quantity:', error);
      const errorMessage = error?.message || 'Failed to update quantity';
      toast({
        title: "Error",
        description: errorMessage.includes('not authenticated')
          ? 'Please sign in to update your cart.'
          : 'Failed to update quantity. Please try again.',
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (cartItemId: string) => CartAPI.removeFromCart(cartItemId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      console.error('Error removing item:', error);
      const errorMessage = error?.message || 'Failed to remove item';
      toast({
        title: "Error",
        description: errorMessage.includes('not authenticated')
          ? 'Please sign in to modify your cart.'
          : 'Failed to remove item. Please try again.',
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: CartAPI.clearCart,
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      console.error('Error clearing cart:', error);
      const errorMessage = error?.message || 'Failed to clear cart';
      toast({
        title: "Error",
        description: errorMessage.includes('not authenticated')
          ? 'Please sign in to modify your cart.'
          : 'Failed to clear cart. Please try again.',
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeItemMutation.mutate(cartItemId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = () => {
    if (!validation?.isValid) {
      toast({
        title: "Cannot proceed to checkout",
        description: "Please fix the issues in your cart first.",
        variant: "destructive",
      });
      return;
    }

    navigate('/checkout');
  };

  // Handle loading and error states with timeout
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading your cart...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Handle loading timeout
  if (loadingTimeout && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ShoppingCart className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cart Loading Timeout
          </h2>
          <p className="text-gray-600 mb-4">
            Your cart is taking longer than expected to load. This might be a temporary issue.
          </p>
          <div className="space-x-2">
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/product-catalog')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle cart loading errors
  if (isError || error) {
    const errorMessage = error?.message || 'Unknown error occurred';
    const isAuthError = errorMessage.includes('not authenticated');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ShoppingCart className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAuthError ? 'Authentication Required' : 'Cart Loading Error'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isAuthError
              ? 'Please sign in to view your cart.'
              : 'We\'re having trouble loading your cart. Please try again.'
            }
          </p>
          <div className="space-x-2">
            {isAuthError ? (
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            ) : (
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/product-catalog')}>
              Continue Shopping
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
              <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                {errorMessage}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (!cartSummary || cartSummary.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/product-catalog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Catalog
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Shopping Cart</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Start shopping to add items to your cart.
              </p>
              <Link to="/product-catalog">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/product-catalog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Catalog
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Shopping Cart</h1>
            </div>

            <div className="flex items-center gap-2">
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runPerformanceProfile}
                  className="text-xs"
                >
                  <Bug className="w-3 h-3 mr-1" />
                  Test Performance
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Cart Items ({cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validation Errors */}
                {validation && !validation.isValid && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Validation Warnings */}
                {validation && validation.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <div key={index}>{warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {cartSummary.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.products.images && item.products.images.length > 0 ? (
                        <img 
                          src={item.products.images[0]} 
                          alt={item.products.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.products.name}</h3>
                      <p className="text-sm text-gray-600">{item.products.sku}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{item.products.unit_of_measure}</Badge>
                        <span className="text-sm text-gray-500">
                          Min: {item.products.minimum_order_qty}
                        </span>
                        {item.products.maximum_order_qty && (
                          <span className="text-sm text-gray-500">
                            Max: {item.products.maximum_order_qty}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        ₱{(item.quantity * item.products.price).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₱{item.products.price.toLocaleString()} each
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeItemMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{cartSummary.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (12%)</span>
                  <span>₱{cartSummary.taxAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cartSummary.shippingCost === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      `₱${cartSummary.shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₱{cartSummary.total.toLocaleString()}</span>
                </div>

                {cartSummary.subtotal < 5000 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Add ₱{(5000 - cartSummary.subtotal).toLocaleString()} more for free shipping!
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={!validation?.isValid}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <Link to="/product-catalog">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
