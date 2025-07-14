import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.password) newErrors.push('Password is required');

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setErrors([error.message]);
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('account_type')
          .eq('user_id', data.user.id)
          .single();

        // Redirect based on account type
        if (profile?.account_type === 'franchisor') {
          navigate('/franchisor-dashboard', { replace: true });
        } else {
          navigate('/franchisee-dashboard', { replace: true });
        }
      }

    } catch (error) {
      console.error('Login error:', error);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.user) {
        toast({
          title: "Demo Login Successful",
          description: "Welcome to the demo!",
        });
        navigate('/franchisee-dashboard', { replace: true });
      } else {
        setErrors([error?.message || 'Demo login failed']);
      }
    } catch (error) {
      setErrors(['Demo login failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
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
                      type={showPassword ? "text" : "password"}
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
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        {errors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm">{error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Sign up here
                  </Link>
                </p>
              </div>
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
      </div>
    </div>
  );
};

export default Login;