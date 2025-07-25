
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import ContractDetails from '@/components/contract/ContractDetails';
import PackageInclusions from '@/components/contract/PackageInclusions';
import ContractDocuments from '@/components/contract/ContractDocuments';
import ContractMilestones from '@/components/contract/ContractMilestones';
import ContractSidebar from '@/components/contract/ContractSidebar';
import { downloadDocument, downloadAllDocuments } from '@/utils/downloadUtils';
import { upgradePackages, processUpgrade } from '@/services/upgradeService';
import { ArrowLeft } from 'lucide-react';

const ContractPackage = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const contractDetails = {
    packageType: 'Package B - Mid Tier',
    investment: '₱120,000',
    agreementDate: 'January 1, 2024',
    franchiseTerm: '5 years',
    territory: 'Makati CBD',
    royaltyRate: '8% monthly',
    renewalOption: 'Available',
    status: 'Active'
  };

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

  const documents = [
    {
      name: 'Franchise Agreement',
      type: 'Contract',
      size: '2.1 MB',
      lastUpdated: '2024-01-01',
      description: 'Complete franchise agreement with terms and conditions'
    },
    {
      name: 'Operations Manual',
      type: 'Guide',
      size: '8.5 MB',
      lastUpdated: '2024-01-10',
      description: 'Comprehensive operations and procedures manual'
    },
    {
      name: 'Territory Map',
      type: 'Document',
      size: '1.2 MB',
      lastUpdated: '2024-01-01',
      description: 'Detailed territory boundaries and restrictions'
    },
    {
      name: 'Financial Projections',
      type: 'Spreadsheet',
      size: '0.8 MB',
      lastUpdated: '2024-01-05',
      description: 'Revenue projections and financial planning tools'
    }
  ];

  const milestones = [
    { title: 'Contract Signed', date: '2024-01-01', status: 'completed' as const },
    { title: 'Initial Payment', date: '2024-01-01', status: 'completed' as const },
    { title: 'Location Setup', date: '2024-01-15', status: 'completed' as const },
    { title: 'Staff Training', date: '2024-01-20', status: 'in-progress' as const },
    { title: 'Grand Opening', date: '2024-02-01', status: 'upcoming' as const }
  ];

  const handleDownload = async (docName: string) => {
    setIsDownloading(docName);
    try {
      await downloadDocument(docName);
      toast({
        title: "Download Started",
        description: `${docName} is being downloaded...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading('all');
    try {
      await downloadAllDocuments();
      toast({
        title: "Download Started",
        description: "All documents are being downloaded...",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the documents.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUpgrade = async (packageName: string, additionalCost: number) => {
    setIsUpgrading(true);
    try {
      const result = await processUpgrade(packageName, additionalCost);
      if (result.success) {
        toast({
          title: "Upgrade Request Submitted",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade request.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Contract & Package - Franchisee Dashboard"
        description="View your franchise contract details and package information"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link to="/franchisee-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract & Package</h1>
              <p className="text-gray-600">View your franchise agreement and package details</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="contract" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contract">Contract</TabsTrigger>
                <TabsTrigger value="package">Package</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
              </TabsList>

              <TabsContent value="contract">
                <ContractDetails
                  contractDetails={contractDetails}
                  onDownload={handleDownload}
                  isDownloading={isDownloading === 'Franchise Agreement'}
                />
              </TabsContent>

              <TabsContent value="package">
                <PackageInclusions packageInclusions={packageInclusions} />
              </TabsContent>

              <TabsContent value="documents">
                <ContractDocuments
                  documents={documents}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
              </TabsContent>

              <TabsContent value="milestones">
                <ContractMilestones milestones={milestones} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <ContractSidebar
              onDownloadAll={handleDownloadAll}
              isDownloading={isDownloading === 'all'}
              upgradePackages={upgradePackages}
              onUpgrade={handleUpgrade}
              isUpgrading={isUpgrading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractPackage;
