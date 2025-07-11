
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  status: 'Good' | 'Low' | 'Critical';
  price: number;
  category: string;
}

interface InventoryItemCardProps {
  item: InventoryItem;
  onAddToCart: (item: InventoryItem) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onAddToCart
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good':
        return <Badge className="bg-green-100 text-green-800">Good Stock</Badge>;
      case 'Low':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusBadge(item.status)}
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Current Stock: {item.currentStock} {item.unit}
            </p>
            {item.status !== 'Good' && (
              <div className="flex items-center space-x-1 text-sm text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Reorder Level: {item.reorderLevel} {item.unit}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            ₱{item.price.toLocaleString()}
          </span>
          <Button onClick={() => onAddToCart(item)} size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
