import { supabase } from '@/integrations/supabase/client';

export interface FranchiseApplication {
  application_id: string;
  applicant_name: string;
  email: string;
  phone: string;
  business_experience: string;
  investment_capacity: number;
  preferred_location: string;
  brand_interest: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'onboarding';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  notes?: string;
}

export interface OnboardingStep {
  step_id: string;
  application_id: string;
  step_name: string;
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
  data?: any;
}

export interface OnboardingWorkflow {
  workflow_id: string;
  brand_id: string;
  workflow_name: string;
  steps: OnboardingStep[];
  is_active: boolean;
}

/**
 * Franchise Onboarding Service
 * Handles complete franchise onboarding workflow from application to setup
 */
export class FranchiseOnboardingService {
  
  /**
   * Submit franchise application
   */
  static async submitApplication(applicationData: {
    applicant_name: string;
    email: string;
    phone: string;
    business_experience: string;
    investment_capacity: number;
    preferred_location: string;
    brand_interest: string;
    additional_info?: string;
  }): Promise<{ success: boolean; application_id?: string; error?: string }> {
    
    try {
      const { data, error } = await supabase
        .from('franchise_application')
        .insert({
          ...applicationData,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Send notification to admin
      await this.notifyAdminNewApplication(data.application_id);
      
      return { success: true, application_id: data.application_id };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get application status
   */
  static async getApplicationStatus(applicationId: string): Promise<FranchiseApplication | null> {
    try {
      const { data, error } = await supabase
        .from('franchise_application')
        .select('*')
        .eq('application_id', applicationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching application status:', error);
      return null;
    }
  }
  
  /**
   * Review application (admin function)
   */
  static async reviewApplication(
    applicationId: string, 
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('franchise_application')
        .update({
          status: decision === 'approved' ? 'onboarding' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: user.id,
          notes
        })
        .eq('application_id', applicationId);
      
      if (error) throw error;
      
      if (decision === 'approved') {
        // Start onboarding workflow
        await this.startOnboardingWorkflow(applicationId);
      }
      
      // Send notification to applicant
      await this.notifyApplicantDecision(applicationId, decision);
      
      return { success: true };
    } catch (error) {
      console.error('Error reviewing application:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Start onboarding workflow
   */
  static async startOnboardingWorkflow(applicationId: string): Promise<void> {
    try {
      // Get application details
      const application = await this.getApplicationStatus(applicationId);
      if (!application) throw new Error('Application not found');
      
      // Get brand workflow
      const { data: brand } = await supabase
        .from('brand')
        .select('brand_id')
        .eq('brand_name', application.brand_interest)
        .single();
      
      if (!brand) throw new Error('Brand not found');
      
      // Create onboarding steps
      const defaultSteps = [
        { step_name: 'Document Verification', step_order: 1 },
        { step_name: 'Financial Assessment', step_order: 2 },
        { step_name: 'Location Approval', step_order: 3 },
        { step_name: 'Contract Signing', step_order: 4 },
        { step_name: 'Initial Training', step_order: 5 },
        { step_name: 'Store Setup', step_order: 6 },
        { step_name: 'Grand Opening', step_order: 7 }
      ];
      
      const steps = defaultSteps.map(step => ({
        application_id: applicationId,
        step_name: step.step_name,
        step_order: step.step_order,
        status: 'pending' as const
      }));
      
      await supabase.from('onboarding_step').insert(steps);
      
    } catch (error) {
      console.error('Error starting onboarding workflow:', error);
      throw error;
    }
  }
  
  /**
   * Update onboarding step
   */
  static async updateOnboardingStep(
    stepId: string,
    status: 'in_progress' | 'completed' | 'skipped',
    data?: any
  ): Promise<{ success: boolean; error?: string }> {
    
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (data) {
        updateData.data = data;
      }
      
      const { error } = await supabase
        .from('onboarding_step')
        .update(updateData)
        .eq('step_id', stepId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get onboarding progress
   */
  static async getOnboardingProgress(applicationId: string): Promise<{
    steps: OnboardingStep[];
    progress: number;
    currentStep?: OnboardingStep;
  }> {
    
    try {
      const { data: steps, error } = await supabase
        .from('onboarding_step')
        .select('*')
        .eq('application_id', applicationId)
        .order('step_order');
      
      if (error) throw error;
      
      const completedSteps = steps?.filter(step => step.status === 'completed').length || 0;
      const totalSteps = steps?.length || 0;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      
      const currentStep = steps?.find(step => 
        step.status === 'in_progress' || 
        (step.status === 'pending' && !steps.some(s => s.status === 'in_progress'))
      );
      
      return {
        steps: steps || [],
        progress,
        currentStep
      };
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      return { steps: [], progress: 0 };
    }
  }
  
  /**
   * Complete onboarding
   */
  static async completeOnboarding(applicationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get application details
      const application = await this.getApplicationStatus(applicationId);
      if (!application) throw new Error('Application not found');
      
      // Create franchisee record
      const { data: brand } = await supabase
        .from('brand')
        .select('brand_id')
        .eq('brand_name', application.brand_interest)
        .single();
      
      if (!brand) throw new Error('Brand not found');
      
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisee')
        .insert({
          brand_id: brand.brand_id,
          business_name: `${application.applicant_name} Franchise`,
          legal_name: application.applicant_name,
          onboarding_status: 'completed',
          status: 'active'
        })
        .select()
        .single();
      
      if (franchiseeError) throw franchiseeError;
      
      // Update application status
      await supabase
        .from('franchise_application')
        .update({ status: 'completed' })
        .eq('application_id', applicationId);
      
      // Create user account if needed
      await this.createFranchiseeAccount(application, franchisee.franchisee_id);
      
      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Get all applications (admin function)
   */
  static async getAllApplications(): Promise<FranchiseApplication[]> {
    try {
      const { data, error } = await supabase
        .from('franchise_application')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }
  
  // Private helper methods
  private static async notifyAdminNewApplication(applicationId: string): Promise<void> {
    // Implementation for admin notification
    console.log(`New application submitted: ${applicationId}`);
  }
  
  private static async notifyApplicantDecision(applicationId: string, decision: string): Promise<void> {
    // Implementation for applicant notification
    console.log(`Application ${applicationId} ${decision}`);
  }
  
  private static async createFranchiseeAccount(application: FranchiseApplication, franchiseeId: string): Promise<void> {
    // Implementation for creating user account
    console.log(`Creating account for franchisee: ${franchiseeId}`);
  }
}
