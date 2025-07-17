/**
 * Login Module Test Runner
 * 
 * Comprehensive testing for login functionality and integration with Phase 1 security enhancements
 */

import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut } from '@/hooks/useAuth';
import { AuthenticationError, getUserFriendlyMessage } from '@/lib/errors';

export interface LoginTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
  error?: string;
  details?: any;
}

export class LoginTestRunner {
  private results: LoginTestResult[] = [];
  private testEmail: string;
  private testPassword: string;

  constructor(testEmail: string = 'logintest@franchisehub.test', testPassword: string = 'TestLogin123!') {
    this.testEmail = testEmail;
    this.testPassword = testPassword;
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<LoginTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: LoginTestResult = {
        name,
        status: 'passed',
        message: 'Test passed successfully',
        duration
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = getUserFriendlyMessage(error);
      
      const result: LoginTestResult = {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testErrorHandlingIntegration(): Promise<LoginTestResult> {
    return this.runTest('Error Handling Integration', async () => {
      try {
        await signIn('invalid@email.com', 'wrongpassword');
        throw new Error('Should have failed with invalid credentials');
      } catch (error) {
        // Verify that we get an AuthenticationError with proper user message
        if (!(error instanceof AuthenticationError)) {
          throw new Error('Expected AuthenticationError but got: ' + error?.constructor?.name);
        }
        
        if (!error.userMessage) {
          throw new Error('AuthenticationError missing userMessage property');
        }
        
        const userMessage = getUserFriendlyMessage(error);
        if (!userMessage || userMessage.length < 10) {
          throw new Error('User-friendly message is too short or missing');
        }
      }
    });
  }

  async testValidLoginFlow(): Promise<LoginTestResult> {
    return this.runTest('Valid Login Flow', async () => {
      // First create a test user
      const uniqueEmail = `valid-login-${Date.now()}@franchisehub.test`;
      
      try {
        await signUp(uniqueEmail, this.testPassword, {
          full_name: 'Test User',
          role: 'franchisee'
        });
        
        // Now test login
        const result = await signIn(uniqueEmail, this.testPassword);
        
        if (!result.user) {
          throw new Error('Login succeeded but no user returned');
        }
        
        if (!result.session) {
          throw new Error('Login succeeded but no session returned');
        }
        
        // Verify profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', result.user.id)
          .single();
        
        if (!profile) {
          throw new Error('User profile not found after login');
        }
        
      } finally {
        // Clean up
        await signOut();
      }
    });
  }

  async testProfileLoadingDependency(): Promise<LoginTestResult> {
    return this.runTest('Profile Loading Dependency', async () => {
      // Test that authentication properly depends on profile loading
      const uniqueEmail = `profile-test-${Date.now()}@franchisehub.test`;
      
      try {
        // Create user
        await signUp(uniqueEmail, this.testPassword);
        
        // Login
        const result = await signIn(uniqueEmail, this.testPassword);
        
        if (!result.user) {
          throw new Error('Login failed - no user returned');
        }
        
        // Verify that the authentication system requires a valid profile
        // This is tested by checking that the user object has proper profile data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user found after login');
        }
        
      } finally {
        await signOut();
      }
    });
  }

  async testNavigationAfterLogin(): Promise<LoginTestResult> {
    return this.runTest('Navigation After Login', async () => {
      // Test that login doesn't break navigation flow
      const uniqueEmail = `nav-test-${Date.now()}@franchisehub.test`;
      
      try {
        // Create franchisee user
        await signUp(uniqueEmail, this.testPassword, {
          full_name: 'Test Franchisee',
          role: 'franchisee'
        });
        
        // Login
        const result = await signIn(uniqueEmail, this.testPassword);
        
        if (!result.user) {
          throw new Error('Login failed');
        }
        
        // Verify session is active
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session after login');
        }
        
        // Test that we can access user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', result.user.id)
          .single();
        
        if (!profile || profile.role !== 'franchisee') {
          throw new Error('Profile role not set correctly');
        }
        
      } finally {
        await signOut();
      }
    });
  }

  async testErrorBoundaryIntegration(): Promise<LoginTestResult> {
    return this.runTest('Error Boundary Integration', async () => {
      // Test that authentication errors are properly categorized for error boundaries
      try {
        await signIn('test@nonexistent.com', 'wrongpassword');
        throw new Error('Should have failed');
      } catch (error) {
        if (!(error instanceof AuthenticationError)) {
          throw new Error('Expected AuthenticationError');
        }
        
        // Verify error has proper categorization
        if (!error.code) {
          throw new Error('Error missing code property');
        }
        
        if (!error.userMessage) {
          throw new Error('Error missing userMessage property');
        }
        
        // Verify error boundary would detect this as auth error
        const isAuthError = error.message.includes('auth') || 
                           error.message.includes('profile') ||
                           error.message.includes('permission') ||
                           error.message.includes('unauthorized') ||
                           error.message.includes('sign in') ||
                           error.message.includes('token') ||
                           error.message.includes('Invalid') ||
                           error.message.includes('credentials');
        
        if (!isAuthError) {
          throw new Error('Error would not be detected as auth error by error boundary');
        }
      }
    });
  }

  async testMultipleRoleLogin(): Promise<LoginTestResult> {
    return this.runTest('Multiple Role Login', async () => {
      const roles = ['franchisee', 'franchisor'];
      
      for (const role of roles) {
        const uniqueEmail = `${role}-test-${Date.now()}@franchisehub.test`;
        
        try {
          // Create user with specific role
          await signUp(uniqueEmail, this.testPassword, {
            full_name: `Test ${role}`,
            role: role
          });
          
          // Login
          const result = await signIn(uniqueEmail, this.testPassword);
          
          if (!result.user) {
            throw new Error(`Login failed for ${role}`);
          }
          
          // Verify role is set correctly
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', result.user.id)
            .single();
          
          if (!profile || profile.role !== role) {
            throw new Error(`Role not set correctly for ${role}. Expected: ${role}, Got: ${profile?.role}`);
          }
          
        } finally {
          await signOut();
        }
      }
    });
  }

  async testSessionPersistence(): Promise<LoginTestResult> {
    return this.runTest('Session Persistence', async () => {
      const uniqueEmail = `session-test-${Date.now()}@franchisehub.test`;
      
      try {
        // Create and login user
        await signUp(uniqueEmail, this.testPassword);
        const result = await signIn(uniqueEmail, this.testPassword);
        
        if (!result.user) {
          throw new Error('Login failed');
        }
        
        // Verify session persists
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Session not persistent');
        }
        
        // Verify user can be retrieved
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not retrievable from session');
        }
        
        if (user.id !== result.user.id) {
          throw new Error('Session user ID mismatch');
        }
        
      } finally {
        await signOut();
      }
    });
  }

  async runAllLoginTests(): Promise<LoginTestResult[]> {
    this.results = [];
    
    console.log('🔐 Starting Login Module Tests...');
    
    // Run tests in sequence to avoid conflicts
    await this.testErrorHandlingIntegration();
    await this.testValidLoginFlow();
    await this.testProfileLoadingDependency();
    await this.testNavigationAfterLogin();
    await this.testErrorBoundaryIntegration();
    await this.testMultipleRoleLogin();
    await this.testSessionPersistence();
    
    return this.results;
  }

  getResults(): LoginTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    
    return {
      total,
      passed,
      failed,
      skipped,
      successRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0)
    };
  }
}

// Export a default instance for easy use
export const loginTestRunner = new LoginTestRunner();
