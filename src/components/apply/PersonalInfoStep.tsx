
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/pages/Apply';

interface PersonalInfoStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          placeholder="+63 9XX XXX XXXX"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="Street, Barangay, City, Province"
          rows={3}
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
