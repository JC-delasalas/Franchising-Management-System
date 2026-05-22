import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { FranchiseAPI } from '@/api/franchises';
import PersonalInfoStep from '@/components/apply/PersonalInfoStep';
import BusinessExperienceStep from '@/components/apply/BusinessExperienceStep';
import FranchiseSelectionStep from '@/components/apply/FranchiseSelectionStep';
import DocumentUploadStep from '@/components/apply/DocumentUploadStep';
import ReviewSubmitStep from '@/components/apply/ReviewSubmitStep';
import ApplicationSuccess from '@/components/apply/ApplicationSuccess';
import ApplicationSidebar from '@/components/apply/ApplicationSidebar';
import Logo from '@/components/Logo';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  businessExperience: string;
  businessDescription: string;
  investmentCapacity: string;
  timeframe: string;
  selectedBrand: string;
  selectedPackage: string;
  province: string;
  city: string;
}

const Apply = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentsValid, setDocumentsValid] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    businessExperience: '',
    businessDescription: '',
    investmentCapacity: '',
    timeframe: '',
    selectedBrand: '',
    selectedPackage: '',
    province: '',
    city: ''
  });

  // Mutation for submitting application
  const submitApplicationMutation = useMutation({
    mutationFn: FranchiseAPI.createApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted Successfully!",
        description: "We'll review your application and get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Submitting Application",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentValidation = (isValid: boolean) => {
    setDocumentsValid(isValid);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone && formData.address);
      case 2:
        return !!(formData.businessExperience && formData.investmentCapacity && formData.timeframe);
      case 3:
        return !!(formData.selectedBrand && formData.selectedPackage && formData.province && formData.city);
      case 4:
        return documentsValid;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.selectedBrand || !formData.selectedPackage) {
      toast({
        title: "Missing Information",
        description: "Please select a franchise and package before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Prepare application data
    const applicationData = {
      franchise_id: formData.selectedBrand,
      package_id: formData.selectedPackage,
      application_data: {
        personal_info: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        business_experience: {
          years_experience: parseInt(formData.businessExperience) || 0,
          previous_businesses: formData.businessDescription ? [formData.businessDescription] : [],
          management_experience: formData.businessExperience !== '0',
        },
        financial_info: {
          liquid_capital: parseInt(formData.investmentCapacity) || 0,
          net_worth: parseInt(formData.investmentCapacity) * 1.5 || 0, // Estimate
          financing_needed: parseInt(formData.investmentCapacity) < 500000,
        },
        location_preferences: {
          province: formData.province,
          city: formData.city,
          timeframe: formData.timeframe,
        }
      }
    };

    submitApplicationMutation.mutate(applicationData);
  };

  if (isSubmitted) {
    return <ApplicationSuccess />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep 
            formData={formData} 
            onInputChange={handleInputChange} 
          />
        );
      case 2:
        return (
          <BusinessExperienceStep 
            formData={formData} 
            onInputChange={handleInputChange} 
          />
        );
      case 3:
        return (
          <FranchiseSelectionStep 
            formData={formData} 
            onInputChange={handleInputChange} 
          />
        );
      case 4:
        return <DocumentUploadStep onValidationChange={handleDocumentValidation} />;
      case 5:
        return <ReviewSubmitStep formData={formData} />;
      default:
        return null;
    }
  };

  const stepTitles = [
    'Personal Information',
    'Business Experience',
    'Franchise Selection',
    'Upload Documents',
    'Review & Submit'
  ];

  const isStepValid = validateStep(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
            </Link>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Franchise Application</h1>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Step {currentStep}: {stepTitles[currentStep - 1]}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
                
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep === totalSteps ? (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!isStepValid || submitApplicationMutation.isPending}
                    >
                      {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextStep}
                      disabled={!isStepValid}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
                
                {!isStepValid && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    {currentStep === 4 
                      ? "Please upload all required documents to continue."
                      : "Please fill in all required fields to continue."
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <ApplicationSidebar currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
};

export default Apply;
