import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { APIError, handleAPIError, withRetry, logError, RetryOptions } from '@/lib/errors'

export class BaseAPI {
  protected static async handleResponse<T>(
    promise: Promise<{ data: T | null; error: any }>,
    endpoint?: string,
    method?: string
  ): Promise<T> {
    const { data, error } = await promise

    if (error) {
      const apiError = handleAPIError(error, endpoint, method);
      logError(apiError, { endpoint, method, context: 'api_response' });
      throw apiError;
    }

    if (!data) {
      const apiError = new APIError('No data returned', 'NO_DATA', undefined, 'No data was returned from the server', false, endpoint, method);
      logError(apiError, { endpoint, method, context: 'no_data' });
      throw apiError;
    }

    return data
  }

  protected static async handleResponseWithRetry<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    endpoint?: string,
    method?: string,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return withRetry(
      async () => {
        const result = await operation();
        return this.handleResponse(Promise.resolve(result), endpoint, method);
      },
      retryOptions,
      { endpoint, method }
    );
  }

  protected static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        throw handleAPIError(error, 'auth/user', 'GET');
      }

      if (!user) {
        throw new APIError('User not authenticated', 'AUTHENTICATION_ERROR', 401, 'Please sign in to continue');
      }

      return user;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw handleAPIError(error, 'auth/user', 'GET');
    }
  }

  protected static async getCurrentUserProfile() {
    try {
      const user = await this.getCurrentUser();

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw handleAPIError(error, 'user_profiles', 'GET');
      }

      if (!profile) {
        throw new APIError('User profile not found', 'PROFILE_NOT_FOUND', 404, 'Your user profile could not be found');
      }

      return profile;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw handleAPIError(error, 'user_profiles', 'GET');
    }
  }

  protected static async checkPermission(allowedRoles: string[]) {
    try {
      const profile = await this.getCurrentUserProfile();

      if (!profile.role || !allowedRoles.includes(profile.role)) {
        throw new APIError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          'PERMISSION_DENIED',
          403,
          'You do not have permission to perform this action'
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw handleAPIError(error, 'permission_check', 'GET');
    }
  }

  // Generic CRUD operations with enhanced error handling
  protected static async create<T>(
    table: string,
    data: Partial<T>,
    select: string = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.handleResponseWithRetry(
      () => supabase.from(table).insert(data).select(select).single(),
      table,
      'POST',
      retryOptions
    );
  }

  protected static async read<T>(
    table: string,
    filters?: Record<string, any>,
    select: string = '*',
    orderBy?: { column: string; ascending?: boolean },
    retryOptions?: Partial<RetryOptions>
  ): Promise<T[]> {
    return this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).select(select);

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        return query;
      },
      table,
      'GET',
      retryOptions
    );
  }

  protected static async readSingle<T>(
    table: string,
    filters: Record<string, any>,
    select: string = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).select(select);

        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        return query.single();
      },
      table,
      'GET',
      retryOptions
    );
  }

  protected static async update<T>(
    table: string,
    filters: Record<string, any>,
    data: Partial<T>,
    select: string = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T[]> {
    return this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).update(data).select(select);

        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        return query;
      },
      table,
      'PATCH',
      retryOptions
    );
  }

  protected static async delete<T>(
    table: string,
    filters: Record<string, any>,
    retryOptions?: Partial<RetryOptions>
  ): Promise<void> {
    await this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).delete();

        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        return query;
      },
      table,
      'DELETE',
      retryOptions
    );
  }

  // Remove duplicate - using enhanced version above

  // Enhanced CRUD operations with retry logic (replacing duplicates above)
  protected static async createWithRetry<T>(
    table: keyof Database['public']['Tables'],
    data: any,
    select = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.handleResponseWithRetry(
      () => supabase
        .from(table)
        .insert(data)
        .select(select)
        .single(),
      table as string,
      'POST',
      retryOptions
    )
  }

  protected static async readWithRetry<T>(
    table: keyof Database['public']['Tables'],
    filters?: Record<string, any>,
    select = '*',
    orderBy?: { column: string; ascending?: boolean },
    retryOptions?: Partial<RetryOptions>
  ): Promise<T[]> {
    return this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).select(select)

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              query = query.in(key, value)
            } else if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }

        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
        }

        return query
      },
      table as string,
      'GET',
      retryOptions
    )
  }

  protected static async readSingleWithRetry<T>(
    table: keyof Database['public']['Tables'],
    filters: Record<string, any>,
    select = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.handleResponseWithRetry(
      () => {
        let query = supabase.from(table).select(select)

        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        return query.single()
      },
      table as string,
      'GET',
      retryOptions
    )
  }

  protected static async updateWithRetry<T>(
    table: keyof Database['public']['Tables'],
    id: string,
    data: any,
    select = '*',
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.handleResponseWithRetry(
      () => supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(select)
        .single(),
      table as string,
      'PUT',
      retryOptions
    )
  }

  protected static async deleteWithRetry(
    table: keyof Database['public']['Tables'],
    id: string,
    retryOptions?: Partial<RetryOptions>
  ): Promise<void> {
    await this.handleResponseWithRetry(
      () => supabase
        .from(table)
        .delete()
        .eq('id', id),
      table as string,
      'DELETE',
      retryOptions
    )
  }

  // Utility functions
  protected static async generateUniqueNumber(prefix: string, table: string, column: string): Promise<string> {
    const year = new Date().getFullYear()
    let counter = 1
    let isUnique = false
    let number = ''

    while (!isUnique) {
      number = `${prefix}-${year}-${counter.toString().padStart(6, '0')}`
      
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq(column, number)
        .single()

      if (!data) {
        isUnique = true
      } else {
        counter++
      }
    }

    return number
  }

  protected static formatCurrency(amount: number, currency = 'PHP'): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  protected static formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  protected static formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // Pagination helper
  protected static async paginate<T>(
    table: keyof Database['public']['Tables'],
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>,
    select = '*',
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<{
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from(table).select(select, { count: 'exact' })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
    }
    
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  }

  // Search helper
  protected static async search<T>(
    table: keyof Database['public']['Tables'],
    searchTerm: string,
    searchColumns: string[],
    filters?: Record<string, any>,
    select = '*',
    limit = 50
  ): Promise<T[]> {
    let query = supabase.from(table).select(select)
    
    // Add search conditions
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',')
      query = query.or(searchConditions)
    }
    
    // Add filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    query = query.limit(limit)
    
    return this.handleResponse(query)
  }
}
