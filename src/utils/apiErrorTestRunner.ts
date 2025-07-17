/**
 * API Error Management Test Runner
 * 
 * Comprehensive testing for API error handling and retry logic
 */

import { supabase } from '@/lib/supabase';
import { APIError, handleAPIError, withRetry, shouldRetry, calculateRetryDelay } from '@/lib/errors';
import { BaseAPI } from '@/api/base';
import { ProductsAPI } from '@/api/products';

export interface APIErrorTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
  error?: string;
  details?: any;
}

export class APIErrorTestRunner {
  private results: APIErrorTestResult[] = [];

  private async runTest(name: string, testFn: () => Promise<void>): Promise<APIErrorTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: APIErrorTestResult = {
        name,
        status: 'passed',
        message: 'Test passed successfully',
        duration
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: APIErrorTestResult = {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        error: errorMessage
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testErrorClassification(): Promise<APIErrorTestResult> {
    return this.runTest('Error Classification', async () => {
      // Test Supabase error classification
      const supabaseError = { code: 'PGRST116', message: 'Not found' };
      const apiError = handleAPIError(supabaseError, 'test/endpoint', 'GET');
      
      if (!(apiError instanceof APIError)) {
        throw new Error('Expected APIError instance');
      }
      
      if (apiError.code !== 'RESOURCE_NOT_FOUND') {
        throw new Error(`Expected RESOURCE_NOT_FOUND, got ${apiError.code}`);
      }
      
      if (apiError.statusCode !== 404) {
        throw new Error(`Expected status 404, got ${apiError.statusCode}`);
      }
      
      if (apiError.retryable !== false) {
        throw new Error('404 errors should not be retryable');
      }
    });
  }

  async testRetryLogic(): Promise<APIErrorTestResult> {
    return this.runTest('Retry Logic', async () => {
      // Test retry decision logic
      const retryableError = new APIError('Network error', 'NETWORK_ERROR', undefined, undefined, true);
      const nonRetryableError = new APIError('Not found', 'RESOURCE_NOT_FOUND', 404, undefined, false);
      
      if (!shouldRetry(retryableError, 1)) {
        throw new Error('Network errors should be retryable');
      }
      
      if (shouldRetry(nonRetryableError, 1)) {
        throw new Error('404 errors should not be retryable');
      }
      
      if (shouldRetry(retryableError, 5)) {
        throw new Error('Should not retry after max attempts');
      }
      
      // Test delay calculation
      const delay1 = calculateRetryDelay(1);
      const delay2 = calculateRetryDelay(2);
      
      if (delay2 <= delay1) {
        throw new Error('Retry delay should increase with attempt number');
      }
    });
  }

  async testWithRetryFunction(): Promise<APIErrorTestResult> {
    return this.runTest('WithRetry Function', async () => {
      let attemptCount = 0;
      
      // Test successful retry
      const result = await withRetry(
        async () => {
          attemptCount++;
          if (attemptCount < 2) {
            throw new APIError('Temporary error', 'NETWORK_ERROR', undefined, undefined, true);
          }
          return 'success';
        },
        { maxAttempts: 3, baseDelay: 10 }
      );
      
      if (result !== 'success') {
        throw new Error('Expected successful result after retry');
      }
      
      if (attemptCount !== 2) {
        throw new Error(`Expected 2 attempts, got ${attemptCount}`);
      }
    });
  }

  async testBaseAPIErrorHandling(): Promise<APIErrorTestResult> {
    return this.runTest('BaseAPI Error Handling', async () => {
      try {
        // This should fail with proper error handling
        await (BaseAPI as any).readSingle('nonexistent_table', { id: 'test' });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!(error instanceof APIError)) {
          throw new Error('Expected APIError from BaseAPI');
        }
        
        if (!error.userMessage) {
          throw new Error('APIError should have user-friendly message');
        }
        
        if (!error.endpoint) {
          throw new Error('APIError should include endpoint information');
        }
      }
    });
  }

  async testProductsAPIErrorHandling(): Promise<APIErrorTestResult> {
    return this.runTest('ProductsAPI Error Handling', async () => {
      try {
        // Test getting non-existent product
        const product = await ProductsAPI.getProductById('nonexistent-id');
        
        if (product !== null) {
          throw new Error('Expected null for non-existent product');
        }
      } catch (error) {
        // Should not throw for not found, should return null
        throw new Error(`Unexpected error: ${error}`);
      }
    });
  }

  async testUserFriendlyMessages(): Promise<APIErrorTestResult> {
    return this.runTest('User-Friendly Messages', async () => {
      const testCases = [
        { code: 'NETWORK_ERROR', expectedMessage: 'Network connection error' },
        { code: 'PERMISSION_DENIED', expectedMessage: 'You do not have permission' },
        { code: 'RESOURCE_NOT_FOUND', expectedMessage: 'The requested item could not be found' },
        { statusCode: 429, expectedMessage: 'Too many requests' },
        { statusCode: 500, expectedMessage: 'A server error occurred' }
      ];
      
      for (const testCase of testCases) {
        const error = new APIError(
          'Technical message',
          testCase.code || 'HTTP_ERROR',
          testCase.statusCode
        );
        
        if (!error.userMessage.includes(testCase.expectedMessage)) {
          throw new Error(`Expected message containing "${testCase.expectedMessage}", got "${error.userMessage}"`);
        }
      }
    });
  }

  async testErrorLogging(): Promise<APIErrorTestResult> {
    return this.runTest('Error Logging', async () => {
      const originalConsoleError = console.error;
      let loggedError: any = null;
      
      // Mock console.error to capture logs
      console.error = (message: string, error: any) => {
        if (message === 'Error logged:') {
          loggedError = error;
        }
      };
      
      try {
        const error = new APIError('Test error', 'TEST_ERROR', 500);
        const { logError } = await import('@/lib/errors');
        
        logError(error, { context: 'test', endpoint: 'test/endpoint' });
        
        if (!loggedError) {
          throw new Error('Error was not logged');
        }
        
        if (loggedError.name !== 'APIError') {
          throw new Error('Logged error missing name');
        }
        
        if (!loggedError.context?.endpoint) {
          throw new Error('Logged error missing context');
        }
        
      } finally {
        console.error = originalConsoleError;
      }
    });
  }

  async testConcurrentRequests(): Promise<APIErrorTestResult> {
    return this.runTest('Concurrent Request Handling', async () => {
      // Test that multiple concurrent requests handle errors independently
      const promises = Array.from({ length: 5 }, (_, i) => 
        ProductsAPI.getProductById(`test-${i}`)
      );
      
      const results = await Promise.allSettled(promises);
      
      // All should resolve to null (not found) without throwing
      for (const result of results) {
        if (result.status === 'rejected') {
          throw new Error(`Concurrent request failed: ${result.reason}`);
        }
        
        if (result.value !== null) {
          throw new Error('Expected null for non-existent products');
        }
      }
    });
  }

  async testErrorRecovery(): Promise<APIErrorTestResult> {
    return this.runTest('Error Recovery', async () => {
      let failCount = 0;
      
      // Test that system can recover from temporary errors
      const result = await withRetry(
        async () => {
          failCount++;
          if (failCount <= 2) {
            // Simulate temporary network error
            throw new Error('Network temporarily unavailable');
          }
          return { success: true, attempts: failCount };
        },
        { maxAttempts: 5, baseDelay: 10 },
        { endpoint: 'test/recovery', method: 'GET' }
      );
      
      if (!result.success) {
        throw new Error('Expected successful recovery');
      }
      
      if (result.attempts !== 3) {
        throw new Error(`Expected 3 attempts, got ${result.attempts}`);
      }
    });
  }

  async runAllAPIErrorTests(): Promise<APIErrorTestResult[]> {
    this.results = [];
    
    console.log('🔧 Starting API Error Management Tests...');
    
    // Run tests in sequence to avoid conflicts
    await this.testErrorClassification();
    await this.testRetryLogic();
    await this.testWithRetryFunction();
    await this.testBaseAPIErrorHandling();
    await this.testProductsAPIErrorHandling();
    await this.testUserFriendlyMessages();
    await this.testErrorLogging();
    await this.testConcurrentRequests();
    await this.testErrorRecovery();
    
    return this.results;
  }

  getResults(): APIErrorTestResult[] {
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
export const apiErrorTestRunner = new APIErrorTestRunner();
