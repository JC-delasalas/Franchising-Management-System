import { supabase } from '@/lib/supabase';
import { CartAPI } from '@/api/cart';

export interface DebugResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  timing?: number;
  details?: any;
}

export class CartDebugger {
  private results: DebugResult[] = [];

  // Step 1: Authentication State Verification
  async verifyAuthenticationState(): Promise<DebugResult> {
    console.log('🔍 Step 1: Authentication State Verification');
    const startTime = performance.now();
    
    try {
      // Test supabase.auth.getUser()
      const authResponse = await supabase.auth.getUser();
      const timing = performance.now() - startTime;
      
      console.log('Auth Response:', {
        data: authResponse.data,
        error: authResponse.error,
        user: authResponse.data?.user,
        userId: authResponse.data?.user?.id,
        email: authResponse.data?.user?.email,
        role: authResponse.data?.user?.role,
        aud: authResponse.data?.user?.aud,
        exp: authResponse.data?.user?.exp,
        iat: authResponse.data?.user?.iat
      });

      if (authResponse.error) {
        const result: DebugResult = {
          step: 'Authentication State',
          success: false,
          error: `Auth error: ${authResponse.error.message}`,
          timing,
          details: authResponse.error
        };
        this.results.push(result);
        return result;
      }

      if (!authResponse.data?.user) {
        const result: DebugResult = {
          step: 'Authentication State',
          success: false,
          error: 'No authenticated user found',
          timing,
          details: authResponse.data
        };
        this.results.push(result);
        return result;
      }

      const user = authResponse.data.user;
      
      // Check if user exists in user_profiles table
      const profileCheck = await supabase
        .from('user_profiles')
        .select('id, email, role, status')
        .eq('id', user.id)
        .single();

      console.log('Profile Check:', profileCheck);

      // Check session validity
      const session = await supabase.auth.getSession();
      console.log('Session Check:', {
        session: session.data.session,
        error: session.error,
        expiresAt: session.data.session?.expires_at,
        accessToken: session.data.session?.access_token ? 'Present' : 'Missing',
        refreshToken: session.data.session?.refresh_token ? 'Present' : 'Missing'
      });

      const result: DebugResult = {
        step: 'Authentication State',
        success: true,
        timing,
        data: {
          userId: user.id,
          email: user.email,
          profileExists: !profileCheck.error,
          profileData: profileCheck.data,
          sessionValid: !session.error && !!session.data.session,
          sessionExpiry: session.data.session?.expires_at
        }
      };
      
      this.results.push(result);
      return result;
      
    } catch (error: any) {
      const timing = performance.now() - startTime;
      const result: DebugResult = {
        step: 'Authentication State',
        success: false,
        error: error.message,
        timing,
        details: error
      };
      this.results.push(result);
      return result;
    }
  }

