
import React from 'react';
import { validateEmail, validateRequired, validatePhone, validateName, combineValidations } from '@/lib/validation';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: string;
}

export const useSignupValidation = () => {
  const validateForm = (formData: SignupFormData) => {
    const firstNameValidation = validateName(formData.firstName, 'First name');
    const lastNameValidation = validateName(formData.lastName, 'Last name');
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const passwordValidation = validateRequired(formData.password, 'Password');
    const confirmPasswordValidation = validateRequired(formData.confirmPassword, 'Confirm password');
    const accountTypeValidation = validateRequired(formData.accountType, 'Account type');
    
    const customErrors: string[] = [];
    if (formData.password && formData.password.length < 8) {
      customErrors.push('Password must be at least 8 characters long');
    }
    if (formData.password !== formData.confirmPassword) {
      customErrors.push('Passwords do not match');
    }
    
    const combinedValidation = combineValidations(
      firstNameValidation,
      lastNameValidation,
      emailValidation,
      phoneValidation,
      passwordValidation,
      confirmPasswordValidation,
      accountTypeValidation,
      { isValid: customErrors.length === 0, errors: customErrors }
    );
    
    return combinedValidation;
  };

  return { validateForm };
};
