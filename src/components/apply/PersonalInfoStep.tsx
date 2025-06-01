
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/pages/Apply';
import { 
  validateEmail, 
  validatePhone, 
  validateName, 
  validateRequired,
  combineValidations
} from '@/lib/validation';
import FormValidation from './FormValidation';

interface PersonalInfoStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, onInputChange }) => {
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = (field: keyof FormData, value: string) => {
    let validationResults;

    try {
      switch (field) {
        case 'firstName':
          validationResults = combineValidations(
            validateRequired(value, 'First Name'),
            validateName(value, 'First Name')
          );
          break;
        case 'lastName':
          validationResults = combineValidations(
            validateRequired(value, 'Last Name'),
            validateName(value, 'Last Name')
          );
          break;
        case 'email':
          validationResults = combineValidations(
            validateRequired(value, 'Email'),
            validateEmail(value)
          );
          break;
        case 'phone':
          validationResults = combineValidations(
            validateRequired(value, 'Phone'),
            validatePhone(value)
          );
          break;
        case 'address':
          validationResults = validateRequired(value, 'Address');
          break;
        default:
          validationResults = { isValid: true, errors: [] };
      }

      setErrors(prev => ({ ...prev, [field]: validationResults.errors || [] }));
      return validationResults.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setErrors(prev => ({ ...prev, [field]: ['Validation error occurred'] }));
      return false;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    try {
      onInputChange(field, value);
      if (touched[field]) {
        validateField(field, value);
      }
    } catch (error) {
      console.error('Input change error:', error);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    try {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, formData[field] || '');
    } catch (error) {
      console.error('Blur handler error:', error);
    }
  };

  // Initialize form data if not present
  useEffect(() => {
    const requiredFields: (keyof FormData)[] = ['firstName', 'lastName', 'email', 'phone', 'address'];
    requiredFields.forEach(field => {
      if (formData[field] === undefined) {
        onInputChange(field, '');
      }
    });
  }, [formData, onInputChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter your first name"
            className={errors.firstName?.length ? 'border-red-500' : ''}
            required
          />
          <FormValidation errors={errors.firstName || []} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter your last name"
            className={errors.lastName?.length ? 'border-red-500' : ''}
            required
          />
          <FormValidation errors={errors.lastName || []} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="your.email@example.com"
          className={errors.email?.length ? 'border-red-500' : ''}
          required
        />
        <FormValidation errors={errors.email || []} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="+63 9XX XXX XXXX"
          className={errors.phone?.length ? 'border-red-500' : ''}
          required
        />
        <FormValidation errors={errors.phone || []} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Complete Address *</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          onBlur={() => handleBlur('address')}
          placeholder="Street, Barangay, City, Province"
          className={errors.address?.length ? 'border-red-500' : ''}
          rows={3}
          required
        />
        <FormValidation errors={errors.address || []} />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
