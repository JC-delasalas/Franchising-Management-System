
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ApplicationSidebarProps {
  currentStep: number;
}

const ApplicationSidebar: React.FC<ApplicationSidebarProps> = ({ currentStep }) => {
  const steps = [
    'Personal Information',
    'Business Experience', 
    'Franchise Selection',
    'Upload Documents',
    'Review & Submit'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center space-x-3 ${
                index + 1 < currentStep ? 'text-green-600' :
                index + 1 === currentStep ? 'text-blue-600' :
                'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index + 1 < currentStep ? 'bg-green-100' :
                  index + 1 === currentStep ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              Our franchise specialists are here to assist you with your application.
            </p>
            <div className="space-y-2">
              <p><strong>Phone:</strong> (02) 8123-4567</p>
              <p><strong>Email:</strong> franchise@franchisehub.ph</p>
              <p><strong>Hours:</strong> Mon-Fri 8AM-6PM</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSidebar;
