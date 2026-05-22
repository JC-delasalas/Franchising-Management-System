import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const SupplierProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-blue-600" />
            Supplier Products
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">
                Supplier product management functionality will be available in the next update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierProductsPage;
