import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

/**
 * Base service class for database operations with multi-tenant support
 */
export abstract class BaseService<T extends TableName> {
  protected tableName: T;

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  /**
   * Get the current user's franchisor_id for multi-tenant filtering
   */
  protected async getCurrentFranchisorId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    return profile?.franchisor_id || null;
  }

  /**
   * Create a new record with automatic franchisor_id assignment
   */
  async create(data: Partial<Tables[T]['Insert']>): Promise<{
    data: Tables[T]['Row'] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Add franchisor_id if the table has this column and it's not already set
    const insertData = { ...data };
    if (franchisorId && 'franchisor_id' in insertData && !insertData.franchisor_id) {
      (insertData as any).franchisor_id = franchisorId;
    }

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(insertData as Tables[T]['Insert'])
      .select()
      .single();

    return { data: result, error };
  }

  /**
   * Get records with automatic multi-tenant filtering
   */
  async getAll(filters?: Record<string, any>): Promise<{
    data: Tables[T]['Row'][] | null;
    error: any;
  }> {
    let query = supabase.from(this.tableName).select('*');

    // Apply multi-tenant filtering
    const franchisorId = await this.getCurrentFranchisorId();
    if (franchisorId) {
      query = query.eq('franchisor_id', franchisorId);
    }

    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
    return { data, error };
  }

  /**
   * Get a single record by ID with multi-tenant filtering
   */
  async getById(id: string): Promise<{
    data: Tables[T]['Row'] | null;
    error: any;
  }> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id);

    // Apply multi-tenant filtering
    const franchisorId = await this.getCurrentFranchisorId();
    if (franchisorId) {
      query = query.eq('franchisor_id', franchisorId);
    }

    const { data, error } = await query.single();
    return { data, error };
  }

  /**
   * Update a record with multi-tenant filtering
   */
  async update(id: string, updates: Partial<Tables[T]['Update']>): Promise<{
    data: Tables[T]['Row'] | null;
    error: any;
  }> {
    let query = supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id);

    // Apply multi-tenant filtering
    const franchisorId = await this.getCurrentFranchisorId();
    if (franchisorId) {
      query = query.eq('franchisor_id', franchisorId);
    }

    const { data, error } = await query.select().single();
    return { data, error };
  }

  /**
   * Delete a record with multi-tenant filtering
   */
  async delete(id: string): Promise<{ error: any }> {
    let query = supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    // Apply multi-tenant filtering
    const franchisorId = await this.getCurrentFranchisorId();
    if (franchisorId) {
      query = query.eq('franchisor_id', franchisorId);
    }

    const { error } = await query;
    return { error };
  }

  /**
   * Get paginated results
   */
  async getPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<{
    data: Tables[T]['Row'][] | null;
    count: number | null;
    error: any;
  }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .range(from, to);

    // Apply multi-tenant filtering
    const franchisorId = await this.getCurrentFranchisorId();
    if (franchisorId) {
      query = query.eq('franchisor_id', franchisorId);
    }

    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, count, error } = await query;
    return { data, count, error };
  }
}
