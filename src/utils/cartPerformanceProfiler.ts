/**
 * Cart Performance Profiler
 * Measures and identifies cart loading bottlenecks
 */

import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  data?: any;
}

export class CartPerformanceProfiler {
  private metrics: PerformanceMetric[] = [];

  async profileCartLoading(): Promise<{
    totalTime: number;
    bottlenecks: PerformanceMetric[];
    recommendations: string[];
    metrics: PerformanceMetric[];
  }> {
    console.log('🔍 Starting cart performance profiling...');
    this.metrics = [];

    const overallStart = performance.now();

    // 1. Test Authentication Performance
    await this.measureOperation('Authentication Check', async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { authenticated: !!user.user, userId: user.user?.id };
    });

    // 2. Test Raw Database Query Performance
    await this.measureOperation('Raw Database Query', async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return { itemCount: data?.length || 0 };
    });

    // 3. Test Database Query with Product Join
    await this.measureOperation('Database Query with Product Join', async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
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
        .eq('user_id', user.user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return { itemsWithProducts: data?.length || 0 };
    });

    // 4. Test CartAPI.getCartItems Performance
    await this.measureOperation('CartAPI.getCartItems', async () => {
      const items = await CartAPI.getCartItems();
      return { itemCount: items.length };
    });

    // 5. Test CartAPI.getCartSummary Performance
    await this.measureOperation('CartAPI.getCartSummary', async () => {
      const summary = await CartAPI.getCartSummary();
      return { 
        itemCount: summary.itemCount,
        total: summary.total 
      };
    });

    // 6. Test React Query Cache Performance
    await this.measureOperation('React Query Cache Check', async () => {
      // Simulate what React Query does
      const cacheKey = ['cart', 'summary'];
      return { cacheKey: cacheKey.join('-') };
    });

    const overallEnd = performance.now();
    const totalTime = overallEnd - overallStart;

    // Identify bottlenecks (operations taking > 1 second)
    const bottlenecks = this.metrics.filter(m => m.duration > 1000);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    console.log('📊 Cart performance profiling complete:', {
      totalTime: `${totalTime.toFixed(2)}ms`,
      bottlenecks: bottlenecks.length,
      recommendations: recommendations.length
    });

    return {
      totalTime,
      bottlenecks,
      recommendations,
      metrics: this.metrics
    };
  }

  private async measureOperation(name: string, operation: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      this.metrics.push({
        operation: name,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        data: result
      });

      console.log(`✅ ${name}: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error: any) {
      const endTime = performance.now();
      
      this.metrics.push({
        operation: name,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error.message
      });

      console.error(`❌ ${name}: ${error.message} (${(endTime - startTime).toFixed(2)}ms)`);
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check authentication performance
    const authMetric = this.metrics.find(m => m.operation === 'Authentication Check');
    if (authMetric && authMetric.duration > 500) {
      recommendations.push('Authentication is slow - consider implementing auth caching');
    }

    // Check database query performance
    const dbMetric = this.metrics.find(m => m.operation === 'Raw Database Query');
    if (dbMetric && dbMetric.duration > 1000) {
      recommendations.push('Database queries are slow - check indexes and RLS policies');
    }

    // Check join performance
    const joinMetric = this.metrics.find(m => m.operation === 'Database Query with Product Join');
    if (joinMetric && dbMetric && joinMetric.duration > (dbMetric.duration * 2)) {
      recommendations.push('Product join is expensive - consider denormalizing or caching product data');
    }

    // Check API layer performance
    const apiMetric = this.metrics.find(m => m.operation === 'CartAPI.getCartItems');
    const summaryMetric = this.metrics.find(m => m.operation === 'CartAPI.getCartSummary');
    if (apiMetric && summaryMetric && (summaryMetric.duration > apiMetric.duration * 1.5)) {
      recommendations.push('Cart summary calculation is slow - optimize calculation logic');
    }

    // Check for failed operations
    const failedOps = this.metrics.filter(m => !m.success);
    if (failedOps.length > 0) {
      recommendations.push(`${failedOps.length} operations failed - check error handling and authentication`);
    }

    return recommendations;
  }

  generateReport(): string {
    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const successRate = (this.metrics.filter(m => m.success).length / this.metrics.length) * 100;
    
    let report = `
Cart Performance Report:
========================
Total Time: ${totalTime.toFixed(2)}ms
Success Rate: ${successRate.toFixed(1)}%
Target: <3000ms (${totalTime < 3000 ? 'PASS' : 'FAIL'})

Operation Breakdown:
`;

    this.metrics.forEach(metric => {
      const status = metric.success ? '✅' : '❌';
      const time = metric.duration.toFixed(2);
      report += `${status} ${metric.operation}: ${time}ms\n`;
      if (!metric.success && metric.error) {
        report += `   Error: ${metric.error}\n`;
      }
    });

    const bottlenecks = this.metrics.filter(m => m.duration > 1000);
    if (bottlenecks.length > 0) {
      report += `\nBottlenecks (>1000ms):\n`;
      bottlenecks.forEach(b => {
        report += `⚠️  ${b.operation}: ${b.duration.toFixed(2)}ms\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const cartPerformanceProfiler = new CartPerformanceProfiler();
