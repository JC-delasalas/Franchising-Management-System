
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/pages/Apply';

interface FranchiseSelectionStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
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

const FranchiseSelectionStep: React.FC<FranchiseSelectionStepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Franchise Selection</h3>
      <div className="space-y-2">
        <Label htmlFor="selectedBrand">Preferred Brand *</Label>
        <Select value={formData.selectedBrand} onValueChange={(value) => onInputChange('selectedBrand', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="selectedPackage">Package Tier *</Label>
        <Select value={formData.selectedPackage} onValueChange={(value) => onInputChange('selectedPackage', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a package" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(packages).map(([key, pkg]) => (
              <SelectItem key={key} value={key}>
                Package {key} - {pkg.name} ({pkg.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Preferred Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="City or specific area"
          required
        />
      </div>
      
      {formData.selectedPackage && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Package Summary:</h4>
          <div className="text-sm text-blue-800">
            <p><strong>Package:</strong> {packages[formData.selectedPackage as keyof typeof packages]?.name}</p>
            <p><strong>Investment:</strong> {packages[formData.selectedPackage as keyof typeof packages]?.price}</p>
            <p><strong>Setup:</strong> {packages[formData.selectedPackage as keyof typeof packages]?.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseSelectionStep;
