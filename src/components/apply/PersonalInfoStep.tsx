
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/pages/Apply';
import { validateEmail, validatePhone, validateName, validateRequired } from '@/lib/validation';

interface PersonalInfoStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, onInputChange }) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = (field: keyof FormData, value: string) => {
    let error = '';

    switch (field) {
      case 'firstName':
      case 'lastName':
        const nameResult = validateName(value, field === 'firstName' ? 'First Name' : 'Last Name');
        error = nameResult.errors[0] || '';
        break;
      case 'email':
        const emailResult = validateEmail(value);
        error = emailResult.errors[0] || '';
        break;
      case 'phone':
        const phoneResult = validatePhone(value);
        error = phoneResult.errors[0] || '';
        break;
      case 'address':
        const addressResult = validateRequired(value, 'Address');
        error = addressResult.errors[0] || '';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    onInputChange(field, value);
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter your first name"
            className={errors.firstName ? 'border-red-500' : ''}
            required
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter your last name"
            className={errors.lastName ? 'border-red-500' : ''}
            required
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="your.email@example.com"
          className={errors.email ? 'border-red-500' : ''}
          required
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="+63 9XX XXX XXXX"
          className={errors.phone ? 'border-red-500' : ''}
          required
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          onBlur={() => handleBlur('address')}
          placeholder="Street, Barangay, City, Province"
          className={errors.address ? 'border-red-500' : ''}
          rows={3}
          required
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
