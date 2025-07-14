
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Mail } from 'lucide-react';

interface EmailVerificationScreenProps {
  email: string;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ email }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <p className="text-gray-600">We've sent a verification link to {email}</p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Please click the verification link in your email to activate your account.
                This may take a few minutes.
              </p>
              <div className="pt-4">
                <Button onClick={() => navigate('/login')} className="w-full">
                  Continue to Login
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                For demo purposes, your email will be automatically verified in 3 seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationScreen;
