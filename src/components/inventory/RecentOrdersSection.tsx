
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';

interface Order {
  id: string;
  orderDate: string;
  items: any[];
  totalAmount: number;
  status: string;
}

interface RecentOrdersSectionProps {
  orders: Order[];
}

export const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
  orders
}) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5" />
          <span>Recent Orders</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
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
  );
};
