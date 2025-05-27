
import React from 'react';
import { FormData } from '@/pages/Apply';

interface ReviewSubmitStepProps {
  formData: FormData;
}

const brands = [
  { id: 'siomai-king', name: 'Siomai King' },
  { id: 'juicy-lemon', name: 'Juicy Lemon' },
  { id: 'cafe-supremo', name: 'Café Supremo' },
  { id: 'bite-go-burgers', name: 'Bite & Go Burgers' }
];

const packages = {
  A: { name: 'Entry Level', price: '₱50,000', description: 'Food Cart Setup' },
  B: { name: 'Mid Tier', price: '₱120,000', description: 'Kiosk Setup' },
  C: { name: 'Advanced', price: '₱250,000', description: 'Food Stall Setup' },
  D: { name: 'Investor Tier', price: '₱500,000+', description: 'Mini Branch Setup' }
};

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Review & Submit</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Personal Information</h4>
          <p className="text-sm text-gray-600">
            {formData.firstName} {formData.lastName}<br />
            {formData.email}<br />
            {formData.phone}<br />
            {formData.address}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Business Experience</h4>
          <p className="text-sm text-gray-600">
            Experience: {formData.businessExperience}<br />
            Investment Capacity: {formData.investmentCapacity}<br />
            Timeframe: {formData.timeframe}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-900">Selected Franchise</h4>
          <p className="text-sm text-blue-800">
            Brand: {brands.find(b => b.id === formData.selectedBrand)?.name}<br />
            Package: {formData.selectedPackage && packages[formData.selectedPackage as keyof typeof packages]?.name}<br />
            Location: {formData.city}, {formData.province}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-green-900">Next Steps</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Application review (2-3 business days)</li>
            <li>• Initial consultation call</li>
            <li>• Document verification</li>
            <li>• Site visit and approval</li>
            <li>• Contract signing and training</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
