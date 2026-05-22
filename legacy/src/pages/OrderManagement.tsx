import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOrderManagement, useOrderPricing } from '@/hooks/useOrderManagement';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { PageHeaderWithBack } from '@/components/navigation/BackToDashboard';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  Send,
  MessageSquare
} from 'lucide-react';

const OrderManagement = () => {
  const { user, role } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'rejected' | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    from_date: '',
    to_date: ''
  });

  const {
    orders,
    pendingApprovals,
    orderMetrics,
    isLoading,
    approvalsLoading,
    isRealTimeConnected,
    processApproval,
    createShipment,
    confirmDelivery,
    cancelOrder,
    isProcessingApproval
  } = useOrderManagement(filters);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproval = () => {
    if (!selectedOrder || !approvalAction) return;
    
    processApproval({
      orderId: selectedOrder.id,
      action: approvalAction,
      comments: approvalComments
    });

    setSelectedOrder(null);
    setApprovalAction(null);
    setApprovalComments('');
  };

  const canApprove = (order: any) => {
    if (role === 'franchisee_manager' && order.status === 'pending_approval') return true;
    if (role === 'regional_coordinator' && order.status === 'level1_approved') return true;
    if (role === 'franchisor' && order.status === 'level2_approved') return true;
    return false;
  };

  const filteredOrders = orders?.filter(order => {
    if (selectedTab === 'pending' && !order.status.includes('pending') && !order.status.includes('approved')) return false;
    if (selectedTab === 'processing' && order.status !== 'processing') return false;
    if (selectedTab === 'shipped' && order.status !== 'shipped') return false;
    if (selectedTab === 'delivered' && order.status !== 'delivered') return false;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Order Management - FranchiseHub"
        description="Manage orders, approvals, and fulfillment across your franchise network"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeaderWithBack
          title="Order Management"
          subtitle="Manage orders, approvals, and fulfillment"
        />

        {/* Real-time Status Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isRealTimeConnected ? 'Real-time updates active' : 'Offline mode'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Order Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{orderMetrics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    ₱{orderMetrics.totalValue.toLocaleString()} total value
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{orderMetrics.pendingApprovalsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Require your attention
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{orderMetrics.shippedOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently shipping
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₱{Math.round(orderMetrics.averageOrderValue).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Per order
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        {pendingApprovals && pendingApprovals.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Orders Requiring Your Approval</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        ₱{order.grand_total.toLocaleString()} • {order.franchise_locations?.name}
                      </p>
                      <p className="text-xs text-orange-700">
                        Priority: {order.priority} • Created: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Order Approval - {selectedOrder?.order_number}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Details */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-2">Order Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>Order Number: {selectedOrder.order_number}</p>
                                    <p>Total Amount: ₱{selectedOrder.grand_total.toLocaleString()}</p>
                                    <p>Priority: <Badge className={getPriorityColor(selectedOrder.priority)}>{selectedOrder.priority}</Badge></p>
                                    <p>Location: {selectedOrder.franchise_locations?.name}</p>
                                    <p>Created by: {selectedOrder.user_profiles?.full_name}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Order Items</h4>
                                  <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                                    {selectedOrder.order_items?.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between">
                                        <span>{item.products?.name} x{item.quantity}</span>
                                        <span>₱{item.total_price.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Approval Actions */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Action</label>
                                  <Select value={approvalAction || ''} onValueChange={(value: any) => setApprovalAction(value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approved">Approve</SelectItem>
                                      <SelectItem value="rejected">Reject</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">Comments</label>
                                  <Textarea
                                    value={approvalComments}
                                    onChange={(e) => setApprovalComments(e.target.value)}
                                    placeholder="Add comments (optional)"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedOrder(null);
                                      setApprovalAction(null);
                                      setApprovalComments('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleApproval}
                                    disabled={!approvalAction || isProcessingApproval}
                                    variant={approvalAction === 'approved' ? 'default' : 'destructive'}
                                  >
                                    {isProcessingApproval ? 'Processing...' : `${approvalAction === 'approved' ? 'Approve' : 'Reject'} Order`}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Orders</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.user_profiles?.full_name}</TableCell>
                          <TableCell>{order.franchise_locations?.name}</TableCell>
                          <TableCell>₱{(order.total_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {canApprove(order) && (
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderManagement;
