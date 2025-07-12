import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Franchisee = Database['public']['Tables']['franchisee']['Row'];
type Contract = Database['public']['Tables']['contract']['Row'];
type ContractVersion = Database['public']['Tables']['contract_version']['Row'];

/**
 * Franchisee Lifecycle Management Service
 * Objective 7: Comprehensive Franchisee Lifecycle Management
 */
export class FranchiseeService extends BaseService<'franchisee'> {
  constructor() {
    super('franchisee');
  }

  /**
   * Create new franchisee application
   */
  async createFranchiseeApplication(applicationData: {
    brand_id: string;
    company_nm: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    investment_capacity: number;
    experience_years?: number;
    business_plan?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Franchisee | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('franchisee')
      .insert({
        ...applicationData,
        franchisor_id: franchisorId,
        status: 'pending',
        onboarding_status: 'application_submitted',
        application_date: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update franchisee onboarding status
   */
  async updateOnboardingStatus(
    franchiseeId: string,
    status: 'application_submitted' | 'under_review' | 'approved' | 'contract_sent' | 
            'contract_signed' | 'training_scheduled' | 'training_completed' | 
            'location_setup' | 'operational' | 'rejected'
  ): Promise<{
    data: Franchisee | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const updates: any = {
      onboarding_status: status,
      updated_at: new Date().toISOString(),
    };

    // Update overall status based on onboarding status
    if (status === 'operational') {
      updates.status = 'active';
    } else if (status === 'rejected') {
      updates.status = 'inactive';
    }

    const { data, error } = await supabase
      .from('franchisee')
      .update(updates)
      .eq('franchisee_id', franchiseeId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Create franchise contract
   */
  async createContract(contractData: {
    franchisee_id: string;
    contract_type: 'franchise_agreement' | 'area_development' | 'master_franchise';
    terms: Record<string, any>;
    duration_years: number;
    territory?: Record<string, any>;
    fees: Record<string, any>;
    obligations: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Contract | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data: contract, error: contractError } = await supabase
      .from('contract')
      .insert({
        ...contractData,
        franchisor_id: franchisorId,
        status: 'draft',
        created_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (contractError) return { data: null, error: contractError };

    // Create initial contract version
    const { error: versionError } = await supabase
      .from('contract_version')
      .insert({
        contract_id: contract.contract_id,
        version_number: 1,
        content: contractData.terms,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        franchisor_id: franchisorId,
      });

    if (versionError) {
      // Rollback contract creation
      await supabase.from('contract').delete().eq('contract_id', contract.contract_id);
      return { data: null, error: versionError };
    }

    return { data: contract, error: null };
  }

  /**
   * Update contract version
   */
  async updateContractVersion(
    contractId: string,
    newContent: Record<string, any>,
    changeNotes?: string
  ): Promise<{
    data: ContractVersion | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Get current highest version number
    const { data: versions } = await supabase
      .from('contract_version')
      .select('version_number')
      .eq('contract_id', contractId)
      .eq('franchisor_id', franchisorId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    const { data, error } = await supabase
      .from('contract_version')
      .insert({
        contract_id: contractId,
        version_number: nextVersion,
        content: newContent,
        change_notes: changeNotes,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Sign contract
   */
  async signContract(
    contractId: string,
    signatureData: {
      signer_name: string;
      signer_role: 'franchisor' | 'franchisee';
      signature_method: 'digital' | 'physical' | 'electronic';
      signature_data?: Record<string, any>;
    }
  ): Promise<{
    data: Contract | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Get current contract
    const { data: contract, error: fetchError } = await supabase
      .from('contract')
      .select('*')
      .eq('contract_id', contractId)
      .eq('franchisor_id', franchisorId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    // Update contract with signature
    const signatures = contract.signatures || {};
    signatures[signatureData.signer_role] = {
      ...signatureData,
      signed_date: new Date().toISOString(),
      signed_by: (await supabase.auth.getUser()).data.user?.id,
    };

    // Check if both parties have signed
    const isFullySigned = signatures.franchisor && signatures.franchisee;

    const { data, error } = await supabase
      .from('contract')
      .update({
        signatures,
        status: isFullySigned ? 'executed' : 'partially_signed',
        execution_date: isFullySigned ? new Date().toISOString() : null,
      })
      .eq('contract_id', contractId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    // If fully signed, update franchisee onboarding status
    if (!error && isFullySigned) {
      await this.updateOnboardingStatus(contract.franchisee_id, 'contract_signed');
    }

    return { data, error };
  }

  /**
   * Get franchisee pipeline
   */
  async getFranchiseePipeline(): Promise<{
    data: {
      by_status: Record<string, number>;
      by_onboarding_stage: Record<string, number>;
      recent_applications: Franchisee[];
      conversion_metrics: any;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get all franchisees
      const { data: franchisees } = await supabase
        .from('franchisee')
        .select('*')
        .eq('franchisor_id', franchisorId);

      // Group by status
      const by_status = franchisees?.reduce((acc: any, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Group by onboarding stage
      const by_onboarding_stage = franchisees?.reduce((acc: any, f) => {
        acc[f.onboarding_status] = (acc[f.onboarding_status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Recent applications (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recent_applications = franchisees?.filter(f => 
        new Date(f.application_date || f.created_at) >= thirtyDaysAgo
      ).slice(0, 10) || [];

      // Conversion metrics
      const totalApplications = franchisees?.length || 0;
      const activeCount = franchisees?.filter(f => f.status === 'active').length || 0;
      const conversionRate = totalApplications > 0 ? (activeCount / totalApplications) * 100 : 0;

      return {
        data: {
          by_status,
          by_onboarding_stage,
          recent_applications,
          conversion_metrics: {
            total_applications: totalApplications,
            active_franchisees: activeCount,
            conversion_rate: conversionRate,
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get franchisee performance metrics
   */
  async getFranchiseePerformance(franchiseeId: string): Promise<{
    data: {
      revenue_metrics: any;
      operational_metrics: any;
      compliance_status: any;
      support_tickets: any;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get revenue data
      const { data: revenueData } = await supabase
        .from('sales_transaction')
        .select('total_amount, transaction_date')
        .eq('franchisee_id', franchiseeId)
        .eq('franchisor_id', franchisorId)
        .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const transactionCount = revenueData?.length || 0;

      // Get compliance data (training completion, etc.)
      const { data: trainingData } = await supabase
        .from('user_training')
        .select('completion_date, score')
        .eq('franchisor_id', franchisorId);

      const completedTraining = trainingData?.filter(t => t.completion_date).length || 0;
      const totalTraining = trainingData?.length || 0;
      const complianceRate = totalTraining > 0 ? (completedTraining / totalTraining) * 100 : 0;

      return {
        data: {
          revenue_metrics: {
            total_revenue: totalRevenue,
            transaction_count: transactionCount,
            average_transaction: transactionCount > 0 ? totalRevenue / transactionCount : 0,
          },
          operational_metrics: {
            // Add operational metrics here
          },
          compliance_status: {
            training_completion_rate: complianceRate,
            completed_modules: completedTraining,
            total_modules: totalTraining,
          },
          support_tickets: {
            // Add support ticket metrics here
          }
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Terminate franchisee relationship
   */
  async terminateFranchisee(
    franchiseeId: string,
    terminationData: {
      reason: string;
      termination_type: 'voluntary' | 'involuntary' | 'expiration';
      effective_date: string;
      settlement_terms?: Record<string, any>;
      notes?: string;
    }
  ): Promise<{
    data: Franchisee | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('franchisee')
      .update({
        status: 'terminated',
        termination_date: terminationData.effective_date,
        termination_reason: terminationData.reason,
        metadata: {
          termination_type: terminationData.termination_type,
          settlement_terms: terminationData.settlement_terms,
          notes: terminationData.notes,
        }
      })
      .eq('franchisee_id', franchiseeId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }
}
