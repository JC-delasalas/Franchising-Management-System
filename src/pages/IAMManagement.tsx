
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IAMDashboard } from '@/components/iam/IAMDashboard';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const IAMManagement: React.FC = () => {
  return (
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
  );
};

export default IAMManagement;
