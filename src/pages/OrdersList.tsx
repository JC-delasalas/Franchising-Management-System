import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrdersAPI, OrderWithItems } from '@/api/ordersNew';
import { 
  ArrowLeft, 
  Package, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const OrdersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user's orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: OrdersAPI.getUserOrders,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/franchisee-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">My Orders</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {filteredOrders.length} Orders
              </Badge>
              <Link to="/product-catalog">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Place New Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders by number or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </h2>
              <p className="text-gray-600 mb-6">
                {orders.length === 0 
                  ? 'Start by placing your first order from our product catalog.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              <Link to="/product-catalog">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStatusIcon(order.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Ordered {new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            <span>{order.order_items?.length || 0} items</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">₱{order.total_amount?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              {order.order_items.slice(0, 3).map((item) => (
                                <div key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {item.products?.name} × {item.quantity}
                                </div>
                              ))}
                              {order.order_items.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{order.order_items.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Shipping Info */}
                        {order.status === 'shipped' && order.tracking_number && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Tracking:</span>
                              <span className="ml-2 font-mono text-blue-700">{order.tracking_number}</span>
                              {order.carrier && (
                                <>
                                  <span className="mx-2 text-blue-600">•</span>
                                  <span className="text-blue-700">{order.carrier}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {order.status === 'rejected' && order.rejection_reason && (
                          <div className="mt-3 p-2 bg-red-50 rounded-lg">
                            <div className="text-sm">
                              <span className="font-medium text-red-800">Rejection Reason:</span>
                              <span className="ml-2 text-red-700">{order.rejection_reason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Order Again
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
