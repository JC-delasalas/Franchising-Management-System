
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const trimmedValue = value?.trim() || '';
  const isValid = trimmedValue.length > 0;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`]
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email?.trim() || '';
  const isValid = emailRegex.test(trimmedEmail);
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid email address']
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  // Philippine phone number validation - more flexible
  const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
  const cleanPhone = phone?.replace(/[\s\-\(\)]/g, '') || '';
  const isValid = phoneRegex.test(cleanPhone);
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid Philippine phone number (e.g., +63 9XX XXX XXXX)']
  };
};

export const validateName = (name: string, fieldName: string): ValidationResult => {
  const nameRegex = /^[a-zA-Z\s\-\.]{2,50}$/;
  const trimmedName = name?.trim() || '';
  const isValid = nameRegex.test(trimmedName);
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be 2-50 characters and contain only letters, spaces, hyphens, and periods`]
  };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const trimmedValue = value?.trim() || '';
  const isValid = trimmedValue.length >= minLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be at least ${minLength} characters long`]
  };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  const trimmedValue = value?.trim() || '';
  const isValid = trimmedValue.length <= maxLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be no more than ${maxLength} characters long`]
  };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors || []);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Utility function to validate form data
export const validateFormData = (formData: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!formData) {
    errors.push('Form data is required');
    return { isValid: false, errors };
  }

  // Add comprehensive form validation
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
  requiredFields.forEach(field => {
    if (!formData[field] || !formData[field].trim()) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
