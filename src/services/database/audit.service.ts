import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

/**
 * Audit and System Integrity Service
 * Objective 10: Robust Auditing & System Integrity
 */
export class AuditService extends BaseService<'audit_logs'> {
  constructor() {
    super('audit_logs');
  }

  /**
   * Log an audit event
   */
  async logEvent(eventData: {
    table_name: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    record_id?: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    data: AuditLog | null;
    error: any;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    const franchisorId = await this.getCurrentFranchisorId();

    if (!user || !franchisorId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        table_name: eventData.table_name,
        operation: eventData.operation,
        record_id: eventData.record_id,
        old_values: eventData.old_values,
        new_values: eventData.new_values,
        user_id: user.id,
        franchisor_id: franchisorId,
        metadata: eventData.metadata || {},
        custom_fields: {},
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters: {
    table_name?: string;
    operation?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    record_id?: string;
  } = {}): Promise<{
    data: (AuditLog & { user_profile: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:user_profiles(first_nm, last_nm, email)
      `)
      .eq('franchisor_id', franchisorId);

    // Apply filters
    if (filters.table_name) {
      query = query.eq('table_name', filters.table_name);
    }
    if (filters.operation) {
      query = query.eq('operation', filters.operation);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.record_id) {
      query = query.eq('record_id', filters.record_id);
    }
    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(1000); // Limit to prevent large queries

    return { data, error };
  }

  /**
   * Get audit summary statistics
   */
  async getAuditSummary(days: number = 30): Promise<{
    data: {
      total_events: number;
      events_by_operation: Record<string, number>;
      events_by_table: Record<string, number>;
      events_by_user: Record<string, number>;
      recent_critical_events: AuditLog[];
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Get all audit logs for the period
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user_profile:user_profiles(first_nm, last_nm)
        `)
        .eq('franchisor_id', franchisorId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) return { data: null, error };

      const total_events = auditLogs?.length || 0;

      // Group by operation
      const events_by_operation = auditLogs?.reduce((acc: Record<string, number>, log) => {
        acc[log.operation] = (acc[log.operation] || 0) + 1;
        return acc;
      }, {}) || {};

      // Group by table
      const events_by_table = auditLogs?.reduce((acc: Record<string, number>, log) => {
        acc[log.table_name] = (acc[log.table_name] || 0) + 1;
        return acc;
      }, {}) || {};

      // Group by user
      const events_by_user = auditLogs?.reduce((acc: Record<string, number>, log) => {
        const userName = log.user_profile 
          ? `${(log.user_profile as any).first_nm} ${(log.user_profile as any).last_nm}`
          : 'Unknown User';
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get recent critical events (deletions and sensitive updates)
      const critical_tables = ['user_profiles', 'role', 'permission', 'brand', 'franchisee'];
      const recent_critical_events = auditLogs?.filter(log => 
        log.operation === 'DELETE' || 
        (log.operation === 'UPDATE' && critical_tables.includes(log.table_name))
      ).slice(0, 10) || [];

      return {
        data: {
          total_events,
          events_by_operation,
          events_by_table,
          events_by_user,
          recent_critical_events,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get audit trail for a specific record
   */
  async getRecordAuditTrail(
    tableName: string,
    recordId: string
  ): Promise<{
    data: (AuditLog & { user_profile: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:user_profiles(first_nm, last_nm, email)
      `)
      .eq('franchisor_id', franchisorId)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('timestamp', { ascending: false });

    return { data, error };
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    searchTerm: string,
    searchFields: ('table_name' | 'operation' | 'old_values' | 'new_values')[] = ['table_name']
  ): Promise<{
    data: (AuditLog & { user_profile: any })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Build search query
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:user_profiles(first_nm, last_nm, email)
      `)
      .eq('franchisor_id', franchisorId);

    // Apply search filters (this is a simplified version - in production you might want to use full-text search)
    if (searchFields.includes('table_name')) {
      query = query.ilike('table_name', `%${searchTerm}%`);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(100);

    return { data, error };
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<{
    data: any;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user_profile:user_profiles(first_nm, last_nm, email)
      `)
      .eq('franchisor_id', franchisorId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false });

    if (error) return { data: null, error };

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'Timestamp', 'Table', 'Operation', 'Record ID', 
        'User', 'Old Values', 'New Values'
      ];
      
      const csvRows = auditLogs?.map(log => [
        log.timestamp,
        log.table_name,
        log.operation,
        log.record_id || '',
        log.user_profile 
          ? `${(log.user_profile as any).first_nm} ${(log.user_profile as any).last_nm}`
          : 'Unknown',
        JSON.stringify(log.old_values || {}),
        JSON.stringify(log.new_values || {})
      ]) || [];

      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return { data: csvContent, error: null };
    }

    return { data: auditLogs, error: null };
  }
}
