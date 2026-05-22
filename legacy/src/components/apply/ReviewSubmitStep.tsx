
import React from 'react';
import { FormData } from '@/pages/Apply';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Briefcase, MapPin } from 'lucide-react';

interface ReviewSubmitStepProps {
  formData: FormData;
}

const brands = [
  { id: 'siomai-shop', name: 'Siomai Shop' },
  { id: 'lemon-juice-stand', name: 'Lemon Juice Stand' },
  { id: 'coffee-shop', name: 'Coffee Shop' },
  { id: 'burger-fries', name: 'Burger & Fries' }
];

const packages = {
  A: { name: 'Entry Level', price: '₱50,000', description: 'Food Cart Setup' },
  B: { name: 'Mid Tier', price: '₱120,000', description: 'Kiosk Setup' },
  C: { name: 'Advanced', price: '₱250,000', description: 'Food Stall Setup' },
  D: { name: 'Investor Tier', price: '₱500,000+', description: 'Mini Branch Setup' }
};

const experienceLabels = {
  'none': 'No previous business experience',
  'limited': 'Limited experience (1-2 years)',
  'moderate': 'Moderate experience (3-5 years)',
  'extensive': 'Extensive experience (5+ years)'
};

const investmentLabels = {
  '50k-100k': '₱50,000 - ₱100,000',
  '100k-250k': '₱100,000 - ₱250,000',
  '250k-500k': '₱250,000 - ₱500,000',
  '500k+': '₱500,000+'
};

const timeframeLabels = {
  'immediately': 'Immediately',
  '1-3months': 'Within 1-3 months',
  '3-6months': 'Within 3-6 months',
  '6months+': 'More than 6 months'
};

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formData }) => {
  const selectedBrand = brands.find(b => b.id === formData.selectedBrand);
  const selectedPackage = formData.selectedPackage && packages[formData.selectedPackage as keyof typeof packages];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Review & Submit</h3>
        <p className="text-gray-600">Please review your information before submitting your application.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {formData.phone}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Address:</span> {formData.address}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Business Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Experience Level:</span>{' '}
                {experienceLabels[formData.businessExperience as keyof typeof experienceLabels] || formData.businessExperience}
              </div>
              <div>
                <span className="font-medium">Investment Capacity:</span>{' '}
                {investmentLabels[formData.investmentCapacity as keyof typeof investmentLabels] || formData.investmentCapacity}
              </div>
              <div>
                <span className="font-medium">Timeline:</span>{' '}
                {timeframeLabels[formData.timeframe as keyof typeof timeframeLabels] || formData.timeframe}
              </div>
              {formData.businessDescription && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-600">{formData.businessDescription}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
              <MapPin className="w-5 h-5" />
              Selected Franchise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium text-blue-900">Brand:</span>{' '}
                <Badge variant="secondary" className="ml-1">
                  {selectedBrand?.name || 'Not selected'}
                </Badge>
              </div>
              {selectedPackage && (
                <div>
                  <span className="font-medium text-blue-900">Package:</span>{' '}
                  <Badge variant="secondary" className="ml-1">
                    {selectedPackage.name} - {selectedPackage.price}
                  </Badge>
                  <p className="text-xs text-blue-700 mt-1">{selectedPackage.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Location:</span>{' '}
                {formData.city && formData.province ? (
                  <span className="text-blue-800">{formData.city}, {formData.province}</span>
                ) : (
                  <span className="text-gray-500">Not specified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span><strong>Application Review:</strong> 2-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span><strong>Initial Consultation:</strong> Phone/video call with our team</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span><strong>Document Verification:</strong> Review of submitted documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span><strong>Site Visit:</strong> Location assessment and approval</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span><strong>Contract & Training:</strong> Final agreement and comprehensive training program</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
