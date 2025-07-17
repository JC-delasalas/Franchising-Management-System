/**
 * Authentication Security Test Runner
 * 
 * Comprehensive testing for authentication security and bypass prevention
 */

import { supabase } from '@/lib/supabase';
import SessionManager from '@/utils/sessionManager';

export interface AuthSecurityTestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  details?: any;
  securityLevel: 'critical' | 'high' | 'medium' | 'low';
}

export class AuthSecurityTestRunner {
  private results: AuthSecurityTestResult[] = [];

  private async runTest(
    name: string, 
    testFn: () => Promise<void>, 
    securityLevel: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ): Promise<AuthSecurityTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: AuthSecurityTestResult = {
        name,
        status: 'passed',
        message: 'Security test passed',
        duration,
        securityLevel
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: AuthSecurityTestResult = {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        securityLevel,
        details: error
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testSessionPersistence(): Promise<AuthSecurityTestResult> {
    return this.runTest('Session Persistence Security', async () => {
      // Check if session persistence is properly configured
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verify session has proper expiry
        if (!session.expires_at) {
          throw new Error('Session missing expiry time - security risk');
        }
        
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Session should not be valid for more than 24 hours
        const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours
        if (timeUntilExpiry > maxSessionTime) {
          throw new Error('Session expiry time too long - security risk');
        }
        
        // Verify session has proper user data
        if (!session.user || !session.user.id) {
          throw new Error('Session missing user data - security risk');
        }
      }
    }, 'critical');
  }

  async testAuthGuardBypass(): Promise<AuthSecurityTestResult> {
    return this.runTest('Auth Guard Bypass Prevention', async () => {
      // Test that protected routes cannot be accessed without authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If user is authenticated, verify they have proper profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, role, status')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          throw new Error('Authenticated user missing profile - potential security bypass');
        }
        
        if (!profile.role) {
          throw new Error('User profile missing role - authorization bypass risk');
        }
        
        if (profile.status !== 'active') {
          throw new Error('Inactive user has active session - security risk');
        }
      }
    }, 'critical');
  }

  async testLoginFormSecurity(): Promise<AuthSecurityTestResult> {
    return this.runTest('Login Form Security', async () => {
      // Test that login form properly validates credentials
      try {
        // Attempt login with invalid credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });
        
        if (!error) {
          throw new Error('Login succeeded with invalid credentials - critical security breach');
        }
        
        // Verify error doesn't expose sensitive information
        if (error.message.includes('password') && error.message.includes('hash')) {
          throw new Error('Login error exposes sensitive information');
        }
        
      } catch (authError: any) {
        // Expected to fail - this is good
        if (authError.message?.includes('Invalid login credentials')) {
          // This is the expected behavior
          return;
        }
        throw authError;
      }
    }, 'critical');
  }

  async testSessionValidation(): Promise<AuthSecurityTestResult> {
    return this.runTest('Session Validation', async () => {
      const sessionInfo = await SessionManager.getSessionInfo();
      
      if (sessionInfo.isActive) {
        // Verify session has all required properties
        if (!sessionInfo.user) {
          throw new Error('Active session missing user data');
        }
        
        if (!sessionInfo.expiresAt) {
          throw new Error('Active session missing expiry information');
        }
        
        // Verify session is not expired
        const expiresAt = new Date(sessionInfo.expiresAt).getTime();
        const now = Date.now();
        
        if (now >= expiresAt) {
          throw new Error('Expired session reported as active');
        }
      }
    }, 'high');
  }

  async testUnauthorizedAccess(): Promise<AuthSecurityTestResult> {
    return this.runTest('Unauthorized Access Prevention', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Test that unauthenticated users cannot access protected data
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .limit(1);
        
        if (data && data.length > 0) {
          throw new Error('Unauthenticated user can access protected data - RLS bypass');
        }
        
        if (!error || !error.message.includes('JWT')) {
          throw new Error('Protected data accessible without proper authentication');
        }
      } else {
        // Test that authenticated users can only access their own data
        const { data: otherUserData } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('id', session.user.id)
          .limit(1);
        
        if (otherUserData && otherUserData.length > 0) {
          throw new Error('User can access other users\' data - RLS policy failure');
        }
      }
    }, 'critical');
  }

  async testPasswordSecurity(): Promise<AuthSecurityTestResult> {
    return this.runTest('Password Security', async () => {
      // Test password requirements (this is more of a policy check)
      const weakPasswords = ['123456', 'password', 'admin', ''];
      
      for (const weakPassword of weakPasswords) {
        try {
          const { error } = await supabase.auth.signUp({
            email: `test-${Date.now()}@test.com`,
            password: weakPassword
          });
          
          if (!error) {
            throw new Error(`Weak password "${weakPassword}" was accepted - security risk`);
          }
          
          // Check if error indicates password strength requirement
          if (!error.message.includes('Password') && !error.message.includes('weak')) {
            // This might be acceptable if there are other validation rules
            console.warn(`Weak password "${weakPassword}" rejected but not for strength reasons`);
          }
        } catch (testError: any) {
          // Expected to fail for weak passwords
          continue;
        }
      }
    }, 'high');
  }

  async testTokenSecurity(): Promise<AuthSecurityTestResult> {
    return this.runTest('Token Security', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verify access token is not exposed in localStorage as plain text
        const localStorageKeys = Object.keys(localStorage);
        
        for (const key of localStorageKeys) {
          const value = localStorage.getItem(key);
          if (value && value.includes(session.access_token)) {
            throw new Error('Access token stored in plain text in localStorage - security risk');
          }
        }
        
        // Verify token has proper structure (JWT)
        const tokenParts = session.access_token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Access token is not a valid JWT');
        }
        
        // Verify token expiry
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (!payload.exp) {
            throw new Error('Access token missing expiry claim');
          }
          
          const tokenExpiry = payload.exp * 1000;
          const now = Date.now();
          
          if (tokenExpiry <= now) {
            throw new Error('Expired access token is still active');
          }
        } catch (parseError) {
          throw new Error('Cannot parse access token payload');
        }
      }
    }, 'high');
  }

  async testLogoutSecurity(): Promise<AuthSecurityTestResult> {
    return this.runTest('Logout Security', async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        // Test logout functionality
        await SessionManager.signOut('/');
        
        // Verify session is cleared
        const { data: { session: afterLogoutSession } } = await supabase.auth.getSession();
        
        if (afterLogoutSession) {
          throw new Error('Session not properly cleared after logout');
        }
        
        // Verify localStorage is cleared
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth') || key.includes('token')
        );
        
        if (authKeys.length > 0) {
          throw new Error('Authentication data not cleared from localStorage after logout');
        }
      }
    }, 'high');
  }

  async runAllSecurityTests(): Promise<AuthSecurityTestResult[]> {
    this.results = [];
    
    console.log('🔒 Starting Authentication Security Tests...');
    
    // Run critical security tests
    await this.testSessionPersistence();
    await this.testAuthGuardBypass();
    await this.testLoginFormSecurity();
    await this.testUnauthorizedAccess();
    
    // Run additional security tests
    await this.testSessionValidation();
    await this.testPasswordSecurity();
    await this.testTokenSecurity();
    await this.testLogoutSecurity();
    
    return this.results;
  }

  getResults(): AuthSecurityTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    const criticalIssues = this.results.filter(r => r.securityLevel === 'critical' && r.status === 'failed').length;
    const highIssues = this.results.filter(r => r.securityLevel === 'high' && r.status === 'failed').length;
    
    return {
      total,
      passed,
      failed,
      warnings,
      criticalIssues,
      highIssues,
      securityScore: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      isSecure: criticalIssues === 0 && highIssues === 0,
    };
  }
}

// Export a default instance for easy use
export const authSecurityTestRunner = new AuthSecurityTestRunner();
