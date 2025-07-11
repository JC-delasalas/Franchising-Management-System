
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { ordersService, Order } from '@/services/ordersService';
import { cacheService } from '@/services/cacheService';
import { 
  Package, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = () => {
    const cachedOrders = cacheService.get('all_orders');
    if (cachedOrders) {
      setOrders(cachedOrders);
    } else {
      const allOrders = ordersService.getAllOrders();
      setOrders(allOrders);
      cacheService.set('all_orders', allOrders);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.franchiseeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    if (ordersService.updateOrderStatus(orderId, newStatus)) {
      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Clear cache
      cacheService.invalidate('all_orders');
      cacheService.set('all_orders', updatedOrders);
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { class: 'bg-orange-100 text-orange-800', icon: Clock },
      processing: { class: 'bg-yellow-100 text-yellow-800', icon: Package },
      shipped: { class: 'bg-blue-100 text-blue-800', icon: Truck },
      delivered: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { class: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.class}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusActions = (order: Order) => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push(
          <Button 
            key="process" 
            size="sm" 
            onClick={() => updateOrderStatus(order.id, 'processing')}
          >
            Process Order
          </Button>
        );
        actions.push(
          <Button 
            key="cancel" 
            size="sm" 
            variant="destructive"
            onClick={() => updateOrderStatus(order.id, 'cancelled')}
          >
            Cancel
          </Button>
        );
        break;
      case 'processing':
        actions.push(
          <Button 
            key="ship" 
            size="sm" 
            onClick={() => updateOrderStatus(order.id, 'shipped')}
          >
            Mark as Shipped
          </Button>
        );
        break;
      case 'shipped':
        actions.push(
          <Button 
            key="deliver" 
            size="sm" 
            onClick={() => updateOrderStatus(order.id, 'delivered')}
          >
            Mark as Delivered
          </Button>
        );
        break;
    }
    
    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Order Management - Franchisor Dashboard"
        description="Manage and track all franchise orders"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage all franchise orders</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by order ID or franchisee name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Franchisee:</strong> {order.franchiseeName}</p>
                        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                        <p><strong>Items:</strong> {order.items.length} items</p>
                        <p><strong>Total Amount:</strong> ₱{order.totalAmount.toLocaleString()}</p>
                        {order.notes && (
                          <p><strong>Notes:</strong> {order.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xl font-bold text-green-600">
                        ₱{order.totalAmount.toLocaleString()}
                      </span>
                      <div className="flex space-x-2">
                        {getStatusActions(order)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        >
                          {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.unit} × ₱{item.price.toLocaleString()}
                              </p>
                            </div>
                            <div className="font-semibold">
                              ₱{(item.quantity * item.price).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No orders match your current filters' 
                    : 'No orders have been placed yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderManagement;
