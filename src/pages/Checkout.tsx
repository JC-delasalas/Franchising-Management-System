import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CartAPI, CartSummary } from '@/api/cart';
import { PaymentMethodsAPI } from '@/api/paymentMethods';
import { AddressesAPI } from '@/api/addresses';
import { OrdersAPI } from '@/api/ordersNew';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  Package,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart summary with error handling and timeout
  const { data: cartSummary, isLoading: cartLoading, error: cartError } = useQuery<CartSummary>({
    queryKey: ['cart-summary'],
    queryFn: CartAPI.getCartSummary,
    retry: 2, // Only retry twice
    retryDelay: 1000, // 1 second delay
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Validate cart with proper error handling
  const { data: validation, error: validationError } = useQuery({
    queryKey: ['cart-validation'],
    queryFn: CartAPI.validateCart,
    enabled: !!cartSummary?.items.length,
    retry: 1, // Only retry once for validation
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: PaymentMethodsAPI.getPaymentMethods,
  });

  // Fetch addresses
  const { data: billingAddresses = [] } = useQuery({
    queryKey: ['billing-addresses'],
    queryFn: () => AddressesAPI.getAddresses('billing'),
  });

  const { data: shippingAddresses = [] } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: () => AddressesAPI.getAddresses('shipping'),
  });

  // Get default payment method and addresses
  const { data: defaultPaymentMethod } = useQuery({
    queryKey: ['default-payment-method'],
    queryFn: PaymentMethodsAPI.getDefaultPaymentMethod,
  });

  const { data: defaultBillingAddress } = useQuery({
    queryKey: ['default-billing-address'],
    queryFn: () => AddressesAPI.getDefaultAddress('billing'),
  });

  const { data: defaultShippingAddress } = useQuery({
    queryKey: ['default-shipping-address'],
    queryFn: () => AddressesAPI.getDefaultAddress('shipping'),
  });

  // Set defaults when data loads
  useEffect(() => {
    if (defaultPaymentMethod && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultPaymentMethod.id);
    }
  }, [defaultPaymentMethod, selectedPaymentMethod]);

  useEffect(() => {
    if (defaultBillingAddress && !selectedBillingAddress) {
      setSelectedBillingAddress(defaultBillingAddress.id);
    }
  }, [defaultBillingAddress, selectedBillingAddress]);

  useEffect(() => {
    if (defaultShippingAddress && !selectedShippingAddress) {
      setSelectedShippingAddress(defaultShippingAddress.id);
    }
  }, [defaultShippingAddress, selectedShippingAddress]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cartSummary || !selectedPaymentMethod || !selectedBillingAddress || !selectedShippingAddress) {
        throw new Error('Missing required checkout information');
      }

      // Get user's franchise location from their profile
      // For now, we'll create a demo franchise location if none exists
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Get or create franchise location for this user
      let { data: franchiseLocation } = await supabase
        .from('franchise_locations')
        .select('*')
        .eq('franchisee_id', userProfile?.id)
        .single();

      if (!franchiseLocation) {
        // Create a demo franchise location for this user
        const { data: newLocation } = await supabase
          .from('franchise_locations')
          .insert({
            franchise_id: 'demo-franchise-id', // This should be a real franchise ID
            franchisee_id: userProfile?.id,
            name: `${userProfile?.full_name || 'Demo'} Location`,
            address: '123 Demo Street',
            city: 'Demo City',
            state: 'Demo State',
            postal_code: '1234',
            phone_number: '+63 2 1234 5678',
            email: userProfile?.email,
            status: 'active',
          })
          .select()
          .single();

        franchiseLocation = newLocation;
      }

      const franchiseLocationId = franchiseLocation?.id;

      const orderData = {
        franchise_location_id: franchiseLocationId,
        items: cartSummary.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.products.price,
        })),
        payment_method_id: selectedPaymentMethod,
        billing_address_id: selectedBillingAddress,
        shipping_address_id: selectedShippingAddress,
        order_notes: orderNotes || undefined,
      };

      return OrdersAPI.createOrder(orderData);
    },
    onSuccess: (order) => {
      // Clear cart after successful order
      CartAPI.clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      
      toast({
        title: "Order placed successfully!",
        description: `Order ${order.order_number} has been submitted for approval.`,
      });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = async () => {
    if (!validation?.isValid) {
      toast({
        title: "Cannot place order",
        description: "Please fix the issues in your cart first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBillingAddress) {
      toast({
        title: "Billing address required",
        description: "Please select a billing address.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedShippingAddress) {
      toast({
        title: "Shipping address required",
        description: "Please select a shipping address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createOrderMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state with timeout protection
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your order details</p>
        </div>
      </div>
    );
  }

  // Handle cart loading errors
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your cart for checkout. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} className="mr-2">
            Refresh Page
          </Button>
          <Button variant="outline" onClick={() => navigate('/cart')}>
            Back to Cart
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart redirect
  if (!cartSummary || cartSummary.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Checkout</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Add items to your cart before proceeding to checkout.
              </p>
              <Link to="/product-catalog">
                <Button>Browse Products</Button>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-xl font-semibold ml-4">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No payment methods found.</p>
                    <Link to="/profile/payment-methods">
                      <Button variant="outline">Add Payment Method</Button>
                    </Link>
                  </div>
                ) : (
                  <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const display = PaymentMethodsAPI.getPaymentMethodDisplay(method);
                        return (
                          <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{display.title}</p>
                                  <p className="text-sm text-gray-600">{display.subtitle}</p>
                                </div>
                                {method.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingAddresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No billing addresses found.</p>
                    <Link to="/profile/addresses">
                      <Button variant="outline">Add Address</Button>
                    </Link>
                  </div>
                ) : (
                  <RadioGroup value={selectedBillingAddress} onValueChange={setSelectedBillingAddress}>
                    <div className="space-y-3">
                      {billingAddresses.map((address) => {
                        const display = AddressesAPI.formatAddressDisplay(address);
                        return (
                          <div key={address.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <RadioGroupItem value={address.id} id={`billing-${address.id}`} />
                            <Label htmlFor={`billing-${address.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{display.title}</p>
                                  <p className="text-sm text-gray-600">{display.subtitle}</p>
                                </div>
                                {address.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No shipping addresses found.</p>
                    <Link to="/profile/addresses">
                      <Button variant="outline">Add Address</Button>
                    </Link>
                  </div>
                ) : (
                  <RadioGroup value={selectedShippingAddress} onValueChange={setSelectedShippingAddress}>
                    <div className="space-y-3">
                      {shippingAddresses.map((address) => {
                        const display = AddressesAPI.formatAddressDisplay(address);
                        return (
                          <div key={address.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <RadioGroupItem value={address.id} id={`shipping-${address.id}`} />
                            <Label htmlFor={`shipping-${address.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{display.title}</p>
                                  <p className="text-sm text-gray-600">{display.subtitle}</p>
                                </div>
                                {address.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any special instructions or notes for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
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
                {/* Items */}
                <div className="space-y-2">
                  {cartSummary.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.products.name} × {item.quantity}</span>
                      <span>₱{(item.quantity * item.products.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
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
                </div>

                {/* Place Order Button */}
                <Button 
                  className="w-full" 
                  onClick={handlePlaceOrder}
                  disabled={!validation?.isValid || isProcessing || createOrderMutation.isPending}
                >
                  {isProcessing || createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  Your order will be submitted for approval by the franchisor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
