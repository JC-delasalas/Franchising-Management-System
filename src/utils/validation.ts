
// Form Validation Utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push('This field is required');
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return { isValid: true, errors: [] };
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters long`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateField(email, {
    required: true,
    pattern: emailPattern
  });
};

export const validatePhone = (phone: string): ValidationResult => {
  const phonePattern = /^(\+63|0)?[0-9]{10}$/;
  return validateField(phone, {
    required: true,
    pattern: phonePattern,
    custom: (value) => {
      if (value && !phonePattern.test(value.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid Philippine phone number';
      }
      return null;
    }
  });
};

export const validateFormData = (data: Record<string, any>, rules: Record<string, ValidationRule>): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  Object.keys(rules).forEach(field => {
    const result = validateField(data[field], rules[field]);
    if (!result.isValid) {
      errors[field] = result.errors;
    }
  });

  return errors;
};

// File validation utilities
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
