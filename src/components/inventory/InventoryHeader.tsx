
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const InventoryHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" asChild>
          <Link to="/franchisee-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Inventory Order</h1>
      <p className="text-gray-600">Manage your stock levels and place orders</p>
    </div>
  );
};
