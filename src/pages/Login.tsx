
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import Navigation from '@/components/Navigation';
import FormValidation from '@/components/apply/FormValidation';
import ComponentErrorBoundary from '@/components/ui/ComponentErrorBoundary';
import SEO from '@/components/SEO';
import { DemoAccountButtons } from '@/components/auth/DemoAccountButtons';
import { LoginFormFields } from '@/components/auth/LoginFormFields';
import { useLoginForm } from '@/components/auth/useLoginForm';
import { LogIn } from 'lucide-react';

const LoginForm = React.memo(() => {
  const {
    formData,
    isLoading,
    showPassword,
    errors,
    handleInputChange,
    handleSubmit,
    handleDemoLogin,
    setShowPassword
  } = useLoginForm();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <p className="text-gray-600">Sign in to your franchise account</p>
      </CardHeader>
      <CardContent>
        <DemoAccountButtons onDemoLogin={handleDemoLogin} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <LoginFormFields
            formData={formData}
            showPassword={showPassword}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <FormValidation errors={errors} />

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

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

const Login = () => {
  const loginStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login - FranchiseHub",
    "description": "Sign in to your FranchiseHub account to access your franchise dashboard and manage your business.",
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "mainEntity": {
      "@type": "Organization",
      "name": "FranchiseHub"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Login - FranchiseHub"
        description="Sign in to your FranchiseHub account to access your franchise dashboard and manage your business."
        structuredData={loginStructuredData}
      />
      <Navigation />

      <main className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <ComponentErrorBoundary>
            <LoginForm />
          </ComponentErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default Login;
