
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import FormValidation from '@/components/apply/FormValidation';
import SignupFormFields from './SignupFormFields';
import { useSignupValidation } from './SignupFormValidation';
import { signupUser } from '@/services/authService';
import { UserPlus } from 'lucide-react';

interface SignupFormProps {
  onVerificationRequired: (email: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onVerificationRequired }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useSignupValidation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signupUser(formData);
      
      if (result.success) {
        if (result.requiresVerification) {
          onVerificationRequired(formData.email);
          toast({
            title: "Account Created!",
            description: "Please check your email for verification instructions.",
          });
        } else {
          navigate('/login');
          toast({
            title: "Account Created!",
            description: "You can now sign in to your account.",
          });
        }
      } else {
        setErrors([result.message]);
      }
    } catch (error) {
      setErrors(['Registration failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SignupFormFields
        formData={formData}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      <FormValidation errors={errors} />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
};

export default React.memo(SignupForm);
