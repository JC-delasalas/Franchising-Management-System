
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Upload, CheckCircle } from 'lucide-react';

const brands = [
  'Siomai King',
  'Juicy Lemon', 
  'Café Supremo',
  'Bite & Go Burgers'
];

const packages = [
  { id: 'A', name: 'Entry Level - ₱50,000', inclusions: ['Food Cart Setup', '₱20,000 Initial Inventory', 'Basic Training'] },
  { id: 'B', name: 'Mid Tier - ₱120,000', inclusions: ['Kiosk Setup', 'POS System', 'Complete Marketing Kit'] },
  { id: 'C', name: 'Advanced - ₱250,000', inclusions: ['Food Stall Setup', 'Premium POS System', 'Full Branding Package'] },
  { id: 'D', name: 'Investor Tier - ₱500,000+', inclusions: ['Mini Branch Setup', 'Advanced POS & Analytics', 'Premium Support'] }
];

const Apply = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    
    // Business Experience
    businessExperience: '',
    investment: '',
    timeline: '',
    
    // Franchise Selection
    brand: '',
    package: '',
    location: '',
    
    // Additional Info
    whyFranchise: '',
    expectations: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const selectedPackage = packages.find(p => p.id === formData.package);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center p-8">
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900">Application Submitted!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your interest in joining our franchise network. We'll review your application and contact you within 24-48 hours.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left">
                <li>• Application review (24-48 hours)</li>
                <li>• Initial phone interview</li>
                <li>• Training schedule coordination</li>
                <li>• Final approval and onboarding</li>
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">FranchiseHub</span>
            </Link>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Franchise Application</CardTitle>
                <Progress value={progress} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+63 9XX XXX XXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Complete Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Business Experience */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Business Experience</h3>
                    <div className="space-y-2">
                      <Label htmlFor="businessExperience">Previous Business Experience</Label>
                      <Select value={formData.businessExperience} onValueChange={(value) => handleInputChange('businessExperience', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No prior business experience</SelectItem>
                          <SelectItem value="some">Some business experience (1-3 years)</SelectItem>
                          <SelectItem value="moderate">Moderate experience (3-5 years)</SelectItem>
                          <SelectItem value="extensive">Extensive experience (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investment">Available Investment Capital</Label>
                      <Select value={formData.investment} onValueChange={(value) => handleInputChange('investment', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your investment range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50k-100k">₱50,000 - ₱100,000</SelectItem>
                          <SelectItem value="100k-250k">₱100,000 - ₱250,000</SelectItem>
                          <SelectItem value="250k-500k">₱250,000 - ₱500,000</SelectItem>
                          <SelectItem value="500k+">₱500,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">When do you plan to start?</Label>
                      <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediately</SelectItem>
                          <SelectItem value="1-3months">1-3 months</SelectItem>
                          <SelectItem value="3-6months">3-6 months</SelectItem>
                          <SelectItem value="6+months">6+ months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Franchise Selection */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Franchise Selection</h3>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Preferred Brand</Label>
                      <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package">Package Tier</Label>
                      <Select value={formData.package} onValueChange={(value) => handleInputChange('package', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your package tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City or specific area"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Upload Requirements */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Upload Requirements</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Valid Government ID',
                        'Proof of Billing/Address',
                        'Bank Certificate/Statement',
                        'Business License (if applicable)'
                      ].map((doc, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">{doc}</p>
                          <p className="text-xs text-gray-500 mt-1">Click to upload or drag and drop</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Review & Submit</h3>
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {formData.email}
                        </div>
                        <div>
                          <span className="font-medium">Brand:</span> {formData.brand}
                        </div>
                        <div>
                          <span className="font-medium">Package:</span> {selectedPackage?.name}
                        </div>
                        <div>
                          <span className="font-medium">Investment:</span> {formData.investment}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> {formData.timeline}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whyFranchise">Why do you want to franchise with us?</Label>
                      <Textarea
                        id="whyFranchise"
                        value={formData.whyFranchise}
                        onChange={(e) => handleInputChange('whyFranchise', e.target.value)}
                        placeholder="Tell us about your motivation..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectations">What are your expectations?</Label>
                      <Textarea
                        id="expectations"
                        value={formData.expectations}
                        onChange={(e) => handleInputChange('expectations', e.target.value)}
                        placeholder="Share your business goals and expectations..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < totalSteps ? (
                    <Button onClick={nextStep}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                      Submit Application
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Summary */}
            {selectedPackage && (
              <Card>
                <CardHeader>
                  <CardTitle>Package Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedPackage.name}</h4>
                      <p className="text-sm text-gray-600">Selected Package</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Inclusions:</h5>
                      <ul className="text-sm space-y-1">
                        {selectedPackage.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>Have questions about the application process?</p>
                  <div className="space-y-2">
                    <div>📞 (02) 8123-4567</div>
                    <div>✉️ applications@franchisehub.ph</div>
                    <div>💬 Live chat available</div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;
