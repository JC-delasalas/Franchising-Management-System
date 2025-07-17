import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Package, Users, TrendingUp, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FranchiseAPI } from '@/api/franchises';

interface FranchisePackage {
  id: string;
  name: string;
  description: string;
  initial_fee: number;
  monthly_royalty_rate: number;
  features: string[];
  inclusions: {
    equipment: string[];
    marketing: string[];
    training: string[];
    support: string[];
  };
  target_market: string;
  estimated_roi: string;
  territory_size: string;
  is_popular: boolean;
}

interface PackageSelectionProps {
  franchiseId: string;
  onPackageSelect: (packageId: string, packageData: FranchisePackage) => void;
  selectedPackageId?: string;
}

export const PackageSelection: React.FC<PackageSelectionProps> = ({
  franchiseId,
  onPackageSelect,
  selectedPackageId
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(selectedPackageId || null);

  // Fetch franchise packages
  const { data: packages, isLoading } = useQuery({
    queryKey: ['franchise-packages', franchiseId],
    queryFn: () => FranchiseAPI.getFranchisePackages(franchiseId),
    staleTime: 10 * 60 * 1000,
  });

  const handlePackageSelect = (pkg: FranchisePackage) => {
    setSelectedPackage(pkg.id);
    onPackageSelect(pkg.id, pkg);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Choose Your Franchise Package</h2>
          <p className="text-gray-600">Loading available packages...</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mock packages if none exist in database
  const mockPackages: FranchisePackage[] = [
    {
      id: 'starter',
      name: 'Starter Package',
      description: 'Perfect for first-time franchise owners looking to enter the market',
      initial_fee: 150000,
      monthly_royalty_rate: 5000,
      features: ['Basic Equipment', 'Initial Training', 'Marketing Kit', '6-month Support'],
      inclusions: {
        equipment: ['Coffee Machine', 'POS System', 'Basic Furniture', 'Initial Inventory'],
        marketing: ['Logo Design', 'Basic Signage', 'Social Media Templates', 'Grand Opening Kit'],
        training: ['2-week Training Program', 'Operations Manual', 'Online Resources'],
        support: ['6-month Phone Support', 'Monthly Check-ins', 'Basic Troubleshooting']
      },
      target_market: 'Small communities, suburban areas',
      estimated_roi: '12-18 months',
      territory_size: '5km radius',
      is_popular: false
    },
    {
      id: 'professional',
      name: 'Professional Package',
      description: 'Comprehensive package for serious entrepreneurs ready to scale',
      initial_fee: 250000,
      monthly_royalty_rate: 7500,
      features: ['Premium Equipment', 'Extended Training', 'Marketing Campaign', '12-month Support', 'Territory Protection'],
      inclusions: {
        equipment: ['Premium Coffee Machines', 'Advanced POS System', 'Premium Furniture', 'Extended Inventory', 'Kitchen Equipment'],
        marketing: ['Professional Branding', 'Digital Marketing Campaign', 'Website Development', 'Local Advertising Budget'],
        training: ['4-week Intensive Training', 'Management Training', 'Staff Training Program', 'Ongoing Workshops'],
        support: ['12-month Dedicated Support', 'Weekly Check-ins', 'Business Consulting', 'Performance Analytics']
      },
      target_market: 'Urban areas, business districts',
      estimated_roi: '8-12 months',
      territory_size: '10km radius',
      is_popular: true
    },
    {
      id: 'premium',
      name: 'Premium Package',
      description: 'Ultimate package for established business owners seeking premium positioning',
      initial_fee: 400000,
      monthly_royalty_rate: 12500,
      features: ['Luxury Equipment', 'VIP Training', 'Premium Marketing', 'Lifetime Support', 'Exclusive Territory', 'Multi-location Rights'],
      inclusions: {
        equipment: ['Luxury Coffee Equipment', 'Smart POS System', 'Designer Furniture', 'Premium Inventory', 'Full Kitchen Setup', 'Tech Integration'],
        marketing: ['Premium Brand Package', 'Comprehensive Digital Strategy', 'Professional Website', 'Influencer Partnerships', 'PR Campaign'],
        training: ['6-week Executive Training', 'Leadership Development', 'Multi-location Management', 'Financial Planning', 'Advanced Operations'],
        support: ['Lifetime Support', 'Dedicated Account Manager', 'Quarterly Business Reviews', 'Advanced Analytics', 'Growth Consulting']
      },
      target_market: 'Premium locations, high-traffic areas',
      estimated_roi: '6-10 months',
      territory_size: '15km radius',
      is_popular: false
    }
  ];

  const displayPackages = packages && packages.length > 0 ? packages : mockPackages;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Franchise Package</h2>
        <p className="text-gray-600">Select the package that best fits your business goals and investment capacity</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPackages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPackage === pkg.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            } ${pkg.is_popular ? 'border-blue-200' : ''}`}
            onClick={() => handlePackageSelect(pkg)}
          >
            {pkg.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                {selectedPackage === pkg.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">{pkg.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₱{pkg.initial_fee.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Initial Investment</div>
                  <div className="text-sm text-gray-600 mt-1">
                    + ₱{pkg.monthly_royalty_rate.toLocaleString()}/month royalty
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Key Features
                </h4>
                <ul className="space-y-1">
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <Check className="w-3 h-3 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-sm text-gray-500">
                      +{pkg.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">ROI Timeline</div>
                  <div className="text-gray-600">{pkg.estimated_roi}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Territory</div>
                  <div className="text-gray-600">{pkg.territory_size}</div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className={`w-full ${
                  selectedPackage === pkg.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePackageSelect(pkg);
                }}
              >
                {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-800">Package Selected</h3>
          </div>
          <p className="text-blue-700">
            You've selected the <strong>{displayPackages.find(p => p.id === selectedPackage)?.name}</strong> package. 
            This includes everything you need to start your franchise journey successfully.
          </p>
          <div className="mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Continue to Application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