  // Step 2: Isolated Cart Query Testing
  async testIsolatedCartQueries(): Promise<DebugResult> {
    console.log('🔍 Step 2: Isolated Cart Query Testing');
    const startTime = performance.now();
    
    try {
      // Get authenticated user first
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error('No authenticated user for cart query test');
      }

      console.log('Testing cart queries for user:', authData.user.id);

      // Test 1: Direct shopping_cart query
      console.log('Test 1: Direct shopping_cart table query');
      const directQueryStart = performance.now();
      const directQuery = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', authData.user.id);
      const directQueryTime = performance.now() - directQueryStart;
      
      console.log('Direct query result:', {
        data: directQuery.data,
        error: directQuery.error,
        count: directQuery.data?.length,
        timing: directQueryTime
      });

      // Test 2: Cart query with products join
      console.log('Test 2: Cart query with products!inner join');
      const joinQueryStart = performance.now();
      const joinQuery = await supabase
        .from('shopping_cart')
        .select(`
          *,
          products!inner (
            id,
            name,
            sku,
            price,
            images,
            description,
            unit_of_measure,
            minimum_order_qty,
            maximum_order_qty,
            active
          )
        `)
        .eq('user_id', authData.user.id)
        .order('added_at', { ascending: false });
      const joinQueryTime = performance.now() - joinQueryStart;
      
      console.log('Join query result:', {
        data: joinQuery.data,
        error: joinQuery.error,
        count: joinQuery.data?.length,
        timing: joinQueryTime
      });

      // Test 3: CartAPI.getCartSummary() in isolation
      console.log('Test 3: CartAPI.getCartSummary() method');
      const apiCallStart = performance.now();
      const apiResult = await CartAPI.getCartSummary();
      const apiCallTime = performance.now() - apiCallStart;
      
      console.log('API call result:', {
        data: apiResult,
        timing: apiCallTime
      });

      const totalTiming = performance.now() - startTime;
      const result: DebugResult = {
        step: 'Isolated Cart Queries',
        success: true,
        timing: totalTiming,
        data: {
          directQuery: {
            success: !directQuery.error,
            count: directQuery.data?.length,
            timing: directQueryTime,
            error: directQuery.error?.message
          },
          joinQuery: {
            success: !joinQuery.error,
            count: joinQuery.data?.length,
            timing: joinQueryTime,
            error: joinQuery.error?.message
          },
          apiCall: {
            success: true,
            data: apiResult,
            timing: apiCallTime
          }
        }
      };
      
      this.results.push(result);
      return result;
      
    } catch (error: any) {
      const timing = performance.now() - startTime;
      const result: DebugResult = {
        step: 'Isolated Cart Queries',
        success: false,
        error: error.message,
        timing,
        details: error
      };
      this.results.push(result);
      return result;
    }
  }

  // Step 3: React Query Hook Behavior Analysis
  async analyzeReactQueryBehavior(): Promise<DebugResult> {
    console.log('🔍 Step 3: React Query Hook Behavior Analysis');
    
    // This will be implemented in the component itself
    // Return placeholder for now
    const result: DebugResult = {
      step: 'React Query Analysis',
      success: true,
      data: {
        note: 'This step requires component-level implementation'
      }
    };
    
    this.results.push(result);
    return result;
  }

  // Step 4: Network Layer Inspection
  async inspectNetworkLayer(): Promise<DebugResult> {
    console.log('🔍 Step 4: Network Layer Inspection');
    const startTime = performance.now();
    
    try {
      // Test Supabase connection
      const connectionTest = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      console.log('Supabase connection test:', {
        status: connectionTest.status,
        statusText: connectionTest.statusText,
        headers: Object.fromEntries(connectionTest.headers.entries())
      });

      // Test auth endpoint
      const authTest = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      console.log('Auth endpoint test:', {
        status: authTest.status,
        statusText: authTest.statusText
      });

      const timing = performance.now() - startTime;
      const result: DebugResult = {
        step: 'Network Layer',
        success: connectionTest.ok,
        timing,
        data: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          connectionStatus: connectionTest.status,
          authEndpointStatus: authTest.status,
          apiKeyPresent: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      };
      
      this.results.push(result);
      return result;
      
    } catch (error: any) {
      const timing = performance.now() - startTime;
      const result: DebugResult = {
        step: 'Network Layer',
        success: false,
        error: error.message,
        timing,
        details: error
      };
      this.results.push(result);
      return result;
    }
  }

  // Run all debugging steps
  async runCompleteAnalysis(): Promise<DebugResult[]> {
    console.log('🚀 Starting Complete Cart Loading Analysis');
    this.results = [];
    
    await this.verifyAuthenticationState();
    await this.testIsolatedCartQueries();
    await this.analyzeReactQueryBehavior();
    await this.inspectNetworkLayer();
    
    console.log('📊 Complete Analysis Results:', this.results);
    return this.results;
  }

  getResults(): DebugResult[] {
    return this.results;
  }

  getSummary(): string {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    
    return `Analysis Complete: ${successful}/${total} steps successful, ${failed} failed`;
  }
}

export const cartDebugger = new CartDebugger();
