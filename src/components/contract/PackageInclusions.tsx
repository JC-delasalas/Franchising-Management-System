
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface PackageInclusionsProps {
  packageInclusions: string[];
}

const PackageInclusions: React.FC<PackageInclusionsProps> = ({ packageInclusions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Inclusions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">What's Included</h4>
            <div className="space-y-3">
              {packageInclusions.map((inclusion, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{inclusion}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support Services</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-sm">Setup Support</h5>
                <p className="text-xs text-gray-600">Complete assistance with location setup and equipment installation</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-sm">Training Program</h5>
                <p className="text-xs text-gray-600">Comprehensive training for you and your staff</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-sm">Ongoing Support</h5>
                <p className="text-xs text-gray-600">Continuous operational and marketing support</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageInclusions;
