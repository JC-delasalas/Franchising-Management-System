
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import UpgradeOptions from '@/components/contract/UpgradeOptions';
import { Download, Calendar, Users } from 'lucide-react';

interface ContractSidebarProps {
  onDownloadAll: () => void;
  isDownloading: boolean;
  upgradePackages: any[];
  onUpgrade: (packageName: string, additionalCost: number) => Promise<void>;
  isUpgrading: boolean;
}

const ContractSidebar: React.FC<ContractSidebarProps> = ({
  onDownloadAll,
  isDownloading,
  upgradePackages,
  onUpgrade,
  isUpgrading
}) => {
  return (
    <div>
      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onDownloadAll}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download All Documents
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Review Meeting
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <UpgradeOptions
        upgradePackages={upgradePackages}
        onUpgrade={onUpgrade}
        isUpgrading={isUpgrading}
      />
    </div>
  );
};

export default React.memo(ContractSidebar);
