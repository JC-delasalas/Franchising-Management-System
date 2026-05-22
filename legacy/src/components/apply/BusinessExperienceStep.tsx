
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormData } from '@/pages/Apply';
import { Briefcase, DollarSign, Calendar, HelpCircle } from 'lucide-react';

interface BusinessExperienceStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const BusinessExperienceStep: React.FC<BusinessExperienceStepProps> = ({ formData, onInputChange }) => {
  const [showInvestmentHelper, setShowInvestmentHelper] = useState(false);

  const getExperienceRecommendation = (experience: string) => {
    switch (experience) {
      case 'none':
        return 'Perfect! Our comprehensive training program will guide you through every step.';
      case 'limited':
        return 'Great foundation! You\'ll benefit from our mentorship and support systems.';
      case 'moderate':
        return 'Excellent! Your experience will help you hit the ground running.';
      case 'extensive':
        return 'Outstanding! You\'re well-positioned to maximize your franchise potential.';
      default:
        return '';
    }
  };

  const getInvestmentGuidance = (capacity: string) => {
    switch (capacity) {
      case '50k-100k':
        return 'Food cart and small retail opportunities available';
      case '100k-250k':
        return 'Food stalls, service franchises, and retail stores';
      case '250k-500k':
        return 'Restaurant franchises and premium retail concepts';
      case '500k+':
        return 'Full-service restaurants and multi-unit opportunities';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Business Experience</h3>
        <p className="text-gray-600">Help us understand your background to recommend the best franchise opportunities for you.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Previous Business Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessExperience">Experience Level *</Label>
            <Select 
              value={formData.businessExperience} 
              onValueChange={(value) => onInputChange('businessExperience', value)}
            >
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

          {formData.businessExperience && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                {getExperienceRecommendation(formData.businessExperience)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="businessDescription">
              Describe any relevant business or management experience (Optional)
            </Label>
            <Textarea
              id="businessDescription"
              placeholder="Tell us about your work history, leadership roles, or any business ventures..."
              value={formData.businessDescription || ''}
              onChange={(e) => onInputChange('businessDescription', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Investment Capacity
            <button
              type="button"
              onClick={() => setShowInvestmentHelper(!showInvestmentHelper)}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
              aria-label="Investment guidance"
            >
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investmentCapacity">Available Investment Range *</Label>
            <Select 
              value={formData.investmentCapacity} 
              onValueChange={(value) => onInputChange('investmentCapacity', value)}
            >
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

          {showInvestmentHelper && (
            <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-yellow-800">Investment includes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Franchise fee and initial setup costs</li>
                <li>• Equipment and inventory</li>
                <li>• Store fixtures and signage</li>
                <li>• Working capital for first 3 months</li>
                <li>• Training and marketing launch support</li>
              </ul>
            </div>
          )}

          {formData.investmentCapacity && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Recommended opportunities:</strong> {getInvestmentGuidance(formData.investmentCapacity)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timeframe">When do you plan to start? *</Label>
            <Select 
              value={formData.timeframe} 
              onValueChange={(value) => onInputChange('timeframe', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">
                  <div className="flex items-center justify-between w-full">
                    <span>Immediately</span>
                    <Badge variant="secondary" className="ml-2">Fast Track</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="1-3months">Within 1-3 months</SelectItem>
                <SelectItem value="3-6months">Within 3-6 months</SelectItem>
                <SelectItem value="6months+">More than 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.timeframe === 'immediately' && (
            <div className="bg-orange-50 p-3 rounded-lg mt-3">
              <p className="text-sm text-orange-800">
                <strong>Fast Track Program:</strong> Priority processing and dedicated support for immediate starters!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessExperienceStep;
