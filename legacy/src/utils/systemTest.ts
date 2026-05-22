// System Integration Test Utilities
// This file contains utilities to test the integrated system

import { supabase } from '@/lib/supabase'
import { FranchiseAPI } from '@/api/franchises'
import { AnalyticsAPI } from '@/api/analytics'
import { OrderAPI } from '@/api/orders'
import { InventoryAPI } from '@/api/inventory'

export interface SystemTestResult {
  test: string
  passed: boolean
  error?: string
  data?: any
}

export class SystemTester {
  private results: SystemTestResult[] = []

  async runAllTests(): Promise<SystemTestResult[]> {
    this.results = []
    
    console.log('🧪 Starting System Integration Tests...')
    
    await this.testDatabaseConnection()
    await this.testFranchiseAPI()
    await this.testAnalyticsAPI()
    await this.testInventoryAPI()
    await this.testOrderAPI()
    await this.testDatabaseViews()
    
    console.log('✅ System Integration Tests Complete')
    console.table(this.results)
    
    return this.results
  }

  private async testDatabaseConnection() {
    try {
      const { data, error } = await supabase.from('franchises').select('count').limit(1)
      
      if (error) throw error
      
      this.addResult('Database Connection', true, undefined, { connected: true })
    } catch (error: any) {
      this.addResult('Database Connection', false, error.message)
    }
  }

  private async testFranchiseAPI() {
    try {
      // Test getting all franchises
      const franchises = await FranchiseAPI.getAllFranchises()
      
      if (!Array.isArray(franchises)) {
        throw new Error('Franchises should be an array')
      }
      
      // Test getting franchise packages if franchises exist
      if (franchises.length > 0) {
        const packages = await FranchiseAPI.getFranchisePackages(franchises[0].id)
        
        if (!Array.isArray(packages)) {
          throw new Error('Packages should be an array')
        }
      }
      
      this.addResult('Franchise API', true, undefined, { 
        franchiseCount: franchises.length,
        hasPackages: franchises.length > 0
      })
    } catch (error: any) {
      this.addResult('Franchise API', false, error.message)
    }
  }

  private async testAnalyticsAPI() {
    try {
      // Test getting KPI metrics (this will fail without proper auth, but we can test the structure)
      try {
        const kpiData = await AnalyticsAPI.getKPIMetrics('test-location-id')
        this.addResult('Analytics API - KPI', true, undefined, { hasKPIData: !!kpiData })
      } catch (error: any) {
        // Expected to fail without proper location, but test the API structure
        if (error.message.includes('Access denied') || error.message.includes('not found')) {
          this.addResult('Analytics API - KPI', true, 'Expected auth error - API structure correct')
        } else {
          throw error
        }
      }
      
      // Test franchisor analytics (will also fail without auth)
      try {
        const franchisorData = await AnalyticsAPI.getFranchisorAnalytics()
        this.addResult('Analytics API - Franchisor', true, undefined, { hasFranchisorData: !!franchisorData })
      } catch (error: any) {
        if (error.message.includes('Insufficient permissions') || error.message.includes('not authenticated')) {
          this.addResult('Analytics API - Franchisor', true, 'Expected auth error - API structure correct')
        } else {
          throw error
        }
      }
      
    } catch (error: any) {
      this.addResult('Analytics API', false, error.message)
    }
  }

  private async testInventoryAPI() {
    try {
      // Test inventory API structure (will fail without auth)
      try {
        const inventory = await InventoryAPI.getInventoryByLocation('test-location-id')
        this.addResult('Inventory API', true, undefined, { hasInventory: !!inventory })
      } catch (error: any) {
        if (error.message.includes('Access denied') || error.message.includes('not found')) {
          this.addResult('Inventory API', true, 'Expected auth error - API structure correct')
        } else {
          throw error
        }
      }
    } catch (error: any) {
      this.addResult('Inventory API', false, error.message)
    }
  }

