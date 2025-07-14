import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, AlertCircle, Users, FileText, TrendingUp } from 'lucide-react';
import { FranchiseOnboardingService, FranchiseApplication, OnboardingStep } from '@/services/franchise/onboardingService';
import { useToast } from '@/hooks/use-toast';

interface OnboardingDashboardProps {
  userRole: 'admin' | 'applicant';
  applicationId?: string;
}

const FranchiseOnboarding: React.FC<OnboardingDashboardProps> = ({ 
  userRole = 'admin', 
  applicationId 
}) => {
  const [applications, setApplications] = useState<FranchiseApplication[]>([]);
  const [currentApplication, setCurrentApplication] = useState<FranchiseApplication | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userRole, applicationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (userRole === 'admin') {
        const allApplications = await FranchiseOnboardingService.getAllApplications();
        setApplications(allApplications);
      } else if (applicationId) {
        const application = await FranchiseOnboardingService.getApplicationStatus(applicationId);
        if (application) {
          setCurrentApplication(application);
          const progressData = await FranchiseOnboardingService.getOnboardingProgress(applicationId);
          setOnboardingSteps(progressData.steps);
          setProgress(progressData.progress);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (appId: string, decision: 'approved' | 'rejected', notes?: string) => {
    try {
      const result = await FranchiseOnboardingService.reviewApplication(appId, decision, notes);
      if (result.success) {
        toast({
          title: "Success",
          description: `Application ${decision} successfully`,
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review application",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStep = async (stepId: string, status: 'in_progress' | 'completed' | 'skipped') => {
    try {
      const result = await FranchiseOnboardingService.updateOnboardingStep(stepId, status);
      if (result.success) {
        toast({
          title: "Success",
          description: "Step updated successfully",
        });
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update step",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'outline',
      'under_review': 'secondary',
      'approved': 'default',
      'rejected': 'destructive',
      'onboarding': 'default',
      'completed': 'default'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Franchise Onboarding Management</h1>
        </div>

        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="onboarding">Active Onboarding</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.application_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{app.applicant_name}</CardTitle>
                        <CardDescription>{app.email} • {app.phone}</CardDescription>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Brand Interest</p>
                        <p className="text-sm text-gray-600">{app.brand_interest}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Investment Capacity</p>
                        <p className="text-sm text-gray-600">₱{app.investment_capacity?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preferred Location</p>
                        <p className="text-sm text-gray-600">{app.preferred_location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-sm text-gray-600">{new Date(app.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleReviewApplication(app.application_id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReviewApplication(app.application_id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-4">
            <div className="grid gap-4">
              {applications.filter(app => app.status === 'onboarding').map((app) => (
                <Card key={app.application_id}>
                  <CardHeader>
                    <CardTitle>{app.applicant_name} - Onboarding Progress</CardTitle>
                    <CardDescription>Track the onboarding progress for this franchisee</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                      
                      <div className="space-y-2">
                        {onboardingSteps.map((step) => (
                          <div key={step.step_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(step.status)}
                              <div>
                                <p className="font-medium">{step.step_name}</p>
                                <p className="text-sm text-gray-600">Step {step.step_order}</p>
                              </div>
                            </div>
                            
                            {step.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateStep(step.step_id, 'in_progress')}
                              >
                                Start
                              </Button>
                            )}
                            
                            {step.status === 'in_progress' && (
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateStep(step.step_id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Onboarding</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'onboarding').length}
                  </div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Applicant view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Franchise Application</h1>
        {currentApplication && getStatusBadge(currentApplication.status)}
      </div>

      {currentApplication && (
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Track your franchise application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              
              <div className="space-y-2">
                {onboardingSteps.map((step) => (
                  <div key={step.step_id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(step.status)}
                    <div>
                      <p className="font-medium">{step.step_name}</p>
                      <p className="text-sm text-gray-600">Step {step.step_order}</p>
                      {step.completed_at && (
                        <p className="text-xs text-green-600">
                          Completed on {new Date(step.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FranchiseOnboarding;
