
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const packageInclusions = [
  'Kiosk Setup & Installation',
  'POS System & Training',
  'Complete Marketing Kit',
  '30-Day Launch Support',
  'Branded Uniforms (5 sets)',
  'Initial Inventory Package',
  'Operations Manual',
  'Territory Protection'
];

export const ContractTab: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Franchise Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Package B - Mid Tier</h4>
            <p className="text-blue-800 text-sm">Investment: ₱120,000</p>
            <p className="text-blue-700 text-xs mt-2">Agreement Date: January 1, 2024</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Franchise Term:</span>
              <span className="text-sm font-medium">5 years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Territory:</span>
              <span className="text-sm font-medium">Makati CBD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Royalty Rate:</span>
              <span className="text-sm font-medium">8% monthly</span>
            </div>
          </div>
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Contract
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Package Inclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {packageInclusions.map((inclusion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{inclusion}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