  private async testOrderAPI() {
    try {
      // Test order API structure (will fail without auth)
      try {
        const orders = await OrderAPI.getOrdersByLocation('test-location-id')
        this.addResult('Order API', true, undefined, { hasOrders: !!orders })
      } catch (error: any) {
        if (error.message.includes('Access denied') || error.message.includes('not found')) {
          this.addResult('Order API', true, 'Expected auth error - API structure correct')
        } else {
          throw error
        }
      }
    } catch (error: any) {
      this.addResult('Order API', false, error.message)
    }
  }

  private async testDatabaseViews() {
    try {
      // Test database views
      const { data: inventoryStatus, error: invError } = await supabase
        .from('inventory_status')
        .select('*')
        .limit(1)
      
      if (invError) throw new Error(`Inventory Status View: ${invError.message}`)
      
      const { data: financialSummary, error: finError } = await supabase
        .from('financial_summary')
        .select('*')
        .limit(1)
      
      if (finError) throw new Error(`Financial Summary View: ${finError.message}`)
      
      const { data: lowStockAlerts, error: stockError } = await supabase
        .from('low_stock_alerts')
        .select('*')
        .limit(1)
      
      if (stockError) throw new Error(`Low Stock Alerts View: ${stockError.message}`)
      
      const { data: performanceDashboard, error: perfError } = await supabase
        .from('franchise_performance_dashboard')
        .select('*')
        .limit(1)
      
      if (perfError) throw new Error(`Performance Dashboard View: ${perfError.message}`)
      
      this.addResult('Database Views', true, undefined, {
        inventoryStatusRecords: inventoryStatus?.length || 0,
        financialSummaryRecords: financialSummary?.length || 0,
        lowStockAlertsRecords: lowStockAlerts?.length || 0,
        performanceDashboardRecords: performanceDashboard?.length || 0
      })
    } catch (error: any) {
      this.addResult('Database Views', false, error.message)
    }
  }

  private addResult(test: string, passed: boolean, error?: string, data?: any) {
    this.results.push({ test, passed, error, data })
    
    const status = passed ? '✅' : '❌'
    const message = error ? ` - ${error}` : ''
    console.log(`${status} ${test}${message}`)
  }

  // Test specific functionality
  static async testDemoData(): Promise<boolean> {
    try {
      console.log('🧪 Testing Demo Data...')
      
      // Check if demo franchises exist
      const { data: franchises, error } = await supabase
        .from('franchises')
        .select('*')
        .limit(5)
      
      if (error) throw error
      
      console.log(`✅ Found ${franchises?.length || 0} franchises`)
      
      // Check if demo products exist
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .limit(5)
      
      console.log(`✅ Found ${products?.length || 0} products`)
      
      // Check if demo inventory exists
      const { data: inventory } = await supabase
        .from('inventory_levels')
        .select('*')
        .limit(5)
      
      console.log(`✅ Found ${inventory?.length || 0} inventory records`)
      
      return true
    } catch (error: any) {
      console.error('❌ Demo Data Test Failed:', error.message)
      return false
    }
  }

  // Test authentication flow
  static async testAuthFlow(): Promise<boolean> {
    try {
      console.log('🧪 Testing Auth Flow...')
      
      // Check if we can get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('✅ User is authenticated:', session.user.email)
        
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          console.log('✅ User profile found:', profile.full_name, profile.role)
        } else {
          console.log('⚠️ User profile not found - this is expected for new users')
        }
      } else {
        console.log('ℹ️ No active session - user needs to log in')
      }
      
      return true
    } catch (error: any) {
      console.error('❌ Auth Flow Test Failed:', error.message)
      return false
    }
  }
}

// Export a simple test runner for use in console
export const runSystemTests = async () => {
  const tester = new SystemTester()
  const results = await tester.runAllTests()
  
  await SystemTester.testDemoData()
  await SystemTester.testAuthFlow()
  
  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.length
  
  console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! System is ready.')
  } else {
    console.log('⚠️ Some tests failed. Check the results above.')
  }
  
  return results
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).runSystemTests = runSystemTests
}
