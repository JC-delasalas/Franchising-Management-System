import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { downloadDocument, downloadAllDocuments } from '@/utils/downloadUtils';
import { upgradePackages, processUpgrade } from '@/services/upgradeService';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  ArrowUp,
  Shield,
  Clock,
  Users
} from 'lucide-react';

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
    { title: 'Contract Signed', date: '2024-01-01', status: 'completed' },
    { title: 'Initial Payment', date: '2024-01-01', status: 'completed' },
    { title: 'Location Setup', date: '2024-01-15', status: 'completed' },
    { title: 'Staff Training', date: '2024-01-20', status: 'in-progress' },
    { title: 'Grand Opening', date: '2024-02-01', status: 'upcoming' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'upcoming':
        return <Calendar className="w-5 h-5 text-gray-400" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

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
        title: "Downloads Started",
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

                        <Button className="w-full mt-4" onClick={() => handleDownload('Franchise Agreement')} disabled={isDownloading === 'Franchise Agreement'}>
                          {isDownloading === 'Franchise Agreement' ? (
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
              </TabsContent>

              <TabsContent value="package">
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
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-gray-600">{doc.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>{doc.type}</span>
                                <span>{doc.size}</span>
                                <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleDownload(doc.name)} disabled={isDownloading === doc.name}>
                            {isDownloading === doc.name ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle>Franchise Setup Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          {getStatusIcon(milestone.status)}
                          <div className="flex-1">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {milestone.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
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
                  onClick={handleDownloadAll}
                  disabled={isDownloading === 'all'}
                >
                  {isDownloading === 'all' ? (
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
                        onClick={() => handleUpgrade(option.name, option.additionalCost)}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractPackage;
