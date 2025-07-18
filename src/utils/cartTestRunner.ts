import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';

export interface CartTestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export class CartTestRunner {
  private results: CartTestResult[] = [];

  async runAllTests(): Promise<CartTestResult[]> {
    this.results = [];
    
    console.log('🛒 Starting Cart Functionality Tests...');
    
    await this.testAuthentication();
    await this.testCartSummary();
    await this.testCartItemCount();
    await this.testCartValidation();
    
    console.log('✅ Cart tests completed');
    return this.results;
  }

  private async testAuthentication(): Promise<void> {
    try {
      const { data: user, error } = await supabase.auth.getUser();
      
      if (error) {
        this.addResult('Authentication Check', false, `Auth error: ${error.message}`);
        return;
      }
      
      if (!user.user) {
        this.addResult('Authentication Check', false, 'No authenticated user found');
        return;
      }
      
      this.addResult('Authentication Check', true, undefined, {
        userId: user.user.id,
        email: user.user.email
      });
    } catch (error: any) {
      this.addResult('Authentication Check', false, error.message);
    }
  }

  private async testCartSummary(): Promise<void> {
    try {
      const summary = await CartAPI.getCartSummary();
      
      // Check if summary has required properties
      const hasRequiredProps = 
        typeof summary.itemCount === 'number' &&
        typeof summary.subtotal === 'number' &&
        typeof summary.taxAmount === 'number' &&
        typeof summary.shippingCost === 'number' &&
        typeof summary.total === 'number' &&
        Array.isArray(summary.items);
      
      if (!hasRequiredProps) {
        this.addResult('Cart Summary', false, 'Missing required properties in cart summary');
        return;
      }
      
      this.addResult('Cart Summary', true, undefined, {
        itemCount: summary.itemCount,
        subtotal: summary.subtotal,
        total: summary.total,
        itemsLength: summary.items.length
      });
    } catch (error: any) {
      this.addResult('Cart Summary', false, error.message);
    }
  }

  private async testCartItemCount(): Promise<void> {
    try {
      const count = await CartAPI.getCartItemCount();
      
      if (typeof count !== 'number') {
        this.addResult('Cart Item Count', false, 'Cart count is not a number');
        return;
      }
      
      this.addResult('Cart Item Count', true, undefined, { count });
    } catch (error: any) {
      this.addResult('Cart Item Count', false, error.message);
    }
  }

  private async testCartValidation(): Promise<void> {
    try {
      const validation = await CartAPI.validateCart();
      
      const hasRequiredProps = 
        typeof validation.isValid === 'boolean' &&
        Array.isArray(validation.errors) &&
        Array.isArray(validation.warnings);
      
      if (!hasRequiredProps) {
        this.addResult('Cart Validation', false, 'Missing required properties in validation result');
        return;
      }
      
      this.addResult('Cart Validation', true, undefined, {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      });
    } catch (error: any) {
      this.addResult('Cart Validation', false, error.message);
    }
  }

  private addResult(testName: string, passed: boolean, error?: string, details?: any): void {
    this.results.push({
      testName,
      passed,
      error,
      details
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}${error ? `: ${error}` : ''}`);
    if (details) {
      console.log('   Details:', details);
    }
  }

  getResults(): CartTestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    return { total, passed, failed };
  }
}

// Export singleton instance
export const cartTestRunner = new CartTestRunner();
