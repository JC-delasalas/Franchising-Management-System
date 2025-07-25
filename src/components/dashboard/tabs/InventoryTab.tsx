
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Package, AlertTriangle, RefreshCw, Warehouse, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { InventoryAPI, UnifiedInventoryItem } from '@/api/inventory';

interface StockStatus {
  status: string;
  className: string;
}

const getStockStatus = (item: UnifiedInventoryItem): StockStatus => {
  const stockPercentage = item.max_stock_level > 0 ? (item.quantity / item.max_stock_level) * 100 : 100;

  if (item.quantity <= item.reorder_point) {
    return { status: 'Critical', className: 'bg-red-100 text-red-800' };
  } else if (stockPercentage <= 30) {
    return { status: 'Low', className: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { status: 'Good', className: 'bg-green-100 text-green-800' };
  }
};

export const InventoryTab: React.FC = () => {
  const { user } = useAuth();

  // Get user's primary location
  const locationId = user?.metadata?.primary_location_id;

  // Fetch unified inventory data (works for both warehouses and franchise locations)
  const { data: inventoryItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unified-inventory', locationId],
    queryFn: async (): Promise<UnifiedInventoryItem[]> => {
      if (!locationId) throw new Error('Location ID required');
      return await InventoryAPI.getUnifiedInventoryByLocation(locationId);
    },
    enabled: !!locationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  if (!locationId) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4" />
        <p>Location information not available. Please contact support.</p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Reorder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Error loading inventory data. Please try again.</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {inventoryItems[0]?.inventory_type === 'warehouse' ? (
              <Warehouse className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            Current Inventory ({inventoryItems.length} items)
            {inventoryItems[0] && (
              <span className="text-sm font-normal text-gray-500">
                • {inventoryItems[0].location_name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4" />
              <p>No inventory items found for this location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} units remaining • Available: {item.available_quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.sku} • Reorder at: {item.reorder_point} • Value: ₱{item.total_value.toLocaleString()}
                      </p>
                      {item.inventory_type === 'warehouse' && item.reserved_quantity > 0 && (
                        <p className="text-xs text-orange-600">
                          Reserved: {item.reserved_quantity} units
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={stockStatus.className}>
                        {stockStatus.status}
                      </Badge>
                      {stockStatus.status !== 'Good' && (
                        <Button size="sm" className="ml-2">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Order
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reorder</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
              <p>No items available for reorder.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {inventoryItems
                  .filter(item => item.quantity <= item.reorder_point)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-red-600">
                          Only {item.quantity} left • Reorder needed
                        </p>
                        <p className="text-xs text-gray-500">
                          Cost: ₱{item.unit_cost?.toLocaleString() || 'N/A'} per unit • Total: ₱{item.total_value.toLocaleString()}
                        </p>
                        {item.inventory_type === 'warehouse' && (
                          <p className="text-xs text-blue-600">
                            Warehouse: {item.location_name}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  ))}
              </div>

              {inventoryItems.filter(item => item.quantity <= item.reorder_point).length === 0 && (
                <div className="text-center p-8 text-green-600">
                  <Package className="w-12 h-12 mx-auto mb-4" />
                  <p>All items are well stocked!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total inventory value: ₱{inventoryItems.reduce((sum, item) => sum + item.total_value, 0).toLocaleString()}
                  </p>
                </div>
              )}

              <Separator className="my-4" />
              <Button className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Full Catalog
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
