import { BaseAPI } from './base';
import { supabase } from '@/lib/supabase';

export interface ApprovalWorkflow {
  id: string;
  application_id: string;
  tier_level: number;
  approver_id?: string;
  assigned_to?: string;
  status: 'pending' | 'approved' | 'rejected' | 'conditional' | 'escalated' | 'withdrawn';
  approval_type: 'full' | 'conditional' | 'rejected';
  comments?: string;
  conditions: Record<string, any>;
  required_documents?: string[];
  priority: number;
  due_date?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalCondition {
  id: string;
  workflow_id: string;
  condition_type: 'document' | 'financial' | 'legal' | 'operational' | 'training' | 'compliance' | 'reference';
  condition_title: string;
  condition_description: string;
  required_value?: string;
  current_value?: string;
  is_satisfied: boolean;
  satisfied_by?: string;
  satisfied_at?: string;
  due_date?: string;
  priority: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApprovalHistory {
  id: string;
  workflow_id: string;
  action: 'created' | 'assigned' | 'approved' | 'rejected' | 'escalated' | 'commented' | 'updated' | 'withdrawn';
  performed_by: string;
  previous_status?: string;
  new_status?: string;
  comments?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApprovalNotification {
  id: string;
  workflow_id: string;
  recipient_id: string;
  notification_type: 'assignment' | 'reminder' | 'escalation' | 'completion' | 'condition_update' | 'deadline_warning';
  title: string;
  message: string;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  read_at?: string;
  scheduled_for: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApprovalDashboardItem {
  application_id: string;
  franchise_id: string;
  franchise_name: string;
  applicant_id: string;
  applicant_name: string;
  overall_status: string;
  current_tier: number;
  priority: number;
  workflow_started_at: string;
  estimated_completion_date?: string;
  current_workflow_id?: string;
  current_assignee_id?: string;
  current_assignee_name?: string;
  current_status?: string;
  current_due_date?: string;
  total_conditions: number;
  satisfied_conditions: number;
  conditions_completion_percentage: number;
  timeline_status: 'overdue' | 'due_soon' | 'on_track';
}

export interface ApprovalDecision {
  workflow_id: string;
  decision: 'approve' | 'reject' | 'conditional';
  comments?: string;
  conditions?: Omit<ApprovalCondition, 'id' | 'workflow_id' | 'created_at' | 'updated_at'>[];
}

export class ApprovalAPI extends BaseAPI {
  /**
   * Get approval workflow dashboard
   */
  static async getApprovalDashboard(
    filters: {
      assignee_id?: string;
      status?: string;
      priority?: number;
      franchise_id?: string;
    } = {}
  ): Promise<ApprovalDashboardItem[]> {
    try {
      let query = supabase
        .from('approval_workflow_dashboard')
        .select('*');

      if (filters.assignee_id) {
        query = query.eq('current_assignee_id', filters.assignee_id);
      }
      if (filters.status) {
        query = query.eq('current_status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.franchise_id) {
        query = query.eq('franchise_id', filters.franchise_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflow(workflowId: string): Promise<ApprovalWorkflow> {
    try {
      const { data, error } = await supabase
        .from('approval_workflow')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get workflows for application
   */
  static async getApplicationWorkflows(applicationId: string): Promise<ApprovalWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('approval_workflow')
        .select('*')
        .eq('application_id', applicationId)
        .order('tier_level');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process approval decision
   */
  static async processApproval(decision: ApprovalDecision): Promise<void> {
    try {
      const workflow = await this.getWorkflow(decision.workflow_id);
      
      if (decision.decision === 'approve') {
        // Use the advance_approval_workflow function
        const { error } = await supabase.rpc('advance_approval_workflow', {
          p_application_id: workflow.application_id,
          p_current_tier: workflow.tier_level,
          p_approved_by: (await supabase.auth.getUser()).data.user?.id,
          p_approval_type: decision.decision === 'conditional' ? 'conditional' : 'full',
          p_comments: decision.comments
        });

        if (error) throw error;

        // Add conditions if conditional approval
        if (decision.decision === 'conditional' && decision.conditions) {
          for (const condition of decision.conditions) {
            await this.addCondition(decision.workflow_id, condition);
          }
        }
      } else if (decision.decision === 'reject') {
        // Use the reject_application function
        const { error } = await supabase.rpc('reject_application', {
          p_application_id: workflow.application_id,
          p_tier_level: workflow.tier_level,
          p_rejected_by: (await supabase.auth.getUser()).data.user?.id,
          p_rejection_reason: decision.comments || 'Application rejected'
        });

        if (error) throw error;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign workflow to user
   */
  static async assignWorkflow(workflowId: string, assigneeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_workflow')
        .update({ assigned_to: assigneeId })
        .eq('id', workflowId);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add condition to workflow
   */
  static async addCondition(
    workflowId: string,
    condition: Omit<ApprovalCondition, 'id' | 'workflow_id' | 'created_at' | 'updated_at'>
  ): Promise<ApprovalCondition> {
    try {
      const { data, error } = await supabase
        .from('approval_conditions')
        .insert({
          workflow_id: workflowId,
          ...condition
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get workflow conditions
   */
  static async getWorkflowConditions(workflowId: string): Promise<ApprovalCondition[]> {
    try {
      const { data, error } = await supabase
        .from('approval_conditions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update condition status
   */
  static async updateCondition(
    conditionId: string,
    updates: Partial<Pick<ApprovalCondition, 'is_satisfied' | 'current_value' | 'satisfied_by'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_conditions')
        .update(updates)
        .eq('id', conditionId);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get workflow history
   */
  static async getWorkflowHistory(workflowId: string): Promise<ApprovalHistory[]> {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select(`
          *,
          user_profiles!approval_history_performed_by_fkey(full_name, email)
        `)
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add comment to workflow
   */
  static async addComment(workflowId: string, comment: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_history')
        .insert({
          workflow_id: workflowId,
          action: 'commented',
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          comments: comment
        });

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<ApprovalNotification[]> {
    try {
      let query = supabase
        .from('approval_notifications')
        .select('*')
        .eq('recipient_id', userId);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('approval_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create notification
   */
  static async createNotification(
    notification: Omit<ApprovalNotification, 'id' | 'is_read' | 'is_sent' | 'created_at'>
  ): Promise<ApprovalNotification> {
    try {
      const { data, error } = await supabase
        .from('approval_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Escalate workflow
   */
  static async escalateWorkflow(
    workflowId: string,
    escalationReason: string,
    escalateTo?: string
  ): Promise<void> {
    try {
      const updates: Partial<ApprovalWorkflow> = {
        status: 'escalated',
        comments: escalationReason,
        priority: 1 // Highest priority
      };

      if (escalateTo) {
        updates.assigned_to = escalateTo;
      }

      const { error } = await supabase
        .from('approval_workflow')
        .update(updates)
        .eq('id', workflowId);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get approval statistics
   */
  static async getApprovalStats(
    filters: {
      date_from?: string;
      date_to?: string;
      franchise_id?: string;
      approver_id?: string;
    } = {}
  ): Promise<{
    total_applications: number;
    approved: number;
    rejected: number;
    pending: number;
    conditional: number;
    avg_processing_time_days: number;
    overdue_count: number;
  }> {
    try {
      // This would typically be a database function or view
      // For now, we'll implement basic stats
      let query = supabase
        .from('franchise_applications')
        .select('overall_status, workflow_started_at, workflow_completed_at');

      if (filters.date_from) {
        query = query.gte('workflow_started_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('workflow_started_at', filters.date_to);
      }
      if (filters.franchise_id) {
        query = query.eq('franchise_id', filters.franchise_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_applications: data?.length || 0,
        approved: data?.filter(app => app.overall_status === 'approved').length || 0,
        rejected: data?.filter(app => app.overall_status === 'rejected').length || 0,
        pending: data?.filter(app => app.overall_status === 'under_review').length || 0,
        conditional: data?.filter(app => app.overall_status === 'conditional_approval').length || 0,
        avg_processing_time_days: 0,
        overdue_count: 0
      };

      // Calculate average processing time for completed applications
      const completedApps = data?.filter(app => 
        app.workflow_completed_at && app.workflow_started_at
      ) || [];

      if (completedApps.length > 0) {
        const totalDays = completedApps.reduce((sum, app) => {
          const start = new Date(app.workflow_started_at);
          const end = new Date(app.workflow_completed_at);
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        stats.avg_processing_time_days = Math.round(totalDays / completedApps.length);
      }

      return stats;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
