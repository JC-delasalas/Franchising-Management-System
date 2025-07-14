import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, CreditCard, DollarSign, Receipt, Clock, Users } from 'lucide-react';
import { POSService, POSProduct, POSSession, POSTransaction } from '@/services/pos/posService';
import { useToast } from '@/hooks/use-toast';

interface CartItem extends POSProduct {
  cartQuantity: number;
  cartTotal: number;
}

const POSSystem: React.FC = () => {
  const [activeSession, setActiveSession] = useState<POSSession | null>(null);
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const { toast } = useToast();

  // Mock location and user data - in real app, get from context
  const locationId = 'mock-location-id';
  const cashierId = 'mock-cashier-id';

  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    setLoading(true);
    try {
      // Check for active session
      const session = await POSService.getActiveSession(locationId);
      setActiveSession(session);

      // Load products
      const productsData = await POSService.getPOSProducts(locationId);
      setProducts(productsData);

      // Load recent transactions
      const transactionsData = await POSService.getTransactionHistory(locationId, undefined, undefined, 10);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading POS data:', error);
      toast({
        title: "Error",
        description: "Failed to load POS data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const result = await POSService.startSession(locationId, cashierId, 'TERMINAL-001', 1000);
      if (result.success && result.session) {
        setActiveSession(result.session);
        toast({
          title: "Success",
          description: "POS session started successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start POS session",
        variant: "destructive"
      });
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    
    try {
      const result = await POSService.endSession(activeSession.session_id, 1200);
      if (result.success) {
        setActiveSession(null);
        toast({
          title: "Success",
          description: "POS session ended successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end POS session",
        variant: "destructive"
      });
    }
  };

  const addToCart = (product: POSProduct) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.product_id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
                cartTotal: (item.cartQuantity + 1) * item.price
              }
            : item
        );
      } else {
        return [...prevCart, {
          ...product,
          cartQuantity: 1,
          cartTotal: product.price
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId
          ? {
              ...item,
              cartQuantity: quantity,
              cartTotal: quantity * item.price
            }
          : item
      )
    );
  };

  const processTransaction = async () => {
    if (!activeSession || cart.length === 0) return;

    try {
      const transactionData = {
        location_id: locationId,
        cashier_id: cashierId,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.cartQuantity,
          unit_price: item.price,
          discount_amount: 0
        }))
      };

      const result = await POSService.processTransaction(activeSession.session_id, transactionData);
      
      if (result.success) {
        setCart([]);
        setCashReceived(0);
        loadPOSData(); // Refresh data
        toast({
          title: "Success",
          description: "Transaction processed successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.cartTotal, 0);
  const taxAmount = cartTotal * 0.12; // 12% VAT
  const finalTotal = cartTotal + taxAmount;
  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - finalTotal) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">POS System</h1>
        <div className="flex items-center gap-4">
          {activeSession ? (
            <div className="flex items-center gap-2">
              <Badge variant="default">Session Active</Badge>
              <Button variant="outline" onClick={endSession}>
                End Session
              </Button>
            </div>
          ) : (
            <Button onClick={startSession}>
              Start Session
            </Button>
          )}
        </div>
      </div>

      {!activeSession ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Session</CardTitle>
            <CardDescription>Please start a POS session to begin processing transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startSession}>
              <Clock className="h-4 w-4 mr-2" />
              Start POS Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.product_id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-600">{product.sku}</p>
                        <p className="text-lg font-bold text-blue-600">₱{product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Payment Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">₱{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.cartQuantity}
                          onChange={(e) => updateCartQuantity(item.product_id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8"
                          min="0"
                        />
                        <p className="text-sm font-medium">₱{item.cartTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (12%):</span>
                      <span>₱{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₱{finalTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method:</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          Cash
                        </Button>
                        <Button
                          size="sm"
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('card')}
                        >
                          Card
                        </Button>
                        <Button
                          size="sm"
                          variant={paymentMethod === 'digital_wallet' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('digital_wallet')}
                        >
                          Digital
                        </Button>
                      </div>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cash Received:</label>
                        <Input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        {cashReceived > 0 && (
                          <p className="text-sm">
                            Change: <span className="font-bold">₱{change.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={processTransaction}
                      disabled={paymentMethod === 'cash' && cashReceived < finalTotal}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Started:</span>
                  <span>{new Date(activeSession.start_time).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sales:</span>
                  <span>₱{activeSession.total_sales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span>{activeSession.total_transactions}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem;
