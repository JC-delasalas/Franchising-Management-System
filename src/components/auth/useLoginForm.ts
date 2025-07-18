
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateRequired, combineValidations } from '@/lib/validation';
import { signIn } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AuthenticationError, getUserFriendlyMessage } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const emailValidation = { isValid: true, errors: [] }; // Allow username or email
    const passwordValidation = validateRequired(formData.password, 'Password');
    
    if (!formData.email.trim()) {
      emailValidation.isValid = false;
      emailValidation.errors.push('Username or email is required');
    }
    
    const combinedValidation = combineValidations(emailValidation, passwordValidation);
    setErrors(combinedValidation.errors);
    
    return combinedValidation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors([]); // Clear previous errors

    try {
      // SECURITY FIX: Always clear any existing sessions before new login
      await supabase.auth.signOut();

      const result = await signIn(formData.email, formData.password);

      if (result.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.email}!`,
        });

        // Navigate based on session - don't wait for profile loading
        // Profile will load in background after navigation
        navigate(ROUTES.FRANCHISEE_DASHBOARD);
      } else {
        // Handle case where signIn succeeds but no user is returned
        setErrors(['Login failed. Please try again.']);
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Use the enhanced error handling to get user-friendly messages
      const userMessage = getUserFriendlyMessage(error);
      setErrors([userMessage]);

      // Show toast for critical errors
      if (error instanceof AuthenticationError && error.shouldSignOut) {
        toast({
          title: "Authentication Error",
          description: userMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return {
    formData,
    isLoading,
    showPassword,
    errors,
    handleInputChange,
    handleSubmit,
    handleDemoLogin,
    setShowPassword
  };
};
