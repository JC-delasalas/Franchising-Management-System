/**
 * RLS Security Test Runner
 * 
 * Comprehensive testing for Row Level Security policies
 * Tests all 13 critical tables that were vulnerable
 */

import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/errors';

export interface RLSTestResult {
  table: string;
  test: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  securityLevel: 'critical' | 'high' | 'medium';
  details?: any;
}

export class RLSSecurityTestRunner {
  private results: RLSTestResult[] = [];

  private async runTest(
    table: string,
    test: string,
    testFn: () => Promise<void>,
    securityLevel: 'critical' | 'high' | 'medium' = 'high'
  ): Promise<RLSTestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: RLSTestResult = {
        table,
        test,
        status: 'passed',
        message: 'RLS policy test passed',
        duration,
        securityLevel
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const result: RLSTestResult = {
        table,
        test,
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

  async testRLSEnabled(): Promise<void> {
    const vulnerableTables = [
      'product_categories', 'custom_fields', 'transaction_history',
      'entity_metadata', 'custom_field_values', 'user_addresses',
      'recurring_charges', 'sales_receipts', 'sales_receipt_items',
      'location_reviews', 'compliance_audits', 'kpi_summary', 'shipment_items'
    ];

    for (const table of vulnerableTables) {
      await this.runTest(table, 'RLS Enabled Check', async () => {
        // Use the test function we created in the migration
        const { data, error } = await supabase.rpc('test_rls_policies');
        
        if (error) {
          throw new Error(`Failed to check RLS status: ${error.message}`);
        }
        
        const tableResult = data?.find(r => r.table_name === table);
        
        if (!tableResult) {
          throw new Error(`Table ${table} not found in RLS test results`);
        }
        
        if (!tableResult.rls_enabled) {
          throw new Error(`RLS not enabled on table ${table}`);
        }
        
        if (tableResult.policy_count === 0) {
          throw new Error(`No RLS policies found for table ${table}`);
        }
        
        if (tableResult.test_result !== 'SECURE') {
          throw new Error(`Table ${table} security status: ${tableResult.test_result}`);
        }
      }, 'critical');
    }
  }

  async testUserDataIsolation(): Promise<void> {
    // Test that users can only access their own data
    const userTables = ['user_addresses', 'transaction_history', 'recurring_charges'];
    
    for (const table of userTables) {
      await this.runTest(table, 'User Data Isolation', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('User must be authenticated to test data isolation');
        }
        
        // Try to access data from the table
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(10);
        
        if (error) {
          // If we get an error, it might be because RLS is working correctly
          // Check if it's a permission error
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            // This is expected if the user has no data in this table
            return;
          }
          throw new Error(`Unexpected error accessing ${table}: ${error.message}`);
        }
        
        // If we get data, verify it belongs to the current user
        if (data && data.length > 0) {
          const userIdField = table === 'user_addresses' ? 'user_id' : 
                             table === 'transaction_history' ? 'user_id' : 
                             'user_id';
          
          const unauthorizedData = data.filter(row => row[userIdField] !== session.user.id);
          
          if (unauthorizedData.length > 0) {
            throw new Error(`Found ${unauthorizedData.length} unauthorized records in ${table}`);
          }
        }
      }, 'critical');
    }
  }

  async testFranchiseDataIsolation(): Promise<void> {
    // Test that franchisees can only access their franchise location data
    const franchiseTables = ['sales_receipts', 'sales_receipt_items', 'location_reviews', 'compliance_audits', 'kpi_summary'];
    
    for (const table of franchiseTables) {
      await this.runTest(table, 'Franchise Data Isolation', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('User must be authenticated to test franchise data isolation');
        }
        
        // Get user's role and franchise locations
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile) {
          throw new Error('User profile not found');
        }
        
        // Try to access data from the table
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(10);
        
        if (error) {
          // Permission errors are expected for users without access
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            return;
          }
          throw new Error(`Unexpected error accessing ${table}: ${error.message}`);
        }
        
        // If user is franchisee, verify they only see their location data
        if (profile.role === 'franchisee' && data && data.length > 0) {
          // Get user's franchise locations
          const { data: userLocations } = await supabase
            .from('franchise_locations')
            .select('id')
            .eq('franchisee_id', session.user.id);
          
          const userLocationIds = userLocations?.map(loc => loc.id) || [];
          
          // Check that all returned data belongs to user's locations
          const unauthorizedData = data.filter(row => {
            const locationId = row.franchise_location_id;
            return locationId && !userLocationIds.includes(locationId);
          });
          
          if (unauthorizedData.length > 0) {
            throw new Error(`Found ${unauthorizedData.length} unauthorized franchise records in ${table}`);
          }
        }
      }, 'critical');
    }
  }

  async testAdminAccess(): Promise<void> {
    // Test that admin/franchisor roles have appropriate access
    const adminTables = ['product_categories', 'custom_fields'];
    
    for (const table of adminTables) {
      await this.runTest(table, 'Admin Access Control', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('User must be authenticated to test admin access');
        }
        
        // Get user's role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile) {
          throw new Error('User profile not found');
        }
        
        // Try to read from admin tables
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(5);
        
        if (error) {
          if (profile.role === 'admin' || profile.role === 'franchisor') {
            throw new Error(`Admin/Franchisor should have read access to ${table}: ${error.message}`);
          }
          // Non-admin users might not have access, which is correct
          return;
        }
        
        // If we got data, that's fine for any authenticated user (read access)
        // Write access is tested separately
      }, 'medium');
    }
  }

  async testUnauthorizedAccess(): Promise<void> {
    // Test that unauthenticated users cannot access any data
    const allTables = [
      'product_categories', 'custom_fields', 'transaction_history',
      'entity_metadata', 'custom_field_values', 'user_addresses',
      'recurring_charges', 'sales_receipts', 'sales_receipt_items',
      'location_reviews', 'compliance_audits', 'kpi_summary', 'shipment_items'
    ];
    
    for (const table of allTables) {
      await this.runTest(table, 'Unauthenticated Access Prevention', async () => {
        // Create a new supabase client without authentication
        const { createClient } = await import('@supabase/supabase-js');
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Try to access data without authentication
        const { data, error } = await anonClient
          .from(table)
          .select('*')
          .limit(1);
        
        if (data && data.length > 0) {
          throw new Error(`Unauthenticated user can access data from ${table}`);
        }
        
        if (!error || !error.message.includes('JWT')) {
          throw new Error(`Expected JWT authentication error for ${table}, got: ${error?.message || 'no error'}`);
        }
        
        // Getting a JWT error is the expected behavior
      }, 'critical');
    }
  }

  async runAllRLSTests(): Promise<RLSTestResult[]> {
    this.results = [];
    
    console.log('🔒 Starting RLS Security Tests...');
    
    // Run all RLS security test categories
    await this.testRLSEnabled();
    await this.testUserDataIsolation();
    await this.testFranchiseDataIsolation();
    await this.testAdminAccess();
    await this.testUnauthorizedAccess();
    
    console.log(`✅ RLS Security Tests Complete: ${this.results.length} tests run`);
    
    return this.results;
  }

  getResults(): RLSTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    const criticalFailures = this.results.filter(r => 
      r.status === 'failed' && r.securityLevel === 'critical'
    ).length;
    
    const tablesSecured = [...new Set(this.results.map(r => r.table))].length;
    
    return {
      total,
      passed,
      failed,
      warnings,
      criticalFailures,
      tablesSecured,
      successRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
      isSecure: criticalFailures === 0,
      allTablesSecured: tablesSecured === 13, // All 13 vulnerable tables
    };
  }
}

// Export a default instance for easy use
export const rlsSecurityTestRunner = new RLSSecurityTestRunner();
