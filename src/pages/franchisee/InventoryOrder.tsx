
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { getCurrentUser } from '@/services/authService';
import { ordersService, OrderItem } from '@/services/ordersService';
import { cacheService } from '@/services/cacheService';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Truck
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  status: 'Good' | 'Low' | 'Critical';
  price: number;
  category: string;
}

interface CartItem extends InventoryItem {
  quantity: number;
}

const InventoryOrder = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentOrders, setRecentOrders] = useState(() => {
    const user = getCurrentUser();
    if (user) {
      const cachedOrders = cacheService.get(`orders_${user.id}`);
      if (cachedOrders) {
        return cachedOrders;
      }
      const orders = ordersService.getOrdersByFranchisee(user.id);
      cacheService.set(`orders_${user.id}`, orders);
      return orders.slice(0, 3); // Show only recent 3
    }
    return [];
  });

  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'Siomai Mix (500pcs)', currentStock: 45, unit: 'pcs', reorderLevel: 20, status: 'Good', price: 2500, category: 'Food' },
    { id: '2', name: 'Sauce Packets (100pcs)', currentStock: 12, unit: 'boxes', reorderLevel: 15, status: 'Low', price: 450, category: 'Condiments' },
    { id: '3', name: 'Disposable Containers (200pcs)', currentStock: 156, unit: 'pcs', reorderLevel: 50, status: 'Good', price: 1200, category: 'Packaging' },
    { id: '4', name: 'Paper Bags (50 bundles)', currentStock: 8, unit: 'bundles', reorderLevel: 10, status: 'Critical', price: 800, category: 'Packaging' },
    { id: '5', name: 'Chili Oil (1L)', currentStock: 5, unit: 'bottles', reorderLevel: 8, status: 'Critical', price: 350, category: 'Condiments' },
    { id: '6', name: 'Soy Sauce (500ml)', currentStock: 25, unit: 'bottles', reorderLevel: 12, status: 'Good', price: 180, category: 'Condiments' },
    { id: '7', name: 'Napkins (1000pcs)', currentStock: 3, unit: 'packs', reorderLevel: 5, status: 'Low', price: 250, category: 'Supplies' },
    { id: '8', name: 'Plastic Spoons (500pcs)', currentStock: 45, unit: 'packs', reorderLevel: 20, status: 'Good', price: 320, category: 'Supplies' }
  ];

  const categories = ['All', 'Food', 'Condiments', 'Packaging', 'Supplies'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const validateOrder = (): string[] => {
    const errors: string[] = [];
    
    if (cart.length === 0) {
      errors.push('Please add items to your cart');
    }
    
    cart.forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.name}`);
      }
    });

    return errors;
  };

  const handleCheckout = async () => {
    const user = getCurrentUser();
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    const validationErrors = validateOrder();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert cart items to order items
      const orderItems: OrderItem[] = cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      }));

      // Create the order
      const order = ordersService.createOrder(
        user.id,
        `${user.firstName} ${user.lastName}`,
        orderItems,
        orderNotes.trim() || undefined
      );

      // Clear cache and update recent orders
      cacheService.invalidate(`orders_${user.id}`);
      const updatedOrders = ordersService.getOrdersByFranchisee(user.id);
      cacheService.set(`orders_${user.id}`, updatedOrders);
      setRecentOrders(updatedOrders.slice(0, 3));

      // Clear form
      setCart([]);
      setOrderNotes('');

      alert(`✅ Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: ₱${order.totalAmount.toLocaleString()}\nItems: ${order.items.length}\n\nYour order is now being processed and will be delivered in 3-5 business days.`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(item.status)}
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Current Stock: {item.currentStock} {item.unit}
                        </p>
                        {item.status !== 'Good' && (
                          <div className="flex items-center space-x-1 text-sm text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Reorder Level: {item.reorderLevel} {item.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        ₱{item.price.toLocaleString()}
                      </span>
                      <Button onClick={() => addToCart(item)} size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleDateString()} • {order.items.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold mb-1">₱{order.totalAmount.toLocaleString()}</div>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent orders</p>
                  )}
                </div>
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
                      <div key={item.id} className="border-b pb-4">
                        <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">₱{item.price.toLocaleString()}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right font-semibold">
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                        <Textarea
                          placeholder="Add any special instructions or notes..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{getTotalAmount().toLocaleString()}</span>
                      </div>

                      <Button 
                        onClick={handleCheckout} 
                        className="w-full"
                        disabled={isSubmitting || cart.length === 0}
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
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
