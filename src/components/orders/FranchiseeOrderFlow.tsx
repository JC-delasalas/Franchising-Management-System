import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSupplierPermissions } from '../auth/SupplierRouteGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Filter,
  Info,
  CheckCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  unit_of_measure: string;
  minimum_order_qty: number;
  maximum_order_qty: number;
  image_url?: string;
  active: boolean;
  // Supplier information hidden from franchisees
  supplier_info?: {
    supplier_name: string;
    lead_time_days: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
}

interface OrderItem {
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Franchisee order flow component - hides supplier details
 * Franchisees can order products but cannot see supplier information
 */
export const FranchiseeOrderFlow: React.FC = () => {
  const { user } = useAuth();
  const { hasSupplierRead } = useSupplierPermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch products without supplier details for franchisees
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        product_id: product.id,
        product,
        quantity: product.minimum_order_qty,
        unit_price: product.price,
        total_price: product.price * product.minimum_order_qty
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setOrderItems(items =>
      items.map(item => {
        if (item.product_id === productId) {
          const quantity = Math.max(
            item.product.minimum_order_qty,
            Math.min(newQuantity, item.product.maximum_order_qty)
          );
          return {
            ...item,
            quantity,
            total_price: item.unit_price * quantity
          };
        }
        return item;
      })
    );
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(items => items.filter(item => item.product_id !== productId));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.active;
  });

  const categories = [...new Set(products.map(p => p.category))];
  const orderTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
          <p className="text-gray-600">Select products from approved catalog</p>
        </div>
        
        {/* Franchisee Notice */}
        {!hasSupplierRead && (
          <Alert className="max-w-md">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Products are sourced from pre-approved suppliers managed by your franchisor.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const orderItem = orderItems.find(item => item.product_id === product.id);
              
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md ml-3"
                        />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          per {product.unit_of_measure}
                        </span>
                      </div>
                      
                      {/* Availability indicator (without supplier details) */}
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Available</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Min order: {product.minimum_order_qty} {product.unit_of_measure}
                      {product.maximum_order_qty && (
                        <> • Max order: {product.maximum_order_qty} {product.unit_of_measure}</>
                      )}
                    </div>

                    {/* Order Controls */}
                    {orderItem ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, orderItem.quantity - 1)}
                            disabled={orderItem.quantity <= product.minimum_order_qty}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium">
                            {orderItem.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, orderItem.quantity + 1)}
                            disabled={orderItem.quantity >= product.maximum_order_qty}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromOrder(product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToOrder(product)}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Order
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No items in order
                </p>
              ) : (
                <div className="space-y-3">
                  {orderItems.map(item => (
                    <div key={item.product_id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        ${item.total_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">
                        ${orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" disabled={orderItems.length === 0}>
                    Submit Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FranchiseeOrderFlow;
