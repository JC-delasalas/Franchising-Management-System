
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const inventoryItems = [
  { name: 'Siomai Mix', stock: 45, unit: 'pcs', reorderLevel: 20, status: 'Good' },
  { name: 'Sauce Packets', stock: 12, unit: 'boxes', reorderLevel: 15, status: 'Low' },
  { name: 'Disposable Containers', stock: 156, unit: 'pcs', reorderLevel: 50, status: 'Good' },
  { name: 'Paper Bags', stock: 8, unit: 'bundles', reorderLevel: 10, status: 'Critical' }
];

const quickOrderProducts = [
  { name: 'Siomai Mix (500pcs)', price: '₱2,500' },
  { name: 'Sauce Packets (100pcs)', price: '₱450' },
  { name: 'Disposable Containers (200pcs)', price: '₱1,200' },
  { name: 'Paper Bags (50 bundles)', price: '₱800' }
];

const getStockStatus = (status: string) => {
  switch (status) {
    case 'Good': return 'bg-green-100 text-green-800';
    case 'Low': return 'bg-yellow-100 text-yellow-800';
    case 'Critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const InventoryTab: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.stock} {item.unit} remaining</p>
                </div>
                <div className="text-right">
                  <Badge className={getStockStatus(item.status)}>
                    {item.status}
                  </Badge>
                  {item.status !== 'Good' && (
                    <Button size="sm" className="ml-2" asChild>
                      <Link to={ROUTES.FRANCHISEE.INVENTORY_ORDER}>Order</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quickOrderProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.price}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={ROUTES.FRANCHISEE.INVENTORY_ORDER}>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <Button className="w-full" asChild>
            <Link to={ROUTES.FRANCHISEE.INVENTORY_ORDER}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Full Catalog
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
