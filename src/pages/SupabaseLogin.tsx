
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ComponentErrorBoundary from '@/components/ui/ComponentErrorBoundary';
import SEO from '@/components/SEO';
import SupabaseLoginForm from '@/components/auth/SupabaseLoginForm';

const SupabaseLogin = () => {
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
            <SupabaseLoginForm />
          </ComponentErrorBoundary>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/supabase-signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupabaseLogin;
