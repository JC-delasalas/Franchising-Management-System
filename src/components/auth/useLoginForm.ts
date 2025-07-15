
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateRequired, combineValidations } from '@/lib/validation';
import { signIn } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

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

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });

        // Navigation will be handled by auth state change in AuthGuard
        // The user will be redirected based on their role
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors([error.message || 'Invalid email or password. Please try again.']);
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
