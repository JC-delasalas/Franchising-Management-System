import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrdersAPI, OrderWithItems } from '@/api/ordersNew';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  // Fetch order details
  const { data: order, isLoading, error } = useQuery<OrderWithItems | null>({
    queryKey: ['order-tracking', orderId],
    queryFn: () => orderId ? OrdersAPI.getOrder(orderId) : null,
    enabled: !!orderId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
              <p className="text-gray-600 mb-6">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link to="/franchisee-dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    const iconClass = `w-6 h-6 ${
      isCompleted ? 'text-green-600' : 
      isActive ? 'text-blue-600' : 
      'text-gray-400'
    }`;

    switch (status) {
      case 'pending_approval':
        return <Clock className={iconClass} />;
      case 'approved':
        return <CheckCircle className={iconClass} />;
      case 'processing':
        return <Package className={iconClass} />;
      case 'shipped':
        return <Truck className={iconClass} />;
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const orderStatuses = [
    { key: 'pending_approval', label: 'Pending Approval', description: 'Waiting for franchisor approval' },
    { key: 'approved', label: 'Approved', description: 'Order approved and ready for processing' },
    { key: 'processing', label: 'Processing', description: 'Order is being prepared' },
    { key: 'shipped', label: 'Shipped', description: 'Order is on the way' },
    { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
  ];

  const currentStatusIndex = orderStatuses.findIndex(s => s.key === order.status);

  const StatusTimeline = () => (
    <div className="space-y-6">
      {orderStatuses.map((status, index) => {
        const isCompleted = index < currentStatusIndex;
        const isActive = index === currentStatusIndex;
        const isFuture = index > currentStatusIndex;

        return (
          <div key={status.key} className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              isCompleted ? 'bg-green-100 border-green-600' :
              isActive ? 'bg-blue-100 border-blue-600' :
              'bg-gray-100 border-gray-300'
            }`}>
              {getStatusIcon(status.key, isActive, isCompleted)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className={`font-medium ${
                  isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {status.label}
                </h3>
                {isActive && (
                  <Badge className={getStatusColor(order.status)}>
                    Current
                  </Badge>
                )}
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
              </div>
              <p className={`text-sm mt-1 ${
                isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {status.description}
              </p>
              
              {/* Show timestamps for completed/active statuses */}
              {(isCompleted || isActive) && (
                <div className="mt-2 text-xs text-gray-500">
                  {status.key === 'approved' && order.approved_at && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Approved on {new Date(order.approved_at).toLocaleDateString()} at {new Date(order.approved_at).toLocaleTimeString()}
                    </div>
                  )}
                  {status.key === 'shipped' && order.shipped_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Shipped on {new Date(order.shipped_date).toLocaleDateString()} at {new Date(order.shipped_date).toLocaleTimeString()}
                    </div>
                  )}
                  {status.key === 'delivered' && order.delivered_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Delivered on {new Date(order.delivered_date).toLocaleDateString()} at {new Date(order.delivered_date).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Connecting line */}
            {index < orderStatuses.length - 1 && (
              <div className={`absolute left-6 mt-12 w-0.5 h-6 ${
                index < currentStatusIndex ? 'bg-green-600' : 'bg-gray-300'
              }`} style={{ marginLeft: '1.5rem' }} />
            )}
          </div>
        );
      })}
    </div>
  );

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
              <h1 className="text-xl font-semibold ml-4">Order Tracking</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Order Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Order #{order.order_number}</h2>
                <p className="text-gray-600">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₱{order.total_amount?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{order.order_items?.length || 0} items</p>
              </div>
            </div>

            {/* Shipping Information */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {order.carrier && (
                    <div>
                      <span className="font-medium text-blue-800">Carrier:</span>
                      <span className="ml-2 text-blue-700">{order.carrier}</span>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div>
                      <span className="font-medium text-blue-800">Tracking Number:</span>
                      <span className="ml-2 text-blue-700 font-mono">{order.tracking_number}</span>
                      <Button variant="link" size="sm" className="ml-2 p-0 h-auto text-blue-600">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Track Package
                      </Button>
                    </div>
                  )}
                  {order.shipping_method && (
                    <div>
                      <span className="font-medium text-blue-800">Shipping Method:</span>
                      <span className="ml-2 text-blue-700">{order.shipping_method}</span>
                    </div>
                  )}
                  {order.estimated_delivery_date && (
                    <div>
                      <span className="font-medium text-blue-800">Estimated Delivery:</span>
                      <span className="ml-2 text-blue-700">
                        {new Date(order.estimated_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.products?.images && item.products.images.length > 0 ? (
                          <img 
                            src={item.products.images[0]} 
                            alt={item.products?.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products?.name}</h3>
                        <p className="text-sm text-gray-600">{item.products?.sku}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₱{item.unit_price?.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ₱{item.line_total?.toLocaleString()}
                        </p>
                        {item.delivered_quantity !== undefined && item.delivered_quantity !== item.quantity && (
                          <p className="text-sm text-orange-600">
                            Delivered: {item.delivered_quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.shipping_address.recipient_name}</p>
                    <p>{order.shipping_address.address_line_1}</p>
                    {order.shipping_address.address_line_2 && (
                      <p>{order.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state_province} {order.shipping_address.postal_code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{order.user_profiles?.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{order.user_profiles?.email}</span>
                  </div>
                  {order.shipping_address?.phone_number && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{order.shipping_address.phone_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₱{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₱{order.tax_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {order.shipping_amount === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      `₱${order.shipping_amount?.toLocaleString()}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₱{order.total_amount?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.order_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.order_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link to="/product-catalog">
                <Button variant="outline" className="w-full">
                  Order Again
                </Button>
              </Link>
              {order.status === 'delivered' && (
                <Button variant="outline" className="w-full">
                  Download Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
