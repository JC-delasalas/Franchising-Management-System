/**
 * Integration Test Runner
 * 
 * Comprehensive testing to ensure all fixes work together properly
 */

import { supabase } from '@/lib/supabase';
import SessionManager from '@/utils/sessionManager';
import { ProductsAPI } from '@/api/products';
import { AnalyticsAPI } from '@/api/analytics';
import { authSecurityTestRunner } from '@/utils/authSecurityTestRunner';
import { routeTestRunner } from '@/utils/routeTestRunner';

export interface IntegrationTestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  category: 'authentication' | 'api' | 'routing' | 'dashboard' | 'security';
  details?: any;
}

export class IntegrationTestRunner {
  private results: IntegrationTestResult[] = [];

  private async runTest(
    name: string,
    testFn: () => Promise<void>,
    category: 'authentication' | 'api' | 'routing' | 'dashboard' | 'security'
  ): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: IntegrationTestResult = {
        name,
        status: 'passed',
        message: 'Integration test passed',
        duration,
        category
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: IntegrationTestResult = {
        name,
        status: 'failed',
        message: errorMessage,
        duration,
        category,
        details: error
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testAuthenticationIntegration(): Promise<void> {
    await this.runTest('Authentication Security Fixes Integration', async () => {
      // Test that authentication security fixes are working
      const securityResults = await authSecurityTestRunner.runAllSecurityTests();
      const criticalFailures = securityResults.filter(r => 
        r.securityLevel === 'critical' && r.status === 'failed'
      );
      
      if (criticalFailures.length > 0) {
        throw new Error(`Critical security issues found: ${criticalFailures.length}`);
      }
    }, 'authentication');

    await this.runTest('Session Management Integration', async () => {
      // Test that session management is working properly
      const sessionInfo = await SessionManager.getSessionInfo();
      
      if (sessionInfo.isActive) {
        // If user is authenticated, verify session is valid
        if (!sessionInfo.user || !sessionInfo.expiresAt) {
          throw new Error('Active session missing required data');
        }
        
        // Verify session is not expired
        const expiresAt = new Date(sessionInfo.expiresAt).getTime();
        const now = Date.now();
        
        if (now >= expiresAt) {
          throw new Error('Session reported as active but is expired');
        }
      }
    }, 'authentication');

    await this.runTest('Navigation Security Integration', async () => {
      // Test that navigation components show proper authentication state
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated - verify they have proper profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, role, status')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          throw new Error('Authenticated user missing profile');
        }
        
        if (!profile.role) {
          throw new Error('User profile missing role');
        }
        
        if (profile.status !== 'active') {
          throw new Error('Inactive user has active session');
        }
      }
    }, 'security');
  }

