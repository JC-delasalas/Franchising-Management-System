import { supabase } from '@/integrations/supabase/client';

/**
 * Flexible Data Service
 * Handles structured, semi-structured, and unstructured data operations
 */
export class FlexibleDataService {
  
  /**
   * Store document (unstructured data)
   */
  async storeDocument(documentData: {
    entity_type: string;
    entity_id?: string;
    document_type: string;
    title: string;
    description?: string;
    file_path?: string;
    file_size?: number;
    mime_type?: string;
    content_text?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        franchisor_id: userProfile.franchisor_id,
        created_by: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get documents with filtering
   */
  async getDocuments(filters: {
    entity_type?: string;
    entity_id?: string;
    document_type?: string;
    tags?: string[];
    search?: string;
  } = {}): Promise<{ data: any[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: [], error: new Error('User profile not found') };

    let query = supabase
      .from('documents')
      .select('*')
      .eq('franchisor_id', userProfile.franchisor_id)
      .eq('is_active', true);

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }
    if (filters.document_type) {
      query = query.eq('document_type', filters.document_type);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    if (filters.search) {
      query = query.textSearch('content_text', filters.search);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data || [], error };
  }

  /**
   * Store configuration (semi-structured data)
   */
  async setConfiguration(
    key: string,
    value: any,
    type: string = 'general',
    description?: string
  ): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('configurations')
      .upsert({
        franchisor_id: userProfile.franchisor_id,
        config_key: key,
        config_value: value,
        config_type: type,
        description,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get configuration
   */
  async getConfiguration(key: string): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('configurations')
      .select('config_value')
      .eq('franchisor_id', userProfile.franchisor_id)
      .eq('config_key', key)
      .single();

    return { data: data?.config_value, error };
  }

  /**
   * Track analytics event
   */
  async trackEvent(eventData: {
    event_type: string;
    event_name: string;
    entity_type?: string;
    entity_id?: string;
    properties?: Record<string, any>;
    session_id?: string;
  }): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        ...eventData,
        franchisor_id: userProfile.franchisor_id,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Create dynamic form
   */
  async createDynamicForm(formData: {
    form_name: string;
    form_type: string;
    title: string;
    description?: string;
    schema: Record<string, any>;
    ui_schema?: Record<string, any>;
    validation_rules?: Record<string, any>;
  }): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('dynamic_forms')
      .insert({
        ...formData,
        franchisor_id: userProfile.franchisor_id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Submit form response
   */
  async submitFormResponse(responseData: {
    form_id: string;
    entity_type?: string;
    entity_id?: string;
    response_data: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('form_responses')
      .insert({
        ...responseData,
        franchisor_id: userProfile.franchisor_id,
        respondent_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update entity metadata
   */
  async updateEntityMetadata(
    entityType: 'user' | 'brand' | 'product' | 'franchisee',
    entityId: string,
    metadata: Record<string, any>
  ): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    let tableName: string;
    let idColumn: string;

    switch (entityType) {
      case 'user':
        tableName = 'user_profiles';
        idColumn = 'user_id';
        break;
      case 'brand':
        tableName = 'brand';
        idColumn = 'brand_id';
        break;
      case 'product':
        tableName = 'product';
        idColumn = 'product_id';
        break;
      case 'franchisee':
        tableName = 'franchisee';
        idColumn = 'franchisee_id';
        break;
      default:
        return { data: null, error: new Error('Invalid entity type') };
    }

    const { data, error } = await supabase
      .from(tableName)
      .update({ metadata })
      .eq(idColumn, entityId)
      .eq('franchisor_id', userProfile.franchisor_id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Search across all entities
   */
  async searchEntities(
    query: string,
    entityTypes?: string[],
    limit: number = 50
  ): Promise<{ data: any[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: [], error: new Error('User profile not found') };

    const { data, error } = await supabase.rpc('search_entities', {
      p_franchisor_id: userProfile.franchisor_id,
      p_query: query,
      p_entity_types: entityTypes,
      p_limit: limit,
    });

    return { data: data || [], error };
  }

  /**
   * Create notification
   */
  async createNotification(notificationData: {
    recipient_id?: string;
    notification_type: string;
    channel: 'email' | 'sms' | 'push' | 'in_app';
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: null, error: new Error('User profile not found') };

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        franchisor_id: userProfile.franchisor_id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(
    startDate?: string,
    endDate?: string,
    eventTypes?: string[]
  ): Promise<{ data: any[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: new Error('User not authenticated') };

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('franchisor_id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) return { data: [], error: new Error('User profile not found') };

    let query = supabase
      .from('analytics_summary')
      .select('*')
      .eq('franchisor_id', userProfile.franchisor_id);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (eventTypes && eventTypes.length > 0) {
      query = query.in('event_type', eventTypes);
    }

    const { data, error } = await query.order('date', { ascending: false });
    return { data: data || [], error };
  }
}

// Singleton instance
export const flexibleDataService = new FlexibleDataService();
