import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const [recentOrders, setRecentOrders] = useState([
    { id: 'ORD-001', date: '2024-01-10', items: 5, total: '₱4,250', status: 'Delivered' },
    { id: 'ORD-002', date: '2024-01-08', items: 3, total: '₱2,100', status: 'In Transit' },
    { id: 'ORD-003', date: '2024-01-05', items: 7, total: '₱6,800', status: 'Delivered' }
  ]);

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
      alert('Please add items to your cart first.');
      return;
    }

    // Generate new order ID
    const newOrderId = `ORD-${String(recentOrders.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const totalAmount = getTotalAmount();

    // Create new order
    const newOrder = {
      id: newOrderId,
      date: today,
      items: cart.length,
      total: `₱${totalAmount.toLocaleString()}`,
      status: 'Processing'
    };

    // Add to recent orders (at the beginning)
    setRecentOrders([newOrder, ...recentOrders]);

    // Clear cart
    setCart([]);

    // Show success message
    alert(`✅ Order placed successfully!\n\nOrder ID: ${newOrderId}\nTotal: ₱${totalAmount.toLocaleString()}\nItems: ${cart.length}\n\nYour order is now being processed and will be delivered in 3-5 business days.`);
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.date).toLocaleDateString()} • {order.items} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold mb-1">{order.total}</div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
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

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>₱{getTotalAmount().toLocaleString()}</span>
                    </div>

                    <Button onClick={handleCheckout} className="w-full">
                      Place Order
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