  async testAPIIntegration(): Promise<void> {
    await this.runTest('Enhanced BaseAPI Integration', async () => {
      // Test that all API methods use enhanced BaseAPI
      const categories = await ProductsAPI.getCategories();
      
      if (!Array.isArray(categories)) {
        throw new Error('ProductsAPI.getCategories should return array');
      }
    }, 'api');

    await this.runTest('Products API Build Fix Integration', async () => {
      // Test that products API syntax fixes are working
      const products = await ProductsAPI.getProducts({ active: true });
      
      if (!Array.isArray(products)) {
        throw new Error('ProductsAPI.getProducts should return array');
      }
      
      // Test catalog products with cart integration
      const catalogProducts = await ProductsAPI.getCatalogProducts({ active: true });
      
      if (!Array.isArray(catalogProducts)) {
        throw new Error('ProductsAPI.getCatalogProducts should return array');
      }
      
      // Verify cart integration fields
      catalogProducts.forEach(product => {
        if (typeof product.in_cart !== 'boolean') {
          throw new Error('Product missing in_cart field');
        }
        if (typeof product.cart_quantity !== 'number') {
          throw new Error('Product missing cart_quantity field');
        }
      });
    }, 'api');

    await this.runTest('Analytics API Schema Fix Integration', async () => {
      // Test that analytics API schema fixes are working
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'franchisor') {
          const analytics = await AnalyticsAPI.getFranchisorAnalytics();
          
          if (!analytics.overview || !analytics.performance || !analytics.financial) {
            throw new Error('Franchisor analytics missing required sections');
          }
        } else if (profile?.role === 'franchisee') {
          // Test franchisee analytics if user has location
          const { data: locations } = await supabase
            .from('franchise_locations')
            .select('id')
            .eq('franchisee_id', session.user.id)
            .limit(1);
          
          if (locations && locations.length > 0) {
            const analytics = await AnalyticsAPI.getFranchiseeAnalytics(locations[0].id);
            
            if (!analytics.sales || !analytics.orders || !analytics.inventory) {
              throw new Error('Franchisee analytics missing required sections');
            }
          }
        }
      }
    }, 'api');
  }

  async testRoutingIntegration(): Promise<void> {
    await this.runTest('Route Component Loading Integration', async () => {
      // Test that all routes can be loaded
      const routeResults = await routeTestRunner.runAllRouteTests();
      const failedRoutes = routeResults.filter(r => r.status === 'error');
      
      if (failedRoutes.length > 0) {
        throw new Error(`${failedRoutes.length} routes failed to load`);
      }
    }, 'routing');

    await this.runTest('Protected Route Security Integration', async () => {
      // Test that protected routes require authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, verify that protected data cannot be accessed
        const { data: protectedData, error } = await supabase
          .from('orders')
          .select('*')
          .limit(1);
        
        if (protectedData && protectedData.length > 0) {
          throw new Error('Unauthenticated user can access protected data');
        }
        
        if (!error || !error.message.includes('JWT')) {
          throw new Error('Protected data should require authentication');
        }
      }
    }, 'security');
  }

  async testDashboardIntegration(): Promise<void> {
    await this.runTest('Dashboard Widget Data Loading Integration', async () => {
      // Test that dashboard widgets can load data
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'franchisor') {
          const metrics = await AnalyticsAPI.getFranchisorMetrics(session.user.id);

          if (!metrics || typeof metrics !== 'object') {
            throw new Error('Franchisor metrics should return object');
          }

          // Verify metrics have required structure
          if (!metrics.overview || !metrics.performance || !metrics.financial) {
            throw new Error('Franchisor metrics missing required sections');
          }
        } else if (profile?.role === 'franchisee') {
          // Test with user's primary location
          const { data: locations } = await supabase
            .from('franchise_locations')
            .select('id')
            .eq('franchisee_id', session.user.id)
            .limit(1);

          if (locations && locations.length > 0) {
            const metrics = await AnalyticsAPI.getFranchiseeMetrics(locations[0].id);

            if (!metrics || typeof metrics !== 'object') {
              throw new Error('Franchisee metrics should return object');
            }

            // Verify metrics have required structure
            if (!metrics.sales || !metrics.orders || !metrics.inventory || !metrics.performance) {
              throw new Error('Franchisee metrics missing required sections');
            }
          }
        }
      }
    }, 'dashboard');

    await this.runTest('KPI Cards Access Control Integration', async () => {
      // Test that KPI cards respect access control
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'franchisee') {
          const { data: locations } = await supabase
            .from('franchise_locations')
            .select('id')
            .eq('franchisee_id', session.user.id)
            .limit(1);

          if (locations && locations.length > 0) {
            const kpiMetrics = await AnalyticsAPI.getKPIMetrics(locations[0].id);

            if (!kpiMetrics || typeof kpiMetrics !== 'object') {
              throw new Error('KPI metrics should return object');
            }

            // Verify KPI metrics have required fields
            const requiredFields = ['todaySales', 'weekSales', 'monthSales', 'salesChange', 'orderCount', 'avgOrderValue', 'inventoryValue', 'lowStockItems'];
            for (const field of requiredFields) {
              if (typeof kpiMetrics[field] !== 'number') {
                throw new Error(`KPI metrics missing required field: ${field}`);
              }
            }
          }
        }
      }
    }, 'dashboard');

    await this.runTest('Real Data vs Mock Data Validation', async () => {
      // Test that dashboard is using real data instead of mock data
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'franchisee') {
          const { data: locations } = await supabase
            .from('franchise_locations')
            .select('id')
            .eq('franchisee_id', session.user.id)
            .limit(1);

          if (locations && locations.length > 0) {
            const analytics = await AnalyticsAPI.getFranchiseeAnalytics(locations[0].id);

            // Check that insights are generated from real data
            if (analytics.insights && analytics.insights.length > 0) {
              const hasGenericInsight = analytics.insights.some(insight =>
                insight.includes('All systems operating normally')
              );

              // If we only have generic insights, we might be using fallback data
              if (analytics.insights.length === 1 && hasGenericInsight) {
                console.warn('Dashboard may be using fallback data - no specific insights generated');
              }
            }
          }
        }
      }
    }, 'dashboard');
  }

  async testSystemHealthIntegration(): Promise<void> {
    await this.runTest('Database Connection Health', async () => {
      // Test that database connection is working
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }, 'api');

    await this.runTest('Error Boundary Integration', async () => {
      // Test that error boundaries are properly integrated
      try {
        // Simulate an API error to test error handling
        await ProductsAPI.getProductById('non-existent-id-12345');
      } catch (error: any) {
        // Should handle the error gracefully with proper error codes
        if (!error.code || !error.message) {
          throw new Error('API errors should have proper error codes and messages');
        }
      }
    }, 'api');

    await this.runTest('Performance Monitoring Integration', async () => {
      // Test that API calls complete within reasonable time
      const startTime = Date.now();
      await ProductsAPI.getCategories();
      const duration = Date.now() - startTime;

      if (duration > 5000) { // 5 seconds
        throw new Error(`API call took too long: ${duration}ms`);
      }
    }, 'api');
  }

  async runAllIntegrationTests(): Promise<IntegrationTestResult[]> {
    this.results = [];

    console.log('🔄 Starting Comprehensive Integration Tests...');

    // Run all integration test categories
    await this.testAuthenticationIntegration();
    await this.testAPIIntegration();
    await this.testRoutingIntegration();
    await this.testDashboardIntegration();
    await this.testSystemHealthIntegration();

    console.log(`✅ Integration Tests Complete: ${this.results.length} tests run`);

    return this.results;
  }

  getResults(): IntegrationTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    const criticalFailures = this.results.filter(r => 
      r.status === 'failed' && (r.category === 'authentication' || r.category === 'security')
    ).length;
    
    return {
      total,
      passed,
      failed,
      warnings,
      criticalFailures,
      successRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      allTestsPassed: failed === 0,
      isProductionReady: failed === 0 && criticalFailures === 0,
    };
  }
}

// Export a default instance for easy use
export const integrationTestRunner = new IntegrationTestRunner();
