import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

export interface AuditLogData {
  entity_type: string;
  entity_id?: string;
  action_type: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  custom_fields?: Record<string, any>;
}

export interface AuditFilter {
  entity_type?: string;
  action_type?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Robust Auditing & System Integrity Service
 * Supports Objective 10: Robust Auditing & System Integrity
 */
export class AuditService {

  /**
   * Log an audit event
   */
  static async logEvent(auditData: AuditLogData, userId?: string) {
    try {
      const logEntry: AuditLogInsert = {
        user_id: userId || null,
        entity_type: auditData.entity_type,
        entity_id: auditData.entity_id || null,
        action_type: auditData.action_type,
        details: auditData.details || {},
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          ip_address: null, // Would be populated by server-side function
          ...auditData.metadata
        },
        custom_fields: auditData.custom_fields || {},
        ip_address: null // Would be populated by server-side function
      };

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(logEntry)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error logging audit event:', error);
      return { success: false, error };
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(filter: AuditFilter = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(
            first_nm,
            last_nm,
            email
          )
        `);

      if (filter.entity_type) {
        query = query.eq('entity_type', filter.entity_type);
      }

      if (filter.action_type) {
        query = query.eq('action_type', filter.action_type);
      }

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.date_from) {
        query = query.gte('timestamp', filter.date_from);
      }

      if (filter.date_to) {
        query = query.lte('timestamp', filter.date_to);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error };
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(filter: AuditFilter = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('action_type, entity_type, timestamp, user_id');

      if (filter.date_from) {
        query = query.gte('timestamp', filter.date_from);
      }

      if (filter.date_to) {
        query = query.lte('timestamp', filter.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_events: data?.length || 0,
        unique_users: new Set(data?.map(log => log.user_id).filter(Boolean)).size,
        action_breakdown: this.aggregateByField(data || [], 'action_type'),
        entity_breakdown: this.aggregateByField(data || [], 'entity_type'),
        daily_activity: this.aggregateByDate(data || []),
        top_users: this.getTopUsers(data || [])
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      return { success: false, error };
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuthEvent(action: 'login' | 'logout' | 'signup' | 'password_reset', userId?: string, details?: Record<string, any>) {
    return this.logEvent({
      entity_type: 'authentication',
      entity_id: userId,
      action_type: action,
      details: {
        timestamp: new Date().toISOString(),
        ...details
      },
      metadata: {
        category: 'security',
        severity: 'info'
      }
    }, userId);
  }

  /**
   * Log data modification events
   */
  static async logDataChange(
    entity_type: string,
    entity_id: string,
    action: 'create' | 'update' | 'delete',
    oldData?: Record<string, any>,
    newData?: Record<string, any>,
    userId?: string
  ) {
    return this.logEvent({
      entity_type,
      entity_id,
      action_type: `${entity_type}_${action}`,
      details: {
        old_data: oldData,
        new_data: newData,
        changes: oldData && newData ? this.getChanges(oldData, newData) : undefined
      },
      metadata: {
        category: 'data_modification',
        severity: action === 'delete' ? 'warning' : 'info'
      }
    }, userId);
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    event_type: 'permission_denied' | 'role_assigned' | 'role_removed' | 'suspicious_activity',
    details: Record<string, any>,
    userId?: string
  ) {
    return this.logEvent({
      entity_type: 'security',
      action_type: event_type,
      details,
      metadata: {
        category: 'security',
        severity: event_type === 'suspicious_activity' ? 'critical' : 'warning'
      }
    }, userId);
  }

  /**
   * Log business events
   */
  static async logBusinessEvent(
    event_type: string,
    entity_type: string,
    entity_id: string,
    details: Record<string, any>,
    userId?: string
  ) {
    return this.logEvent({
      entity_type,
      entity_id,
      action_type: event_type,
      details,
      metadata: {
        category: 'business',
        severity: 'info'
      }
    }, userId);
  }

  /**
   * Log system events
   */
  static async logSystemEvent(
    event_type: 'backup' | 'maintenance' | 'error' | 'performance',
    details: Record<string, any>
  ) {
    return this.logEvent({
      entity_type: 'system',
      action_type: event_type,
      details,
      metadata: {
        category: 'system',
        severity: event_type === 'error' ? 'error' : 'info'
      }
    });
  }

  /**
   * Get audit trail for a specific entity
   */
  static async getEntityAuditTrail(entity_type: string, entity_id: string) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(
            first_nm,
            last_nm,
            email
          )
        `)
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching entity audit trail:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivity(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return { success: false, error };
    }
  }

  /**
   * Search audit logs
   */
  static async searchAuditLogs(searchTerm: string, filter: AuditFilter = {}) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(
            first_nm,
            last_nm,
            email
          )
        `)
        .or(`action_type.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%,details::text.ilike.%${searchTerm}%`);

      if (filter.entity_type) {
        query = query.eq('entity_type', filter.entity_type);
      }

      if (filter.date_from) {
        query = query.gte('timestamp', filter.date_from);
      }

      if (filter.date_to) {
        query = query.lte('timestamp', filter.date_to);
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(filter.limit || 100);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return { success: false, error };
    }
  }

  /**
   * Export audit logs for compliance
   */
  static async exportAuditLogs(filter: AuditFilter = {}) {
    try {
      const result = await this.getAuditLogs({ ...filter, limit: 10000 });
      
      if (!result.success) {
        throw result.error;
      }

      // Create export record
      const { data: exportRecord, error: exportError } = await supabase
        .from('generated_reports')
        .insert({
          report_name: 'Audit Log Export',
          report_type: 'audit_export',
          parameters: filter,
          status: 'completed',
          date_from: filter.date_from,
          date_to: filter.date_to
        })
        .select()
        .single();

      if (exportError) throw exportError;

      return {
        success: true,
        data: {
          export_record: exportRecord,
          audit_logs: result.data,
          total_records: result.data?.length || 0
        }
      };
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return { success: false, error };
    }
  }

  // Helper methods

  private static aggregateByField(data: any[], field: string) {
    const aggregation = new Map();
    data.forEach(item => {
      const value = item[field] || 'unknown';
      aggregation.set(value, (aggregation.get(value) || 0) + 1);
    });
    return Array.from(aggregation.entries()).map(([key, count]) => ({ [field]: key, count }));
  }

  private static aggregateByDate(data: any[]) {
    const dailyActivity = new Map();
    data.forEach(item => {
      const date = item.timestamp.split('T')[0];
      dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
    });
    return Array.from(dailyActivity.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static getTopUsers(data: any[]) {
    const userActivity = new Map();
    data.forEach(item => {
      if (item.user_id) {
        userActivity.set(item.user_id, (userActivity.get(item.user_id) || 0) + 1);
      }
    });
    return Array.from(userActivity.entries())
      .map(([user_id, count]) => ({ user_id, activity_count: count }))
      .sort((a, b) => b.activity_count - a.activity_count)
      .slice(0, 10);
  }

  private static getChanges(oldData: Record<string, any>, newData: Record<string, any>) {
    const changes: Record<string, { old: any; new: any }> = {};
    
    // Check for changed and new fields
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });

    // Check for removed fields
    Object.keys(oldData).forEach(key => {
      if (!(key in newData)) {
        changes[key] = {
          old: oldData[key],
          new: null
        };
      }
    });

    return changes;
  }
}

export default AuditService;
