
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradeBannerProps {
  showUpgrade: boolean;
  onClose: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ showUpgrade, onClose }) => {
  if (!showUpgrade) return null;

  return (
    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Upgrade to Package C - Advanced</h3>
            <p className="text-purple-700">Get Food Stall setup + POS System + Uniforms for just ₱130,000 more!</p>
            <ul className="text-sm text-purple-600 mt-2">
              <li>• Larger territory rights</li>
              <li>• Advanced POS integration</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link to="/franchisee/contract-package">
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeBanner;
