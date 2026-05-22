
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IAMDashboard } from '@/components/iam/IAMDashboard';
import { IAMErrorBoundary } from '@/components/iam/IAMErrorBoundary';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/AuthGuard';
import { useAuthorization } from '@/contexts/AuthorizationContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const IAMManagement: React.FC = () => {
  const { canAccessIAM } = useAuthorization();

  if (!canAccessIAM) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access Identity & Access Management. 
              Please contact your administrator for access.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link to="/franchisor-dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth role="franchisor">
      <IAMErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link to="/franchisor-dashboard">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Shield className="w-8 h-8 mr-3 text-blue-600" />
                      Identity & Access Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage users, roles, and permissions across your franchise network
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main IAM Dashboard */}
            <Card className="shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl text-gray-800">
                  Access Control Center
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <IAMDashboard />
              </CardContent>
            </Card>
          </div>
        </div>
      </IAMErrorBoundary>
    </RequireAuth>
  );
};

export default IAMManagement;
