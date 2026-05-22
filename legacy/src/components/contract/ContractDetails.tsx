
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { FileText, Download, Shield } from 'lucide-react';

interface ContractDetailsProps {
  contractDetails: {
    packageType: string;
    investment: string;
    agreementDate: string;
    franchiseTerm: string;
    territory: string;
    royaltyRate: string;
    renewalOption: string;
    status: string;
  };
  onDownload: (docName: string) => void;
  isDownloading: boolean;
}

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contractDetails,
  onDownload,
  isDownloading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Franchise Agreement Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">{contractDetails.packageType}</h3>
              <p className="text-blue-800 text-lg font-bold">{contractDetails.investment}</p>
              <p className="text-blue-700 text-sm">Total Investment</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Agreement Date:</span>
                <span className="font-medium">{contractDetails.agreementDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Franchise Term:</span>
                <span className="font-medium">{contractDetails.franchiseTerm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Territory:</span>
                <span className="font-medium">{contractDetails.territory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Royalty Rate:</span>
                <span className="font-medium">{contractDetails.royaltyRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renewal Option:</span>
                <span className="font-medium text-green-600">{contractDetails.renewalOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">{contractDetails.status}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Key Terms & Conditions</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Exclusive territory protection within 500m radius</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Trademark and brand usage rights included</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Ongoing training and support provided</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Marketing fund contribution: 2% of gross sales</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Quality standards and compliance requirements</span>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={() => onDownload('Franchise Agreement')} disabled={isDownloading}>
              {isDownloading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Full Contract
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractDetails;
