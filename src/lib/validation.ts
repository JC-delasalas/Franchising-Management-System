// Input validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone validation (Philippine format)
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Philippine mobile numbers: 09XXXXXXXXX or +639XXXXXXXXX
    // Landline: 02XXXXXXXX or +6302XXXXXXXX
    const mobileRegex = /^(09\d{9}|639\d{9})$/;
    const landlineRegex = /^(02\d{8}|6302\d{8})$/;
    
    if (!mobileRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
      errors.push('Please enter a valid Philippine phone number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push(`${fieldName} is required`);
  } else {
    if (name.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    }
    if (name.length > 50) {
      errors.push(`${fieldName} must be less than 50 characters`);
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Text length validation
export const validateLength = (
  value: string, 
  fieldName: string, 
  minLength: number = 0, 
  maxLength: number = 1000
): ValidationResult => {
  const errors: string[] = [];
  
  if (value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  if (value.length > maxLength) {
    errors.push(`${fieldName} must be less than ${maxLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File validation
export const validateFile = (
  file: File, 
  allowedTypes: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB
): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate form data
export const validateFormData = (data: Record<string, any>, rules: Record<string, any>): ValidationResult => {
  const allErrors: string[] = [];
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required) {
      const result = validateRequired(value, fieldRules.label || field);
      allErrors.push(...result.errors);
    }
    
    if (value && fieldRules.type === 'email') {
      const result = validateEmail(value);
      allErrors.push(...result.errors);
    }
    
    if (value && fieldRules.type === 'phone') {
      const result = validatePhone(value);
      allErrors.push(...result.errors);
    }
    
    if (value && fieldRules.type === 'name') {
      const result = validateName(value, fieldRules.label || field);
      allErrors.push(...result.errors);
    }
    
    if (value && fieldRules.minLength) {
      const result = validateLength(value, fieldRules.label || field, fieldRules.minLength, fieldRules.maxLength);
      allErrors.push(...result.errors);
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateRequired,
  validateLength,
  validateFile,
  sanitizeInput,
  validateFormData
};
