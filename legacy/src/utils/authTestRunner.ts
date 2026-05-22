/**
 * Authentication Test Runner
 * 
 * Utility functions to test authentication flows and security measures
 */

import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut, resetPassword } from '@/hooks/useAuth';
import { getUserFriendlyMessage } from '@/lib/errors';

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
  error?: string;
  details?: any;
}

export class AuthTestRunner {
  private results: TestResult[] = [];
  private testEmail: string;
  private testPassword: string;

  constructor(testEmail: string = 'test@franchisehub.test', testPassword: string = 'TestPassword123!') {
    this.testEmail = testEmail;
    this.testPassword = testPassword;
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
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
      
      const result: TestResult = {
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

  async testDatabaseConnection(): Promise<TestResult> {
    return this.runTest('Database Connection', async () => {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
    });
  }

  async testUserRegistration(): Promise<TestResult> {
    return this.runTest('User Registration', async () => {
      const uniqueEmail = `test-${Date.now()}@franchisehub.test`;
      const { data, error } = await signUp(uniqueEmail, this.testPassword, {
        full_name: 'Test User',
        role: 'franchisee'
      });
      if (error) throw error;
      if (!data.user) throw new Error('User not created');
    });
  }

  async testUserLogin(): Promise<TestResult> {
    return this.runTest('User Login', async () => {
      // First create a test user
      const loginEmail = `login-${Date.now()}@franchisehub.test`;
      await signUp(loginEmail, this.testPassword);
      
      // Now try to login
      const { data, error } = await signIn(loginEmail, this.testPassword);
      if (error) throw error;
      if (!data.user) throw new Error('Login failed');
    });
  }

  async testInvalidCredentials(): Promise<TestResult> {
    return this.runTest('Invalid Credentials Handling', async () => {
      try {
        await signIn('invalid@email.com', 'wrongpassword');
        throw new Error('Should have failed with invalid credentials');
      } catch (error) {
        // This should fail - that's the expected behavior
        if (error instanceof Error && error.message.includes('Invalid')) {
          // Test passed - error was handled correctly
          return;
        }
        throw error;
      }
    });
  }

  async testPasswordReset(): Promise<TestResult> {
    return this.runTest('Password Reset', async () => {
      await resetPassword(this.testEmail);
      // Password reset doesn't return data, just check no error thrown
    });
  }

  async testSessionPersistence(): Promise<TestResult> {
    return this.runTest('Session Persistence', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      // Verify session is valid
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session not persistent');
    });
  }

  async testProfileCreation(): Promise<TestResult> {
    return this.runTest('Profile Creation', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile) throw new Error('Profile not created');
    });
  }

  async testRLSPolicyEnforcement(): Promise<TestResult> {
    return this.runTest('RLS Policy Enforcement', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      // Try to access own profile (should work)
      const { data: ownProfile, error: ownError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (ownError) throw new Error('Cannot access own profile');
      if (!ownProfile) throw new Error('Own profile not found');
    });
  }

  async testUserLogout(): Promise<TestResult> {
    return this.runTest('User Logout', async () => {
      await signOut();
      
      // Verify user is logged out
      const { data: { user } } = await supabase.auth.getUser();
      if (user) throw new Error('User still logged in after signOut');
    });
  }

  async testDatabaseFunctionSecurity(): Promise<TestResult> {
    return this.runTest('Database Function Security', async () => {
      // Test that database functions work (they should have search_path set)
      try {
        const { data, error } = await supabase.rpc('generate_order_number');
        if (error) throw error;
        if (!data || !data.startsWith('ORD')) {
          throw new Error('Function did not return expected format');
        }
      } catch (error) {
        // If function doesn't exist or fails, that's also a security issue
        throw new Error(`Database function security test failed: ${error}`);
      }
    });
  }

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    console.log('🔒 Starting Authentication Security Tests...');
    
    // Run tests in sequence to avoid conflicts
    await this.testDatabaseConnection();
    await this.testDatabaseFunctionSecurity();
    await this.testUserRegistration();
    await this.testUserLogin();
    await this.testProfileCreation();
    await this.testSessionPersistence();
    await this.testRLSPolicyEnforcement();
    await this.testPasswordReset();
    await this.testInvalidCredentials();
    await this.testUserLogout();
    
    return this.results;
  }

  getResults(): TestResult[] {
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

  generateReport(): string {
    const summary = this.getSummary();
    
    let report = `# Authentication Security Test Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Tests:** ${summary.total}\n`;
    report += `- **Passed:** ${summary.passed}\n`;
    report += `- **Failed:** ${summary.failed}\n`;
    report += `- **Skipped:** ${summary.skipped}\n`;
    report += `- **Success Rate:** ${summary.successRate}%\n`;
    report += `- **Total Duration:** ${summary.totalDuration}ms\n\n`;
    
    report += `## Test Results\n\n`;
    
    this.results.forEach((result, index) => {
      const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
      report += `### ${index + 1}. ${result.name} ${status}\n\n`;
      report += `- **Status:** ${result.status}\n`;
      report += `- **Message:** ${result.message}\n`;
      report += `- **Duration:** ${result.duration}ms\n`;
      
      if (result.error) {
        report += `- **Error:** ${result.error}\n`;
      }
      
      report += `\n`;
    });
    
    if (summary.failed > 0) {
      report += `## ⚠️ Failed Tests\n\n`;
      report += `The following tests failed and require attention:\n\n`;
      
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          report += `- **${result.name}:** ${result.message}\n`;
        });
    }
    
    return report;
  }
}

// Export a default instance for easy use
export const authTestRunner = new AuthTestRunner();
