/**
 * Cart End-to-End Test Runner
 * Comprehensive testing utility for cart functionality
 */

import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';

interface TestResult {
  step: string;
  success: boolean;
  timing: number;
  error?: string;
  data?: any;
}

export class CartEndToEndTest {
  private results: TestResult[] = [];

  async runCompleteCartTest(): Promise<TestResult[]> {
    this.results = [];
    console.log('🚀 Starting comprehensive cart end-to-end test...');

    // Test 1: Authentication State
    await this.testStep('Verify Authentication State', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) throw new Error('User not authenticated');
      
      return { 
        authenticated: true,
        userId: user.id,
        email: user.email 
      };
    });

    // Test 2: Cart Loading Performance
    await this.testStep('Cart Summary Loading Performance', async () => {
      const startTime = performance.now();
      const cartSummary = await CartAPI.getCartSummary();
      const endTime = performance.now();
      
      const timing = endTime - startTime;
      
      return {
        loadTime: `${timing.toFixed(2)}ms`,
        withinTarget: timing < 3000, // Should be under 3 seconds
        itemCount: cartSummary.itemCount,
        total: cartSummary.total
      };
    });

    // Test 3: Cart Count Consistency
    await this.testStep('Cart Count Consistency Check', async () => {
      const [cartSummary, cartCount] = await Promise.all([
        CartAPI.getCartSummary(),
        CartAPI.getCartItemCount()
      ]);
      
      const consistent = cartSummary.itemCount === cartCount;
      
      return {
        summaryCount: cartSummary.itemCount,
        directCount: cartCount,
        consistent,
        message: consistent ? 'Counts match' : 'Count mismatch detected'
      };
    });

    // Test 4: Database Query Performance
    await this.testStep('Database Query Performance', async () => {
      const startTime = performance.now();
      const items = await CartAPI.getCartItems();
      const endTime = performance.now();
      
      const timing = endTime - startTime;
      
      return {
        queryTime: `${timing.toFixed(2)}ms`,
        withinTarget: timing < 2000, // Should be under 2 seconds
        itemsReturned: items.length,
        hasProductData: items.length > 0 ? !!items[0].products : true
      };
    });

    // Test 5: Cart Operations (if items exist)
    const cartSummary = await CartAPI.getCartSummary();
    if (cartSummary.items.length > 0) {
      await this.testStep('Cart Update Operations', async () => {
        const firstItem = cartSummary.items[0];
        const originalQuantity = firstItem.quantity;
        
        // Test quantity update
        const updateStartTime = performance.now();
        await CartAPI.updateCartItemQuantity(firstItem.id, originalQuantity + 1);
        const updateEndTime = performance.now();
        
        // Verify update
        const updatedSummary = await CartAPI.getCartSummary();
        const updatedItem = updatedSummary.items.find(item => item.id === firstItem.id);
        
        // Restore original quantity
        await CartAPI.updateCartItemQuantity(firstItem.id, originalQuantity);
        
        return {
          updateTime: `${(updateEndTime - updateStartTime).toFixed(2)}ms`,
          updateSuccessful: updatedItem?.quantity === originalQuantity + 1,
          originalQuantity,
          updatedQuantity: updatedItem?.quantity
        };
      });
    }

    // Test 6: Cart Validation
    await this.testStep('Cart Validation', async () => {
      const validation = await CartAPI.validateCart();
      
      return {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings
      };
    });

    // Test 7: Multiple Concurrent Requests
    await this.testStep('Concurrent Request Handling', async () => {
      const startTime = performance.now();
      
      const promises = [
        CartAPI.getCartSummary(),
        CartAPI.getCartItemCount(),
        CartAPI.validateCart()
      ];
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      return {
        concurrentTime: `${(endTime - startTime).toFixed(2)}ms`,
        allSuccessful: results.every(result => result !== null),
        summaryItems: results[0].itemCount,
        directCount: results[1],
        validationPassed: results[2].isValid
      };
    });

    return this.results;
  }

  private async testStep(stepName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const endTime = performance.now();
      
      this.results.push({
        step: stepName,
        success: true,
        timing: endTime - startTime,
        data: result
      });
      
      console.log(`✅ ${stepName}: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error: any) {
      const endTime = performance.now();
      
      this.results.push({
        step: stepName,
        success: false,
        timing: endTime - startTime,
        error: error.message || 'Unknown error'
      });
      
      console.error(`❌ ${stepName}: ${error.message} (${(endTime - startTime).toFixed(2)}ms)`);
    }
  }

  // Quick performance benchmark
  async benchmarkCartPerformance(iterations: number = 5): Promise<{
    averageLoadTime: number;
    minLoadTime: number;
    maxLoadTime: number;
    successRate: number;
  }> {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await CartAPI.getCartSummary();
        const endTime = performance.now();
        times.push(endTime - startTime);
        successes++;
      } catch (error) {
        console.error(`Benchmark iteration ${i + 1} failed:`, error);
      }
    }

    return {
      averageLoadTime: times.reduce((a, b) => a + b, 0) / times.length,
      minLoadTime: Math.min(...times),
      maxLoadTime: Math.max(...times),
      successRate: (successes / iterations) * 100
    };
  }

  // Generate performance report
  generatePerformanceReport(): string {
    const passedTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const averageTime = this.results.reduce((sum, r) => sum + r.timing, 0) / totalTests;
    
    return `
Cart Performance Report:
- Tests Passed: ${passedTests}/${totalTests} (${((passedTests/totalTests) * 100).toFixed(1)}%)
- Average Response Time: ${averageTime.toFixed(2)}ms
- Critical Issues: ${this.results.filter(r => !r.success && r.timing > 3000).length}
- Performance Issues: ${this.results.filter(r => r.success && r.timing > 2000).length}
    `.trim();
  }
}

// Export singleton instance
export const cartEndToEndTest = new CartEndToEndTest();
