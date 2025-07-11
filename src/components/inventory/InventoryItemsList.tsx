
import React from 'react';
import { InventoryItemCard, InventoryItem } from './InventoryItemCard';

interface InventoryItemsListProps {
  items: InventoryItem[];
  onAddToCart: (item: InventoryItem) => void;
}

export const InventoryItemsList: React.FC<InventoryItemsListProps> = ({
  items,
  onAddToCart
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
