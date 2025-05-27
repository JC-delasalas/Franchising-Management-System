
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const ApplicationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center p-8">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Application Submitted!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your interest in franchising with us. We'll review your application and contact you within 2-3 business days.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review and verification of documents</li>
                <li>• Initial consultation call</li>
                <li>• Site visit and approval</li>
                <li>• Contract signing and training schedule</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/franchisee-training">Preview Training</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationSuccess;
