
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus } from 'lucide-react';
import { InventoryItem } from './InventoryItemCard';

export interface CartItem extends InventoryItem {
  quantity: number;
}

interface ShoppingCartProps {
  cart: CartItem[];
  orderNotes: string;
  onOrderNotesChange: (notes: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
  isSubmitting: boolean;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  orderNotes,
  onOrderNotesChange,
  onUpdateQuantity,
  onCheckout,
  isSubmitting
}) => {
  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCartIcon className="w-5 h-5" />
          <span>Cart ({cart.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">₱{item.price.toLocaleString()}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                <Textarea
                  placeholder="Add any special instructions or notes..."
                  value={orderNotes}
                  onChange={(e) => onOrderNotesChange(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>₱{getTotalAmount().toLocaleString()}</span>
              </div>

              <Button 
                onClick={onCheckout} 
                className="w-full"
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
