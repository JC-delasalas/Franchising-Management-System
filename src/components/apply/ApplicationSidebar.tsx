
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Phone, Mail, MessageCircle } from 'lucide-react';

interface ApplicationSidebarProps {
  currentStep: number;
}

const ApplicationSidebar: React.FC<ApplicationSidebarProps> = ({ currentStep }) => {
  const steps = [
    { name: 'Personal Information', icon: Circle, description: 'Basic details' },
    { name: 'Business Experience', icon: Circle, description: 'Your background' }, 
    { name: 'Franchise Selection', icon: Circle, description: 'Choose your brand' },
    { name: 'Upload Documents', icon: Circle, description: 'Required files' },
    { name: 'Review & Submit', icon: Circle, description: 'Final check' }
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex + 1 < currentStep) return 'completed';
    if (stepIndex + 1 === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Application Progress
            <Badge variant="outline">{currentStep}/{steps.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const IconComponent = status === 'completed' ? CheckCircle : 
                                   status === 'current' ? Clock : Circle;
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStepColor(status)}`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'current' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              Our franchise specialists are here to assist you with your application process.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg border">
                <Phone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-gray-600">(02) 8123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg border">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-gray-600">franchise@franchisehub.ph</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 text-xs">
                <strong>Business Hours:</strong><br />
                Monday - Friday: 8AM - 6PM<br />
                Saturday: 9AM - 4PM<br />
                Sunday: Closed
              </p>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat Support
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl">🎯</div>
            <h3 className="font-semibold text-blue-900">Application Tip</h3>
            <p className="text-sm text-blue-800">
              Complete applications are processed 3x faster! Make sure to upload all required documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSidebar;
