
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/pages/Apply';

interface BusinessExperienceStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const BusinessExperienceStep: React.FC<BusinessExperienceStepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Business Experience</h3>
      <div className="space-y-2">
        <Label htmlFor="businessExperience">Previous Business Experience *</Label>
        <Select value={formData.businessExperience} onValueChange={(value) => onInputChange('businessExperience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No previous business experience</SelectItem>
            <SelectItem value="limited">Limited experience (1-2 years)</SelectItem>
            <SelectItem value="moderate">Moderate experience (3-5 years)</SelectItem>
            <SelectItem value="extensive">Extensive experience (5+ years)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="investmentCapacity">Investment Capacity *</Label>
        <Select value={formData.investmentCapacity} onValueChange={(value) => onInputChange('investmentCapacity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your investment range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50k-100k">₱50,000 - ₱100,000</SelectItem>
            <SelectItem value="100k-250k">₱100,000 - ₱250,000</SelectItem>
            <SelectItem value="250k-500k">₱250,000 - ₱500,000</SelectItem>
            <SelectItem value="500k+">₱500,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeframe">When do you plan to start? *</Label>
        <Select value={formData.timeframe} onValueChange={(value) => onInputChange('timeframe', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediately">Immediately</SelectItem>
            <SelectItem value="1-3months">Within 1-3 months</SelectItem>
            <SelectItem value="3-6months">Within 3-6 months</SelectItem>
            <SelectItem value="6months+">More than 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BusinessExperienceStep;
