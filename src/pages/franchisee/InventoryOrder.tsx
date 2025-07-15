import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { InventoryAPI } from '@/api/inventory';
import { OrderAPI } from '@/api/orders';
import { OrderService } from '@/services/OrderService';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Truck,
  RefreshCw
} from 'lucide-react';

interface CartItem {
  product_id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  price: number;
  quantity: number;
}

const InventoryOrder = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's primary location
  const locationId = user?.metadata?.primary_location_id;

  // Fetch inventory data
  const { data: inventory, isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['inventory', locationId],
    queryFn: () => InventoryAPI.getInventoryByLocation(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', locationId],
    queryFn: () => OrderAPI.getOrdersByLocation(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: OrderService.createOrderWithValidation,
    onSuccess: () => {
      toast({
        title: "Order Created Successfully!",
        description: "Your inventory order has been submitted for approval.",
      });
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['orders', locationId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', locationId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Process inventory data
  const inventoryItems = inventory?.map(item => ({
    product_id: item.product_id,
    name: item.product?.name || 'Unknown Product',
    sku: item.product?.sku || '',
    category: item.product?.category || 'Uncategorized',
    current_stock: item.available_quantity,
    reorder_level: item.reorder_level,
    price: item.product?.price || 0,
    status: item.available_quantity <= 0 ? 'Critical' as const :
            item.available_quantity <= item.reorder_level ? 'Low' as const : 'Good' as const
  })) || [];

  // Get unique categories
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const addToCart = (item: typeof inventoryItems[0]) => {
    const existingItem = cart.find(cartItem => cartItem.product_id === item.product_id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.product_id === item.product_id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good':
        return <Badge className="bg-green-100 text-green-800">Good Stock</Badge>;
      case 'Low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'In Transit':
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'Processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    if (!locationId) {
      toast({
        title: "Location Error",
        description: "Unable to determine your location. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Create order data
    const orderData = {
      franchise_location_id: locationId,
      order_type: 'inventory' as const,
      priority: 'normal' as const,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      })),
      special_instructions: 'Inventory restock order from franchisee dashboard'
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Inventory Order - Franchisee Dashboard"
        description="Order inventory items and manage stock levels for your franchise"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link to="/franchisee-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Order</h1>
          <p className="text-gray-600">Manage your stock levels and place orders</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Inventory Catalog */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search inventory items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Items */}
            {inventoryLoading ? (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/3 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : inventoryError ? (
              <div className="text-center p-8 text-red-600">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p>Error loading inventory. Please try again later.</p>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['inventory', locationId] })}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p>No inventory items found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {filteredItems.map((item) => (
                  <Card key={item.product_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusBadge(item.status)}
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            SKU: {item.sku}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Current Stock: {item.current_stock} units
                          </p>
                          {item.status !== 'Good' && (
                            <div className="flex items-center space-x-1 text-sm text-orange-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Reorder Level: {item.reorder_level} units</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(item.price)}
                        </span>
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          disabled={item.current_stock <= 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {item.current_stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{order.order_number}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.order_date).toLocaleDateString()} • {order.items?.length || 0} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold mb-1">{formatCurrency(order.total_amount)}</div>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    <Truck className="w-8 h-8 mx-auto mb-2" />
                    <p>No recent orders found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cart.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product_id} className="border-b pb-4">
                        <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{formatCurrency(item.price)}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(getTotalAmount())}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryOrder;
