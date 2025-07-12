import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TrainingModule = Database['public']['Tables']['training_module']['Row'];
type UserTraining = Database['public']['Tables']['user_training']['Row'];

/**
 * Training & Development Service
 * Objective 8: Standardized Training & Development
 */
export class TrainingService extends BaseService<'training_module'> {
  constructor() {
    super('training_module');
  }

  /**
   * Create a new training module
   */
  async createTrainingModule(moduleData: {
    title: string;
    description?: string;
    module_type: 'document' | 'video' | 'quiz';
    content: Record<string, any>;
    duration_minutes?: number;
    prerequisites?: string[];
    is_mandatory: boolean;
    target_roles?: string[];
    metadata?: Record<string, any>;
  }): Promise<{
    data: TrainingModule | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('training_module')
      .insert({
        ...moduleData,
        franchisor_id: franchisorId,
        is_active: true,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update training module content
   */
  async updateTrainingModule(
    moduleId: string,
    updates: Partial<TrainingModule>
  ): Promise<{
    data: TrainingModule | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('training_module')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('module_id', moduleId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Assign training module to user
   */
  async assignTrainingToUser(
    userId: string,
    moduleId: string,
    dueDate?: string
  ): Promise<{
    data: UserTraining | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('user_training')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('franchisor_id', franchisorId)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    const { data, error } = await supabase
      .from('user_training')
      .insert({
        user_id: userId,
        module_id: moduleId,
        franchisor_id: franchisorId,
        assigned_date: new Date().toISOString(),
        due_date: dueDate,
        status: 'assigned',
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Start training module
   */
  async startTraining(userTrainingId: string): Promise<{
    data: UserTraining | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('user_training')
      .update({
        status: 'in_progress',
        start_date: new Date().toISOString(),
      })
      .eq('user_training_id', userTrainingId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Complete training module
   */
  async completeTraining(
    userTrainingId: string,
    completionData: {
      score?: number;
      time_spent_minutes?: number;
      answers?: Record<string, any>;
      feedback?: string;
    }
  ): Promise<{
    data: UserTraining | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('user_training')
      .update({
        status: 'completed',
        completion_date: new Date().toISOString(),
        score: completionData.score,
        time_spent_minutes: completionData.time_spent_minutes,
        answers: completionData.answers,
        feedback: completionData.feedback,
      })
      .eq('user_training_id', userTrainingId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get user's training progress
   */
  async getUserTrainingProgress(userId: string): Promise<{
    data: {
      assigned: UserTraining[];
      in_progress: UserTraining[];
      completed: UserTraining[];
      overdue: UserTraining[];
      completion_rate: number;
      total_score: number;
      certificates: any[];
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      const { data: userTraining, error } = await supabase
        .from('user_training')
        .select(`
          *,
          training_module:training_module(*)
        `)
        .eq('user_id', userId)
        .eq('franchisor_id', franchisorId);

      if (error) return { data: null, error };

      const assigned = userTraining?.filter(ut => ut.status === 'assigned') || [];
      const in_progress = userTraining?.filter(ut => ut.status === 'in_progress') || [];
      const completed = userTraining?.filter(ut => ut.status === 'completed') || [];
      
      // Check for overdue training
      const today = new Date();
      const overdue = userTraining?.filter(ut => 
        ut.due_date && 
        new Date(ut.due_date) < today && 
        ut.status !== 'completed'
      ) || [];

      const totalTraining = userTraining?.length || 0;
      const completedCount = completed.length;
      const completion_rate = totalTraining > 0 ? (completedCount / totalTraining) * 100 : 0;

      const total_score = completed.reduce((sum, ut) => sum + (ut.score || 0), 0);

      // Generate certificates for completed mandatory training
      const certificates = completed
        .filter(ut => (ut.training_module as any)?.is_mandatory && ut.score && ut.score >= 80)
        .map(ut => ({
          module_title: (ut.training_module as any)?.title,
          completion_date: ut.completion_date,
          score: ut.score,
          certificate_id: `CERT-${ut.user_training_id}`,
        }));

      return {
        data: {
          assigned,
          in_progress,
          completed,
          overdue,
          completion_rate,
          total_score,
          certificates,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get training analytics for franchisor
   */
  async getTrainingAnalytics(): Promise<{
    data: {
      total_modules: number;
      total_assignments: number;
      completion_rate: number;
      average_score: number;
      popular_modules: any[];
      completion_trends: any[];
      user_performance: any[];
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get module count
      const { count: moduleCount } = await supabase
        .from('training_module')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId)
        .eq('is_active', true);

      // Get assignment statistics
      const { data: assignments } = await supabase
        .from('user_training')
        .select('*')
        .eq('franchisor_id', franchisorId);

      const totalAssignments = assignments?.length || 0;
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const completion_rate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      // Calculate average score
      const scoresSum = assignments?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
      const scoredAssignments = assignments?.filter(a => a.score !== null).length || 0;
      const average_score = scoredAssignments > 0 ? scoresSum / scoredAssignments : 0;

      // Popular modules (most assigned)
      const moduleAssignments = assignments?.reduce((acc: any, a) => {
        acc[a.module_id] = (acc[a.module_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const { data: modules } = await supabase
        .from('training_module')
        .select('module_id, title')
        .eq('franchisor_id', franchisorId);

      const popular_modules = Object.entries(moduleAssignments)
        .map(([moduleId, count]) => ({
          module_id: moduleId,
          title: modules?.find(m => m.module_id === moduleId)?.title || 'Unknown',
          assignment_count: count,
        }))
        .sort((a, b) => (b.assignment_count as number) - (a.assignment_count as number))
        .slice(0, 5);

      // User performance ranking
      const userPerformance = assignments?.reduce((acc: any, a) => {
        if (!acc[a.user_id]) {
          acc[a.user_id] = {
            user_id: a.user_id,
            completed: 0,
            total_score: 0,
            assignments: 0,
          };
        }
        acc[a.user_id].assignments++;
        if (a.status === 'completed') {
          acc[a.user_id].completed++;
          acc[a.user_id].total_score += a.score || 0;
        }
        return acc;
      }, {});

      const user_performance = Object.values(userPerformance || {})
        .map((up: any) => ({
          ...up,
          completion_rate: up.assignments > 0 ? (up.completed / up.assignments) * 100 : 0,
          average_score: up.completed > 0 ? up.total_score / up.completed : 0,
        }))
        .sort((a: any, b: any) => b.completion_rate - a.completion_rate)
        .slice(0, 10);

      return {
        data: {
          total_modules: moduleCount || 0,
          total_assignments: totalAssignments,
          completion_rate,
          average_score,
          popular_modules,
          completion_trends: [], // TODO: Implement trends
          user_performance,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create learning path
   */
  async createLearningPath(pathData: {
    name: string;
    description?: string;
    module_sequence: string[];
    target_roles: string[];
    estimated_duration_hours: number;
    metadata?: Record<string, any>;
  }): Promise<{
    data: any;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    // Store learning path in metadata table or create a new table
    const learningPath = {
      ...pathData,
      franchisor_id: franchisorId,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    // For now, store in training_module metadata
    // In production, you might want a separate learning_paths table
    return { data: learningPath, error: null };
  }

  /**
   * Assign learning path to user
   */
  async assignLearningPath(
    userId: string,
    learningPath: any,
    dueDate?: string
  ): Promise<{
    data: UserTraining[];
    error: any;
  }> {
    const assignments: UserTraining[] = [];
    const errors: any[] = [];

    for (const moduleId of learningPath.module_sequence) {
      const { data, error } = await this.assignTrainingToUser(userId, moduleId, dueDate);
      if (error) {
        errors.push({ moduleId, error });
      } else if (data) {
        assignments.push(data);
      }
    }

    return {
      data: assignments,
      error: errors.length > 0 ? errors : null
    };
  }

  /**
   * Generate training certificate
   */
  async generateCertificate(userTrainingId: string): Promise<{
    data: {
      certificate_id: string;
      user_name: string;
      module_title: string;
      completion_date: string;
      score: number;
      certificate_url?: string;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data: userTraining, error } = await supabase
      .from('user_training')
      .select(`
        *,
        training_module:training_module(*),
        user_profile:user_profiles(first_nm, last_nm)
      `)
      .eq('user_training_id', userTrainingId)
      .eq('franchisor_id', franchisorId)
      .eq('status', 'completed')
      .single();

    if (error) return { data: null, error };

    if (!userTraining.score || userTraining.score < 80) {
      return { data: null, error: new Error('Minimum score of 80% required for certification') };
    }

    const certificate = {
      certificate_id: `CERT-${userTrainingId}-${Date.now()}`,
      user_name: `${(userTraining.user_profile as any)?.first_nm} ${(userTraining.user_profile as any)?.last_nm}`,
      module_title: (userTraining.training_module as any)?.title,
      completion_date: userTraining.completion_date!,
      score: userTraining.score,
      // certificate_url: `${window.location.origin}/certificates/${certificate_id}`, // Generate PDF URL
    };

    return { data: certificate, error: null };
  }
}
