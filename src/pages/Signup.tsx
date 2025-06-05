
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import SignupForm from '@/components/auth/SignupForm';
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen';

const Signup = () => {
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleVerificationRequired = (email: string) => {
    setVerificationEmail(email);
    setShowEmailVerification(true);
  };

  if (showEmailVerification) {
    return <EmailVerificationScreen email={verificationEmail} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <p className="text-gray-600">Join our franchise network</p>
            </CardHeader>
            <CardContent>
              <SignupForm onVerificationRequired={handleVerificationRequired} />
              
              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Signup;
