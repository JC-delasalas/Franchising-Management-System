
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const isValid = value.trim().length > 0;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`]
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid email address']
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  // Philippine phone number validation
  const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
  const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid Philippine phone number']
  };
};

export const validateName = (name: string, fieldName: string): ValidationResult => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  const isValid = nameRegex.test(name);
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be 2-50 characters and contain only letters and spaces`]
  };
};

// Additional validation functions for better form handling
export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const isValid = value.trim().length >= minLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be at least ${minLength} characters long`]
  };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  const isValid = value.trim().length <= maxLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be no more than ${maxLength} characters long`]
  };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};
