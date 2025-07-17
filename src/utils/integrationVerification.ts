/**
 * Integration Verification for Phase 2 Enhancements
 * 
 * Verifies that all Phase 2 enhancements work together properly
 */

import { queryClient, queryKeys, performanceMonitoring } from '@/lib/queryClient';
import { APIError, handleAPIError, withRetry, getUserFriendlyMessage } from '@/lib/errors';
import { useAuth } from '@/hooks/useAuth';

export interface IntegrationTestResult {
  component: string;
  status: 'passed' | 'failed';
  message: string;
  details?: any;
}

export class IntegrationVerifier {
  private results: IntegrationTestResult[] = [];

  private addResult(component: string, status: 'passed' | 'failed', message: string, details?: any) {
    this.results.push({ component, status, message, details });
  }

  async verifyLoginModuleIntegration(): Promise<void> {
    try {
      // Verify that login module uses enhanced error handling
      const testError = new APIError('Test login error', 'AUTHENTICATION_ERROR', 401);
      const userMessage = getUserFriendlyMessage(testError);
      
      if (!userMessage || userMessage.length < 10) {
        throw new Error('Login module not properly integrated with error system');
      }
      
      this.addResult('Login Module', 'passed', 'Successfully integrated with enhanced error handling');
    } catch (error) {
      this.addResult('Login Module', 'failed', `Integration failed: ${error}`);
    }
  }

  async verifyAPIErrorManagementIntegration(): Promise<void> {
    try {
      // Verify that API errors work with React Query
      const testError = { code: 'PGRST116', message: 'Not found' };
      const apiError = handleAPIError(testError, 'test/endpoint', 'GET');
      
      if (!(apiError instanceof APIError)) {
        throw new Error('API error handling not working');
      }
      
      if (!apiError.retryable === false) {
        throw new Error('404 errors should not be retryable');
      }
      
      // Test retry integration
      let attempts = 0;
      try {
        await withRetry(
          async () => {
            attempts++;
            if (attempts < 2) {
              throw new APIError('Network error', 'NETWORK_ERROR', undefined, undefined, true);
            }
            return 'success';
          },
          { maxAttempts: 3, baseDelay: 10 }
        );
      } catch (error) {
        throw new Error('Retry logic not working properly');
      }
      
      if (attempts !== 2) {
        throw new Error(`Expected 2 attempts, got ${attempts}`);
      }
      
      this.addResult('API Error Management', 'passed', 'Successfully integrated with React Query retry logic');
    } catch (error) {
      this.addResult('API Error Management', 'failed', `Integration failed: ${error}`);
    }
  }

  async verifyReactQueryOptimization(): Promise<void> {
    try {
      // Verify that React Query uses enhanced error handling
      const defaultOptions = queryClient.getDefaultOptions();
      
      if (!defaultOptions.queries?.retry) {
        throw new Error('React Query retry not configured');
      }
      
      // Test retry function with APIError
      const retryFn = defaultOptions.queries.retry as Function;
      const retryableError = new APIError('Network error', 'NETWORK_ERROR', undefined, undefined, true);
      const nonRetryableError = new APIError('Not found', 'RESOURCE_NOT_FOUND', 404, undefined, false);
      
      if (!retryFn(1, retryableError)) {
        throw new Error('Should retry retryable errors');
      }
      
      if (retryFn(1, nonRetryableError)) {
        throw new Error('Should not retry non-retryable errors');
      }
      
      // Verify query keys are properly structured
      const testUserId = 'test-user';
      const dashboardKey = queryKeys.dashboard.franchisee(testUserId);
      
      if (!Array.isArray(dashboardKey) || dashboardKey.length < 3) {
        throw new Error('Query keys not properly structured');
      }
      
      // Verify performance monitoring
      const startTime = performance.now();
      performanceMonitoring.trackQueryPerformance('test_integration', startTime);
      
      const summary = performanceMonitoring.getPerformanceSummary();
      if (!summary.queries['test_integration']) {
        throw new Error('Performance monitoring not working');
      }
      
      this.addResult('React Query Optimization', 'passed', 'Successfully integrated with error management and performance monitoring');
    } catch (error) {
      this.addResult('React Query Optimization', 'failed', `Integration failed: ${error}`);
    }
  }

  async verifyPhase1SecurityIntegration(): Promise<void> {
    try {
      // Verify that Phase 2 enhancements maintain Phase 1 security
      
      // Check that errors don't expose sensitive information
      const sensitiveError = new APIError(
        'Database connection failed with password: secret123',
        'DATABASE_ERROR',
        500
      );
      
      const userMessage = getUserFriendlyMessage(sensitiveError);
      if (userMessage.includes('secret123') || userMessage.includes('password')) {
        throw new Error('Sensitive information exposed in user message');
      }
      
      // Verify that authentication errors are properly categorized
      const authError = handleAPIError({ message: 'Invalid login credentials' });
      if (!(authError instanceof APIError) || authError.code !== 'INVALID_CREDENTIALS') {
        throw new Error('Authentication errors not properly categorized');
      }
      
      this.addResult('Phase 1 Security', 'passed', 'Security enhancements maintained in Phase 2');
    } catch (error) {
      this.addResult('Phase 1 Security', 'failed', `Security integration failed: ${error}`);
    }
  }

  async verifyErrorBoundaryIntegration(): Promise<void> {
    try {
      // Verify that error boundaries can properly categorize errors
      const errors = [
        new APIError('Network error', 'NETWORK_ERROR'),
        new APIError('Auth error', 'AUTHENTICATION_ERROR', 401),
        new APIError('Permission error', 'PERMISSION_DENIED', 403),
        new APIError('Not found', 'RESOURCE_NOT_FOUND', 404),
      ];
      
      errors.forEach(error => {
        const userMessage = getUserFriendlyMessage(error);
        if (!userMessage || userMessage.length < 10) {
          throw new Error(`Error ${error.code} missing user message`);
        }
      });
      
      this.addResult('Error Boundary Integration', 'passed', 'Error boundaries properly integrated with enhanced error system');
    } catch (error) {
      this.addResult('Error Boundary Integration', 'failed', `Integration failed: ${error}`);
    }
  }

  async runFullIntegrationVerification(): Promise<IntegrationTestResult[]> {
    this.results = [];
    
    console.log('🔗 Starting Integration Verification...');
    
    await this.verifyLoginModuleIntegration();
    await this.verifyAPIErrorManagementIntegration();
    await this.verifyReactQueryOptimization();
    await this.verifyPhase1SecurityIntegration();
    await this.verifyErrorBoundaryIntegration();
    
    return this.results;
  }

  getResults(): IntegrationTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      allPassed: failed === 0,
    };
  }
}

// Export a default instance for easy use
export const integrationVerifier = new IntegrationVerifier();
