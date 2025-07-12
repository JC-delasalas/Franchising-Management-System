
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const SupabaseLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Check for URL messages (like account creation confirmation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const message = urlParams.get('message');
    
    if (message === 'account-created') {
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account before signing in.",
      });
    }
  }, [location.search, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with:', formData.email);
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Signin error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrors(['Invalid email or password. Please check your credentials and try again.']);
        } else if (error.message.includes('Email not confirmed')) {
          setErrors(['Please check your email and click the verification link before signing in.']);
        } else if (error.message.includes('User not found')) {
          setErrors(['No account found with this email address. Please sign up first.']);
        } else {
          setErrors([error.message || 'Login failed. Please try again.']);
        }
        return;
      }

      console.log('Login successful, navigating to dashboard...');
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Navigate to the intended page or dashboard
      const from = location.state?.from?.pathname || '/franchisee-dashboard';
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login function for testing
  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password });
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        toast({
          title: "Demo Login Successful",
          description: "Welcome to the demo!",
        });
        navigate('/franchisee-dashboard', { replace: true });
      } else {
        setErrors([error.message]);
      }
    } catch (error) {
      setErrors(['Demo login failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-gray-600">Sign in to your franchise account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
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

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm">{error}</p>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo Login Section */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Demo Accounts</CardTitle>
          <p className="text-sm text-gray-600">Try the app with these demo accounts</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDemoLogin('demo@franchisee.com', 'demo123')}
            disabled={isLoading}
          >
            Demo Franchisee Login
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleDemoLogin('demo@franchisor.com', 'demo123')}
            disabled={isLoading}
          >
            Demo Franchisor Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseLoginForm;
