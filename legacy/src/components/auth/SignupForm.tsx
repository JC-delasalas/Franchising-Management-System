
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/hooks/useAuth';
import FormValidation from '@/components/apply/FormValidation';
import SignupFormFields from './SignupFormFields';
import { useSignupValidation } from './SignupFormValidation';
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
      const data = await signUp(
        formData.email,
        formData.password,
        {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          role: formData.accountType === 'franchisor' ? 'franchisor' : 'franchisee'
        }
      );

      if (data.user && !data.session) {
        // Email verification required
        onVerificationRequired(formData.email);
        toast({
          title: "Account Created!",
          description: "Please check your email for verification instructions.",
        });
      } else {
        // User signed up and logged in
        navigate('/dashboard');
        toast({
          title: "Account Created!",
          description: "Welcome to FranchiseHub!",
        });
      }
    } catch (error: any) {
      setErrors([error.message || 'Registration failed. Please try again.']);
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
