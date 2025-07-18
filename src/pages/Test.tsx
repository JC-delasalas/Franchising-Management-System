import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthTest from '@/components/testing/AuthTest';
import CartTest from '@/components/testing/CartTest';

const Test: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Testing Dashboard</h1>
          <p className="text-gray-600 mb-4">Test various system components and functionality</p>
          <div className="flex justify-center gap-4">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* Authentication Test */}
          <AuthTest />

          {/* Cart Test */}
          <CartTest />
        </div>
      </div>
    </div>
  );
};

export default Test;
