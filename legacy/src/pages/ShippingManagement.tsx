import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { OrdersAPI, OrderWithItems } from '@/api/ordersNew';
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';

const ShippingManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const [shippingData, setShippingData] = useState({
    carrier: '',
    tracking_number: '',
    shipping_method: '',
    estimated_delivery_date: '',
  });

  // Fetch orders ready for shipping
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['shipping-orders'],
    queryFn: OrdersAPI.getShippingOrders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update shipping info mutation
  const updateShippingMutation = useMutation({
    mutationFn: ({ orderId, shippingInfo }: { orderId: string; shippingInfo: any }) =>
      OrdersAPI.updateShippingInfo(orderId, shippingInfo),
    onSuccess: (order) => {
      toast({
        title: "Shipping info updated",
        description: `Shipping information for order ${order.order_number} has been updated.`,
      });
      refetch();
      setIsShippingDialogOpen(false);
      setEditingOrder(null);
      resetShippingForm();
    },
    onError: (error) => {
      console.error('Error updating shipping info:', error);
      toast({
        title: "Update failed",
        description: "Failed to update shipping information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark as shipped mutation
  const markAsShippedMutation = useMutation({
    mutationFn: OrdersAPI.markAsShipped,
    onSuccess: (order) => {
      toast({
        title: "Order marked as shipped",
        description: `Order ${order.order_number} has been marked as shipped.`,
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error marking as shipped:', error);
      toast({
        title: "Update failed",
        description: "Failed to mark order as shipped. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark as delivered mutation
  const markAsDeliveredMutation = useMutation({
    mutationFn: OrdersAPI.markAsDelivered,
    onSuccess: (order) => {
      toast({
        title: "Order marked as delivered",
        description: `Order ${order.order_number} has been marked as delivered.`,
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error marking as delivered:', error);
      toast({
        title: "Update failed",
        description: "Failed to mark order as delivered. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk shipping mutation
  const bulkShippingMutation = useMutation({
    mutationFn: ({ orderIds, shippingInfo }: { orderIds: string[]; shippingInfo: any }) =>
      OrdersAPI.bulkUpdateShipping(orderIds, shippingInfo),
    onSuccess: (result) => {
      toast({
        title: "Bulk shipping update completed",
        description: `Updated shipping information for ${result.updated} orders.`,
      });
      refetch();
      setSelectedOrders([]);
      setIsShippingDialogOpen(false);
      resetShippingForm();
    },
    onError: (error) => {
      console.error('Error bulk updating shipping:', error);
      toast({
        title: "Bulk update failed",
        description: "Failed to update shipping information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetShippingForm = () => {
    setShippingData({
      carrier: '',
      tracking_number: '',
      shipping_method: '',
      estimated_delivery_date: '',
    });
  };

  const handleEditShipping = (order: OrderWithItems) => {
    setEditingOrder(order);
    setShippingData({
      carrier: order.carrier || '',
      tracking_number: order.tracking_number || '',
      shipping_method: order.shipping_method || '',
      estimated_delivery_date: order.estimated_delivery_date ? 
        new Date(order.estimated_delivery_date).toISOString().split('T')[0] : '',
    });
    setIsShippingDialogOpen(true);
  };

  const handleUpdateShipping = () => {
    if (!editingOrder) return;

    updateShippingMutation.mutate({
      orderId: editingOrder.id,
      shippingInfo: shippingData,
    });
  };

  const handleBulkShipping = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to update shipping information.",
        variant: "destructive",
      });
      return;
    }

    bulkShippingMutation.mutate({
      orderIds: selectedOrders,
      shippingInfo: shippingData,
    });
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const carriers = [
    'LBC Express',
    'JRS Express',
    '2GO Express',
    'Ninja Van',
    'Grab Express',
    'Lalamove',
    'J&T Express',
    'GoGo Express',
    'Air21',
    'PHLPost'
  ];

  const shippingMethods = [
    'Standard Delivery',
    'Express Delivery',
    'Same Day Delivery',
    'Next Day Delivery',
    'Economy Delivery',
    'Premium Delivery'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading shipping orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/franchisor-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Shipping Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {orders.length} Orders
              </Badge>
              {selectedOrders.length > 0 && (
                <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingOrder(null)}>
                      <Truck className="w-4 h-4 mr-2" />
                      Bulk Update ({selectedOrders.length})
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready to Ship</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'approved' || o.status === 'processing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Delivery</p>
                  <p className="text-2xl font-bold">3.2 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">No orders to ship</h2>
              <p className="text-gray-600 mb-6">
                Orders ready for shipping will appear here.
              </p>
              <Link to="/franchisor-dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipping Orders</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => handleSelectOrder(order.id)}
                        />
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {formatStatus(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.user_profiles?.full_name} • {order.order_items?.length || 0} items • ₱{order.total_amount?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ordered {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsShippedMutation.mutate(order.id)}
                            disabled={markAsShippedMutation.isPending}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Mark as Processing
                          </Button>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsShippedMutation.mutate(order.id)}
                            disabled={markAsShippedMutation.isPending}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Mark as Shipped
                          </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsDeliveredMutation.mutate(order.id)}
                            disabled={markAsDeliveredMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditShipping(order)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Shipping
                        </Button>

                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {(order.carrier || order.tracking_number) && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {order.carrier && (
                            <div>
                              <span className="font-medium">Carrier:</span>
                              <span className="ml-2">{order.carrier}</span>
                            </div>
                          )}
                          {order.tracking_number && (
                            <div>
                              <span className="font-medium">Tracking:</span>
                              <span className="ml-2 font-mono">{order.tracking_number}</span>
                            </div>
                          )}
                          {order.estimated_delivery_date && (
                            <div>
                              <span className="font-medium">Est. Delivery:</span>
                              <span className="ml-2">
                                {new Date(order.estimated_delivery_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivery Address */}
                    {order.shipping_address && (
                      <div className="mt-3 text-sm text-gray-600">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{order.shipping_address.recipient_name}</span>
                            <br />
                            {order.shipping_address.address_line_1}, {order.shipping_address.city}, {order.shipping_address.state_province}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? `Update Shipping - Order #${editingOrder.order_number}` : `Bulk Update Shipping (${selectedOrders.length} orders)`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={shippingData.carrier} onValueChange={(value) => setShippingData({ ...shippingData, carrier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrier => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                value={shippingData.tracking_number}
                onChange={(e) => setShippingData({ ...shippingData, tracking_number: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <Label htmlFor="shipping_method">Shipping Method</Label>
              <Select value={shippingData.shipping_method} onValueChange={(value) => setShippingData({ ...shippingData, shipping_method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {shippingMethods.map(method => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimated_delivery_date">Estimated Delivery Date</Label>
              <Input
                id="estimated_delivery_date"
                type="date"
                value={shippingData.estimated_delivery_date}
                onChange={(e) => setShippingData({ ...shippingData, estimated_delivery_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsShippingDialogOpen(false);
                setEditingOrder(null);
                resetShippingForm();
              }}
              disabled={updateShippingMutation.isPending || bulkShippingMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingOrder ? handleUpdateShipping : handleBulkShipping}
              disabled={updateShippingMutation.isPending || bulkShippingMutation.isPending}
            >
              {updateShippingMutation.isPending || bulkShippingMutation.isPending ? 'Updating...' : 'Update Shipping Info'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShippingManagement;
