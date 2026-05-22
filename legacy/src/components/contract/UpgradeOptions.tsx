
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { ArrowUp } from 'lucide-react';

interface UpgradePackage {
  name: string;
  price: string;
  additionalCost: number;
  savings: string;
}

interface UpgradeOptionsProps {
  upgradePackages: UpgradePackage[];
  onUpgrade: (packageName: string, additionalCost: number) => void;
  isUpgrading: boolean;
}

const UpgradeOptions: React.FC<UpgradeOptionsProps> = ({
  upgradePackages,
  onUpgrade,
  isUpgrading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Your Package</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upgradePackages.map((option, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">{option.name}</h4>
              <p className="text-lg font-bold text-green-600 mb-2">{option.price}</p>
              <p className="text-xs text-green-600 mb-3">{option.savings}</p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => onUpgrade(option.name, option.additionalCost)}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ArrowUp className="w-4 h-4 mr-2" />
                )}
                Upgrade Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeOptions;
