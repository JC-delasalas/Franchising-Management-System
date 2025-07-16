import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { OrdersAPI, OrderWithItems } from '@/api/ordersNew';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Package,
  User,
  MapPin,
  CreditCard,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';

const OrderApprovalDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // Fetch pending orders
  const { data: pendingOrders = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: OrdersAPI.getPendingOrders,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Approve order mutation
  const approveOrderMutation = useMutation({
    mutationFn: ({ orderId, comments }: { orderId: string; comments?: string }) =>
      OrdersAPI.approveOrder(orderId, comments),
    onSuccess: (order) => {
      toast({
        title: "Order approved",
        description: `Order ${order.order_number} has been approved successfully.`,
      });
      refetch();
      setIsApprovalDialogOpen(false);
      setApprovalComments('');
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error('Error approving order:', error);
      toast({
        title: "Approval failed",
        description: "Failed to approve order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      OrdersAPI.rejectOrder(orderId, reason),
    onSuccess: (order) => {
      toast({
        title: "Order rejected",
        description: `Order ${order.order_number} has been rejected.`,
      });
      refetch();
      setIsRejectionDialogOpen(false);
      setRejectionReason('');
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error('Error rejecting order:', error);
      toast({
        title: "Rejection failed",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApproveOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsApprovalDialogOpen(true);
  };

  const handleRejectOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsRejectionDialogOpen(true);
  };

  const confirmApproval = () => {
    if (!selectedOrder) return;
    approveOrderMutation.mutate({
      orderId: selectedOrder.id,
      comments: approvalComments || undefined,
    });
  };

  const confirmRejection = () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this order.",
        variant: "destructive",
      });
      return;
    }
    rejectOrderMutation.mutate({
      orderId: selectedOrder.id,
      reason: rejectionReason,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading pending orders...</p>
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
              <h1 className="text-xl font-semibold ml-4">Order Approval Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {pendingOrders.length} Pending Orders
              </Badge>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">
                    ₱{pendingOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Franchisees</p>
                  <p className="text-2xl font-bold">
                    {new Set(pendingOrders.map(order => order.created_by)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">All caught up!</h2>
              <p className="text-gray-600 mb-6">
                There are no orders pending approval at the moment.
              </p>
              <Link to="/franchisor-dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Submitted {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRejectOrder(order)}
                        disabled={rejectOrderMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveOrder(order)}
                        disabled={approveOrderMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Franchisee Info */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Franchisee
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{order.user_profiles?.full_name}</p>
                        <p>{order.user_profiles?.email}</p>
                        {order.franchise_locations && (
                          <p className="mt-1">{order.franchise_locations.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Order Summary
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.order_items?.length || 0} items</p>
                        <p className="font-medium text-lg text-gray-900">
                          ₱{order.total_amount?.toLocaleString()}
                        </p>
                        {order.order_notes && (
                          <p className="mt-1 text-xs italic">"{order.order_notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment
                      </h4>
                      <div className="text-sm text-gray-600">
                        {order.payment_methods ? (
                          <>
                            <p className="font-medium">{order.payment_methods.payment_type}</p>
                            <p>{order.payment_methods.nickname}</p>
                          </>
                        ) : (
                          <p>No payment method</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Shipping
                      </h4>
                      <div className="text-sm text-gray-600">
                        {order.shipping_address ? (
                          <>
                            <p className="font-medium">{order.shipping_address.recipient_name}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.state_province}</p>
                          </>
                        ) : (
                          <p>No shipping address</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.products?.name} × {item.quantity}</span>
                            <span className="font-medium">₱{item.line_total?.toLocaleString()}</span>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{order.order_items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to approve order #{selectedOrder?.order_number}?
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Approval Comments (Optional)
              </label>
              <Textarea
                placeholder="Add any comments about this approval..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsApprovalDialogOpen(false)}
                disabled={approveOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmApproval}
                disabled={approveOrderMutation.isPending}
              >
                {approveOrderMutation.isPending ? 'Approving...' : 'Approve Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will reject order #{selectedOrder?.order_number} and notify the franchisee.
              </AlertDescription>
            </Alert>
            <div>
              <label className="block text-sm font-medium mb-2">
                Rejection Reason (Required)
              </label>
              <Textarea
                placeholder="Please provide a clear reason for rejecting this order..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsRejectionDialogOpen(false)}
                disabled={rejectOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmRejection}
                disabled={rejectOrderMutation.isPending || !rejectionReason.trim()}
              >
                {rejectOrderMutation.isPending ? 'Rejecting...' : 'Reject Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderApprovalDashboard;
