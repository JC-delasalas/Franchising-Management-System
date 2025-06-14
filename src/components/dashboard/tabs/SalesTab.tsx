
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';

export const SalesTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Daily Sales Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sales Date</label>
              <Input type="date" defaultValue="2024-01-15" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Total Sales Amount</label>
              <Input placeholder="₱ 0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Transactions</label>
              <Input placeholder="0" type="number" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Sales Sheet</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload Excel file or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">Supported: .xlsx, .xls, .csv</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Save as Draft</Button>
          <Button>Submit Report</Button>
        </div>
      </CardContent>
    </Card>
  );
};
