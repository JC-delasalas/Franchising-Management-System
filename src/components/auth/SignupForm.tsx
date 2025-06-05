
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import FormValidation from '@/components/apply/FormValidation';
import { validateEmail, validateRequired, validatePhone, validateName, combineValidations } from '@/lib/validation';
import { signupUser } from '@/services/authService';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface SignupFormProps {
  onVerificationRequired: (email: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onVerificationRequired }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const validateForm = () => {
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
    
    setErrors(combinedValidation.errors);
    return combinedValidation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="John"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Doe"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+63 9XX XXX XXXX"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="franchisee">Franchisee</SelectItem>
            <SelectItem value="franchisor">Franchisor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

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

export default SignupForm;
