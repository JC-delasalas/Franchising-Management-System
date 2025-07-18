
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateRequired, combineValidations } from '@/lib/validation';
import { signIn, useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AuthenticationError, getUserFriendlyMessage } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handle navigation when authentication completes
  useEffect(() => {
    if (loginSuccess && isAuthenticated && !authLoading) {
      console.log('Authentication completed, navigating to dashboard');
      navigate(ROUTES.FRANCHISEE_DASHBOARD);
      setIsLoading(false);
      setLoginSuccess(false);
    }
  }, [isAuthenticated, authLoading, loginSuccess, navigate]);

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
    setLoginSuccess(false);

    try {
      // SECURITY FIX: Always clear any existing sessions before new login
      await supabase.auth.signOut();

      console.log('Attempting login...');
      const result = await signIn(formData.email, formData.password);

      if (result.user) {
        console.log('Login successful, waiting for authentication state...');
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.email}!`,
        });

        // Set flag to trigger navigation when auth state updates
        setLoginSuccess(true);

        // Fallback navigation after 3 seconds if auth state doesn't update
        setTimeout(() => {
          if (loginSuccess) {
            console.log('Fallback navigation triggered');
            navigate(ROUTES.FRANCHISEE_DASHBOARD);
            setIsLoading(false);
            setLoginSuccess(false);
          }
        }, 3000);
      } else {
        // Handle case where signIn succeeds but no user is returned
        setErrors(['Login failed. Please try again.']);
        setIsLoading(false);
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

      setIsLoading(false);
      setLoginSuccess(false);
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
