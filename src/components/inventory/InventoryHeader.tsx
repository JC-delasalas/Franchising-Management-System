
import React from 'react';
import { BackButton } from '@/components/ui/BackButton';

export const InventoryHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <BackButton 
          to="/franchisee-dashboard" 
          label="Back to Dashboard"
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Inventory Order</h1>
      <p className="text-gray-600">Manage your stock levels and place orders</p>
    </div>
  );
};
